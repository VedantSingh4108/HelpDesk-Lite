import { Filter } from 'lucide-react';

export default function MyTickets() {
  const dummyTickets = [
    { id: 'T-1023', title: 'Cannot access VPN', status: 'In Progress', date: 'Oct 24, 2023', statusClass: 'status-progress' },
    { id: 'T-0982', title: 'Billing error on recent invoice', status: 'Open', date: 'Oct 22, 2023', statusClass: 'status-open' },
    { id: 'T-0841', title: 'Requesting Adobe CC License', status: 'Resolved', date: 'Oct 15, 2023', statusClass: 'status-resolved' }
  ];

  return (
    <div className="page-content container">
      <div className="flex justify-between items-center mb-lg">
        <h2 className="text-2xl">My Tickets</h2>
        <button className="btn btn-secondary">
          <Filter size={16} /> Filter
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--background)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
              <th className="label" style={{ padding: 'var(--space-md)' }}>Ticket ID</th>
              <th className="label" style={{ padding: 'var(--space-md)' }}>Title</th>
              <th className="label" style={{ padding: 'var(--space-md)' }}>Date</th>
              <th className="label" style={{ padding: 'var(--space-md)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {dummyTickets.map(ticket => (
              <tr key={ticket.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: 'var(--space-md)', fontWeight: 500 }}>{ticket.id}</td>
                <td style={{ padding: 'var(--space-md)' }}>{ticket.title}</td>
                <td style={{ padding: 'var(--space-md)', color: 'var(--text-muted)' }}>{ticket.date}</td>
                <td style={{ padding: 'var(--space-md)' }}>
                  <span className={`badge ${ticket.statusClass}`}>{ticket.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
