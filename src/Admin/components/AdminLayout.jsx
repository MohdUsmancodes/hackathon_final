import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';

export const AdminLayout = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Services', href: '/admin/services' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                {/* Mobile menu button */}
                <button
                  type="button"
                  className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <span className="sr-only">Open main menu</span>
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
                <h1 className="text-xl font-bold text-gray-900 ml-4 md:ml-0">Admin Panel</h1>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      location.pathname === item.href
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                onClick={() => {/* Add logout handler */}}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        navigation={navigation}
        userRole="admin"
      />

      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}; 