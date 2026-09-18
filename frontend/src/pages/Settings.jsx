import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Sliders, Bell, Check, Save } from 'lucide-react';

const Settings = () => {
    const [config, setConfig] = useState({
        minConfidenceThreshold: 80,
        enforceLoanAversion: true,
        maxDtiCeiling: 70,
        enableVoiceOutreach: true,
        emailDailyDigest: true,
        autoApprovePrime: false
    });

    const [saved, setSaved] = useState(false);

    const handleToggle = (key) => {
        setConfig(prev => ({ ...prev, [key]: !prev[key] }));
        setSaved(false);
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <div className="settings-page" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <SettingsIcon size={22} color="var(--brand-blue)" />
                    <h1>System Policy & Agent Governance</h1>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Configure automated cross-sell criteria, regulatory lending safety caps, and relationship outreach channels.
                </p>
            </div>

            {/* Risk & Compliance Guardrails */}
            <div className="glass-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Shield size={18} color="var(--status-success)" />
                    <h3 style={{ fontSize: '0.9375rem' }}>Risk Compliance & Safety Guardrails</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Strict Loan Aversion Compliance</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                Force suppression of credit products when customer expresses negative debt intent
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={config.enforceLoanAversion}
                            onChange={() => handleToggle('enforceLoanAversion')}
                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--brand-blue)' }}
                        />
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Max Debt-to-Income (DTI) Lending Ceiling</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    Customers exceeding this leverage ratio are restricted to savings or debt consolidation
                                </div>
                            </div>
                            <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--brand-blue)' }}>
                                {config.maxDtiCeiling}%
                            </span>
                        </div>
                        <input
                            type="range"
                            min="50"
                            max="80"
                            value={config.maxDtiCeiling}
                            onChange={(e) => { setConfig({ ...config, maxDtiCeiling: Number(e.target.value) }); setSaved(false); }}
                            style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--brand-blue)' }}
                        />
                    </div>
                </div>
            </div>

            {/* AI Recommendation Engine Parameters */}
            <div className="glass-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Sliders size={18} color="var(--brand-blue)" />
                    <h3 style={{ fontSize: '0.9375rem' }}>AI Matching Parameters</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Minimum Cross-Sell Confidence Threshold</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    Recommendations below this match percentage are flagged for manual banker review
                                </div>
                            </div>
                            <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--brand-blue)' }}>
                                {config.minConfidenceThreshold}%
                            </span>
                        </div>
                        <input
                            type="range"
                            min="60"
                            max="95"
                            value={config.minConfidenceThreshold}
                            onChange={(e) => { setConfig({ ...config, minConfidenceThreshold: Number(e.target.value) }); setSaved(false); }}
                            style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--brand-blue)' }}
                        />
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Auto-Dispatch Pre-Approvals for Prime Tiers</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                Instantly queue pre-screened offers for verified customers with credit 750+
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={config.autoApprovePrime}
                            onChange={() => handleToggle('autoApprovePrime')}
                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--brand-blue)' }}
                        />
                    </div>
                </div>
            </div>

            {/* Channel Outreach Preferences */}
            <div className="glass-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Bell size={18} color="var(--status-warning)" />
                    <h3 style={{ fontSize: '0.9375rem' }}>Outreach & Notification Channels</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Interactive Voice Intelligence Outreach</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                Permit automated telephone engagement for high-affinity accounts
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={config.enableVoiceOutreach}
                            onChange={() => handleToggle('enableVoiceOutreach')}
                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--brand-blue)' }}
                        />
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Daily Risk & Recommendation Digest</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                Email executive summary to compliance and risk management daily at 8:00 AM
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={config.emailDailyDigest}
                            onChange={() => handleToggle('emailDailyDigest')}
                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--brand-blue)' }}
                        />
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
                {saved && (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Check size={16} /> Configuration Saved
                    </span>
                )}
                <button className="btn btn-primary" onClick={handleSave}>
                    <Save size={15} /> Save Policy Changes
                </button>
            </div>
        </div>
    );
};

export default Settings;
