import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarDays,
  Bell,
  GraduationCap,
  BarChart3,
  Settings,
  LogOut,
  UserCircle,
  Briefcase,
} from 'lucide-react';
import { logout } from '../store/authSlice';

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (user?.role === 'admin') return '/dashboard/hr';
    if (user?.role === 'manager') return '/dashboard/manager';
    return '/dashboard/employee';
  };

  const navItems = [
    {
      label: 'Dashboard',
      path: getDashboardPath(),
      icon: LayoutDashboard,
      roles: ['admin', 'manager', 'employee'],
    },
    {
      label: user?.role === 'manager' ? 'My Team' : 'Employee Directory',
      path: '/employees',
      icon: Users,
      roles: ['admin', 'manager'],
    },
    {
      label: 'Attendance',
      path: '/attendance',
      icon: CalendarCheck,
      roles: ['admin', 'manager', 'employee'],
    },
    {
      label: 'Leave Management',
      path: '/leaves',
      icon: CalendarDays,
      roles: ['admin', 'manager', 'employee'],
    },
    {
      label: 'Announcements',
      path: '/announcements',
      icon: Bell,
      roles: ['admin', 'manager', 'employee'],
    },
    {
      label: 'Training Programs',
      path: '/training',
      icon: GraduationCap,
      roles: ['admin', 'manager', 'employee'],
    },
    {
      label: 'Reports & Analytics',
      path: '/reports',
      icon: BarChart3,
      roles: ['admin'],
    },
    {
      label: 'My Profile',
      path: '/profile',
      icon: UserCircle,
      roles: ['employee', 'manager', 'admin'],
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: Settings,
      roles: ['admin', 'manager', 'employee'],
    },
  ];

  const allowedNav = navItems.filter((item) =>
    item.roles.includes(user?.role || 'employee')
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              Staff<span className="text-brand-400">Sync</span>
            </h1>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Enterprise HRMS
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          {allowedNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User Footer Profile & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-brand-800 text-brand-200 flex items-center justify-center font-bold text-xs ring-2 ring-brand-500/30 overflow-hidden shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.slice(0, 2).toUpperCase() || 'SS'
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
                <span className="inline-block text-[10px] text-slate-400 capitalize">
                  {user?.role === 'admin' ? 'HR Director' : user?.role || 'Member'}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
