import { BarChart, Inbox } from 'lucide-react';
import { allDummyTickets } from '../data/dummyData';

export default function AdminAnalytics() {
  const totalTickets = allDummyTickets.length;
  const openTickets = allDummyTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  const resolvedTickets = allDummyTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

  return (
    <div className="page-content container">
      <h2 className="text-2xl mb-lg">Admin Analytics</h2>
      
      {/* Stats Cards */}
      <div className="flex gap-lg mb-lg">
        <div className="card" style={{ flex: 1 }}>
          <div className="flex items-center gap-md mb-sm">
            <div style={{ padding: '8px', backgroundColor: 'var(--secondary-bg)', borderRadius: 'var(--radius-std)' }}>
              <Inbox size={20} color="var(--primary)" />
            </div>
            <p className="label">Total Tickets</p>
          </div>
          <p className="text-2xl">{totalTickets}</p>
        </div>
        
        <div className="card" style={{ flex: 1 }}>
          <div className="flex items-center gap-md mb-sm">
            <div style={{ padding: '8px', backgroundColor: '#dbeafe', borderRadius: 'var(--radius-std)' }}>
              <Inbox size={20} color="#1d4ed8" />
            </div>
            <p className="label">Open / In Progress</p>
          </div>
          <p className="text-2xl">{openTickets}</p>
        </div>

        <div className="card" style={{ flex: 1 }}>
          <div className="flex items-center gap-md mb-sm">
            <div style={{ padding: '8px', backgroundColor: '#d1fae5', borderRadius: 'var(--radius-std)' }}>
              <Inbox size={20} color="#047857" />
            </div>
            <p className="label">Resolved / Closed</p>
          </div>
          <p className="text-2xl">{resolvedTickets}</p>
        </div>
      </div>

      {/* Main Chart Placeholder */}
      <div className="card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
        <h3 className="text-lg mb-md">Ticket Volume Trends</h3>
        <div className="flex items-center justify-center" style={{ flex: 1, border: '1px dashed var(--border)', borderRadius: 'var(--radius-std)', backgroundColor: 'var(--background)' }}>
          <div className="text-muted flex-col items-center gap-sm">
            <BarChart size={48} />
            <p>Chart Data Placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );
}
