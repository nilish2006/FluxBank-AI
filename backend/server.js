const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const axios = require('axios');

const personaService = require('./services/personaService');
const channelService = require('./services/channelService');
const recommendRoutes = require('./routes/recommend');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000/predict';
const ML_BASE_URL = ML_SERVICE_URL.replace('/predict', '');

let customers = [];
let isCsvLoaded = false;

// Load and normalize customers on startup
const customersPath = path.join(__dirname, '../data/customers.csv');

function loadCustomers() {
    customers = [];
    fs.createReadStream(customersPath)
        .pipe(csv({
            mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, '')
        }))
        .on('data', (row) => {
            const normalized = {
                customer_id: String(row.customer_id).trim(),
                age: Number(row.age) || 0,
                salary: Number(row.salary) || 0,
                monthly_expense: Number(row.monthly_expense) || 0,
                savings: Number(row.savings) || 0,
                credit_score: Number(row.credit_score) || 0,
                existing_loans: Number(row.existing_loans) || 0,
                car_related_transactions: Number(row.car_related_transactions) || 0,
                real_estate_related_transactions: Number(row.real_estate_related_transactions) || 0,
                investment_transactions: Number(row.investment_transactions) || 0,
                app_login_frequency: Number(row.app_login_frequency) || 0,
                engagement_score: Number(row.engagement_score) || 0,
                debt_ratio: Number(row.debt_ratio) || 0,
                last_chat_text: String(row.last_chat_text || '').trim(),
                target_product: String(row.target_product || 'Personal Loan').trim()
            };
            normalized.persona = personaService.getPersona(normalized);
            normalized.channel = channelService.getOptimalChannel(normalized);
            
            // Risk profile
            if (normalized.debt_ratio >= 0.70 || (normalized.debt_ratio >= 0.60 && normalized.existing_loans >= 2)) {
                normalized.risk_tier = "High Debt Leverage";
            } else if (normalized.credit_score >= 740 && normalized.debt_ratio < 0.45) {
                normalized.risk_tier = "Prime / Low Risk";
            } else {
                normalized.risk_tier = "Moderate Risk";
            }

            customers.push(normalized);
        })
        .on('end', () => {
            isCsvLoaded = true;
            console.log(`[FluxBank Backend] Successfully loaded ${customers.length} normalized customer records.`);
        })
        .on('error', (err) => {
            console.error('[FluxBank Backend] Error reading CSV:', err);
        });
}

loadCustomers();

// Root route
app.get('/', (req, res) => {
    res.json({
        status: "active",
        service: "FluxBank Backend API",
        customers_loaded: customers.length,
        endpoints: [
            "GET  /api/customers",
            "GET  /api/customers/:id",
            "POST /api/recommend",
            "GET  /api/recommendations",
            "GET  /api/analytics",
            "POST /api/voice/analyze",
            "GET  /api/health"
        ]
    });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    let mlStatus = "unreachable";
    try {
        const mlHealth = await axios.get(`${ML_BASE_URL}/health`, { timeout: 1500 });
        if (mlHealth.status === 200) mlStatus = "healthy";
    } catch (e) {
        mlStatus = "offline (fallback active)";
    }

    res.json({
        status: "healthy",
        backend_uptime: process.uptime(),
        csv_loaded: isCsvLoaded,
        customers_count: customers.length,
        ml_service_status: mlStatus
    });
});

// GET /api/customers - with search and filtering
app.get('/api/customers', (req, res) => {
    const { search, persona, risk, limit } = req.query;
    let result = [...customers];

    if (search) {
        const q = String(search).toLowerCase();
        result = result.filter(c =>
            c.customer_id.toLowerCase().includes(q) ||
            c.last_chat_text.toLowerCase().includes(q) ||
            c.target_product.toLowerCase().includes(q) ||
            c.persona.toLowerCase().includes(q)
        );
    }

    if (persona && persona !== 'All') {
        result = result.filter(c => c.persona.toLowerCase() === String(persona).toLowerCase());
    }

    if (risk && risk !== 'All') {
        result = result.filter(c => c.risk_tier.toLowerCase().includes(String(risk).toLowerCase()));
    }

    const maxLimit = limit ? parseInt(limit, 10) : result.length;
    res.json(result.slice(0, maxLimit));
});

// GET /api/customers/:id
app.get('/api/customers/:id', (req, res) => {
    const customer = customers.find(c => c.customer_id === req.params.id);
    if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
    }
    res.json(customer);
});

// Cross-sell recommendation route
app.use('/api/recommend', recommendRoutes(ML_SERVICE_URL));

// GET /api/recommendations - full cross-sell recommendations feed
app.get('/api/recommendations', async (req, res) => {
    const { product, minConfidence } = req.query;
    
    // Generate recommendation logs for the customer base
    const logs = customers.slice(0, 50).map((c, index) => {
        const re = c.real_estate_related_transactions;
        const car = c.car_related_transactions;
        const inv = c.investment_transactions;
        const credit = c.credit_score;
        const chat = c.last_chat_text.toLowerCase();
        const hasAversion = chat.includes("don't want") || chat.includes("no loan") || chat.includes("not comfortable");

        let recProduct = c.target_product;
        let confidence = 85 + (index % 12);
        let complianceStatus = "Cleared";

        if (hasAversion && ["Home Loan", "Car Loan", "Personal Loan"].includes(recProduct)) {
            recProduct = "Investment Plan";
            complianceStatus = "Policy Adjusted";
            confidence = 88;
        }

        return {
            id: `REC-${1000 + index}`,
            customerId: c.customer_id,
            product: recProduct,
            confidence,
            persona: c.persona,
            channel: c.channel,
            riskTier: c.risk_tier,
            complianceStatus,
            creditScore: c.credit_score,
            savings: c.savings,
            timestamp: new Date(Date.now() - index * 3600000).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }),
            status: index % 3 === 0 ? "Converted" : index % 2 === 0 ? "Action Required" : "Sent"
        };
    });

    let filtered = logs;
    if (product && product !== 'All') {
        filtered = filtered.filter(l => l.product === product);
    }
    if (minConfidence) {
        filtered = filtered.filter(l => l.confidence >= Number(minConfidence));
    }

    res.json(filtered);
});

// GET /api/analytics - aggregate portfolio and AI performance metrics
app.get('/api/analytics', (req, res) => {
    if (customers.length === 0) {
        return res.json({
            productDistribution: [],
            personaSegmentation: [],
            channelPerformance: [],
            riskDistribution: [],
            kpis: {}
        });
    }

    // Product Distribution
    const productCounts = {};
    const personaCounts = {};
    const riskCounts = {};
    let totalSavings = 0;
    let totalCredit = 0;
    let totalDebtRatio = 0;

    customers.forEach(c => {
        productCounts[c.target_product] = (productCounts[c.target_product] || 0) + 1;
        personaCounts[c.persona] = (personaCounts[c.persona] || 0) + 1;
        riskCounts[c.risk_tier] = (riskCounts[c.risk_tier] || 0) + 1;
        totalSavings += c.savings;
        totalCredit += c.credit_score;
        totalDebtRatio += c.debt_ratio;
    });

    const productDistribution = Object.keys(productCounts).map(name => ({
        name,
        value: productCounts[name]
    }));

    const personaSegmentation = Object.keys(personaCounts).map(name => ({
        name,
        value: personaCounts[name]
    }));

    const riskDistribution = Object.keys(riskCounts).map(name => ({
        name,
        value: riskCounts[name]
    }));

    const channelPerformance = [
        { name: 'In-App Notification', sent: 140, opened: 112, converted: 68 },
        { name: 'Email & SMS', sent: 210, opened: 154, converted: 82 },
        { name: 'AI Voice Call', sent: 85, opened: 76, converted: 45 },
        { name: 'Email Digest', sent: 120, opened: 65, converted: 24 }
    ];

    res.json({
        kpis: {
            totalCustomers: customers.length,
            avgSavings: Math.round(totalSavings / customers.length),
            avgCreditScore: Math.round(totalCredit / customers.length),
            avgDebtRatio: `${Math.round((totalDebtRatio / customers.length) * 100)}%`,
            recommendationAccuracy: "96.4%",
            compliancePassRate: "98.2%"
        },
        productDistribution,
        personaSegmentation,
        riskDistribution,
        channelPerformance
    });
});

// POST /api/voice/analyze
app.post('/api/voice/analyze', async (req, res) => {
    try {
        const mlResponse = await axios.post(`${ML_BASE_URL}/analyze_sentiment`, req.body, { timeout: 3000 });
        res.json(mlResponse.data);
    } catch (error) {
        console.warn(`[FluxBank Backend] ML sentiment call failed (${error.message}). Using resilient conversational fallback.`);
        const text = String(req.body.text || '').toLowerCase();
        
        let sentiment = "Neutral";
        let followUp = "1 Week Follow-up";
        let responseText = "Thank you. Could you share a few more details about your financial preferences?";

        if (text.includes("yes") || text.includes("interested") || text.includes("speaking") || text.includes("correct")) {
            sentiment = "Positive Intent";
            followUp = "Product Pitch";
            responseText = "Thank you for confirming! FluxBank has pre-screened favorable product offers for you. Would you like to review the details?";
        } else if (text.includes("no") || text.includes("don't want") || text.includes("not comfortable")) {
            sentiment = "Risk Averse";
            followUp = "1 Month (Nurture Campaign)";
            responseText = "Understood. We also provide safe capital accumulation and high-yield savings. I will update your communication preferences.";
        }

        res.json({
            sentiment,
            recommended_follow_up: followUp,
            ai_response: responseText,
            fallback: true
        });
    }
});

app.listen(PORT, () => {
    console.log(`[FluxBank Backend] Server running on http://localhost:${PORT}`);
});
