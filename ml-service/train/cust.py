import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score, f1_score
import joblib

# Locate dataset
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
POSSIBLE_PATHS = [
    os.path.join(CURRENT_DIR, "..", "..", "data", "customers.csv"),
    os.path.join(CURRENT_DIR, "customers.csv"),
    os.path.join(os.getcwd(), "data", "customers.csv"),
    "customers.csv"
]

data_path = None
for p in POSSIBLE_PATHS:
    if os.path.exists(p):
        data_path = p
        break

if not data_path:
    raise FileNotFoundError("Could not find customers.csv in expected locations.")

print(f"Loading customer data from: {data_path}")
df = pd.read_csv(data_path)

# ── Text feature engineering from last_chat_text ──────────────────────────────
chat_keywords = {
    "chat_home":     ["house", "home loan", "home", "mortgage", "property"],
    "chat_car":      ["car", "auto", "vehicle"],
    "chat_invest":   ["invest", "savings", "grow", "portfolio", "fund"],
    "chat_credit":   ["credit card", "card offers", "cashback", "rewards"],
    "chat_personal": ["personal loan", "urgent funds", "emergency"],
    "chat_no_loan":  ["don't want", "dont want", "do not want", "no loan", "no loans", "not comfortable", "no debt", "avoid debt", "avoid risk", "not looking for loan"],
}

for col, keywords in chat_keywords.items():
    df[col] = df["last_chat_text"].fillna("").astype(str).str.lower().apply(
        lambda text: int(any(kw in text for kw in keywords))
    )

# ── Financial Ratios Feature Engineering ─────────────────────────────────────
df["savings_to_salary"] = df["savings"] / (df["salary"] + 1.0)
df["disposable_income"] = (df["salary"] / 12.0) - df["monthly_expense"]
df["high_engagement"] = (df["engagement_score"] >= 7).astype(int)
df["prime_credit"] = (df["credit_score"] >= 720).astype(int)

# ── Features ──────────────────────────────────────────────────────────────────
feature_cols = [
    "age",
    "salary",
    "monthly_expense",
    "savings",
    "credit_score",
    "existing_loans",
    "car_related_transactions",
    "real_estate_related_transactions",
    "investment_transactions",
    "app_login_frequency",
    "engagement_score",
    "debt_ratio",
    "savings_to_salary",
    "disposable_income",
    "high_engagement",
    "prime_credit",
    # engineered text features
    "chat_home",
    "chat_car",
    "chat_invest",
    "chat_credit",
    "chat_personal",
    "chat_no_loan",
]

X = df[feature_cols]

# ── Target ────────────────────────────────────────────────────────────────────
y = df["target_product"]
le = LabelEncoder()
y_encoded = le.fit_transform(y)

# Stratified split keeps class proportions in both train & test
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)

# ── Models ────────────────────────────────────────────────────────────────────
rf = RandomForestClassifier(
    n_estimators=300,
    max_depth=10,
    min_samples_split=2,
    min_samples_leaf=1,
    max_features="sqrt",
    class_weight="balanced",
    random_state=42,
    n_jobs=-1,
)

gb = GradientBoostingClassifier(
    n_estimators=200,
    learning_rate=0.05,
    max_depth=4,
    min_samples_split=2,
    subsample=0.85,
    random_state=42,
)

ensemble = VotingClassifier(
    estimators=[("rf", rf), ("gb", gb)],
    voting="soft",
)

# ── Train & Evaluate ──────────────────────────────────────────────────────────
print("Training ensemble model...")
ensemble.fit(X_train, y_train)
y_pred = ensemble.predict(X_test)

print("\n===== CLASSIFICATION REPORT (Test Set) =====\n")
print(classification_report(y_test, y_pred, target_names=le.classes_))

test_acc = accuracy_score(y_test, y_pred)
test_f1 = f1_score(y_test, y_pred, average="weighted")
print(f"Test Accuracy: {round(test_acc * 100, 2)}%")
print(f"Weighted F1-Score: {round(test_f1 * 100, 2)}%")

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = cross_val_score(ensemble, X, y_encoded, cv=cv, scoring="accuracy")
print(f"5-Fold CV Accuracy: {round(cv_scores.mean() * 100, 2)}% ± {round(cv_scores.std() * 100, 2)}%")

# ── Save Artifacts ────────────────────────────────────────────────────────────
models_dir = os.path.join(CURRENT_DIR, "..", "models")
os.makedirs(models_dir, exist_ok=True)

model_file = os.path.join(models_dir, "cross_sell_model.pkl")
le_file = os.path.join(models_dir, "label_encoder.pkl")
cols_file = os.path.join(models_dir, "feature_cols.pkl")

joblib.dump(ensemble, model_file)
joblib.dump(le, le_file)
joblib.dump(feature_cols, cols_file)

print(f"\nModel artifacts saved to {models_dir}:")
print(f" - {model_file}")
print(f" - {le_file}")
print(f" - {cols_file}")
