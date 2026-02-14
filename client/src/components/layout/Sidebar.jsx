import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderPlus, Settings, Layers,
  ChevronLeft, LogOut, FolderOpen
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderOpen, label: 'My Projects' },
  { to: '/projects/new', icon: FolderPlus, label: 'New Project' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ open, onToggle }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`${open ? 'w-64' : 'w-16'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {open ? (
          <>
            <div className="flex items-center gap-2">
              <Layers className="w-8 h-8 text-primary-600" />
              <span className="font-bold text-lg text-gray-900">ERP Builder</span>
            </div>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </>
        ) : (
          <button onClick={onToggle} className="mx-auto p-1.5 rounded-lg hover:bg-gray-100">
            <Layers className="w-7 h-7 text-primary-600" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
            title={!open ? label : undefined}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {open && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="border-t border-gray-200 p-2">
        {open && user && (
          <div className="px-3 py-2 mb-1">
            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
          title={!open ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {open && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
