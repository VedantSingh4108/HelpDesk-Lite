import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { LayoutDashboard, Users, Tags, Inbox, CheckSquare, Filter } from 'lucide-react';

export default function Sidebar({ role }) {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const showFilters = searchParams.get('showFilters') === 'true';

  const adminLinks = [
    { name: 'Analytics', path: '/admin', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Category Management', path: '/admin/categories', icon: Tags },
  ];

  const agentLinks = [
    { name: 'Dashboard', path: '/agent/dashboard', icon: Inbox },
    { name: 'My Assigned', path: '/agent/my-assigned', icon: CheckSquare },
    { name: 'Filters', action: 'toggle-filters', icon: Filter },
  ];

  const links = role === 'admin' ? adminLinks : role === 'agent' ? agentLinks : [];

  if (links.length === 0) return null;

  const handleToggleFilters = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (showFilters) {
      newParams.delete('showFilters');
    } else {
      newParams.set('showFilters', 'true');
    }
    setSearchParams(newParams);
  };

  return (
    <aside style={{
      width: '250px',
      backgroundColor: 'var(--primary)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      padding: 'var(--space-md) 0'
    }}>
      <div style={{ padding: '0 var(--space-lg) var(--space-md) var(--space-lg)' }}>
        <h2 className="text-lg" style={{ color: 'var(--primary-on)' }}>
          {role === 'admin' ? 'Admin Portal' : 'Agent Workspace'}
        </h2>
      </div>
      
      <nav className="flex-col mt-md">
        {links.map(link => {
          const Icon = link.icon;
          
          if (link.action === 'toggle-filters') {
            const isActive = showFilters;
            return (
              <button 
                key={link.name} 
                onClick={handleToggleFilters}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                  padding: '12px var(--space-lg)',
                  color: isActive ? 'white' : 'var(--secondary-bg)',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                  borderLeft: isActive ? '4px solid var(--info)' : '4px solid transparent',
                  borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  fontFamily: 'inherit'
                }}
              >
                <Icon size={18} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>{link.name}</span>
              </button>
            );
          }

          const isActive = location.pathname === link.path;
          return (
            <Link 
              key={link.name} 
              to={link.path + (searchParams.toString() ? `?${searchParams.toString()}` : '')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                padding: '12px var(--space-lg)',
                textDecoration: 'none',
                color: isActive ? 'white' : 'var(--secondary-bg)',
                backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderLeft: isActive ? '4px solid var(--info)' : '4px solid transparent',
              }}
            >
              <Icon size={18} />
              <span style={{ fontSize: '14px', fontWeight: 500 }}>{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
