import { useNavigate } from 'react-router-dom';

export default function LoginScreen() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // RBAC Simulation based on selected role
    const role = e.target.role.value;
    if (role === 'admin') navigate('/admin');
    else if (role === 'agent') navigate('/agent');
    else navigate('/submit');
  };

  return (
    <div className="flex items-center justify-center h-full" style={{ minHeight: '100vh' }}>
      <div className="card" style={{ width: '400px', padding: 'var(--space-xl)' }}>
        <h1 className="text-2xl mb-sm" style={{ textAlign: 'center' }}>Welcome Back</h1>
        <p className="text-muted mb-lg" style={{ textAlign: 'center', fontSize: '14px' }}>
          Please sign in to your Corporate Helpdesk
        </p>

        <form onSubmit={handleLogin} className="flex-col gap-md">
          <div className="flex-col gap-xs">
            <label className="label">Email Address</label>
            <input type="email" required className="input-field" placeholder="employee@company.com" />
          </div>
          
          <div className="flex-col gap-xs">
            <label className="label">Password</label>
            <input type="password" required className="input-field" placeholder="••••••••" />
          </div>

          <div className="flex-col gap-xs mt-sm">
            <label className="label">Select Role (For Demo Routing)</label>
            <select name="role" className="input-field">
              <option value="user">End-User</option>
              <option value="agent">Support Agent</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary mt-md w-full" style={{ padding: '12px' }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
