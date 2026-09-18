module.exports = {
    getOptimalChannel: (customer) => {
        if (!customer) return "Email & SMS";
        const appLogins = Number(customer.app_login_frequency) || 0;
        const engagement = Number(customer.engagement_score) || 0;

        if (appLogins >= 18) return "In-App Notification";
        if (engagement >= 7) return "AI Voice Call";
        if (appLogins >= 10) return "Email & SMS";
        return "Email Digest";
    }
};
