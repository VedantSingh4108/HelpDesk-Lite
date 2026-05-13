import { useState } from 'react';
import Modal from '../components/Modal';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Technical Support', description: 'Hardware and software issues.' },
    { id: 2, name: 'Billing & Subscriptions', description: 'Invoice and payment questions.' },
    { id: 3, name: 'Account Access', description: 'Password resets and login help.' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleOpenModal = (category = null) => {
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
  };

  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (editingCategory) {
      setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, ...formData } : c));
    } else {
      setCategories([...categories, { id: Date.now(), ...formData }]);
    }
    handleCloseModal();
  };

  return (
    <div className="page-content container">
      <div className="flex justify-between items-center mb-lg">
        <h2 className="text-2xl">Category Management</h2>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>Create Category</button>
      </div>

      <div className="flex-col gap-md">
        {categories.map(cat => (
          <div key={cat.id} className="card flex justify-between items-center">
            <div>
              <h3 style={{ fontWeight: 500 }}>{cat.name}</h3>
              <p className="text-muted" style={{ fontSize: '14px', marginTop: '4px' }}>{cat.description}</p>
            </div>
            <button className="btn btn-secondary" onClick={() => handleOpenModal(cat)}>Edit</button>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingCategory ? 'Edit Category' : 'Create Category'}>
        <form onSubmit={handleSaveCategory} className="flex-col gap-md">
          <div className="flex-col gap-xs">
            <label className="label">Category Name</label>
            <input 
              type="text" 
              required
              className="input-field" 
              placeholder="e.g., Hardware Issues" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="flex-col gap-xs">
            <label className="label">Description</label>
            <textarea 
              required
              className="input-field" 
              rows="3"
              placeholder="Briefly describe what issues fall under this category..." 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
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
