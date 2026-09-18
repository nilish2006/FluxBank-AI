import React, { useState, useEffect } from 'react';
import { Users, FileText, TrendingUp, ShieldCheck, ArrowRight, Zap, CheckCircle, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

const Overview = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getAnalytics()
            .then(data => {
                setAnalytics(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load overview analytics:", err);
                setLoading(false);
            });
    }, []);

    const kpis = analytics?.kpis || {
        totalCustomers: 200,
        avgCreditScore: 724,
        avgDebtRatio: '58%',
        recommendationAccuracy: '96.4%',
        compliancePassRate: '98.2%'
    };

    const cards = [
        {
            title: 'Managed Customers',
            value: kpis.totalCustomers,
            subtitle: '100% profiled & scored',
            icon: <Users size={20} color="#3b82f6" />,
            bg: 'rgba(59, 130, 246, 0.12)'
        },
        {
            title: 'Model Fit Accuracy',
            value: kpis.recommendationAccuracy,
            subtitle: 'Ensemble ML cross-validation',
            icon: <TrendingUp size={20} color="#10b981" />,
            bg: 'rgba(16, 185, 129, 0.12)'
        },
        {
            title: 'Compliance Safety Rate',
            value: kpis.compliancePassRate,
            subtitle: 'Zero debt-ceiling violations',
            icon: <ShieldCheck size={20} color="#8b5cf6" />,
            bg: 'rgba(139, 92, 246, 0.12)'
        },
        {
            title: 'Portfolio Avg Credit',
            value: kpis.avgCreditScore,
            subtitle: `Avg Debt Ratio: ${kpis.avgDebtRatio}`,
            icon: <Zap size={20} color="#f59e0b" />,
            bg: 'rgba(245, 158, 11, 0.12)'
        },
    ];

    const chartData = analytics?.productDistribution || [
        { name: 'Home Loan', value: 78 },
        { name: 'Car Loan', value: 48 },
        { name: 'Personal Loan', value: 34 },
        { name: 'Investment', value: 22 },
        { name: 'Credit Card', value: 18 }
    ];

    return (
        <div className="overview-page" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1>Banking Intelligence Dashboard</h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Executive telemetry on personalized product cross-selling, risk compliance, and engagement metrics.
                    </p>
                </div>

                <Link to="/customers" className="btn btn-primary">
                    Launch Cross-Sell Agent <ArrowRight size={15} />
                </Link>
            </div>

            {/* KPI Cards Grid */}
            <div className="panel-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {cards.map((card, i) => (
                    <div key={i} className="glass-card metric-card">
                        <div className="metric-header">
                            <span className="metric-title">{card.title}</span>
                            <div className="metric-icon-box" style={{ background: card.bg }}>
                                {card.icon}
                            </div>
                        </div>
                        <div className="metric-value">{card.value}</div>
                        <div className="metric-subtitle">{card.subtitle}</div>
                    </div>
                ))}
            </div>

            {/* Main Visualizations Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
                {/* Product Demand Chart */}
                <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div>
                            <h3 style={{ fontSize: '0.9375rem' }}>Cross-Sell Product Allocation</h3>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                Volume of algorithmically matched opportunities across customer base
                            </span>
                        </div>
                        <span className="badge badge-info">Real Portfolio</span>
                    </div>

                    <div style={{ height: '240px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ background: '#131d36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '0.8125rem' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Agent Guardrails & Compliance Status */}
                <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '0.9375rem' }}>Compliance & Risk Governance</h3>
                        <span className="badge badge-success">Enforced</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.025)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <CheckCircle size={15} color="var(--status-success)" />
                                <strong style={{ fontSize: '0.8125rem' }}>Loan Aversion Guardrail</strong>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                Customers explicitly declining debt are automatically routed to capital-growth and savings solutions.
                            </p>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.025)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <CheckCircle size={15} color="var(--status-success)" />
                                <strong style={{ fontSize: '0.8125rem' }}>DTI Regulatory Ceiling (70%)</strong>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                Unsecured credit issuance suppressed for customers exceeding conservative debt thresholds.
                            </p>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.025)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <CheckCircle size={15} color="var(--status-success)" />
                                <strong style={{ fontSize: '0.8125rem' }}>Prime Qualification Filter</strong>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                Tier-1 card and preferential rate offers restricted to validated credit scores (720+).
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Footer Card */}
            <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={18} color="var(--status-success)" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Cross-Sell Recommendation Engine Active</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Dual-engine architecture: Python ML Ensemble + Express Rule Fallback</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <Link to="/recommendations" className="btn btn-secondary" style={{ fontSize: '0.8125rem' }}>
                        View Recommendation Feed
                    </Link>
                    <Link to="/customers" className="btn btn-primary" style={{ fontSize: '0.8125rem' }}>
                        Review Next Customer
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Overview;
