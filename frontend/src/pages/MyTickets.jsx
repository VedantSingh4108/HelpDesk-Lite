import React, { useState, useEffect } from 'react';
import { Edit2, X, CheckCircle } from 'lucide-react'; // Removed Filter
import axios from 'axios';

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Edit Modal State ---
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [updateMsg, setUpdateMsg] = useState(null);

  // --- Chat/Comment States ---
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  // Fetch tickets
  const fetchTickets = async () => {
    const token = localStorage.getItem('helpdeskToken');

    if (!token) {
      setError("Please log in to view your tickets.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/tickets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setTickets(data);
      } else {
        setError(data.message || 'Failed to fetch tickets.');
      }
    } catch (err) {
      setError('Server error while fetching tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // --- Fetch Chat Comments ---
  const fetchComments = async (ticketId) => {
    if (!ticketId) return;
    setLoadingComments(true);
    try {
      const token = localStorage.getItem('helpdeskToken');
      const { data } = await axios.get(`http://localhost:5000/api/comments/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  // Trigger comment loading when modal opens
  useEffect(() => {
    if (selectedTicket?._id) {
      fetchComments(selectedTicket._id);
    }
  }, [selectedTicket?._id]);

  // --- Submit New Chat Message ---
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem('helpdeskToken');
      const { data } = await axios.post(
        `http://localhost:5000/api/comments/${selectedTicket._id}`,
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments(prev => [...prev, data]);
      setNewComment('');
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // --- Handle API Requests ---
  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    setUpdateMsg(null);
    const token = localStorage.getItem('helpdeskToken');

    try {
      const response = await fetch(`http://localhost:5000/api/tickets/${selectedTicket._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ description: editDescription })
      });

      const data = await response.json();

      if (response.ok) {
        setUpdateMsg({ type: 'success', text: 'Ticket updated successfully!' });
        fetchTickets();
        setTimeout(() => setSelectedTicket(null), 1500);
      } else {
        setUpdateMsg({ type: 'error', text: data.message });
      }
    } catch (err) {
      setUpdateMsg({ type: 'error', text: 'Server error updating ticket.' });
    }
  };

  const handleCloseTicket = async (ticketId) => {
    const confirmClose = window.confirm("Are you sure you want to close this ticket? This action cannot be undone.");
    if (!confirmClose) return;

    const token = localStorage.getItem('helpdeskToken');
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`http://localhost:5000/api/tickets/${ticketId}`, { status: 'closed' }, config);
      fetchTickets();
    } catch (error) {
      console.error("Error closing ticket:", error);
      alert("Failed to close the ticket. Please try again.");
    }
  };

  const openEditModal = (ticket) => {
    setSelectedTicket(ticket);
    setEditDescription(ticket.description);
    setUpdateMsg(null);
  };

  // Helpers
  const getStatusStyle = (status) => {
    const normalizedStatus = status?.toLowerCase();
    if (normalizedStatus === 'open') return { class: 'status-open', label: 'Open' };
    if (normalizedStatus === 'in-progress' || normalizedStatus === 'in progress') return { class: 'status-progress', label: 'In Progress' };
    if (normalizedStatus === 'resolved') return { class: 'status-resolved', label: 'Resolved' };
    if (normalizedStatus === 'closed') return { class: 'status-closed', label: 'Closed' };
    return { class: '', label: status };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) return <div className="page-content container" style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>Loading your tickets...</div>;
  if (error) return <div className="page-content container" style={{ textAlign: 'center', color: 'red', padding: 'var(--space-xl)' }}>{error}</div>;

  // --- Split the data into Active and Completed ---
  const activeTickets = tickets.filter(t => t.status?.toLowerCase() !== 'closed');

  const completedTickets = tickets
    .filter(t => t.status?.toLowerCase() === 'closed')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  return (
    <div className="page-content container" style={{ position: 'relative' }}>

      {/* HEADER: Filter Button Removed */}
      <div className="flex justify-between items-center mb-lg">
        <h2 className="text-2xl">My Tickets</h2>
      </div>

      {/* --- SECTION 1: ACTIVE TICKETS --- */}
      <h3 className="text-lg mb-sm" style={{ fontWeight: 600 }}>Active Tickets</h3>
      <div className="card mb-xl" style={{ padding: 0, overflow: 'hidden' }}>
        {activeTickets.length === 0 ? (
          <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
            You have no active tickets.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--background)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th className="label" style={{ padding: 'var(--space-md)' }}>Ticket ID</th>
                <th className="label" style={{ padding: 'var(--space-md)' }}>Title</th>
                <th className="label" style={{ padding: 'var(--space-md)' }}>Date</th>
                <th className="label" style={{ padding: 'var(--space-md)' }}>Status</th>
                <th className="label" style={{ padding: 'var(--space-md)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {activeTickets.map(ticket => {
                const statusInfo = getStatusStyle(ticket.status);
                return (
                  <tr style={{ borderBottom: '1px solid var(--border)' }} key={ticket._id}>
                    <td style={{ padding: 'var(--space-md)', fontWeight: 500 }}>T-{ticket._id.slice(-6).toUpperCase()}</td>
                    <td style={{ padding: 'var(--space-md)' }}>{ticket.title}</td>
                    <td style={{ padding: 'var(--space-md)', color: 'var(--text-muted)' }}>{formatDate(ticket.createdAt)}</td>
                    <td style={{ padding: 'var(--space-md)' }}><span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span></td>
                    <td style={{ padding: 'var(--space-md)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                        <button
                          onClick={() => openEditModal(ticket)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center' }}
                          title="Edit & View Chat"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleCloseTicket(ticket._id)}
                          style={{ padding: '4px 8px', fontSize: '12px', color: '#dc2626', borderColor: '#fca5a5', backgroundColor: '#fef2f2' }}
                        >
                          Close
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* --- SECTION 2: RECENTLY COMPLETED --- */}
      <h3 className="text-lg mb-sm" style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Recently Completed</h3>
      <div className="card" style={{ padding: 0, overflow: 'hidden', opacity: 0.85 }}>
        {completedTickets.length === 0 ? (
          <div style={{ padding: 'var(--space-lg)', textAlign: 'center', color: 'var(--text-muted)' }}>
            No completed tickets yet.
          </div>
        ) : (
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
              {completedTickets.map(ticket => (
                <tr style={{ borderBottom: '1px solid var(--border)' }} key={ticket._id}>
                  <td style={{ padding: 'var(--space-md)', fontWeight: 500, color: 'var(--text-muted)' }}>T-{ticket._id.slice(-6).toUpperCase()}</td>
                  <td style={{ padding: 'var(--space-md)', color: 'var(--text-muted)' }}>{ticket.title}</td>
                  <td style={{ padding: 'var(--space-md)', color: 'var(--text-muted)' }}>{formatDate(ticket.createdAt)}</td>
                  <td style={{ padding: 'var(--space-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontSize: '14px', fontWeight: 500 }}>
                      <CheckCircle size={16} /> Closed
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --- The Edit Modal Overlay --- */}
      {selectedTicket && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '550px', padding: 'var(--space-lg)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Ticket Options & Messages</h3>
              <button onClick={() => setSelectedTicket(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {updateMsg && (
              <div style={{
                padding: '12px', marginBottom: '16px', borderRadius: 'var(--radius-std)',
                backgroundColor: updateMsg.type === 'error' ? '#fee2e2' : '#dcfce7',
                color: updateMsg.type === 'error' ? '#991b1b' : '#166534',
                fontSize: '14px', textAlign: 'center', fontWeight: '500'
              }}>
                {updateMsg.text}
              </div>
            )}

            <div style={{ backgroundColor: 'var(--surface)', padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-std)', marginBottom: 'var(--space-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Ticket ID: <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>T-{selectedTicket._id.slice(-6).toUpperCase()}</span>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '500' }}>{selectedTicket.title}</div>
            </div>

            {/* --- Dynamic Live Support Chat Feed --- */}
            <div style={{ marginBottom: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="label">Live Helpdesk Messages</label>

              <div style={{
                maxHeight: '200px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                backgroundColor: 'var(--background)',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid var(--border)'
              }}>
                {loadingComments ? (
                  <p className="text-muted text-xs" style={{ textAlign: 'center' }}>Loading thread...</p>
                ) : comments.length === 0 ? (
                  <p className="text-muted text-xs" style={{ textAlign: 'center', padding: '8px' }}>No messages exchanged yet.</p>
                ) : (
                  comments.map(c => {
                    const isMe = c.user?.role === 'end-user';
                    return (
                      <div
                        key={c._id}
                        style={{
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          maxWidth: '80%',
                          backgroundColor: isMe ? 'var(--primary)' : '#e2e8f0',
                          color: isMe ? '#ffffff' : '#0f172a',
                          padding: '6px 12px',
                          borderRadius: '12px',
                          borderBottomRightRadius: isMe ? '2px' : '12px',
                          borderBottomLeftRadius: isMe ? '12px' : '2px',
                          fontSize: '13px'
                        }}
                      >
                        <div style={{ fontSize: '10px', opacity: 0.75, fontWeight: 'bold', marginBottom: '2px' }}>
                          {isMe ? 'You' : `${c.user?.name || 'Agent'} (Support)`}
                        </div>
                        <div>{c.text}</div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Send Form Component */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ask for an update or reply to the support team..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  style={{ flex: 1, fontSize: '13px', padding: '6px 12px' }}
                />
                <button type="button" className="btn btn-primary" onClick={handleAddComment} style={{ padding: '6px 14px', fontSize: '13px' }}>
                  Send
                </button>
              </div>
            </div>

            {/* Existing Update Ticket Details Form */}
            <form onSubmit={handleUpdateTicket} style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-md)' }}>
              <div style={{ marginBottom: 'var(--space-lg)' }}>
                <label className="label" style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>Update Description</label>
                <textarea className="input-field" rows="3" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} style={{ width: '100%', resize: 'vertical' }} required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedTicket(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}