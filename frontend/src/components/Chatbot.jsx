import React, { useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';

export default function Chatbot() {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { id: 1, sender: 'bot', text: 'Hi there! I am the FAQ Assistant. How can I help you today?' }
    ]);
    const [isTyping, setIsTyping] = useState(false);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const userMessage = message;

        setChatHistory(prev => [...prev, { id: Date.now(), sender: 'user', text: userMessage }]);
        setMessage('');
        setIsTyping(true);

        try {
            const token = localStorage.getItem('helpdeskToken');

            const response = await fetch('http://localhost:5000/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: userMessage }),
            });

            const data = await response.json();

            if (response.ok) {
                setChatHistory(prev => [...prev, { id: Date.now(), sender: 'bot', text: data.reply }]);
            } else {
                setChatHistory(prev => [...prev, { id: Date.now(), sender: 'bot', text: 'Error connecting to the AI brain.' }]);
            }
        } catch (error) {
            setChatHistory(prev => [...prev, { id: Date.now(), sender: 'bot', text: 'Server error. Is the backend running?' }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            {!isChatOpen && (
                <button
                    className="btn btn-primary"
                    style={{
                        position: 'fixed',
                        bottom: 'var(--space-xl)',
                        right: 'var(--space-xl)',
                        borderRadius: '50%',
                        width: '60px',
                        height: '60px',
                        padding: 0,
                        boxShadow: 'var(--shadow-2)',
                        zIndex: 9999 // High z-index to stay above everything
                    }}
                    onClick={() => setIsChatOpen(true)}
                >
                    <MessageSquare size={24} />
                </button>
            )}

            {/* Chat Window */}
            {isChatOpen && (
                <div
                    className="card"
                    style={{
                        position: 'fixed',
                        bottom: 'var(--space-xl)',
                        right: 'var(--space-xl)',
                        width: '350px',
                        height: '500px',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: 0,
                        boxShadow: 'var(--shadow-2)',
                        zIndex: 9999,
                        overflow: 'hidden'
                    }}
                >
                    <div style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-on)', padding: 'var(--space-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="text-lg" style={{ color: 'var(--primary-on)', margin: 0 }}>FAQ Assistant</h3>
                        <button
                            onClick={() => setIsChatOpen(false)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--primary-on)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', backgroundColor: 'var(--background)' }}>
                        {chatHistory.map(msg => (
                            <div key={msg.id} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                                <div style={{
                                    padding: '10px 14px',
                                    borderRadius: 'var(--radius-lg)',
                                    backgroundColor: msg.sender === 'user' ? 'var(--primary)' : 'var(--surface)',
                                    color: msg.sender === 'user' ? 'var(--primary-on)' : 'var(--text-main)',
                                    boxShadow: msg.sender === 'user' ? 'none' : 'var(--shadow-1)',
                                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border)',
                                    borderBottomRightRadius: msg.sender === 'user' ? '0px' : 'var(--radius-lg)',
                                    borderBottomLeftRadius: msg.sender === 'bot' ? '0px' : 'var(--radius-lg)'
                                }}>
                                    <p style={{ fontSize: '14px', margin: 0, lineHeight: '1.4' }}>{msg.text}</p>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
                                <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderBottomLeftRadius: '0px', fontStyle: 'italic', fontSize: '13px' }}>
                                    Agent is typing...
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ padding: 'var(--space-sm)', borderTop: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
                        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Type your message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                style={{ flex: 1 }}
                            />
                            <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px' }}>
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}