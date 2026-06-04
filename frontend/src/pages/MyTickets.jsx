import React, { useState, useEffect } from 'react';
import { Filter, Edit2, X } from 'lucide-react'; // Added Edit2 and X icons

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- NEW: Edit Modal State ---
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [updateMsg, setUpdateMsg] = useState(null);

  // Fetch tickets from the backend when the page loads
  const fetchTickets = async () => {
    const token = localStorage.getItem('helpdeskToken');

    if (!token) {
      setError("Please log in to view your tickets.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/tickets', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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

  // --- NEW: Handle the API PUT Request ---
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
        fetchTickets(); // Refresh the table to show the new data
        setTimeout(() => setSelectedTicket(null), 1500); // Close modal after 1.5s
      } else {
        // This is where our Backend Lockout Rule triggers!
        setUpdateMsg({ type: 'error', text: data.message });
      }
    } catch (err) {
      setUpdateMsg({ type: 'error', text: 'Server error updating ticket.' });
    }
  };

  const openEditModal = (ticket) => {
    setSelectedTicket(ticket);
    setEditDescription(ticket.description);
    setUpdateMsg(null);
  };

  // Helper to map backend status to your custom CSS classes
  const getStatusStyle = (status) => {
    const normalizedStatus = status?.toLowerCase();
    if (normalizedStatus === 'open') return { class: 'status-open', label: 'Open' };
    if (normalizedStatus === 'in-progress' || normalizedStatus === 'in progress') return { class: 'status-progress', label: 'In Progress' };
    if (normalizedStatus === 'resolved' || normalizedStatus === 'closed') return { class: 'status-resolved', label: 'Resolved' };
    return { class: '', label: status };
  };

  // Helper to format MongoDB dates to match your "Oct 24, 2023" style
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) return <div className="page-content container" style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>Loading your tickets...</div>;
  if (error) return <div className="page-content container" style={{ textAlign: 'center', color: 'red', padding: 'var(--space-xl)' }}>{error}</div>;

  return (
    <div className="page-content container" style={{ position: 'relative' }}>
      <div className="flex justify-between items-center mb-lg">
        <h2 className="text-2xl">My Tickets</h2>
        <button className="btn btn-secondary">
          <Filter size={16} /> Filter
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {tickets.length === 0 ? (
          <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
            You haven't submitted any tickets yet.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--background)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th className="label" style={{ padding: 'var(--space-md)' }}>Ticket ID</th>
                <th className="label" style={{ padding: 'var(--space-md)' }}>Title</th>
                <th className="label" style={{ padding: 'var(--space-md)' }}>Date</th>
                <th className="label" style={{ padding: 'var(--space-md)' }}>Status</th>
                <th className="label" style={{ padding: 'var(--space-md)' }}>Action</th> {/* NEW HEADER */}
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => {
                const statusInfo = getStatusStyle(ticket.status);

                return (
                  <tr key={ticket._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    {/* Slicing the MongoDB ObjectId to act as a short, clean ticket number */}
                    <td style={{ padding: 'var(--space-md)', fontWeight: 500 }}>
                      T-{ticket._id.slice(-6).toUpperCase()}
                    </td>
                    <td style={{ padding: 'var(--space-md)' }}>{ticket.title}</td>
                    <td style={{ padding: 'var(--space-md)', color: 'var(--text-muted)' }}>
                      {formatDate(ticket.createdAt)}
                    </td>
                    <td style={{ padding: 'var(--space-md)' }}>
                      <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>
                    </td>
                    <td style={{ padding: 'var(--space-md)' }}>
                      {/* NEW: Edit Button */}
                      <button
                        onClick={() => openEditModal(ticket)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center' }}
                      >
                        <Edit2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* --- NEW: The Edit Modal Overlay --- */}
      {selectedTicket && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Update Ticket Details</h3>
              <button
                onClick={() => setSelectedTicket(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
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

            {/* NEW: Read-Only Context Box */}
            <div style={{
              backgroundColor: 'var(--surface)',
              padding: 'var(--space-sm) var(--space-md)',
              borderRadius: 'var(--radius-std)',
              marginBottom: 'var(--space-lg)',
              border: '1px solid var(--border)'
            }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Ticket ID: <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>T-{selectedTicket._id.slice(-6).toUpperCase()}</span>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '500' }}>
                {selectedTicket.title}
              </div>
            </div>

            <form onSubmit={handleUpdateTicket}>
              <div style={{ marginBottom: 'var(--space-lg)' }}>
                <label className="label" style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>Description</label>
                <textarea
                  className="input-field"
                  rows="5"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  style={{ width: '100%', resize: 'vertical' }}
                  required
                />
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