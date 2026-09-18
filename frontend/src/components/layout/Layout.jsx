import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Mic, BarChart2, Settings, ShieldCheck, Bell } from 'lucide-react';
import NotificationPanel from '../NotificationPanel';
import { api } from '../../services/api';
import '../../styles/dashboard.css';

const Sidebar = ({ onToggleNotifications }) => {
    const [systemStatus, setSystemStatus] = useState('Checking...');

    useEffect(() => {
        api.getHealth()
            .then(res => {
                setSystemStatus(res.ml_service_status === 'healthy' ? 'AI Engine Active' : 'Fallback Engine Active');
            })
            .catch(() => setSystemStatus('Standalone Mode'));
    }, []);

    return (
        <div className="sidebar-nav">
            <div style={{ marginBottom: '28px', padding: '4px 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '8px',
                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 'bold'
                    }}>
                        <ShieldCheck size={22} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.125rem', letterSpacing: '-0.02em', color: '#ffffff' }}>FluxBank</h2>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            AI Cross-Sell Agent
                        </span>
                    </div>
                </div>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard size={18} /> Overview
                </NavLink>
                <NavLink to="/customers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Users size={18} /> Customer Intelligence
                </NavLink>
                <NavLink to="/recommendations" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <FileText size={18} /> Cross-Sell Feed
                </NavLink>
                <NavLink to="/voice-ai" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Mic size={18} /> Voice Intelligence
                </NavLink>
                <NavLink to="/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <BarChart2 size={18} /> Portfolio Analytics
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Settings size={18} /> Policy & Rules
                </NavLink>
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                    onClick={onToggleNotifications}
                    className="btn btn-outline"
                    style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '14px', fontSize: '0.8125rem' }}
                >
                    <Bell size={16} /> Alerts & Notifications
                </button>
                <div style={{ padding: '0 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Risk Officer</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Authorized Portal</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="status-dot online" />
                        <span style={{ fontSize: '0.7rem', color: 'var(--status-success)', fontWeight: 500 }}>
                            {systemStatus}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Layout = () => {
    const [showNotifications, setShowNotifications] = useState(false);

    return (
        <div className="app-layout">
            <aside className="app-sidebar">
                <Sidebar onToggleNotifications={() => setShowNotifications(!showNotifications)} />
            </aside>
            <main className="app-main">
                <Outlet />
            </main>
            <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
        </div>
    );
};

export default Layout;
