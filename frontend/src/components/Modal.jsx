export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)', // Uses a dark slate overlay
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100
    }}>
      <div className="card" style={{ width: '450px', padding: 'var(--space-xl)' }}>
        <div className="flex justify-between items-center mb-lg">
          <h3 className="text-xl">{title}</h3>
        </div>
        {children}
      </div>
    </div>
  );
}
