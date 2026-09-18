import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import CustomerSelector from '../components/CustomerSelector';
import RecommendationPanel from '../components/RecommendationPanel';
import PersonaPanel from '../components/PersonaPanel';
import ChannelPanel from '../components/ChannelPanel';
import VoiceEnginePanel from '../components/VoiceEnginePanel';
import { Shield, AlertTriangle, RefreshCw, DollarSign, Wallet, CreditCard, Activity, ArrowRight } from 'lucide-react';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [recommendationData, setRecommendationData] = useState(null);
    const [loadingRecommendation, setLoadingRecommendation] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recommendationError, setRecommendationError] = useState(null);

    const loadCustomers = () => {
        setInitialLoading(true);
        setError(null);
        api.getCustomers()
            .then(data => {
                setCustomers(data);
                setInitialLoading(false);
                if (data.length > 0 && !selectedCustomer) {
                    handleSelectCustomer(data[0]);
                }
            })
            .catch(err => {
                console.error("Failed to load customers:", err);
                setError("Unable to connect to the banking backend server. Please verify services are running.");
                setInitialLoading(false);
            });
    };

    useEffect(() => {
        loadCustomers();
    }, []);

    const handleSelectCustomer = async (customer) => {
        setSelectedCustomer(customer);
        setLoadingRecommendation(true);
        setRecommendationError(null);
        setRecommendationData(null);

        try {
            const res = await api.getRecommendation(customer);
            setRecommendationData(res);
        } catch (err) {
            console.error("Recommendation retrieval error:", err);
            setRecommendationError("Failed to generate real-time recommendation for this customer.");
        } finally {
            setLoadingRecommendation(false);
        }
    };

    if (initialLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--brand-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Loading customer accounts...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card" style={{ maxWidth: '500px', margin: '40px auto', textAlign: 'center', padding: '30px' }}>
                <AlertTriangle size={36} color="var(--status-danger)" style={{ marginBottom: '12px' }} />
                <h3 style={{ marginBottom: '8px' }}>Backend Unavailable</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>{error}</p>
                <button className="btn btn-primary" onClick={loadCustomers}>
                    <RefreshCw size={15} /> Retry Connection
                </button>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', minHeight: 'calc(100vh - 80px)' }}>
            {/* Left Column: Customer Selector */}
            <CustomerSelector
                customers={customers}
                onSelect={handleSelectCustomer}
                selectedId={selectedCustomer?.customer_id}
            />

            {/* Right Column: Customer Details & AI Agent */}
            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {selectedCustomer && (
                    <>
                        {/* Customer Header & Account Cards */}
                        <div className="glass-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <h2 style={{ fontSize: '1.4rem' }}>Customer #{selectedCustomer.customer_id}</h2>
                                        <span className={`badge ${selectedCustomer.risk_tier?.includes('Prime') ? 'badge-success' : selectedCustomer.risk_tier?.includes('High') ? 'badge-danger' : 'badge-info'}`}>
                                            <Shield size={12} /> {selectedCustomer.risk_tier || 'Standard'}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                        Age {selectedCustomer.age} • Annual Salary: ${Number(selectedCustomer.salary || 0).toLocaleString()} • Segment: {selectedCustomer.persona}
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: selectedCustomer.credit_score >= 720 ? 'var(--status-success)' : '#60a5fa' }}>
                                        {selectedCustomer.credit_score}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>FICO Credit Score</div>
                                </div>
                            </div>

                            {/* Financial Metric Tiles */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Cash Reserves</div>
                                    <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>${Number(selectedCustomer.savings || 0).toLocaleString()}</div>
                                </div>
                                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Monthly Outflows</div>
                                    <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>${Number(selectedCustomer.monthly_expense || 0).toLocaleString()}</div>
                                </div>
                                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Debt-to-Income</div>
                                    <div style={{ fontSize: '1.125rem', fontWeight: 600, color: Number(selectedCustomer.debt_ratio) > 0.65 ? 'var(--status-danger)' : 'inherit' }}>
                                        {Math.round(Number(selectedCustomer.debt_ratio || 0) * 100)}%
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Active Loans</div>
                                    <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{selectedCustomer.existing_loans || 0} Accounts</div>
                                </div>
                            </div>

                            {/* Activity Indicators */}
                            <div style={{ marginTop: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                <span>Real Estate Transactions: <strong style={{ color: 'var(--text-primary)' }}>{selectedCustomer.real_estate_related_transactions}</strong></span>
                                <span>Auto Transactions: <strong style={{ color: 'var(--text-primary)' }}>{selectedCustomer.car_related_transactions}</strong></span>
                                <span>Investment Trades: <strong style={{ color: 'var(--text-primary)' }}>{selectedCustomer.investment_transactions}</strong></span>
                                <span>Monthly App Logins: <strong style={{ color: 'var(--text-primary)' }}>{selectedCustomer.app_login_frequency}</strong></span>
                            </div>
                        </div>

                        {/* Last Interaction Note */}
                        {selectedCustomer.last_chat_text && (
                            <div className="glass-card" style={{ padding: '14px 18px', background: 'rgba(255, 255, 255, 0.02)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                                    Latest Customer Dialogue Intent
                                </div>
                                <p style={{ fontSize: '0.875rem', fontStyle: 'italic', color: 'var(--text-primary)' }}>
                                    "{selectedCustomer.last_chat_text}"
                                </p>
                            </div>
                        )}

                        {/* Loading State for AI Recommendation */}
                        {loadingRecommendation && (
                            <div className="glass-card" style={{ textAlign: 'center', padding: '36px' }}>
                                <div style={{ width: '28px', height: '28px', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--brand-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px auto' }} />
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    Synthesizing behavioral patterns, checking compliance, and generating recommendation...
                                </span>
                            </div>
                        )}

                        {/* Error in recommendation */}
                        {recommendationError && (
                            <div className="glass-card" style={{ borderLeft: '4px solid var(--status-warning)', padding: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <AlertTriangle size={16} color="var(--status-warning)" />
                                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{recommendationError}</span>
                                </div>
                                <button className="btn btn-secondary" onClick={() => handleSelectCustomer(selectedCustomer)}>
                                    Retry Prediction
                                </button>
                            </div>
                        )}

                        {/* Recommendation and Insights Display */}
                        {recommendationData && !loadingRecommendation && (
                            <>
                                <RecommendationPanel
                                    recommendation={recommendationData.recommendation}
                                    insights={recommendationData.insights}
                                    customer={selectedCustomer}
                                />

                                <div className="panel-row">
                                    <PersonaPanel persona={recommendationData.insights?.persona} />
                                    <ChannelPanel channel={recommendationData.insights?.channel} />
                                </div>

                                {recommendationData.insights?.voice_engine && (
                                    <VoiceEnginePanel voiceData={recommendationData.insights.voice_engine} />
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Customers;
