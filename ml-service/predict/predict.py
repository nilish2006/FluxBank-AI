import pandas as pd
import numpy as np
import joblib
import os

# Load saved model, encoder, and feature column order
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) # ml-service root
MODEL_DIR = os.path.join(BASE_DIR, "models")

model = None
le = None
feature_cols = None

try:
    model = joblib.load(os.path.join(MODEL_DIR, "cross_sell_model.pkl"))
    le = joblib.load(os.path.join(MODEL_DIR, "label_encoder.pkl"))
    feature_cols = joblib.load(os.path.join(MODEL_DIR, "feature_cols.pkl"))
except Exception as e:
    print(f"Warning: Could not load model artifacts from {MODEL_DIR}: {e}")

# ── Chat text feature engineering (must match cust.py) ────────────────
chat_keywords = {
    "chat_home":     ["house", "home loan", "home", "mortgage", "property"],
    "chat_car":      ["car", "auto", "vehicle"],
    "chat_invest":   ["invest", "savings", "grow", "portfolio", "fund"],
    "chat_credit":   ["credit card", "card offers", "cashback", "rewards"],
    "chat_personal": ["personal loan", "urgent funds", "emergency"],
    "chat_no_loan":  ["don't want", "dont want", "do not want", "no loan", "no loans", "not comfortable", "no debt", "avoid debt", "avoid risk", "not looking for loan"],
}

def preprocess_input(data):
    """Casts dictionary values to correct types and computes derived financial indicators."""
    processed = dict(data).copy() if data else {}
    
    int_cols = [
        'age', 'salary', 'monthly_expense', 'savings', 'credit_score', 
        'existing_loans', 'car_related_transactions', 'real_estate_related_transactions',
        'investment_transactions', 'app_login_frequency', 'engagement_score'
    ]
    float_cols = ['debt_ratio']
    
    for col in int_cols:
        try:
            processed[col] = int(float(processed.get(col, 0)))
        except (ValueError, TypeError):
            processed[col] = 0
            
    for col in float_cols:
        try:
            processed[col] = float(processed.get(col, 0.0))
        except (ValueError, TypeError):
            processed[col] = 0.0

    # Ensure last_chat_text is a string
    processed['last_chat_text'] = str(processed.get('last_chat_text') or '').strip()
    
    # Financial derived indicators
    salary = max(0, processed['salary'])
    savings = max(0, processed['savings'])
    monthly_exp = max(0, processed['monthly_expense'])
    
    processed['savings_to_salary'] = round(savings / (salary + 1.0), 4)
    processed['disposable_income'] = round((salary / 12.0) - monthly_exp, 2)
    processed['high_engagement'] = 1 if processed['engagement_score'] >= 7 else 0
    processed['prime_credit'] = 1 if processed['credit_score'] >= 720 else 0

    return processed

def add_chat_features(df):
    """Add keyword-based binary features from last_chat_text column safely."""
    chat_series = df["last_chat_text"].fillna("").astype(str).str.lower()
    for col, keywords in chat_keywords.items():
        df[col] = chat_series.apply(
            lambda text: int(any(kw in text for kw in keywords))
        )
    return df

def assess_risk_profile(customer_row):
    """Determine customer risk tier and score from leverage, credit score, and savings buffer."""
    credit = customer_row.get("credit_score", 650)
    debt_ratio = customer_row.get("debt_ratio", 0.5)
    existing_loans = customer_row.get("existing_loans", 0)
    savings = customer_row.get("savings", 0)
    salary = customer_row.get("salary", 50000)

    # Debt-to-Income / Leverage Flags
    if debt_ratio >= 0.70 or (debt_ratio >= 0.60 and existing_loans >= 2):
        tier = "High Debt Leverage"
        risk_level = "High"
        badge_color = "#f43f5e"
    elif credit >= 740 and debt_ratio < 0.45 and savings > (salary * 0.3):
        tier = "Prime / Low Risk"
        risk_level = "Low"
        badge_color = "#10b981"
    else:
        tier = "Moderate Risk"
        risk_level = "Moderate"
        badge_color = "#3b82f6"

    return {
        "tier": tier,
        "risk_level": risk_level,
        "badge_color": badge_color,
        "debt_to_income": f"{round(debt_ratio * 100, 1)}%",
        "credit_tier": "Prime (740+)" if credit >= 740 else "Good (670-739)" if credit >= 670 else "Fair (<670)"
    }

def apply_compliance_rules(raw_product, confidence, customer_row):
    """
    Ensures banking compliance and customer safety:
    1. Respect loan-aversion intents ('don't want loans', 'not comfortable').
    2. Enforce debt-ratio ceiling to prevent over-indebtedness.
    3. Restrict premium credit products to qualifying credit profiles.
    """
    product = raw_product
    compliance_status = "Cleared"
    compliance_notes = []

    chat_text = customer_row.get("last_chat_text", "").lower()
    has_loan_aversion = any(kw in chat_text for kw in chat_keywords["chat_no_loan"])
    debt_ratio = customer_row.get("debt_ratio", 0.0)
    credit_score = customer_row.get("credit_score", 0)

    # Rule 1: Customer Loan Aversion
    if has_loan_aversion and product in ["Home Loan", "Car Loan", "Personal Loan"]:
        compliance_status = "Policy Adjusted"
        compliance_notes.append("Customer opted out of borrowing inquiries; redirected to capital-growth products.")
        product = "Investment Plan"
        confidence = max(82.0, float(confidence) - 5.0)

    # Rule 2: High Debt Burden Constraint
    if debt_ratio >= 0.70 and product in ["Personal Loan", "Premium Credit Card"]:
        compliance_status = "Policy Adjusted"
        compliance_notes.append("Debt-to-income ratio exceeds regulatory threshold (70%); unsecured borrowing suppressed.")
        product = "Investment Plan" if customer_row.get("savings", 0) > 100000 else "High-Yield Savings"
        confidence = 85.0

    # Rule 3: Credit Score Guardrail for Premium Card
    if product == "Premium Credit Card" and credit_score < 680:
        compliance_status = "Policy Adjusted"
        compliance_notes.append("Credit score below prime requirement (680) for Premium tier; routed to standard rewards.")
        product = "Personal Loan" if debt_ratio < 0.55 else "Investment Plan"
        confidence = 80.0

    return {
        "final_product": product,
        "final_confidence": round(float(confidence), 1),
        "status": compliance_status,
        "notes": compliance_notes
    }

def predict_customer(customer_row):
    """Model prediction with fallback rule-based classification."""
    # Fallback rule-based if model is unavailable
    if model is None or le is None or feature_cols is None:
        return predict_customer_fallback(customer_row)

    try:
        row_df = pd.DataFrame([customer_row])
        row_df = add_chat_features(row_df)

        # Fill any missing columns with 0
        for col in feature_cols:
            if col not in row_df.columns:
                row_df[col] = 0

        features_df = row_df[feature_cols]

        prediction = model.predict(features_df)[0]
        probabilities = model.predict_proba(features_df)[0]

        predicted_product = le.inverse_transform([prediction])[0]
        confidence = round(float(np.max(probabilities)) * 100, 1)

        return predicted_product, confidence
    except Exception as e:
        print(f"Error in ML prediction, using fallback: {e}")
        return predict_customer_fallback(customer_row)

def predict_customer_fallback(customer_row):
    """Rule-based recommendation fallback for resilience."""
    re = customer_row.get("real_estate_related_transactions", 0)
    car = customer_row.get("car_related_transactions", 0)
    inv = customer_row.get("investment_transactions", 0)
    credit = customer_row.get("credit_score", 650)
    
    if re > 2:
        return "Home Loan", 88.0
    elif car > 5:
        return "Car Loan", 89.5
    elif inv > 6:
        return "Investment Plan", 91.0
    elif credit > 740:
        return "Premium Credit Card", 90.0
    else:
        return "Personal Loan", 82.5

def assign_persona(customer_row):
    """Behavioral segmentation."""
    inv = customer_row.get("investment_transactions", 0)
    debt = customer_row.get("debt_ratio", 0.0)
    savings = customer_row.get("savings", 0)
    credit = customer_row.get("credit_score", 0)

    if inv > 6:
        return "Investor"
    elif debt > 0.68:
        return "High Spender"
    elif savings > 400000:
        return "Saver"
    elif credit >= 750:
        return "Credit Elite"
    else:
        return "Balanced Customer"

def select_channel(customer_row):
    """Determine optimal outreach channel by customer engagement style."""
    app_logins = customer_row.get("app_login_frequency", 0)
    engagement = customer_row.get("engagement_score", 0)

    if app_logins >= 18:
        return "In-App Notification"
    elif engagement >= 7:
        return "AI Voice Call"
    elif app_logins >= 10:
        return "Email & SMS"
    else:
        return "Email Digest"

def generate_explanation(customer_row, product, compliance_result):
    """Produces multi-factor transparent banking explanation."""
    reasons = []
    
    if compliance_result["status"] == "Policy Adjusted":
        reasons.extend(compliance_result["notes"])

    credit = customer_row.get("credit_score", 0)
    debt = customer_row.get("debt_ratio", 0.0)
    savings = customer_row.get("savings", 0)
    inv = customer_row.get("investment_transactions", 0)
    car = customer_row.get("car_related_transactions", 0)
    re = customer_row.get("real_estate_related_transactions", 0)

    if product == "Home Loan":
        reasons.append(f"Recorded {re} real estate inquiries indicating active property acquisition intent")
        if credit >= 680:
            reasons.append(f"Credit score ({credit}) meets qualified home buyer financing benchmarks")
        if savings > 150000:
            reasons.append("Sufficient reserve liquidity for competitive down-payment tiers")

    elif product == "Car Loan":
        reasons.append(f"High automobile activity ({car} transactions) indicates vehicle purchase readiness")
        if debt < 0.65:
            reasons.append(f"Healthy monthly debt ratio ({round(debt*100)}%) accommodates auto installments")

    elif product == "Investment Plan":
        if inv > 4:
            reasons.append(f"Customer has {inv} active investment transactions demonstrating capital growth orientation")
        if savings > 200000:
            reasons.append(f"Strong surplus cash position (${savings:,}) suited for yield enhancement")

    elif product == "Premium Credit Card":
        if credit >= 740:
            reasons.append(f"Prime credit score of {credit} qualifies for top-tier rewards and travel benefits")
        reasons.append("Spending volume aligns with accelerated points and annual fee waiver thresholds")

    elif product == "Personal Loan":
        reasons.append("Short-term financing profile matches liquidity consolidation and flexible tenor")

    elif product == "High-Yield Savings":
        reasons.append(f"Capital preservation priority; optimizes interest returns on current cash balance (${savings:,})")

    if not reasons:
        reasons.append("Matches financial behavioral cluster and customer segment historical adoption")

    return reasons

def generate_account_insights(customer_row, product):
    """Generate personalized financial insights and actionable advice."""
    insights = []
    savings = customer_row.get("savings", 0)
    salary = customer_row.get("salary", 0)
    debt = customer_row.get("debt_ratio", 0.0)
    credit = customer_row.get("credit_score", 0)
    monthly_exp = customer_row.get("monthly_expense", 0)

    if savings > 250000:
        potential_interest = round(savings * 0.045)
        insights.append(f"Surplus Liquidity: You hold ${savings:,} in cash. Allocating a portion to High-Yield accounts could generate ~${potential_interest:,}/year in risk-free yield.")

    if monthly_exp > 30000:
        annual_cashback = round(monthly_exp * 12 * 0.02)
        insights.append(f"Rewards Potential: Your recurring monthly expenses (${monthly_exp:,}) could earn ~${annual_cashback:,} annually via cashback credit cards.")

    if debt > 0.60:
        insights.append(f"Expense Optimization: Debt ratio is currently at {round(debt*100)}%. Consolidating obligations could reduce your monthly interest expenses.")
    else:
        insights.append(f"Favorable Borrowing: At a healthy {round(debt*100)}% debt-to-income ratio, you are eligible for prime tier interest rate discounts.")

    if credit >= 750:
        insights.append("Credit Health: Your prime credit tier unlocks priority processing and zero-origination fees across loan products.")

    return insights

def analyze_sentiment(text):
    """Sentiment classification for conversational text with robust defaults."""
    text_lower = (text or "").lower()
    
    if any(k in text_lower for k in ["not comfortable", "don't want", "no loan", "stop", "never"]):
        sentiment_status = "Risk Averse"
        follow_up = "1 Month (Nurture Campaign)"
    elif any(k in text_lower for k in ["apply", "ready", "sign up", "interested", "yes", "tell me more"]):
        sentiment_status = "High Purchase Intent"
        follow_up = "Immediate (Within 2 hours)"
    elif any(k in text_lower for k in ["maybe", "cost", "fee", "rate", "details"]):
        sentiment_status = "Information Seeking"
        follow_up = "2-3 Days"
    else:
        sentiment_status = "Neutral"
        follow_up = "1 Week Follow-up"

    return sentiment_status, follow_up

def ai_voice_call_module(customer_row, product):
    """Provides conversational script and initial engagement parameters."""
    chat = customer_row.get("last_chat_text", "")
    sentiment_status, follow_up = analyze_sentiment(chat)

    return {
        "voice_call_status": "ACTIVE",
        "detected_sentiment": sentiment_status,
        "dynamic_script": f"Hello! FluxBank here with a personalized update. Based on your recent activity, our {product} aligns with your financial milestones.",
        "recommended_follow_up": follow_up
    }
