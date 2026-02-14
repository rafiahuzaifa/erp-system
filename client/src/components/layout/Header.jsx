import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, ChevronRight } from 'lucide-react';
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
      const projectName = currentProject?.name || 'Project';
      crumbs.push({ label: projectName, to: `/projects/${parts[1]}` });

      if (parts[2] === 'builder') crumbs.push({ label: 'Builder' });
      else if (parts[2] === 'codegen') crumbs.push({ label: 'Code Generation' });
      else if (parts[2] === 'deploy') crumbs.push({ label: 'Deployment' });
    } else if (parts[0] === 'settings') {
      crumbs.push({ label: 'Settings' });
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-sm">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="w-4 h-4 text-gray-300" />}
              {i < breadcrumbs.length - 1 && crumb.to ? (
                <Link to={crumb.to} className="text-gray-500 hover:text-gray-700">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold">
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        )}
      </div>
    </header>
  );
}
