import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import { BarChart2, PieChart as PieIcon, TrendingUp, Shield } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getAnalytics()
            .then(res => {
                setData(res);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load analytics:", err);
                setLoading(false);
            });
    }, []);

    const productData = data?.productDistribution || [
        { name: 'Home Loan', value: 78 },
        { name: 'Car Loan', value: 48 },
        { name: 'Personal Loan', value: 34 },
        { name: 'Investment Plan', value: 22 },
        { name: 'Premium Card', value: 18 }
    ];

    const personaData = data?.personaSegmentation || [
        { name: 'Investor', value: 45 },
        { name: 'Saver', value: 55 },
        { name: 'High Spender', value: 38 },
        { name: 'Credit Elite', value: 32 },
        { name: 'Balanced', value: 30 }
    ];

    const channelData = data?.channelPerformance || [
        { name: 'In-App', sent: 140, opened: 112, converted: 68 },
        { name: 'Email/SMS', sent: 210, opened: 154, converted: 82 },
        { name: 'AI Voice', sent: 85, opened: 76, converted: 45 },
        { name: 'Digest', sent: 120, opened: 65, converted: 24 }
    ];

    const kpis = data?.kpis || {
        totalCustomers: 200,
        avgSavings: 421000,
        avgCreditScore: 724,
        avgDebtRatio: '58%'
    };

    return (
        <div className="analytics-page" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <BarChart2 size={22} color="var(--brand-blue)" />
                    <h1>Portfolio Analytics & Conversion Insights</h1>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Aggregated intelligence on cross-sell demand distribution, customer segmentation, and conversion velocity.
                </p>
            </div>

            {/* Quick Metrics */}
            <div className="panel-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="glass-card metric-card">
                    <span className="metric-title">Portfolio Accounts</span>
                    <div className="metric-value">{kpis.totalCustomers}</div>
                    <span className="metric-subtitle">Active scored relationships</span>
                </div>
                <div className="glass-card metric-card">
                    <span className="metric-title">Avg Reserve Liquidity</span>
                    <div className="metric-value">${Number(kpis.avgSavings || 0).toLocaleString()}</div>
                    <span className="metric-subtitle">Customer balance benchmark</span>
                </div>
                <div className="glass-card metric-card">
                    <span className="metric-title">Avg Credit Profile</span>
                    <div className="metric-value">{kpis.avgCreditScore}</div>
                    <span className="metric-subtitle">Prime portfolio qualification</span>
                </div>
                <div className="glass-card metric-card">
                    <span className="metric-title">Avg Leverage Ratio</span>
                    <div className="metric-value">{kpis.avgDebtRatio}</div>
                    <span className="metric-subtitle">Within regulatory limits</span>
                </div>
            </div>

            {/* Chart Grid */}
            <div className="panel-row" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
                <div className="glass-card" style={{ height: '340px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '12px' }}>
                        <h3 style={{ fontSize: '0.9375rem' }}>Product Allocation Breakdown</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Cross-sell target volume across portfolio</span>
                    </div>
                    <div style={{ flex: 1, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={productData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ background: '#131d36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '0.8125rem' }} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card" style={{ height: '340px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '12px' }}>
                        <h3 style={{ fontSize: '0.9375rem' }}>Behavioral Persona Segmentation</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Distribution across algorithmic customer clusters</span>
                    </div>
                    <div style={{ flex: 1, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={personaData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={85}
                                    paddingAngle={3}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    fontSize={11}
                                >
                                    {personaData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#131d36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '0.8125rem' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Channel Performance Chart */}
            <div className="glass-card" style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '0.9375rem' }}>Channel Funnel Performance</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Dispatched offers vs opens vs converted agreements</span>
                </div>
                <div style={{ flex: 1, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={channelData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ background: '#131d36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '0.8125rem' }} />
                            <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '8px' }} />
                            <Bar dataKey="sent" fill="#3b82f6" name="Offers Sent" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="opened" fill="#f59e0b" name="Opened" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="converted" fill="#10b981" name="Converted" radius={[2, 2, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
