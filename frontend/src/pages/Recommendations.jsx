import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FileText, Filter, CheckCircle, Shield, ArrowUpRight, Search, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Recommendations = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState('All');
    const [minConfidence, setMinConfidence] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const fetchRecommendations = () => {
        setLoading(true);
        api.getRecommendations({ product: selectedProduct, minConfidence })
            .then(data => {
                setRecommendations(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading recommendations:", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchRecommendations();
    }, [selectedProduct, minConfidence]);

    const products = ['All', 'Home Loan', 'Car Loan', 'Investment Plan', 'Premium Credit Card', 'Personal Loan'];

    const filtered = recommendations.filter(r => {
        const matchesSearch = String(r.customerId).toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.persona.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="recommendations-page" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <FileText size={22} color="var(--brand-blue)" />
                        <h1>Cross-Sell Recommendation Feed</h1>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Live automated product matching stream evaluated against risk policy and customer affinity.
                    </p>
                </div>

                <button className="btn btn-secondary" onClick={fetchRecommendations} disabled={loading}>
                    <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Stream
                </button>
            </div>

            {/* Filter Bar */}
            <div className="glass-card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Filter size={14} /> Product Filter:
                    </span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {products.map(p => (
                            <button
                                key={p}
                                onClick={() => setSelectedProduct(p)}
                                style={{
                                    padding: '4px 10px',
                                    fontSize: '0.75rem',
                                    borderRadius: 'var(--radius-full)',
                                    border: '1px solid',
                                    borderColor: selectedProduct === p ? 'var(--brand-blue)' : 'var(--border-subtle)',
                                    background: selectedProduct === p ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
                                    color: selectedProduct === p ? '#93c5fd' : 'var(--text-secondary)',
                                    cursor: 'pointer'
                                }}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Min Score:</span>
                        <select
                            value={minConfidence}
                            onChange={(e) => setMinConfidence(Number(e.target.value))}
                            style={{ padding: '4px 8px', fontSize: '0.8125rem' }}
                        >
                            <option value={0}>All Scores</option>
                            <option value={80}>80%+ High Match</option>
                            <option value={90}>90%+ Top Tier</option>
                        </select>
                    </div>

                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: '5px 10px', fontSize: '0.8125rem', width: '160px' }}
                    />
                </div>
            </div>

            {/* Recommendations Table */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '50px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Aggregating live recommendations...
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: '50px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                        No recommendation records found matching current criteria.
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="banking-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Recommended Product</th>
                                    <th>Fit Score</th>
                                    <th>Compliance</th>
                                    <th>Persona</th>
                                    <th>Primary Channel</th>
                                    <th>Generated</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((item) => (
                                    <tr key={item.id}>
                                        <td style={{ fontWeight: 600 }}>
                                            <span style={{ color: '#93c5fd' }}>Customer #{item.customerId}</span>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                Score: {item.creditScore} • ${Number(item.savings || 0).toLocaleString()}
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{item.product}</td>
                                        <td>
                                            <span className={`badge ${item.confidence >= 90 ? 'badge-success' : 'badge-info'}`}>
                                                {item.confidence}%
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${item.complianceStatus === 'Cleared' ? 'badge-neutral' : 'badge-warning'}`}>
                                                <Shield size={10} /> {item.complianceStatus}
                                            </span>
                                        </td>
                                        <td>{item.persona}</td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{item.channel}</td>
                                        <td style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>{item.timestamp}</td>
                                        <td>
                                            <span className={`badge ${item.status === 'Converted' ? 'badge-success' : item.status === 'Action Required' ? 'badge-warning' : 'badge-neutral'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                className="btn btn-outline"
                                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                                onClick={() => navigate('/customers')}
                                            >
                                                Inspect <ArrowUpRight size={12} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Recommendations;
