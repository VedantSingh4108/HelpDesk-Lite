import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';

export default function LoginScreen() {
  const navigate = useNavigate();

  // 1. Add state to capture input and errors
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  // 2. The real API call to the backend
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null); // Clear any previous errors

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // IT WORKED! Save token and route based on the ACTUAL database role
        localStorage.setItem('helpdeskToken', data.token);
        localStorage.setItem('helpdeskUser', JSON.stringify(data));

        if (data.role === 'admin') navigate('/admin');
        else if (data.role === 'support-agent') navigate('/agent');
        else navigate('/submit');
      } else {
        // Backend rejected the credentials
        setError(data.message);
      }
    } catch (err) {
      setError("Server is not responding. Is your backend running?");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-full bg-gradient-to-br from-slate-100 to-blue-50 p-4 relative overflow-hidden">

      {/* Initial Center Color Splash (Circular Rays) */}
      <div
        className="fixed top-1/2 left-1/2 w-32 h-32 rounded-full animate-splash pointer-events-none z-0"
        style={{ background: 'repeating-conic-gradient(from 0deg, #3b82f6 0deg 15deg, #8b5cf6 15deg 30deg)' }}
      ></div>

      {/* Solid Ping-Pong Background Balls (Center Burst) */}
      <div className="fixed inset-0 pointer-events-none animate-fade-in-delayed z-0">
        <div className="absolute top-[calc(50%-40px)] left-[calc(50%-40px)] animate-ping-pong-x-1">
          <div className="w-20 h-20 bg-blue-500 rounded-full shadow-lg animate-ping-pong-y-1"></div>
        </div>
        <div className="absolute top-[calc(50%-40px)] left-[calc(50%-40px)] animate-ping-pong-x-2">
          <div className="w-20 h-20 bg-indigo-500 rounded-full shadow-lg animate-ping-pong-y-2"></div>
        </div>
        <div className="absolute top-[calc(50%-40px)] left-[calc(50%-40px)] animate-ping-pong-x-3">
          <div className="w-20 h-20 bg-purple-500 rounded-full shadow-lg animate-ping-pong-y-3"></div>
        </div>
        <div className="absolute top-[calc(50%-40px)] left-[calc(50%-40px)] animate-ping-pong-x-4">
          <div className="w-20 h-20 bg-violet-400 rounded-full shadow-lg animate-ping-pong-y-4"></div>
        </div>
        <div className="absolute top-[calc(50%-40px)] left-[calc(50%-40px)] animate-ping-pong-x-5">
          <div className="w-20 h-20 bg-blue-400 rounded-full shadow-lg animate-ping-pong-y-5"></div>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl w-full max-w-md p-10 border border-slate-100 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">{'Welcome Back'}</h1>
          <p className="text-slate-500 text-[15px]">
            {'Please sign in to your Corporate Helpdesk'}
          </p>
        </div>

        {/* 3. Display error message if login fails */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide font-['IBM_Plex_Sans']">{'Email Address'}</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center justify-center pointer-events-none">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)} // Bind state
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder={'employee@company.com'}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide font-['IBM_Plex_Sans']">{'Password'}</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center justify-center pointer-events-none">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)} // Bind state
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder={'••••••••'}
              />
            </div>
          </div>

          {/* MOCK DROPDOWN REMOVED */}

          <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-lg mt-4 transition-colors text-[15px]">
            {'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}