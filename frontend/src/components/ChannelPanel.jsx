import React from 'react';
import { Mail, Smartphone, Bell, PhoneCall } from 'lucide-react';

const icons = {
    "Email & SMS": <Mail size={20} color="#60a5fa" />,
    "In-App Notification": <Bell size={20} color="#fbbf24" />,
    "AI Voice Call": <PhoneCall size={20} color="#34d399" />,
    "Email Digest": <Mail size={20} color="#94a3b8" />
};

const channelInsights = {
    "In-App Notification": "High digital app engagement; deliver real-time promotional banner on next login.",
    "AI Voice Call": "High relationship affinity; automated interactive voice outreach yields highest conversion.",
    "Email & SMS": "Multi-touch campaign combining transactional email with SMS prompt for fast response.",
    "Email Digest": "Scheduled periodic communication preferred; deliver within monthly account summary."
};

const ChannelPanel = ({ channel }) => {
    if (!channel) return null;

    return (
        <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Optimal Engagement Channel
                </h3>
                <span className="badge badge-neutral">Outreach</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{
                    width: '36px', height: '36px', borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    {icons[channel] || <Mail size={20} color="#60a5fa" />}
                </div>
                <div>
                    <h4 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)' }}>{channel}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Max Conversion Probability</span>
                </div>
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                {channelInsights[channel] || "Standard multi-channel outreach strategy."}
            </p>
        </div>
    );
};

export default ChannelPanel;
