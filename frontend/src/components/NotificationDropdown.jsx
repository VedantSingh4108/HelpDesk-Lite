import { useState } from 'react';
import { Bell } from 'lucide-react';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button 
        className="btn btn-secondary" 
        style={{ padding: '8px', border: 'none', background: 'transparent' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={20} />
      </button>
      
      {isOpen && (
        <div 
          className="card"
          style={{
            position: 'absolute',
            right: 0,
            top: '40px',
            width: '300px',
            padding: '16px',
            zIndex: 10,
            boxShadow: 'var(--shadow-2)'
          }}
        >
          <div className="flex justify-between items-center mb-md">
            <h3 className="text-lg">Notifications</h3>
            <span className="label">Mark all read</span>
          </div>
          <div className="flex-col gap-sm">
            <div style={{ padding: '8px', backgroundColor: 'var(--background)', borderRadius: 'var(--radius-std)' }}>
              <p className="label">System</p>
              <p style={{ fontSize: '14px' }}>Maintenance scheduled for tonight.</p>
            </div>
            <div style={{ padding: '8px', backgroundColor: 'var(--background)', borderRadius: 'var(--radius-std)' }}>
              <p className="label">Ticket #1024</p>
              <p style={{ fontSize: '14px' }}>Status changed to In Progress.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
