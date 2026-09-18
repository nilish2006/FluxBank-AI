import requests
import json

url = "http://localhost:5000/predict"

# Sample data from customer 1
data = {
    "customer_id": "1",
    "age": "50",
    "salary": "153694",
    "monthly_expense": "106478",
    "savings": "130268",
    "credit_score": "620",
    "existing_loans": "2",
    "car_related_transactions": "9",
    "real_estate_related_transactions": "2",
    "investment_transactions": "6",
    "app_login_frequency": "11",
    "engagement_score": "8",
    "debt_ratio": "0.69",
    "last_chat_text": "I don't want any loans right now",
    "target_product": "Car Loan"
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print("Response Body:")
    print(response.text)
except Exception as e:
    print(f"Request failed: {e}")
