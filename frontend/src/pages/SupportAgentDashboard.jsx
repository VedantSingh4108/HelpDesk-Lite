import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function SupportAgentDashboard() {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchParams] = useSearchParams();
  const showFilters = searchParams.get('showFilters') === 'true';

  // --- Live Data States ---
  const loggedInUser = JSON.parse(localStorage.getItem('helpdeskUser')) || {};
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Chat/Comment States ---
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false); // NEW: AI Loading State

  const location = useLocation();
  const navigate = useNavigate();

  // URL is the single source of truth for the active tab to sync with Sidebar
  const activeFilter = location.pathname.includes('my-assigned')
    ? 'assigned'
    : location.pathname.includes('completed')
      ? 'completed'
      : 'all';

  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // --- STATE MACHINE LOGIC ---
  const allowedTransitions = {
    'open': ['open', 'in-progress', 'resolved'],
    'in-progress': ['in-progress', 'resolved'],
    'resolved': ['resolved', 'closed'],
    'closed': ['closed']
  };

  const formatStatusDisplay = (status) => {
    if (!status) return 'Unknown';
    if (status === 'in-progress') return 'In Progress';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // --- Fetch Live Tickets from Backend ---
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${loggedInUser.token}` } };

      // We fetch all tickets or assigned tickets. The frontend will handle filtering out 'completed'
      const url = activeFilter === 'assigned' ? 'https ://helpdesk-backend-aer8.onrender.com/api/tickets?assignedTo=me' : 'https://helpdesk-backend-aer8.onrender.com/api/tickets';

      const { data } = await axios.get(url, config);
      setTickets(data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    setSelectedTicket(null);
  }, [activeFilter]);

  // --- Fetch Chat Comments ---
  const fetchComments = async (ticketId) => {
    if (!ticketId) return;
    setLoadingComments(true);
    try {
      const config = { headers: { Authorization: `Bearer ${loggedInUser.token}` } };
      const { data } = await axios.get(`https://helpdesk-backend-aer8.onrender.com/api/comments/${ticketId}`, config);
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  // Trigger fetch whenever a new ticket is opened
  useEffect(() => {
    if (selectedTicket?._id) {
      fetchComments(selectedTicket._id);
    }
  }, [selectedTicket?._id]);

  // --- NEW: Fetch AI Suggestion ---
  const handleSuggestReply = async () => {
    if (!selectedTicket) return;
    setIsSuggesting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${loggedInUser.token}` } };
      const { data } = await axios.get(`https://helpdesk-backend-aer8.onrender.com/api/tickets/${selectedTicket._id}/suggest-reply`, config);

      // Auto-insert the AI's draft directly into the typing box!
      setNewComment(data.suggestion);
    } catch (error) {
      console.error("Error fetching AI suggestion:", error);
      alert("AI could not generate a response right now.");
    } finally {
      setIsSuggesting(false);
    }
  };

  // --- Submit New Chat Message ---
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const config = { headers: { Authorization: `Bearer ${loggedInUser.token}` } };
      const { data } = await axios.post(
        `https://helpdesk-backend-aer8.onrender.com/api/comments/${selectedTicket._id}`,
        { text: newComment },
        config
      );

      // Append new message directly to state so it renders instantly
      setComments(prev => [...prev, data]);
      setNewComment('');
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // --- Atomic Claim Logic ---
  const handleClaimTicket = async (ticketId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${loggedInUser.token}` } };
      await axios.put(`https://helpdesk-backend-aer8.onrender.com/api/tickets/${ticketId}/claim`, {}, config);

      fetchTickets();
      setSelectedTicket(null);
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

  const normalizeStatus = (rawStatus) => {
    if (!rawStatus) return 'open';
    return rawStatus.toLowerCase().replace(' ', '-');
  };

  // --- Status Update Logic ---
  const handleStatusChange = async (ticketId, newStatus) => {
    setSelectedTicket(prev => ({ ...prev, status: newStatus }));

    try {
      const config = { headers: { Authorization: `Bearer ${loggedInUser.token}` } };
      await axios.put(`https://helpdesk-backend-aer8.onrender.com/api/tickets/${ticketId}`, { status: newStatus }, config);
      fetchTickets();
    } catch (error) {
      console.error("Error updating status:", error.response?.data || error.message);
      alert(`Update failed: ${error.response?.data?.message || 'Check console'}`);
      fetchTickets();
    }
  };

  // --- Apply Frontend Filters ---
  let displayedTickets = tickets;

  if (!Array.isArray(displayedTickets)) {
    displayedTickets = [];
  } else {
    // 1. Split the tickets based on which Tab is active
    if (activeFilter === 'all' || activeFilter === 'assigned') {
      // ACTIVE TABS: Hide closed tickets
      displayedTickets = displayedTickets.filter(t => normalizeStatus(t.status) !== 'closed');
    } else if (activeFilter === 'completed') {
      // COMPLETED TAB: Only show closed, sort by newest, grab top 10
      displayedTickets = displayedTickets
        .filter(t => normalizeStatus(t.status) === 'closed')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);
    }

    // 2. Apply the Dropdown Filters
    if (statusFilter !== 'All Statuses') {
      displayedTickets = displayedTickets.filter(t => normalizeStatus(t.status) === normalizeStatus(statusFilter));
    }
    if (categoryFilter !== 'All') {
      displayedTickets = displayedTickets.filter(t => t.category === categoryFilter);
    }
    if (priorityFilter !== 'All') {
      displayedTickets = displayedTickets.filter(t => t.priority === priorityFilter);
    }
  }

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

      {/* Dynamic CSS Injection to hide the global chatbot when this panel is open */}
      {selectedTicket && (
        <style>{`
          /* This explicitly targets the ID wrapper in Chatbot.jsx */
          #helpdesk-chatbot {
            display: none !important;
          }
        `}</style>
      )}

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
              All Tickets
            </button>
            <button
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeFilter === 'assigned'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              onClick={() => navigate('/agent/my-assigned' + (showFilters ? '?showFilters=true' : ''))}
            >
              My Assigned
            </button>
            <button
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeFilter === 'completed'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              onClick={() => navigate('/agent/completed' + (showFilters ? '?showFilters=true' : ''))}
            >
              Completed
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
            <p className="text-muted" style={{ padding: 'var(--space-md)' }}>No tickets found.</p>
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
                {/* Left Side: ID, Title, and Attachment */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>
                    <span className="label mr-md" style={{ marginRight: '8px' }}>
                      #{ticket._id ? ticket._id.slice(-6).toUpperCase() : (ticket.id || 'NEW')}
                    </span>
                    <span style={{ fontWeight: 500 }}>{ticket.title || 'Untitled Ticket'}</span>
                  </div>

                  {/* 📎 ATTACHMENT LINK FOR THE LIST */}
                  {ticket.attachmentUrl && (
                    <a
                      href={ticket.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ fontSize: '12px', color: '#3b82f6', textDecoration: 'underline', width: 'fit-content' }}
                    >
                      📎 View Attachment
                    </a>
                  )}
                </div>

                {/* Right Side: Status and Category */}
                <div className="flex items-center gap-md">
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
            boxShadow: '-4px 0 15px rgba(0,0,0,0.05)',
            position: 'relative',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* HEADER: Pinned to the top! */}
          <div className="flex justify-between items-center" style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--border)', zIndex: 10 }}>
            <h3 className="text-lg" style={{ margin: 0 }}>Ticket Details</h3>
            <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => setSelectedTicket(null)}>Close</button>
          </div>

          {/* BODY: This area will now scroll independently beneath the header */}
          <div className="flex-col gap-md" style={{ padding: 'var(--space-lg)', overflowY: 'auto', flex: 1 }}>
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

              {/* 📎 ATTACHMENT LINK ADDED RIGHT BELOW THE DESCRIPTION */}
              {selectedTicket?.attachmentUrl && (
                <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-muted)' }}>Attached File: </span>
                  <a
                    href={selectedTicket.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#2563eb', textDecoration: 'underline', fontSize: '14px', marginLeft: '8px', display: 'inline-flex', alignItems: 'center' }}
                  >
                    📎 Click to Open Document
                  </a>
                </div>
              )}
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

            <div className="mt-md" style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              <p className="label">Ticket Conversation</p>

              {/* Message History Feed */}
              <div style={{
                maxHeight: '400px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                backgroundColor: 'var(--background)',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid var(--border)'
              }}>
                {loadingComments ? (
                  <p className="text-muted text-xs" style={{ textAlign: 'center' }}>Loading conversation...</p>
                ) : comments.length === 0 ? (
                  <p className="text-muted text-xs" style={{ textAlign: 'center', padding: '12px' }}>No messages sent yet.</p>
                ) : (
                  comments.map(c => {
                    const isStaff = c.user?.role === 'admin' || c.user?.role === 'support-agent';
                    return (
                      <div
                        key={c._id}
                        style={{
                          alignSelf: isStaff ? 'flex-end' : 'flex-start',
                          maxWidth: '85%',
                          backgroundColor: isStaff ? 'var(--primary)' : '#e2e8f0',
                          color: isStaff ? '#ffffff' : '#0f172a',
                          padding: '6px 12px',
                          borderRadius: '12px',
                          borderBottomRightRadius: isStaff ? '2px' : '12px',
                          borderBottomLeftRadius: isStaff ? '12px' : '2px',
                          fontSize: '13px'
                        }}
                      >
                        <div style={{ fontSize: '10px', opacity: 0.8, fontWeight: 'bold', marginBottom: '2px' }}>
                          {c.user?.name || 'Unknown'} ({isStaff ? 'Agent' : 'User'})
                        </div>
                        <div>{c.text}</div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleAddComment} className="flex gap-xs" style={{ marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={handleSuggestReply}
                  disabled={isSuggesting}
                  className="btn btn-secondary"
                  style={{
                    padding: '6px 10px',
                    fontSize: '14px',
                    backgroundColor: '#f8fafc',
                    borderColor: '#cbd5e1',
                    cursor: isSuggesting ? 'wait' : 'pointer'
                  }}
                  title="Generate AI Draft"
                >
                  {isSuggesting ? '⏳' : '✨'}
                </button>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Type a message..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  style={{ flex: 1, padding: '6px 12px', fontSize: '13px' }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                  Send
                </button>
              </form>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}