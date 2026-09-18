import React from 'react';
import { Mic, Radio, MessageSquare, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const VoiceEnginePanel = ({ voiceData }) => {
    if (!voiceData) return null;

    const { voice_call_status, dynamic_script, detected_sentiment, recommended_follow_up } = voiceData;

    return (
        <div className="glass-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '28px', height: '28px', borderRadius: 'var(--radius-sm)',
                        background: 'rgba(139, 92, 246, 0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#a78bfa'
                    }}>
                        <Mic size={16} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '0.875rem', margin: 0 }}>AI Voice Intelligence Engine</h3>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Simulated Interactive Outreach</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="status-dot online" style={{ background: '#a78bfa' }} />
                    <span style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600 }}>{voice_call_status}</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Detected Sentiment</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {detected_sentiment}
                    </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Actionable Follow-Up</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--status-success)', marginTop: '2px' }}>
                        {recommended_follow_up || 'Standard Schedule'}
                    </div>
                </div>
            </div>

            <div style={{
                background: 'rgba(0, 0, 0, 0.25)',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '12px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <MessageSquare size={13} color="#a78bfa" />
                    <span style={{ fontSize: '0.7rem', color: '#a78bfa', fontWeight: 600, textTransform: 'uppercase' }}>
                        Dynamic Outreach Script
                    </span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>
                    "{dynamic_script}"
                </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Link to="/voice-ai" className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '5px 10px' }}>
                    Launch Softphone Simulator <ArrowUpRight size={13} />
                </Link>
            </div>
        </div>
    );
};

export default VoiceEnginePanel;
