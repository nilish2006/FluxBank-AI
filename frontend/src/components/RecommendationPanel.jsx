import React, { useState } from 'react';
import { Sparkles, CheckCircle, Shield, AlertCircle, ArrowRight, Lightbulb, Check } from 'lucide-react';

const RecommendationPanel = ({ recommendation, insights, customer }) => {
    const [actionState, setActionState] = useState('idle'); // idle, processing, completed

    if (!recommendation) return null;

    const { product, confidence, explanation, reasons = [] } = recommendation;
    const compliance = insights?.compliance;
    const accountInsights = insights?.account_insights || [];
    const riskProfile = insights?.risk_profile;

    const handleAction = () => {
        setActionState('processing');
        setTimeout(() => {
            setActionState('completed');
        }, 600);
    };

    return (
        <div className="glass-card" style={{ borderLeft: '4px solid var(--brand-blue)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <Sparkles size={18} color="var(--brand-blue)" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Intelligent Cross-Sell Recommendation
                        </span>
                    </div>
                    <h2 style={{ fontSize: '1.75rem', color: '#ffffff', fontWeight: 700 }}>{product}</h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {compliance && (
                        <span className={`badge ${compliance.status === 'Cleared' ? 'badge-success' : 'badge-warning'}`}>
                            <Shield size={12} /> {compliance.status}
                        </span>
                    )}
                    <span className="badge badge-info" style={{ fontSize: '0.8125rem', padding: '4px 10px' }}>
                        {confidence}% Match Score
                    </span>
                </div>
            </div>

            {/* Confidence Progress Bar */}
            <div style={{ margin: '14px 0 20px 0' }}>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                        style={{
                            width: `${Math.min(100, confidence)}%`,
                            height: '100%',
                            background: confidence >= 85 ? 'var(--status-success)' : 'var(--brand-blue)',
                            borderRadius: '3px',
                            transition: 'width 0.5s ease'
                        }}
                    />
                </div>
            </div>

            {/* Why This Product / Explanations */}
            <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Why this product was recommended
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {reasons.length > 0 ? (
                        reasons.map((r, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                                <CheckCircle size={15} color="var(--status-success)" style={{ marginTop: '3px', flexShrink: 0 }} />
                                <span>{r}</span>
                            </div>
                        ))
                    ) : (
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{explanation}</p>
                    )}
                </div>
            </div>

            {/* Account Insights Section */}
            {accountInsights.length > 0 && (
                <div style={{
                    background: 'rgba(37, 99, 235, 0.08)',
                    border: '1px solid rgba(37, 99, 235, 0.2)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px',
                    marginBottom: '20px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <Lightbulb size={16} color="#60a5fa" />
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#93c5fd' }}>Account & Portfolio Insights</span>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {accountInsights.map((insight, idx) => (
                            <li key={idx}>{insight}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Compliance Note if any */}
            {compliance?.notes?.length > 0 && compliance.status !== 'Cleared' && (
                <div style={{
                    background: 'var(--status-warning-bg)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 12px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.8125rem',
                    color: '#fde68a'
                }}>
                    <AlertCircle size={16} color="var(--status-warning)" style={{ flexShrink: 0 }} />
                    <span>{compliance.notes.join(" ")}</span>
                </div>
            )}

            {/* Call to Action Footer */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)',
                flexWrap: 'wrap',
                gap: '12px'
            }}>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                    Target Customer: <strong style={{ color: 'var(--text-secondary)' }}>Customer #{customer?.customer_id}</strong>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    {actionState === 'completed' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--status-success)', fontSize: '0.875rem', fontWeight: 600 }}>
                            <Check size={16} /> Offer Dispatched to Customer
                        </div>
                    ) : (
                        <>
                            <button
                                className="btn btn-secondary"
                                onClick={() => alert(`Logged custom notes for Customer #${customer?.customer_id}`)}
                            >
                                Add Note
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleAction}
                                disabled={actionState === 'processing'}
                            >
                                {actionState === 'processing' ? 'Dispatching...' : 'Approve & Send Offer'}
                                <ArrowRight size={15} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecommendationPanel;
