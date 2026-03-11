import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, ChevronRight, MonitorPlay } from 'lucide-react';
import useProjectStore from '../../store/useProjectStore';
import useAuthStore from '../../store/useAuthStore';

export default function Header({ onToggleSidebar }) {
  const location = useLocation();
  const { currentProject } = useProjectStore();
  const { user } = useAuthStore();

  const getBreadcrumbs = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    const crumbs = [{ label: 'Home', to: '/dashboard' }];
    if (parts[0] === 'dashboard') return crumbs;
    if (parts[0] === 'projects' && parts[1] === 'new') {
      crumbs.push({ label: 'New Project' });
    } else if (parts[0] === 'projects' && parts.length === 1) {
      crumbs.push({ label: 'My Projects' });
    } else if (parts[0] === 'projects' && parts[1]) {
      crumbs.push({ label: currentProject?.name || 'Project', to: `/projects/${parts[1]}` });
      if (parts[2] === 'builder')  crumbs.push({ label: 'Builder' });
      else if (parts[2] === 'codegen') crumbs.push({ label: 'Code Generation' });
      else if (parts[2] === 'deploy')  crumbs.push({ label: 'Deployment' });
    } else if (parts[0] === 'settings') {
      crumbs.push({ label: 'Settings' });
    } else if (parts[0] === 'demo') {
      crumbs.push({ label: 'Live Demo' });
    }
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 shadow-sm shadow-gray-100/60">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-sm min-w-0">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />}
              {i < breadcrumbs.length - 1 && crumb.to ? (
                <Link to={crumb.to} className="text-gray-400 hover:text-gray-700 font-medium transition-colors truncate max-w-[100px]">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-800 font-semibold truncate max-w-[180px]">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Link to="/demo"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors">
          <MonitorPlay className="w-4 h-4" />
          <span className="hidden md:inline">Live Demo</span>
        </Link>
        {user && (
          <div className="flex items-center gap-2">
            <div className="hidden md:block text-right">
              <p className="text-xs font-semibold text-gray-700 leading-none">{user.name}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{user.plan || 'Free Plan'}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {initials}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
