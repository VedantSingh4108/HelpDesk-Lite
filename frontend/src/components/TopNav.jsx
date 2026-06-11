import { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';

export default function TopNav({ role = 'user' }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // 1. Safely grab the logged-in user from Local Storage
  const loggedInUser = JSON.parse(localStorage.getItem('helpdeskUser')) || {};

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

  // 2. Safely log the user out
  const handleLogout = () => {
    setIsProfileOpen(false);
    localStorage.removeItem('helpdeskToken');
    localStorage.removeItem('helpdeskUser');
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

      {/* Dynamic CSS Injection to handle NavLink active states! */}
      <style>{`
        .top-nav-link {
          text-decoration: none;
          color: var(--text-muted);
          font-weight: 500;
          padding: 8px 12px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        
        .top-nav-link:hover {
          color: var(--text-main);
          background-color: var(--background);
        }

        /* This is the magic class React Router attaches automatically! */
        .top-nav-link.active {
          color: var(--primary);
          background-color: #eff6ff; /* A very light blue tint */
        }
      `}</style>

      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-lg">
          <Link to={role === 'admin' ? '/admin' : role === 'agent' ? '/agent' : '/submit'} style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1 className="text-xl">HelpdeskPlatform</h1>
          </Link>

          {role === 'user' && (
            <nav className="flex gap-sm">
              <NavLink to="/submit" className="top-nav-link">Submit Ticket</NavLink>
              <NavLink to="/my-tickets" className="top-nav-link">My Tickets</NavLink>
              <NavLink to="/support" className="top-nav-link">Support</NavLink>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-md">
          {/* NotificationDropdown component REMOVED entirely */}

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
                  <p style={{ fontWeight: 500 }}>{loggedInUser.name || 'Support Agent'}</p>
                  <p className="text-muted" style={{ fontSize: '14px' }}>{loggedInUser.email || 'agent@helpdesk.com'}</p>
                </div>

                <div className="flex-col gap-sm">
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