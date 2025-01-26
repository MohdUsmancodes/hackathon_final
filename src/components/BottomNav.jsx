import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaUserTie, FaQrcode, FaChartBar, FaUsers, FaCog, FaTicketAlt, FaBuilding, FaUserCog } from 'react-icons/fa';

const navConfigs = {
  admin: [
    { path: '/admin', icon: FaHome, label: 'Dashboard' },
    { path: '/admin/managers', icon: FaUserTie, label: 'Managers' },
    { path: '/admin/services', icon: FaTicketAlt, label: 'Services' },
    { path: '/admin/departments', icon: FaBuilding, label: 'Departments' },
    { path: '/admin/settings', icon: FaCog, label: 'Settings' }
  ],
  manager: [
    { path: '/department-manager', icon: FaHome, label: 'Dashboard' },
    { path: '/department-manager/scan', icon: FaQrcode, label: 'Scan' },
    { path: '/department-manager/queue', icon: FaUsers, label: 'Queue' },
    { path: '/department-manager/analytics', icon: FaChartBar, label: 'Analytics' },
    { path: '/department-manager/profile', icon: FaUserCog, label: 'Profile' }
  ],
  user: [
    { path: '/', icon: FaHome, label: 'Home' },
    { path: '/services', icon: FaTicketAlt, label: 'Services' },
    { path: '/bookings', icon: FaQrcode, label: 'My QR' },
    { path: '/profile', icon: FaUserCog, label: 'Profile' }
  ]
};

export const BottomNav = ({ userType = 'user' }) => {
  const navItems = navConfigs[userType];

  return (
    <>
      {/* Desktop Navigation - Side */}
      <nav className="hidden md:flex flex-col space-y-1 fixed left-0 top-0 h-full bg-white shadow-lg p-4 w-64 z-50">
        <div className="mb-8 px-4">
          <h2 className="text-xl font-bold text-gray-800">
            {userType === 'admin' ? 'Admin Panel' : 
             userType === 'manager' ? 'Manager Dashboard' : 
             'User Dashboard'}
          </h2>
        </div>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center px-4 py-3 text-gray-700 rounded-lg transition-all duration-200
              ${isActive 
                ? 'bg-blue-50 text-blue-600 shadow-sm translate-x-1' 
                : 'hover:bg-gray-50 hover:translate-x-1'
              }
            `}
            end={item.path === '/' || item.path === '/admin' || item.path === '/department-manager'}
          >
            <item.icon className={`w-5 h-5 mr-3 transition-transform duration-200 
              ${item.path === '/department-manager/queue' ? 'transform -rotate-12' : ''}`} 
            />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t z-50">
        <div className="flex items-center justify-around h-16">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                relative flex flex-col items-center justify-center w-full h-full
                ${isActive ? 'text-blue-600' : 'text-gray-600'}
              `}
              end={item.path === '/' || item.path === '/admin' || item.path === '/department-manager'}
            >
              <item.icon className={`w-6 h-6 mb-1 transition-transform duration-200
                ${item.path === '/department-manager/queue' ? 'transform -rotate-12' : ''}
              `} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {/* Active Indicator */}
              <div className={`absolute -top-0.5 w-12 h-0.5 rounded-full transition-all duration-200 
                ${isActive ? 'bg-blue-600 scale-100' : 'scale-0'}`} 
              />
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Content Padding for Mobile */}
      <div className="md:hidden h-16" />
    </>
  );
}; 