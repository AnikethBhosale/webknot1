import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const { admin, logout } = useAuth();
  const location = useLocation();

  const navigation = admin?.role === 'super_admin' ? [
    { name: 'Super Admin', href: '/superadmin', icon: '👑' }
  ] : [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Events', href: '/events', icon: '🎉' },
    { name: 'Students', href: '/students', icon: '👥' },
    { name: 'Attendance', href: '/attendance', icon: '✅' },
    { name: 'Feedback', href: '/feedback', icon: '💬' },
    { name: 'Reports', href: '/reports', icon: '📈' },
  ];

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-primary-600">
            <h1 className="text-xl font-bold text-white">Campus Events</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{admin?.email}</p>
                <p className="text-xs text-gray-500 capitalize">{admin?.role}</p>
                {admin?.college && (
                  <p className="text-xs text-gray-500">{admin.college.name}</p>
                )}
              </div>
              <button
                onClick={logout}
                className="ml-3 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Logout"
              >
                🚪
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
