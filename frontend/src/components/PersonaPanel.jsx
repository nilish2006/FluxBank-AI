import React from 'react';
import { PieChart, Wallet, CreditCard, Shield, UserCheck } from 'lucide-react';

const icons = {
    "Investor": <PieChart size={20} color="#818cf8" />,
    "Saver": <Wallet size={20} color="#34d399" />,
    "High Spender": <CreditCard size={20} color="#f87171" />,
    "Credit Elite": <Shield size={20} color="#fbbf24" />,
    "Balanced Customer": <UserCheck size={20} color="#60a5fa" />
};

const descriptions = {
    "Investor": "Active market participant seeking wealth accumulation and capital growth.",
    "Saver": "High reserve liquidity ratio; prioritizes principal safety and yield.",
    "High Spender": "Elevated monthly transaction volume; prime candidate for cashback incentives.",
    "Credit Elite": "Excellent creditworthiness with low borrowing leverage; pre-screened for premier tiers.",
    "Balanced Customer": "Steady income and expenditure equilibrium with standard service needs."
};

const PersonaPanel = ({ persona }) => {
    if (!persona) return null;

    return (
        <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Behavioral Persona
                </h3>
                <span className="badge badge-neutral">Segment</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{
                    width: '36px', height: '36px', borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    {icons[persona] || <UserCheck size={20} color="#60a5fa" />}
                </div>
                <div>
                    <h4 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)' }}>{persona}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Financial Behavioral Model</span>
                </div>
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                {descriptions[persona] || "Standard banking customer profile."}
            </p>
        </div>
    );
};

export default PersonaPanel;
