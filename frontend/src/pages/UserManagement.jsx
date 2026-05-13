import { useState } from 'react';
import Modal from '../components/Modal';

export default function UserManagement() {
  const [users, setUsers] = useState([
    { id: 1, name: 'Alice Smith', email: 'alice@company.com', role: 'Admin' },
    { id: 2, name: 'Bob Jones', email: 'bob@company.com', role: 'Support Agent' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@company.com', role: 'End-User' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', role: 'End-User' });

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, role: user.role });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', role: 'End-User' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
    } else {
      setUsers([...users, { id: Date.now(), ...formData }]);
    }
    handleCloseModal();
  };

  return (
    <div className="page-content container">
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
              <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: 'var(--space-md)', fontWeight: 500 }}>{user.name}</td>
                <td style={{ padding: 'var(--space-md)' }}>{user.email}</td>
                <td style={{ padding: 'var(--space-md)' }}>
                  <span className="badge">{user.role}</span>
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
        <form onSubmit={handleSaveUser} className="flex-col gap-md">
          <div className="flex-col gap-xs">
            <label className="label">Name</label>
            <input 
              type="text" 
              required
              className="input-field" 
              placeholder="Full Name" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
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
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="flex-col gap-xs">
            <label className="label">Role</label>
            <select 
              className="input-field"
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
            >
              <option value="End-User">End-User</option>
              <option value="Support Agent">Support Agent</option>
              <option value="Admin">Admin</option>
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
