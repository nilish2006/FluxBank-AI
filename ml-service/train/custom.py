import pandas as pd
import numpy as np
import random

np.random.seed(42)
random.seed(42)

n = 200  # number of customers

chat_samples = [
    "I am interested in investment opportunities",
    "I don't want any loans right now",
    "Planning to buy a car soon",
    "Thinking about purchasing a house",
    "Just checking account details",
    "Looking for better credit card offers",
    "Not comfortable taking financial risk",
    "Want to grow my savings",
    "Searching for home loan options",
    "Exploring car loan offers"
]

data = []

for i in range(n):
    
    age = np.random.randint(22, 60)
    
    # Salary depends on age
    if age < 30:
        salary = np.random.randint(30000, 80000)
    elif age < 45:
        salary = np.random.randint(60000, 150000)
    else:
        salary = np.random.randint(50000, 200000)
    
    monthly_expense = int(salary * np.random.uniform(0.4, 0.8))
    
    savings = np.random.randint(20000, 800000)
    
    credit_score = np.random.randint(600, 850)
    
    existing_loans = np.random.randint(0, 3)
    
    car_related_transactions = np.random.randint(0, 10)
    real_estate_related_transactions = np.random.randint(0, 5)
    investment_transactions = np.random.randint(0, 15)
    
    app_login_frequency = np.random.randint(1, 30)
    
    engagement_score = np.random.randint(1, 10)
    
    last_chat_text = random.choice(chat_samples)
    
    debt_ratio = round(monthly_expense / salary, 2)
    
    # Target Product Logic
    if real_estate_related_transactions > 2:
        target_product = "Home Loan"
    elif car_related_transactions > 5:
        target_product = "Car Loan"
    elif investment_transactions > 8:
        target_product = "Investment Plan"
    elif credit_score > 750:
        target_product = "Premium Credit Card"
    else:
        target_product = "Personal Loan"
    
    data.append([
        i+1, age, salary, monthly_expense, savings,
        credit_score, existing_loans,
        car_related_transactions,
        real_estate_related_transactions,
        investment_transactions,
        app_login_frequency,
        engagement_score,
        debt_ratio,
        last_chat_text,
        target_product
    ])

columns = [
    "customer_id",
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
    "last_chat_text",
    "target_product"
]

df = pd.DataFrame(data, columns=columns)

df.to_csv("customers.csv", index=False)

print("Mock banking dataset created successfully!")
print("File saved as customers.csv")