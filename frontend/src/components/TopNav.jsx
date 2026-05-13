import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';
import { User, LogOut } from 'lucide-react';

export default function TopNav({ role = 'user' }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsProfileOpen(false);
    navigate('/');
  };

  return (
    <header style={{
      height: '64px',
      borderBottom: '1px solid var(--border)',
      backgroundColor: 'var(--surface)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 var(--space-lg)'
    }}>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-lg">
          <Link to={role === 'admin' ? '/admin' : role === 'agent' ? '/agent' : '/submit'} style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1 className="text-xl">HelpdeskPlatform</h1>
          </Link>
          
          {role === 'user' && (
            <nav className="flex gap-md">
              <Link to="/submit" style={{ textDecoration: 'none', color: 'var(--text-muted)' }}>Submit Ticket</Link>
              <Link to="/my-tickets" style={{ textDecoration: 'none', color: 'var(--text-muted)' }}>My Tickets</Link>
              <Link to="/support" style={{ textDecoration: 'none', color: 'var(--text-muted)' }}>Support</Link>
            </nav>
          )}
        </div>
        
        <div className="flex items-center gap-md">
          <NotificationDropdown />
          
          <div ref={profileRef} style={{ position: 'relative' }}>
            <div 
              className="flex items-center gap-sm" 
              style={{ cursor: 'pointer' }}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                backgroundColor: 'var(--primary)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <User size={16} />
              </div>
            </div>

            {isProfileOpen && (
              <div 
                className="card"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '40px',
                  width: '240px',
                  padding: '16px',
                  zIndex: 50,
                  boxShadow: 'var(--shadow-2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-md)'
                }}
              >
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-sm)' }}>
                  <p style={{ fontWeight: 500 }}>Jane Doe</p>
                  <p className="text-muted" style={{ fontSize: '14px' }}>jane.doe@company.com</p>
                </div>
                
                <div className="flex-col gap-sm">
                  <Link 
                    to="#" 
                    style={{ textDecoration: 'none', color: 'var(--text-main)', fontSize: '14px', padding: '4px 0' }}
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Settings
                  </Link>
                  <button 
                    onClick={handleLogout}
                    style={{ 
                      background: 'none', border: 'none', color: 'var(--error)', 
                      fontSize: '14px', padding: '4px 0', display: 'flex', 
                      alignItems: 'center', gap: '8px', cursor: 'pointer', textAlign: 'left',
                      fontFamily: 'inherit'
                    }}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
