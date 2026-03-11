import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderPlus, Settings, Layers,
  ChevronLeft, LogOut, FolderOpen, MonitorPlay
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects',     icon: FolderOpen,      label: 'My Projects' },
  { to: '/projects/new', icon: FolderPlus,      label: 'New Project' },
  { to: '/demo',         icon: MonitorPlay,     label: 'Live Demo',  highlight: true },
  { to: '/settings',     icon: Settings,        label: 'Settings' },
];

export default function Sidebar({ open, onToggle }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <aside
      className={`${open ? 'w-60' : 'w-16'} sidebar-dark flex flex-col transition-all duration-300 flex-shrink-0 overflow-hidden`}
      style={{ minHeight: '100vh' }}
    >
      {/* Logo */}
      <div className={`h-16 flex items-center border-b border-white/10 flex-shrink-0 ${open ? 'px-4 justify-between' : 'justify-center'}`}>
        {open ? (
          <>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/50 flex-shrink-0">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-white tracking-tight text-base">ERP Builder</span>
            </div>
            <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors flex-shrink-0">
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors group">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-lg flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {navItems.map(({ to, icon: Icon, label, highlight }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            title={!open ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-900/40'
                  : highlight
                  ? 'text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {open && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-white/10 p-2 flex-shrink-0">
        {open && user && (
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1 rounded-xl hover:bg-white/5 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-tight">{user.name}</p>
              <p className="text-xs text-white/40 truncate">{user.email}</p>
            </div>
          </div>
        )}
        {!open && user && (
          <div className="flex justify-center mb-1 px-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          title={!open ? 'Logout' : undefined}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:bg-red-500/20 hover:text-red-300 transition-all w-full"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {open && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
