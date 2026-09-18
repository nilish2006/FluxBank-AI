from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import traceback

# Ensure we can import from predict directory
sys.path.append(os.path.join(os.path.dirname(__file__), 'predict'))

from predict import (
    predict_customer,
    assign_persona,
    select_channel,
    generate_explanation,
    generate_account_insights,
    assess_risk_profile,
    apply_compliance_rules,
    ai_voice_call_module,
    preprocess_input,
    analyze_sentiment
)

app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json or {}
        customer_row = preprocess_input(data)
        
        # ML Prediction
        raw_product, raw_confidence = predict_customer(customer_row)
        
        # Compliance & Safety Filtering
        compliance = apply_compliance_rules(raw_product, raw_confidence, customer_row)
        final_product = compliance["final_product"]
        final_confidence = compliance["final_confidence"]
        
        # Customer Profile & Behavioral Persona
        persona = assign_persona(customer_row)
        channel = select_channel(customer_row)
        risk_profile = assess_risk_profile(customer_row)
        
        # Transparent Explanation & Account Insights
        reasons = generate_explanation(customer_row, final_product, compliance)
        insights = generate_account_insights(customer_row, final_product)
        
        # AI Voice Call metadata
        voice_data = ai_voice_call_module(customer_row, final_product)
        
        response = {
            "customer_id": data.get("customer_id"),
            "product": final_product,
            "raw_model_product": raw_product,
            "confidence": final_confidence,
            "persona": persona,
            "channel": channel,
            "risk_profile": risk_profile,
            "compliance": compliance,
            "explanation": reasons[0] if reasons else f"Recommended {final_product} based on transaction patterns.",
            "reasons": reasons,
            "insights": insights,
            "voice_data": voice_data
        }
        
        return jsonify(response)
    
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/analyze_sentiment', methods=['POST'])
def analyze_text():
    try:
        data = request.json or {}
        text = (data.get('text') or '').strip()
        text_lower = text.lower()
        stage = data.get('stage', 'conversation')

        # Robust defaults preventing UnboundLocalError
        sentiment = "Neutral"
        follow_up = "1 Week Follow-up"
        response_text = "Thank you for sharing that. Could you tell me a bit more about your financial goals?"

        # 1. Stage: Intro Response
        if stage == 'intro_response':
            if any(x in text_lower for x in ["yes", "yeah", "speaking", "correct", "that's me", "i am", "sure", "hello", "hi"]):
                sentiment = "Positive Intent"
                follow_up = "Product Pitch"
                response_text = "Great, thanks for confirming! I see you have an active relationship with FluxBank. We actually have an exclusive, pre-qualified product offer tailored for you. Would you like to hear the quick highlights?"
            elif any(x in text_lower for x in ["no", "not me", "wrong number", "busy", "cannot talk"]):
                sentiment = "Negative"
                follow_up = "Do Not Call"
                response_text = "My apologies for the interruption. I'll note your preferences in our system. Have a wonderful day!"
            else:
                sentiment = "Neutral"
                follow_up = "Verification Follow-up"
                response_text = "Just to ensure I am speaking with the authorized account holder, could you please confirm your name?"

        # 2. Conversational Intent Classification
        elif any(x in text_lower for x in ["no loan", "don't want", "not comfortable", "stop", "unsubscribe", "not interested"]):
            sentiment = "Risk Averse"
            follow_up = "1 Month (Nurture Campaign)"
            response_text = "I completely respect that! We also offer high-yield savings and automated investment tools with zero debt commitment. Would you prefer info on wealth growth instead?"

        elif any(x in text_lower for x in ["tell me more", "details", "what is the offer", "interested", "sounds good", "rates", "features"]):
            sentiment = "Information Seeking"
            follow_up = "2-3 Days"
            response_text = "It comes with preferred competitive interest rates, zero origination fees, and an automated cashback feature. Would you like me to send the complete breakdown to your email?"

        elif any(x in text_lower for x in ["apply", "sign up", "ready", "get started", "proceed", "yes"]):
            sentiment = "High Purchase Intent"
            follow_up = "Immediate (Within 2 hours)"
            response_text = "Excellent! I have logged your pre-approval in the FluxBank portal. A relationship manager will send the 1-click confirmation right away."

        elif any(x in text_lower for x in ["fee", "charge", "cost", "interest rate", "annual fee"]):
            sentiment = "Interested"
            follow_up = "1-2 Days"
            response_text = "There are zero hidden costs, and any annual fee is 100% waived for active account holders who meet minimum activity thresholds."

        else:
            sentiment, follow_up = analyze_sentiment(text)
            response_text = f"Got it. Based on '{text}', I can tailor our product details for you or connect you with a specialist. How would you like to proceed?"

        return jsonify({
            "sentiment": sentiment,
            "recommended_follow_up": follow_up,
            "ai_response": response_text
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "service": "FluxBank ML Service",
        "model_loaded": bool(predict_customer)
    }), 200

if __name__ == '__main__':
    print("Starting FluxBank ML Service on http://localhost:5000...")
    app.run(host='0.0.0.0', port=5000, debug=False)
