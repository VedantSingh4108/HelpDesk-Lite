import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import axios from 'axios';

export default function CategoryManagement() {
  // Live Data State
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form State
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [updateMsg, setUpdateMsg] = useState(null);

  // --- Fetch Live Categories ---
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('helpdeskToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const { data } = await axios.get('http://localhost:5000/api/categories', config);
      setCategories(data);
    } catch (err) {
      setError("Failed to load categories. Ensure you are connected to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category = null) => {
    setUpdateMsg(null);
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, description: category.description });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setUpdateMsg(null);
  };

  // --- Save / Update Category via API ---
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setUpdateMsg(null);

    const token = localStorage.getItem('helpdeskToken');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      if (editingCategory) {
        // Update existing category
        await axios.put(`http://localhost:5000/api/categories/${editingCategory._id}`, formData, config);
        setUpdateMsg({ type: 'success', text: 'Category updated successfully!' });
      } else {
        // Create new category
        await axios.post('http://localhost:5000/api/categories', formData, config);
        setUpdateMsg({ type: 'success', text: 'Category created successfully!' });
      }

      fetchCategories(); // Refresh the list
      setTimeout(() => handleCloseModal(), 1500); // Close modal automatically
    } catch (err) {
      setUpdateMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save category.'
      });
    }
  };

  if (loading) return <div className="page-content container text-center mt-xl">Loading Categories...</div>;
  if (error) return <div className="page-content container text-center mt-xl text-red-500">{error}</div>;

  return (
    <div className="page-content container">
      <div className="flex justify-between items-center mb-lg">
        <h2 className="text-2xl">Category Management</h2>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>Create Category</button>
      </div>

      <div className="flex-col gap-md">
        {categories.map(cat => (
          <div key={cat._id} className="card flex justify-between items-center">
            <div>
              <h3 style={{ fontWeight: 500 }}>
                {cat.name}
                {cat.name === 'Technical Support' && <span style={{ fontSize: '12px', color: 'var(--primary)', marginLeft: '8px' }}>★ AI Default</span>}
              </h3>
              <p className="text-muted" style={{ fontSize: '14px', marginTop: '4px' }}>{cat.description}</p>
            </div>
            <button className="btn btn-secondary" onClick={() => handleOpenModal(cat)}>Edit</button>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="text-center text-muted p-lg border-dashed" style={{ border: '1px dashed var(--border)', borderRadius: 'var(--radius-std)' }}>
            No categories found. Create one to get started!
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingCategory ? 'Edit Category' : 'Create Category'}>

        {updateMsg && (
          <div style={{
            padding: '10px', marginBottom: '16px', borderRadius: '6px', textAlign: 'center', fontSize: '14px', fontWeight: '500',
            backgroundColor: updateMsg.type === 'error' ? '#fee2e2' : '#dcfce7',
            color: updateMsg.type === 'error' ? '#991b1b' : '#166534',
          }}>
            {updateMsg.text}
          </div>
        )}

        <form onSubmit={handleSaveCategory} className="flex-col gap-md">
          <div className="flex-col gap-xs">
            <label className="label">Category Name</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g., Hardware Issues"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              // Safeguard: Prevent renaming the AI fallback category
              disabled={editingCategory && editingCategory.name === 'Technical Support'}
            />
            {editingCategory && editingCategory.name === 'Technical Support' && (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>This core category cannot be renamed, but you can update its description.</span>
            )}
          </div>
          <div className="flex-col gap-xs">
            <label className="label">Description</label>
            <textarea
              required
              className="input-field"
              rows="3"
              placeholder="Briefly describe what issues fall under this category..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          <div className="flex justify-end gap-sm mt-md">
            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Category</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}