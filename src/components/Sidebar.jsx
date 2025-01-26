import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Sidebar = ({ isOpen, onClose, navigation, userRole }) => {
  const location = useLocation();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:hidden
      `}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {userRole === 'admin' ? 'Admin Panel' : 
               userRole === 'department' ? 'Department Manager' : 
               'Saylani Fishery'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <nav className="mt-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`
                block px-4 py-2 text-base font-medium transition-colors duration-200
                ${location.pathname === item.href
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
              onClick={onClose}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}; 