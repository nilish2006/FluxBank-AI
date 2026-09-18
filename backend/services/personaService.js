module.exports = {
    getPersona: (customer) => {
        if (!customer) return "Balanced Customer";
        const inv = Number(customer.investment_transactions) || 0;
        const savings = Number(customer.savings) || 0;
        const debt = Number(customer.debt_ratio) || 0;
        const credit = Number(customer.credit_score) || 0;

        if (inv > 6) return "Investor";
        if (debt > 0.68) return "High Spender";
        if (savings > 400000) return "Saver";
        if (credit >= 750) return "Credit Elite";
        return "Balanced Customer";
    }
};
