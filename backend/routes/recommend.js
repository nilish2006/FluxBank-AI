const express = require('express');
const axios = require('axios');
const router = express.Router();

const personaService = require('../services/personaService');
const channelService = require('../services/channelService');

function generateRuleBasedFallback(customer) {
    const re = Number(customer.real_estate_related_transactions) || 0;
    const car = Number(customer.car_related_transactions) || 0;
    const inv = Number(customer.investment_transactions) || 0;
    const credit = Number(customer.credit_score) || 650;
    const debt = Number(customer.debt_ratio) || 0.5;
    const savings = Number(customer.savings) || 0;
    const chat = String(customer.last_chat_text || '').toLowerCase();

    const hasLoanAversion = ["don't want", "dont want", "no loan", "no loans", "not comfortable", "no debt"].some(kw => chat.includes(kw));

    let product = "Personal Loan";
    let confidence = 84.5;
    let complianceStatus = "Cleared";
    const complianceNotes = [];

    if (hasLoanAversion) {
        product = "Investment Plan";
        confidence = 88.0;
        complianceStatus = "Policy Adjusted";
        complianceNotes.push("Customer opted out of borrowing inquiries; redirected to capital-growth products.");
    } else if (re > 2) {
        product = "Home Loan";
        confidence = 89.2;
    } else if (car > 5) {
        product = "Car Loan";
        confidence = 91.0;
    } else if (inv > 6 || savings > 350000) {
        product = "Investment Plan";
        confidence = 89.5;
    } else if (credit >= 740) {
        product = "Premium credit Card";
        confidence = 92.0;
    }

    if (!hasLoanAversion && debt >= 0.70 && (product === "Personal Loan" || product === "Premium Credit Card")) {
        product = "Investment Plan";
        complianceStatus = "Policy Adjusted";
        complianceNotes.push("Debt-to-income ratio exceeds regulatory threshold (70%); redirected to wealth accumulation.");
    }

    const reasons = complianceNotes.slice();
    if (product === "Home Loan") reasons.push("Property inquiries indicate home purchase readiness");
    else if (product === "Car Loan") reasons.push("Frequent auto-related transactions indicate vehicle financing intent");
    else if (product === "Investment plan") reasons.push("Liquidity reserves and portfolio transactions support wealth management");
    else if (product === "Premium Credit Card") reasons.push("Prime credit score qualifies for top-tier travel and cashback privileges");
    else reasons.push("Flexible liquidity structure aligns with current expenditure profile");

    const insights = [];
    if (savings > 200000) {
        insights.push(`Surplus Liquidity: Holding $${savings.toLocaleString()} in cash reserves. Yield enhancement available.`);
    }
    if (debt > 0.60) {
        insights.push(`Expense Optimization: Debt ratio is at ${Math.round(debt * 100)}%. Debt consolidation may lower monthly outlays.`);
    } else {
        insights.push(`Credit Health: Healthy ${Math.round(debt * 100)}% debt-to-income ratio qualifies for prime rate discounts.`);
    }

    const riskTier = debt >= 0.70 ? "High Debt Leverage" : credit >= 740 && debt < 0.45 ? "Prime / Low Risk" : "Moderate Risk";

    return {
        product,
        confidence,
        persona: personaService.getPersona(customer),
        channel: channelService.getOptimalChannel(customer),
        risk_profile: {
            tier: riskTier,
            risk_level: riskTier.includes("Prime") ? "Low" : riskTier.includes("High") ? "High" : "Moderate",
            badge_color: riskTier.includes("Prime") ? "#10b981" : riskTier.includes("High") ? "#f43f5e" : "#3b82f6",
            debt_to_income: `${Math.round(debt * 100)}%`
        },
        compliance: {
            status: complianceStatus,
            notes: complianceNotes
        },
        explanation: reasons[0] || `Recommended ${product} based on transaction patterns.`,
        reasons,
        insights,
        voice_data: {
            voice_call_status: "ACTIVE",
            detected_sentiment: hasLoanAversion ? "Risk Averse" : "Positive Intent",
            dynamic_script: `Hello! FluxBank here with a personalized update. Our ${product} is tailored to your current goals.`,
            recommended_follow_up: hasLoanAversion ? "1 Month (Nurture Campaign)" : "2-3 Days"
        },
        source: "fallback_rule_engine"
    };
}

module.exports = (mlServiceUrl) => {
    router.post('/', async (req, res) => {
        const customerData = req.body;
        if (!customerData) {
            return res.status(400).json({ error: "Customer data required" });
        }

        try {
            // Call Python ML Service with a 4-second timeout
            const mlResponse = await axios.post(mlServiceUrl, customerData, { timeout: 4000 });
            const data = mlResponse.data;

            const enrichedResponse = {
                customer_id: customerData.customer_id,
                recommendation: {
                    product: data.product,
                    raw_model_product: data.raw_model_product || data.product,
                    confidence: data.confidence,
                    explanation: data.explanation,
                    reasons: data.reasons || [data.explanation]
                },
                insights: {
                    persona: data.persona || personaService.getPersona(customerData),
                    channel: data.channel || channelService.getOptimalChannel(customerData),
                    risk_profile: data.risk_profile || {
                        tier: "Standard",
                        risk_level: "Moderate",
                        badge_color: "#3b82f6"
                    },
                    compliance: data.compliance || { status: "Cleared", notes: [] },
                    account_insights: data.insights || [],
                    voice_engine: data.voice_data || null
                },
                source: "ml_service"
            };

            res.json(enrichedResponse);
        } catch (error) {
            console.warn(`[FluxBank Backend] ML Service unavailable at ${mlServiceUrl} (${error.message}). Using intelligent rule-based banking fallback.`);
            
            const fallback = generateRuleBasedFallback(customerData);
            const enrichedResponse = {
                customer_id: customerData.customer_id,
                recommendation: {
                    product: fallback.product,
                    raw_model_product: fallback.product,
                    confidence: fallback.confidence,
                    explanation: fallback.explanation,
                    reasons: fallback.reasons
                },
                insights: {
                    persona: fallback.persona,
                    channel: fallback.channel,
                    risk_profile: fallback.risk_profile,
                    compliance: fallback.compliance,
                    account_insights: fallback.insights,
                    voice_engine: fallback.voice_data
                },
                source: "rule_engine_fallback",
                notice: "Generated via banking rule-based engine while ML service is warming up."
            };

            res.json(enrichedResponse);
        }
    });

    return router;
};
