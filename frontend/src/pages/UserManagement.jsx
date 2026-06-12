import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import axios from 'axios';

export default function UserManagement() {
  // Live Data State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form State: Added password to the state!
  const [formData, setFormData] = useState({ name: '', email: '', role: 'end-user', password: '' });
  const [updateMsg, setUpdateMsg] = useState(null); // For success/error feedback

  // --- Fetch Live Users ---
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('helpdeskToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const { data } = await axios.get('https://helpdesk-backend-aer8.onrender.com/api/users', config);
      setUsers(data);
    } catch (err) {
      setError("Failed to load users. Ensure you have Admin privileges.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user = null) => {
    setUpdateMsg(null);
    if (user) {
      setEditingUser(user);
      // Reset password field when editing (admins shouldn't edit passwords here)
      setFormData({ name: user.name, email: user.email, role: user.role || 'end-user', password: '' });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', role: 'end-user', password: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setUpdateMsg(null);
  };

  // --- Save / Update User via API ---
  const handleSaveUser = async (e) => {
    e.preventDefault();
    setUpdateMsg(null);

    const token = localStorage.getItem('helpdeskToken');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      if (editingUser) {
        // Update existing user
        await axios.put(`https://helpdesk-backend-aer8.onrender.com/api/users/${editingUser._id}/role`, { role: formData.role }, config);
        setUpdateMsg({ type: 'success', text: 'User updated successfully!' });
        fetchUsers();
        setTimeout(() => handleCloseModal(), 1500);
      } else {
        // Create new user - Now sending the password!
        await axios.post('https://helpdesk-backend-aer8.onrender.com/api/users', {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          password: formData.password
        }, config);

        setUpdateMsg({ type: 'success', text: 'User created successfully!' });
        fetchUsers();
        setTimeout(() => handleCloseModal(), 2500);
      }
    } catch (err) {
      // Smarter error handling
      const serverMessage = err.response?.data?.message || 'Failed to save user data.';
      setUpdateMsg({ type: 'error', text: serverMessage });
    }
  };

  if (loading) return <div className="page-content container text-center mt-xl">Loading Users...</div>;
  if (error) return <div className="page-content container text-center mt-xl text-red-500">{error}</div>;

  return (
    <div className="page-content w-full px-8">
      <div className="flex justify-between items-center mb-lg">
        <h2 className="text-2xl">User Management</h2>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>Add New User</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--background)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
              <th className="label" style={{ padding: 'var(--space-md)' }}>Name</th>
              <th className="label" style={{ padding: 'var(--space-md)' }}>Email</th>
              <th className="label" style={{ padding: 'var(--space-md)' }}>Role</th>
              <th className="label" style={{ padding: 'var(--space-md)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: 'var(--space-md)', fontWeight: 500 }}>{user.name}</td>
                <td style={{ padding: 'var(--space-md)' }}>{user.email}</td>
                <td style={{ padding: 'var(--space-md)' }}>
                  <span className="badge">
                    {user.role === 'end-user' ? 'End-User' :
                      user.role === 'support-agent' ? 'Support Agent' :
                        user.role === 'admin' ? 'Admin' : user.role}
                  </span>
                </td>
                <td style={{ padding: 'var(--space-md)' }}>
                  <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => handleOpenModal(user)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingUser ? 'Edit User' : 'Add New User'}>
        {updateMsg && (
          <div style={{
            padding: '10px', marginBottom: '16px', borderRadius: '6px', textAlign: 'center', fontSize: '14px', fontWeight: '500',
            backgroundColor: updateMsg.type === 'error' ? '#fee2e2' : '#dcfce7',
            color: updateMsg.type === 'error' ? '#991b1b' : '#166534',
          }}>
            {updateMsg.text}
          </div>
        )}

        <form onSubmit={handleSaveUser} className="flex-col gap-md">
          <div className="flex-col gap-xs">
            <label className="label">Name</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="Full Name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              disabled={!!editingUser}
            />
          </div>
          <div className="flex-col gap-xs">
            <label className="label">Email Address</label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="email@company.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              disabled={!!editingUser}
            />
          </div>

          {/* NEW: Password Field - Only displays when creating a new user! */}
          {!editingUser && (
            <div className="flex-col gap-xs">
              <label className="label">Temporary Password</label>
              <input
                type="text" // Using text so you can see what you are typing
                className="input-field"
                placeholder="Leave blank for Password123!"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          )}

          <div className="flex-col gap-xs">
            <label className="label">Role</label>
            <select
              className="input-field"
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="end-user">End-User</option>
              <option value="support-agent">Support Agent</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-sm mt-md">
            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save User</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}