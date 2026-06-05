import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function SupportAgentDashboard() {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchParams] = useSearchParams();
  const showFilters = searchParams.get('showFilters') === 'true';

  // --- Live Data States ---
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pull live agent info from local storage (Make sure this matches your auth implementation)
  const loggedInUser = JSON.parse(localStorage.getItem('helpdeskUser')) || { _id: 'dummy_id', name: 'Agent', token: '' };

  const location = useLocation();
  const navigate = useNavigate();

  // URL is the single source of truth for the active tab to sync with Sidebar
  const activeFilter = location.pathname.includes('my-assigned') ? 'assigned' : 'all';

  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  // --- STATE MACHINE LOGIC ---
  // This dictates exactly which statuses are allowed next
  const allowedTransitions = {
    'open': ['open', 'in-progress', 'resolved', 'closed'],
    'in-progress': ['in-progress', 'resolved'],
    'resolved': ['resolved', 'closed'],
    'closed': ['closed']
  };
  // Helper to make lowercase database statuses look pretty in the UI
  const formatStatusDisplay = (status) => {
    if (!status) return 'Unknown';
    if (status === 'in-progress') return 'In Progress';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  // --- Fetch Live Tickets from Backend ---
  const fetchTickets = async () => {
    setLoading(true);
    try {
      console.log("MY CURRENT USER DATA IS:", loggedInUser);
      const config = { headers: { Authorization: `Bearer ${loggedInUser.token}` } };
      // Switch backend query based on the active URL filter
      const url = activeFilter === 'assigned' ? '/api/tickets?assignedTo=me' : '/api/tickets';

      const { data } = await axios.get(url, config);

      // THIS WILL TELL US IF THE BACKEND IS ANGRY:
      console.log("BACKEND RESPONSE:", data);

      setTickets(data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch whenever the URL tab changes
  useEffect(() => {
    fetchTickets();
    setSelectedTicket(null); // Close panel when switching tabs
  }, [activeFilter]);

  // --- Atomic Claim Logic ---
  const handleClaimTicket = async (ticketId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${loggedInUser.token}` } };
      await axios.put(`/api/tickets/${ticketId}/claim`, {}, config);

      fetchTickets(); // Refresh list
      setSelectedTicket(null); // Close panel to reflect changes
    } catch (error) {
      if (error.response && error.response.status === 409) {
        alert("Whoops! Another agent just claimed this ticket. It is locked.");
        fetchTickets();
        setSelectedTicket(null);
      } else {
        console.error("Error claiming ticket:", error);
      }
    }
  };
  // NEW HELPER: Bulletproof normalizer for messy database strings
  const normalizeStatus = (rawStatus) => {
    if (!rawStatus) return 'open';
    // Converts "In Progress" -> "in-progress", AND "OPEN" -> "open"
    return rawStatus.toLowerCase().replace(' ', '-');
  };
  // --- Status Update Logic ---
  // --- Status Update Logic ---
  const handleStatusChange = async (ticketId, newStatus) => {
    // 1. INSTANT UI UPDATE: Change the panel state immediately so it never snaps back
    setSelectedTicket(prev => ({ ...prev, status: newStatus }));

    try {
      // 2. Send the update to the database in the background
      const config = { headers: { Authorization: `Bearer ${loggedInUser.token}` } };
      await axios.put(`/api/tickets/${ticketId}`, { status: newStatus }, config);

      // 3. Refresh the main list so the background cards match the new status
      fetchTickets();
    } catch (error) {
      // THIS WILL PRINT THE EXACT REASON THE BACKEND REJECTED IT
      console.error("Error updating status:", error.response?.data || error.message);

      alert(`Update failed: ${error.response?.data?.message || 'Check console'}`);
      fetchTickets(); // Revert the UI since the save failed
    }
  };

  // --- Apply Frontend Filters ---
  let displayedTickets = tickets;

  if (statusFilter !== 'All Statuses') {
    displayedTickets = !Array.isArray(displayedTickets) ? [] : displayedTickets.filter(t => t.status === statusFilter);
  }
  if (categoryFilter !== 'All') {
    displayedTickets = !Array.isArray(displayedTickets) ? [] : displayedTickets.filter(t => t.category === categoryFilter);
  }
  if (priorityFilter !== 'All') {
    displayedTickets = !Array.isArray(displayedTickets) ? [] : displayedTickets.filter(t => t.priority === priorityFilter);
  }

  // Helper function to map statuses to your CSS classes
  const getStatusClass = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-amber-100 text-amber-800';
      case 'resolved': return 'bg-emerald-100 text-emerald-800';
      case 'closed': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="flex h-full w-full" style={{ position: 'relative' }}>
      {/* Main Ticket List */}
      <div className="page-content" style={{ flex: 1 }}>
        <div className="flex justify-between items-center mb-md">
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              onClick={() => navigate('/agent/dashboard' + (showFilters ? '?showFilters=true' : ''))}
            >
              {'All Tickets'}
            </button>
            <button
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeFilter === 'assigned'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              onClick={() => navigate('/agent/my-assigned' + (showFilters ? '?showFilters=true' : ''))}
            >
              {'My Assigned'}
            </button>
          </div>
          <div className="flex gap-sm">
            <select
              className="input-field"
              style={{ width: 'auto' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All Statuses">All Statuses</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
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
              <option value="Feature Request">Feature Request</option>
            </select>
            <select className="input-field" style={{ width: '150px' }} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <button className="btn btn-secondary" onClick={() => { setCategoryFilter('All'); setPriorityFilter('All'); setStatusFilter('All Statuses'); }} style={{ marginLeft: 'auto' }}>
              Clear
            </button>
          </div>
        )}

        <div className="flex-col gap-sm">
          {loading ? (
            <p className="text-muted" style={{ padding: 'var(--space-md)' }}>Loading tickets...</p>
          ) : !Array.isArray(displayedTickets) || displayedTickets.length === 0 ? (
            <p className="text-muted" style={{ padding: 'var(--space-md)' }}>No tickets found. Check console (F12) for backend errors.</p>
          ) : (
            displayedTickets.map(ticket => (
              <div
                key={ticket._id || ticket.id || Math.random()}
                className="card flex justify-between items-center"
                style={{
                  cursor: 'pointer',
                  padding: 'var(--space-md)',
                  border: selectedTicket?._id === ticket._id ? '2px solid var(--primary)' : 'none'
                }}
                onClick={() => setSelectedTicket(ticket)}
              >
                <div>
                  <span className="label mr-md" style={{ marginRight: '8px' }}>
                    #{ticket._id ? ticket._id.slice(-6).toUpperCase() : (ticket.id || 'NEW')}
                  </span>
                  <span style={{ fontWeight: 500 }}>{ticket.title || 'Untitled Ticket'}</span>
                </div>
                <div className="flex items-center gap-md">
                  {/* Add .toLowerCase() right here so the colors always match! */}
                  <span className={`badge ${getStatusClass(ticket.status?.toLowerCase())}`} style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px' }}>
                    {formatStatusDisplay(ticket.status)}
                  </span>
                  <span className="label">{ticket.category || 'Uncategorized'}</span>
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
              <p className="text-muted text-sm">{selectedTicket._id || selectedTicket.id}</p>
            </div>

            <div>
              <p className="label">Title</p>
              <p style={{ fontWeight: 500 }}>{selectedTicket.title}</p>
            </div>

            <div>
              <p className="label">Description</p>
              <p className="text-sm" style={{ whiteSpace: 'pre-wrap', backgroundColor: 'var(--background)', padding: '8px', borderRadius: '4px' }}>
                {selectedTicket.description || 'No description provided.'}
              </p>
            </div>

            <div className="flex gap-md">
              <div style={{ flex: 1 }}>
                <p className="label">Category</p>
                <p>{selectedTicket.category}</p>
              </div>
              <div style={{ flex: 1 }}>
                <p className="label">Submitted By</p>
                <p>{selectedTicket.user?.name || 'Unknown User'}</p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-md)' }}>
              <p className="label">Assignment</p>

              {!selectedTicket.assignedTo ? (
                /* ONLY show the Assign button if the ticket is 'open' */
                normalizeStatus(selectedTicket.status) === 'open' ? (
                  <button
                    className="btn btn-primary mt-xs w-full"
                    onClick={() => handleClaimTicket(selectedTicket._id)}
                  >
                    Assign to Me
                  </button>
                ) : (
                  <p className="text-muted text-sm mt-xs">
                    Cannot claim a {formatStatusDisplay(selectedTicket.status)} ticket.
                  </p>
                )
              ) : (
                <p style={{ marginTop: '4px', fontWeight: 500, color: 'var(--primary)' }}>
                  Assigned to: {
                    (selectedTicket.assignedTo._id || selectedTicket.assignedTo) === loggedInUser._id
                      ? "You"
                      : (selectedTicket.assignedTo.name || 'Another Agent')
                  }
                </p>
              )}
            </div>

            <div>
              <p className="label">Status</p>
              <select
                className="input-field mt-xs"
                value={normalizeStatus(selectedTicket.status)}
                onChange={(e) => handleStatusChange(selectedTicket._id, e.target.value)}
                // THIS IS THE MAGIC LINE: 
                // It locks the dropdown if nobody owns it, OR if the current logged-in user isn't the owner
                disabled={
                  !selectedTicket.assignedTo ||
                  (selectedTicket.assignedTo._id || selectedTicket.assignedTo) !== loggedInUser._id ||
                  normalizeStatus(selectedTicket.status) === 'closed'
                }
              >
                {allowedTransitions[normalizeStatus(selectedTicket.status)]?.map(statusOption => (
                  <option key={statusOption} value={statusOption}>
                    {formatStatusDisplay(statusOption)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-md" style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-md)' }}>
              <p className="label mb-xs">Internal Notes (Coming Soon)</p>
              <textarea className="input-field" rows="4" placeholder="Add a note..." disabled></textarea>
              <button className="btn btn-secondary mt-sm w-full" disabled>Save Note</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}