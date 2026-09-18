import React, { useState } from 'react';
import { Users, Search, Filter } from 'lucide-react';

const CustomerSelector = ({ customers = [], onSelect, selectedId }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [personaFilter, setPersonaFilter] = useState('All');

    const personas = ['All', 'Investor', 'Saver', 'High Spender', 'Credit Elite'];

    const filtered = customers.filter(c => {
        const id = String(c.customer_id || '').toLowerCase();
        const chat = String(c.last_chat_text || '').toLowerCase();
        const prod = String(c.target_product || '').toLowerCase();
        const persona = String(c.persona || '').toLowerCase();
        const search = searchTerm.toLowerCase();

        const matchesSearch = id.includes(search) || chat.includes(search) || prod.includes(search) || persona.includes(search);
        const matchesPersona = personaFilter === 'All' || c.persona === personaFilter;

        return matchesSearch && matchesPersona;
    });

    return (
        <div className="customer-sidebar">
            <div style={{ padding: '16px 14px 10px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={18} color="var(--brand-blue)" />
                        <h3 style={{ margin: 0, fontSize: '0.9375rem' }}>Customer Portfolio</h3>
                    </div>
                    <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                        {filtered.length} of {customers.length}
                    </span>
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative', marginBottom: '10px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-tertiary)' }} />
                    <input
                        type="text"
                        placeholder="Search ID, intent, product..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '7px 10px 7px 32px',
                            fontSize: '0.8125rem'
                        }}
                    />
                </div>

                {/* Persona Filter Chips */}
                <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {personas.map(p => (
                        <button
                            key={p}
                            onClick={() => setPersonaFilter(p)}
                            style={{
                                padding: '3px 8px',
                                fontSize: '0.7rem',
                                borderRadius: 'var(--radius-full)',
                                border: '1px solid',
                                borderColor: personaFilter === p ? 'var(--brand-blue)' : 'var(--border-subtle)',
                                background: personaFilter === p ? 'rgba(37, 99, 235, 0.18)' : 'transparent',
                                color: personaFilter === p ? '#93c5fd' : 'var(--text-secondary)',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
                {filtered.length === 0 ? (
                    <div style={{ padding: '30px 15px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                        No customers match this search.
                    </div>
                ) : (
                    filtered.map((c) => {
                        const isSelected = selectedId === c.customer_id;
                        return (
                            <div
                                key={c.customer_id}
                                className={`customer-item ${isSelected ? 'selected' : ''}`}
                                onClick={() => onSelect(c)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: isSelected ? '#93c5fd' : 'var(--text-primary)' }}>
                                        Customer #{c.customer_id}
                                    </span>
                                    <span className="badge badge-neutral" style={{ fontSize: '0.6875rem', padding: '1px 6px' }}>
                                        Score {c.credit_score}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    <span>{c.persona || 'Standard'}</span>
                                    <span style={{ color: 'var(--text-tertiary)' }}>
                                        ${Number(c.savings || 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default CustomerSelector;
