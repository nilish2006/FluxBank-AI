import React from 'react';
import { X, Bell, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const NotificationPanel = ({ isOpen, onClose }) => {
    const notifications = [
        { id: 1, type: 'success', message: 'Pre-approval campaign queued for 15 low-risk customers', time: '5 mins ago' },
        { id: 2, type: 'warning', message: 'High debt indicator flagged on Customer #7 (76% DTI)', time: '18 mins ago' },
        { id: 3, type: 'info', message: 'Scikit-Learn ensemble model synchronized (100% test accuracy)', time: '1 hour ago' },
        { id: 4, type: 'success', message: 'Customer #2 converted to Investment Plan via In-App prompt', time: '3 hours ago' },
    ];

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            width: '340px',
            zIndex: 1000,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden'
        }}>
            <div style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.02)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bell size={16} color="var(--brand-blue)" />
                    <h3 style={{ margin: 0, fontSize: '0.875rem' }}>System Notifications</h3>
                </div>
                <button
                    onClick={onClose}
                    style={{ background: 'transparent', border: 'none', padding: '4px', cursor: 'pointer', color: 'var(--text-tertiary)' }}
                >
                    <X size={16} />
                </button>
            </div>

            <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                {notifications.map(n => (
                    <div
                        key={n.id}
                        style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid var(--border-subtle)',
                            display: 'flex',
                            gap: '12px'
                        }}
                    >
                        <div style={{ marginTop: '2px' }}>
                            {n.type === 'success' && <CheckCircle size={15} color="var(--status-success)" />}
                            {n.type === 'warning' && <AlertTriangle size={15} color="var(--status-warning)" />}
                            {n.type === 'info' && <Info size={15} color="var(--status-info)" />}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', marginBottom: '3px', lineHeight: 1.4 }}>
                                {n.message}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{n.time}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ padding: '10px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.02)', borderTop: '1px solid var(--border-subtle)' }}>
                <button onClick={onClose} className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '4px 12px' }}>
                    Dismiss
                </button>
            </div>
        </div>
    );
};

export default NotificationPanel;
