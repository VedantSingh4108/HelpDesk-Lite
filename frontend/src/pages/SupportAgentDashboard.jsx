import { useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { allDummyTickets } from '../data/dummyData';

export default function SupportAgentDashboard() {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const showFilters = searchParams.get('showFilters') === 'true';

  // Dummy agent ID
  const currentAgentId = 'A-001';

  // Track if the view is set to 'All Tickets' or 'My Assigned' based on nested route
  const filterType = location.pathname === '/agent/my-assigned' ? 'assigned' : 'all';

  // Additional filter state for the popover/row
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Apply filters
  let displayedTickets = allDummyTickets;
  
  if (filterType === 'assigned') {
    displayedTickets = displayedTickets.filter(t => t.assigneeId === currentAgentId);
  }

  if (categoryFilter !== 'All') {
    displayedTickets = displayedTickets.filter(t => t.category === categoryFilter);
  }

  if (priorityFilter !== 'All') {
    displayedTickets = displayedTickets.filter(t => t.priority === priorityFilter);
  }

  return (
    <div className="flex h-full w-full" style={{ position: 'relative' }}>
      {/* Main Ticket List */}
      <div className="page-content" style={{ flex: 1 }}>
        <div className="flex justify-between items-center mb-md">
          <h2 className="text-xl">
            {filterType === 'assigned' ? 'My Assigned Tickets' : 'All Tickets'}
          </h2>
          <div className="flex gap-sm">
            <select className="input-field" style={{ width: 'auto' }}>
              <option>All Statuses</option>
              <option>Open</option>
              <option>In Progress</option>
              <option>Resolved</option>
              <option>Closed</option>
            </select>
          </div>
        </div>

        {/* Optional Filter Row */}
        {showFilters && (
          <div className="card mb-md flex gap-md items-center" style={{ padding: 'var(--space-sm) var(--space-md)' }}>
            <p className="label">Advanced Filters:</p>
            <select className="input-field" style={{ width: '180px' }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="All">All Categories</option>
              <option value="Technical Support">Technical Support</option>
              <option value="Billing & Subscriptions">Billing & Subscriptions</option>
              <option value="Account Access">Account Access</option>
            </select>
            <select className="input-field" style={{ width: '150px' }} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <button className="btn btn-secondary" onClick={() => { setCategoryFilter('All'); setPriorityFilter('All'); }} style={{ marginLeft: 'auto' }}>
              Clear
            </button>
          </div>
        )}

        <div className="flex-col gap-sm">
          {displayedTickets.length === 0 ? (
            <p className="text-muted" style={{ padding: 'var(--space-md)' }}>No tickets found matching your criteria.</p>
          ) : (
            displayedTickets.map(ticket => (
              <div 
                key={ticket.id} 
                className="card flex justify-between items-center" 
                style={{ cursor: 'pointer', padding: 'var(--space-md)' }}
                onClick={() => setSelectedTicket(ticket)}
              >
                <div>
                  <span className="label mr-md" style={{ marginRight: '8px' }}>{ticket.id}</span>
                  <span style={{ fontWeight: 500 }}>{ticket.title}</span>
                </div>
                <div className="flex items-center gap-md">
                  <span className={`badge ${ticket.statusClass}`}>{ticket.status}</span>
                  <span className="label">{ticket.priority}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right-hand Slide-out Panel */}
      {selectedTicket && (
        <div 
          style={{
            width: '400px',
            borderLeft: '1px solid var(--border)',
            backgroundColor: 'var(--surface)',
            padding: 'var(--space-lg)',
            boxShadow: '-4px 0 15px rgba(0,0,0,0.05)',
            overflowY: 'auto'
          }}
        >
          <div className="flex justify-between items-center mb-md">
            <h3 className="text-lg">Ticket Details</h3>
            <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => setSelectedTicket(null)}>Close</button>
          </div>
          
          <div className="flex-col gap-md">
            <div>
              <p className="label">Ticket ID</p>
              <p>{selectedTicket.id}</p>
            </div>
            <div>
              <p className="label">Title</p>
              <p style={{ fontWeight: 500 }}>{selectedTicket.title}</p>
            </div>
            <div>
              <p className="label">Category</p>
              <p>{selectedTicket.category}</p>
            </div>
            <div>
              <p className="label">Status</p>
              <select className="input-field mt-xs" defaultValue={selectedTicket.status}>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            
            <div className="mt-md" style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-md)' }}>
              <p className="label mb-xs">Internal Notes</p>
              <textarea className="input-field" rows="4" placeholder="Add a note..."></textarea>
              <button className="btn btn-primary mt-sm w-full">Save Note</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
