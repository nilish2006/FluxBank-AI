import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Phone, PhoneOff, Activity, MessageSquare, Send, User, Bot, Volume2, VolumeX, Shield, ToggleLeft, ToggleRight, Radio } from 'lucide-react';
import { api } from '../services/api';

const VoiceAI = () => {
    const [phoneNumber, setPhoneNumber] = useState('+1 (555) 382-9014');
    const [callStatus, setCallStatus] = useState('IDLE'); // IDLE, CALLING, CONNECTED, ENDED
    const [transcript, setTranscript] = useState([]);
    const [sentimentData, setSentimentData] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [turnState, setTurnState] = useState('idle'); // idle | ai_speaking | listening | processing | ready_to_speak
    const [textInput, setTextInput] = useState('');
    const [autoTurnTaking, setAutoTurnTaking] = useState(true);
    const [muteAIVoice, setMuteAIVoice] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(true);

    const recognitionRef = useRef(null);
    const synthesisRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

    // Operational state refs to avoid stale closures in event listeners
    const isAISpeakingRef = useRef(false);
    const isProcessingRef = useRef(false);
    const isListeningRef = useRef(false);
    const callStatusRef = useRef('IDLE');
    const autoTurnTakingRef = useRef(true);
    const muteAIVoiceRef = useRef(false);
    const lastSpokenByAIRef = useRef({ text: '', timestamp: 0 });
    const cooldownTimeoutRef = useRef(null);
    const currentUtteranceRef = useRef(null);

    // Keep refs in sync with React state
    useEffect(() => {
        callStatusRef.current = callStatus;
    }, [callStatus]);

    useEffect(() => {
        autoTurnTakingRef.current = autoTurnTaking;
    }, [autoTurnTaking]);

    useEffect(() => {
        muteAIVoiceRef.current = muteAIVoice;
    }, [muteAIVoice]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListeningRef.current) {
            try {
                recognitionRef.current.abort();
            } catch (e) {
                // ignore
            }
            isListeningRef.current = false;
            setIsListening(false);
        }
    }, []);

    const startListening = useCallback(() => {
        if (!recognitionRef.current) return;
        if (callStatusRef.current !== 'CONNECTED') return;
        if (isAISpeakingRef.current) return;
        if (isProcessingRef.current) return;
        if (isListeningRef.current) return;

        try {
            recognitionRef.current.start();
            isListeningRef.current = true;
            setIsListening(true);
            setTurnState('listening');
        } catch (e) {
            // If already started or active, ignore
            if (e.name !== 'InvalidStateError') {
                console.warn("Recognition start notice:", e);
            }
        }
    }, []);

    // Speech Synthesis with Anti-Echo locks
    const speak = useCallback((text) => {
        if (!text) return;

        // 1. Immediately kill recognition to guarantee mic is deaf during AI audio playback
        stopListening();
        isAISpeakingRef.current = true;
        setIsSpeaking(true);
        setTurnState('ai_speaking');

        // 2. If voice is muted by user, skip audio playback and transition straight to user turn
        if (muteAIVoiceRef.current || !synthesisRef.current) {
            lastSpokenByAIRef.current = { text, timestamp: Date.now() };
            setTimeout(() => {
                isAISpeakingRef.current = false;
                setIsSpeaking(false);
                if (callStatusRef.current === 'CONNECTED') {
                    if (autoTurnTakingRef.current) {
                        setTurnState('listening');
                        startListening();
                    } else {
                        setTurnState('ready_to_speak');
                    }
                }
            }, 600);
            return;
        }

        try {
            // Clean up any in-flight utterance
            synthesisRef.current.cancel();

            setTimeout(() => {
                const utterance = new SpeechSynthesisUtterance(text);
                currentUtteranceRef.current = utterance;

                const voices = synthesisRef.current.getVoices();
                const preferredVoice = voices.find(v => 
                    v.name.includes("Google US English") || 
                    v.name.includes("Microsoft Zira") || 
                    v.name.includes("Natural") ||
                    (v.lang && v.lang.startsWith("en"))
                );
                if (preferredVoice) utterance.voice = preferredVoice;

                utterance.rate = 1.0;
                utterance.pitch = 1.0;

                const handleSpeechEnd = () => {
                    isAISpeakingRef.current = false;
                    setIsSpeaking(false);
                    lastSpokenByAIRef.current = { text, timestamp: Date.now() };

                    // 3. Acoustic tail buffer (400ms): allow room reverb to dissipate before opening mic
                    if (cooldownTimeoutRef.current) clearTimeout(cooldownTimeoutRef.current);
                    cooldownTimeoutRef.current = setTimeout(() => {
                        if (callStatusRef.current === 'CONNECTED') {
                            if (autoTurnTakingRef.current) {
                                setTurnState('listening');
                                startListening();
                            } else {
                                setTurnState('ready_to_speak');
                            }
                        }
                    }, 400);
                };

                utterance.onend = handleSpeechEnd;
                utterance.onerror = (event) => {
                    console.warn("Speech synthesis notice:", event);
                    handleSpeechEnd();
                };

                synthesisRef.current.speak(utterance);
            }, 30);
        } catch (e) {
            console.warn("Speech synthesis invocation failed:", e);
            isAISpeakingRef.current = false;
            setIsSpeaking(false);
            if (callStatusRef.current === 'CONNECTED' && autoTurnTakingRef.current) {
                startListening();
            }
        }
    }, [startListening, stopListening]);

    const handleUserMessage = useCallback(async (rawText) => {
        const text = (rawText || '').trim();
        if (!text) return;

        // Anti-Echo Filter: Check if text matches what AI just said (acoustic leak from speakers)
        if (isAISpeakingRef.current) {
            console.log("[Echo Suppressor] Dropped audio packet: AI is currently speaking");
            return;
        }

        const now = Date.now();
        const lastSpoken = lastSpokenByAIRef.current;
        if (lastSpoken.text && (now - lastSpoken.timestamp < 3500)) {
            const cleanUser = text.toLowerCase().replace(/[^a-z0-9]/g, '');
            const cleanAI = lastSpoken.text.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (cleanAI.includes(cleanUser) && cleanUser.length > 5) {
                console.log("[Echo Suppressor] Dropped matching speaker feedback echo:", text);
                return;
            }
        }

        // Lock pipeline
        stopListening();
        isProcessingRef.current = true;
        setTurnState('processing');

        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setTranscript(prev => [...prev, { sender: 'Customer', text, time: timeString }]);
        setTextInput('');

        try {
            const isIntroResponse = transcript.length <= 1;
            const context = {
                stage: isIntroResponse ? 'intro_response' : 'conversation'
            };

            const analysis = await api.analyzeSentiment(text, context);
            setSentimentData(analysis);
            isProcessingRef.current = false;

            const aiReply = analysis.ai_response || "Thank you for that information. Let me register that for your profile.";
            setTranscript(prev => [...prev, {
                sender: 'FluxBank Agent',
                text: aiReply,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);

            speak(aiReply);
        } catch (err) {
            console.error("Voice sentiment analysis error:", err);
            isProcessingRef.current = false;
            const fallbackReply = "I understand. I have updated your account profile accordingly.";
            setTranscript(prev => [...prev, {
                sender: 'FluxBank Agent',
                text: fallbackReply,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            speak(fallbackReply);
        }
    }, [speak, stopListening, transcript.length]);

    // Instantiate SpeechRecognition ONCE on component mount
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setSpeechSupported(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            isListeningRef.current = true;
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            if (isAISpeakingRef.current || isProcessingRef.current) {
                return;
            }
            if (event.results && event.results[0] && event.results[0][0]) {
                const transcriptText = event.results[0][0].transcript;
                handleUserMessage(transcriptText);
            }
        };

        recognition.onerror = (event) => {
            isListeningRef.current = false;
            setIsListening(false);
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
                console.warn("Speech recognition warning:", event.error);
            }
        };

        recognition.onend = () => {
            isListeningRef.current = false;
            setIsListening(false);
            // If connected, not speaking, not processing, and in auto mode, restart listening after a tick
            if (callStatusRef.current === 'CONNECTED' && 
                !isAISpeakingRef.current && 
                !isProcessingRef.current && 
                autoTurnTakingRef.current) {
                setTimeout(() => {
                    if (callStatusRef.current === 'CONNECTED' && !isAISpeakingRef.current && !isProcessingRef.current) {
                        startListening();
                    }
                }, 300);
            }
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                try { recognitionRef.current.abort(); } catch (e) {}
            }
            if (synthesisRef.current) {
                try { synthesisRef.current.cancel(); } catch (e) {}
            }
            if (cooldownTimeoutRef.current) {
                clearTimeout(cooldownTimeoutRef.current);
            }
        };
    }, [handleUserMessage, startListening]);

    const handleCall = () => {
        if (!phoneNumber) return;
        setCallStatus('CALLING');
        setTranscript([]);
        setSentimentData(null);
        setTurnState('idle');

        setTimeout(() => {
            setCallStatus('CONNECTED');
            const intro = "Hello! I am calling from FluxBank with a personalized banking update. Am I speaking with the account holder?";
            const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setTranscript([{ sender: 'FluxBank Agent', text: intro, time: timeString }]);
            speak(intro);
        }, 1200);
    };

    const handleHangup = () => {
        setCallStatus('ENDED');
        setTurnState('idle');
        stopListening();
        if (synthesisRef.current) {
            try { synthesisRef.current.cancel(); } catch (e) {}
        }
        if (cooldownTimeoutRef.current) {
            clearTimeout(cooldownTimeoutRef.current);
        }
    };

    const toggleMicManual = () => {
        if (isListening) {
            stopListening();
            setTurnState('ready_to_speak');
        } else {
            startListening();
        }
    };

    return (
        <div className="voice-ai-page" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header with Title and Mode Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <Activity size={22} color="var(--brand-blue)" />
                        <h1>AI Voice Intelligence Agent</h1>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Outbound relationship calling with automated turn-taking, anti-echo acoustic suppression, and sentiment detection.
                    </p>
                </div>

                {/* Controls Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-card)', padding: '6px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        <span>Auto Turn-Taking:</span>
                        <button
                            onClick={() => setAutoTurnTaking(!autoTurnTaking)}
                            className="btn btn-outline"
                            style={{ padding: '3px 8px', fontSize: '0.75rem', borderColor: autoTurnTaking ? 'var(--brand-blue)' : 'var(--border-subtle)', color: autoTurnTaking ? '#93c5fd' : 'var(--text-secondary)' }}
                        >
                            {autoTurnTaking ? 'ON (Hands-Free)' : 'OFF (Push to Talk)'}
                        </button>
                    </div>

                    <div style={{ width: '1px', height: '16px', background: 'var(--border-subtle)' }} />

                    <button
                        onClick={() => setMuteAIVoice(!muteAIVoice)}
                        className="btn btn-outline"
                        style={{ padding: '3px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', color: muteAIVoice ? 'var(--status-warning)' : 'var(--text-secondary)' }}
                        title={muteAIVoice ? 'AI Speech Audio Muted' : 'AI Speech Audio Active'}
                    >
                        {muteAIVoice ? <VolumeX size={14} color="var(--status-warning)" /> : <Volume2 size={14} />}
                        {muteAIVoice ? 'Audio Muted' : 'Audio On'}
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px', alignItems: 'start' }}>
                {/* Left Panel: Softphone Terminal */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 22px' }}>
                    {/* Phone Avatar Circle with Dynamic Status Ring */}
                    <div style={{
                        width: '84px',
                        height: '84px',
                        borderRadius: '50%',
                        background: callStatus === 'CONNECTED' 
                            ? (isSpeaking ? 'rgba(139, 92, 246, 0.2)' : isListening ? 'rgba(16, 185, 129, 0.2)' : 'rgba(37, 99, 235, 0.15)')
                            : callStatus === 'CALLING' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: `2px solid ${callStatus === 'CONNECTED' 
                            ? (isSpeaking ? '#8b5cf6' : isListening ? 'var(--status-success)' : 'var(--brand-blue)')
                            : callStatus === 'CALLING' ? 'var(--status-warning)' : 'var(--border-subtle)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                        transition: 'all 0.3s ease'
                    }} className={isListening ? 'mic-active-pulse' : ''}>
                        <Phone size={34} color={callStatus === 'CONNECTED' 
                            ? (isSpeaking ? '#a78bfa' : isListening ? 'var(--status-success)' : '#93c5fd')
                            : callStatus === 'CALLING' ? 'var(--status-warning)' : 'var(--text-secondary)'} />
                    </div>

                    <h2 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>
                        {callStatus === 'IDLE' ? 'Outbound Dialer' : callStatus === 'CALLING' ? 'Dialing Customer...' : callStatus === 'CONNECTED' ? 'Call In Progress' : 'Call Completed'}
                    </h2>

                    {/* Turn State Banner */}
                    <div style={{ minHeight: '26px', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {callStatus === 'CONNECTED' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem' }}>
                                {turnState === 'ai_speaking' && (
                                    <span style={{ color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Volume2 size={15} /> AI is speaking... <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>(Mic Muted)</span>
                                    </span>
                                )}
                                {turnState === 'listening' && (
                                    <span style={{ color: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                                        <span className="status-dot online" /> Listening... Speak now
                                    </span>
                                )}
                                {turnState === 'processing' && (
                                    <span style={{ color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Activity size={15} className="spin" /> Processing your answer...
                                    </span>
                                )}
                                {turnState === 'ready_to_speak' && (
                                    <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Mic size={15} /> Tap "Speak" when ready
                                    </span>
                                )}
                            </div>
                        )}
                        {callStatus !== 'CONNECTED' && (
                            <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                                Automated personalized banking outreach
                            </span>
                        )}
                    </div>

                    {/* Dialer Input Form */}
                    {callStatus === 'IDLE' && (
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '6px' }}>Target Customer Number</label>
                                <input
                                    type="text"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    style={{ width: '100%', textAlign: 'center', fontWeight: 600 }}
                                />
                            </div>
                            <button className="btn btn-primary" onClick={handleCall} style={{ width: '100%', padding: '10px' }}>
                                <Phone size={16} /> Initiate Outbound Call
                            </button>
                        </div>
                    )}

                    {callStatus === 'CALLING' && (
                        <button className="btn btn-outline" onClick={handleHangup} style={{ width: '100%' }}>
                            Cancel Call
                        </button>
                    )}

                    {/* Active In-Call Controls */}
                    {callStatus === 'CONNECTED' && (
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    className={`btn ${isListening ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={toggleMicManual}
                                    style={{ flex: 1, borderColor: isListening ? 'var(--status-success)' : 'var(--border-subtle)', background: isListening ? 'var(--status-success)' : 'var(--bg-input)' }}
                                    title="Toggle microphone"
                                >
                                    <Mic size={16} /> {isListening ? 'Stop Mic' : 'Tap to Speak'}
                                </button>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => speak("Hello, this is FluxBank with an exclusive product offer.")}
                                    title="Replay greeting"
                                >
                                    <Volume2 size={16} />
                                </button>
                            </div>

                            <button
                                className="btn"
                                onClick={handleHangup}
                                style={{ background: 'var(--status-danger)', color: 'white', width: '100%' }}
                            >
                                <PhoneOff size={16} /> End Call Session
                            </button>
                        </div>
                    )}

                    {callStatus === 'ENDED' && (
                        <button className="btn btn-secondary" onClick={() => setCallStatus('IDLE')} style={{ width: '100%' }}>
                            Start Another Call
                        </button>
                    )}

                    {/* Quick Simulation Prompts for Instant Testing */}
                    {callStatus === 'CONNECTED' && (
                        <div style={{ width: '100%', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '8px' }}>
                                Quick Test Prompts (1-Click):
                            </span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <button
                                    className="btn btn-outline"
                                    style={{ fontSize: '0.75rem', justifyContent: 'flex-start', padding: '5px 8px' }}
                                    onClick={() => handleUserMessage("Yes, this is the account holder speaking.")}
                                >
                                    "Yes, account holder speaking"
                                </button>
                                <button
                                    className="btn btn-outline"
                                    style={{ fontSize: '0.75rem', justifyContent: 'flex-start', padding: '5px 8px' }}
                                    onClick={() => handleUserMessage("I am interested, tell me more about the offer.")}
                                >
                                    "Interested, tell me more"
                                </button>
                                <button
                                    className="btn btn-outline"
                                    style={{ fontSize: '0.75rem', justifyContent: 'flex-start', padding: '5px 8px' }}
                                    onClick={() => handleUserMessage("I don't want any loans or high risk products.")}
                                >
                                    "I don't want any loans"
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel: Live Dialogue Transcript & Sentiment Inference */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Transcript Box */}
                    <div className="glass-card" style={{ height: '370px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                        <div style={{
                            padding: '12px 18px',
                            borderBottom: '1px solid var(--border-subtle)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(255, 255, 255, 0.02)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MessageSquare size={16} color="var(--brand-blue)" />
                                <h3 style={{ fontSize: '0.875rem', margin: 0 }}>Call Dialogue Stream</h3>
                            </div>
                            <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                                {transcript.length} turns
                            </span>
                        </div>

                        <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {transcript.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                                    Call stream will populate here once a call is initiated.
                                </div>
                            ) : (
                                transcript.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            alignSelf: msg.sender === 'Customer' ? 'flex-end' : 'flex-start',
                                            maxWidth: '80%'
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontSize: '0.7rem',
                                            color: 'var(--text-tertiary)',
                                            marginBottom: '3px',
                                            justifyContent: msg.sender === 'Customer' ? 'flex-end' : 'flex-start'
                                        }}>
                                            {msg.sender === 'Customer' ? <User size={12} /> : <Bot size={12} color="#60a5fa" />}
                                            <span>{msg.sender}</span>
                                            <span>•</span>
                                            <span>{msg.time}</span>
                                        </div>
                                        <div style={{
                                            background: msg.sender === 'Customer' ? 'rgba(37, 99, 235, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                            border: `1px solid ${msg.sender === 'Customer' ? 'rgba(37, 99, 235, 0.3)' : 'var(--border-subtle)'}`,
                                            padding: '10px 14px',
                                            borderRadius: 'var(--radius-sm)',
                                            fontSize: '0.8125rem',
                                            lineHeight: 1.45,
                                            color: 'var(--text-primary)'
                                        }}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Text input form for hybrid speech/text conversation */}
                        {callStatus === 'CONNECTED' && (
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleUserMessage(textInput); }}
                                style={{
                                    padding: '10px 14px',
                                    borderTop: '1px solid var(--border-subtle)',
                                    display: 'flex',
                                    gap: '8px',
                                    background: 'rgba(255, 255, 255, 0.015)'
                                }}
                            >
                                <input
                                    type="text"
                                    placeholder={isListening ? "Listening to your voice (or type here)..." : "Type customer response..."}
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    style={{ flex: 1, fontSize: '0.8125rem' }}
                                />
                                <button type="submit" className="btn btn-primary" disabled={!textInput.trim()}>
                                    <Send size={14} />
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Real-time Telemetry & Sentiment Card */}
                    <div className="glass-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Activity size={16} color="var(--status-success)" />
                                <h3 style={{ fontSize: '0.875rem', margin: 0 }}>Conversational Intent & Next Action</h3>
                            </div>
                            <span className="badge badge-neutral">AI Inference</span>
                        </div>

                        {sentimentData ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '14px' }}>
                                <div style={{ background: 'rgba(255, 255, 255, 0.025)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Detected Sentiment</div>
                                    <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--status-warning)', marginTop: '4px' }}>
                                        {sentimentData.sentiment}
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(255, 255, 255, 0.025)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>CRM Follow-Up Action</div>
                                    <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--status-success)', marginTop: '4px' }}>
                                        {sentimentData.recommended_follow_up}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                                Sentiment signals will calculate as dialogue exchanges occur.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoiceAI;
