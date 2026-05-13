import { useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';

export default function SubmissionAndChatbot() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { id: 1, sender: 'bot', text: 'Hi there! I am the FAQ Assistant. How can I help you today?' }
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setChatHistory([...chatHistory, { id: Date.now(), sender: 'user', text: message }]);
    setMessage('');
    
    // Simulate bot response
    setTimeout(() => {
      setChatHistory(prev => [...prev, { id: Date.now(), sender: 'bot', text: 'I am a simulated assistant. How else can I help?' }]);
    }, 1000);
  };

  return (
    <div className="page-content container" style={{ position: 'relative', height: '100%', paddingBottom: '100px' }}>
      <h2 className="text-2xl mb-lg text-center" style={{ textAlign: 'center' }}>Submit a Request</h2>
      
      <div className="flex justify-center w-full">
        {/* Main Form Area */}
        <div className="card w-full" style={{ maxWidth: '800px' }}>
          <form className="flex-col gap-md">
            <div className="flex-col gap-xs">
              <label className="label">Title</label>
              <input type="text" className="input-field" placeholder="Brief summary of the issue" />
            </div>

            <div className="flex-col gap-xs">
              <label className="label">Category</label>
              <select className="input-field">
                <option>Technical Support</option>
                <option>Billing & Subscriptions</option>
                <option>Feature Request</option>
                <option>Account Access</option>
              </select>
            </div>

            <div className="flex-col gap-xs">
              <label className="label">Description</label>
              <textarea 
                className="input-field" 
                rows="6" 
                placeholder="Provide detailed information about the problem..."
                style={{ resize: 'vertical' }}
              ></textarea>
            </div>

            <div className="flex-col gap-xs">
              <label className="label">Attachments (Optional)</label>
              <div style={{
                border: '1px dashed var(--border)',
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-std)',
                textAlign: 'center',
                backgroundColor: 'var(--background)'
              }}>
                <p className="text-muted" style={{ fontSize: '14px' }}>Drag and drop files here, or click to browse</p>
                <input type="file" style={{ display: 'none' }} />
              </div>
            </div>

            <div className="flex justify-end gap-sm mt-md">
              <button type="button" className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary">Submit Ticket</button>
            </div>
          </form>
        </div>
      </div>

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
            zIndex: 50
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
            zIndex: 50,
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-on)', padding: 'var(--space-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="text-lg" style={{ color: 'var(--primary-on)', margin: 0 }}>FAQ Assistant</h3>
            <button 
              onClick={() => setIsChatOpen(false)} 
              style={{ background: 'transparent', border: 'none', color: 'var(--primary-on)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat History */}
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
          </div>

          {/* Input Area */}
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
    </div>
  );
}
