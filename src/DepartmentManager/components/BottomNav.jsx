import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaQrcode, FaList, FaChartBar, FaUser } from 'react-icons/fa';

const BottomNav = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  const navItems = [
    {
      path: '/department-manager/scan',
      icon: <FaQrcode size={20} />,
      label: 'Scan'
    },
    {
      path: '/department-manager/bookings',
      icon: <FaList size={20} />,
      label: 'Bookings'
    },
    {
      path: '/department-manager/analytics',
      icon: <FaChartBar size={20} />,
      label: 'Analytics'
    },
    {
      path: '/department-manager/profile',
      icon: <FaUser size={20} />,
      label: 'Profile'
    }
  ];

  return (
    <>
      {/* Desktop Navigation - Hidden on mobile */}
      <nav className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-white shadow-lg">
        <div className="w-full">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">Department Manager</h2>
          </div>
          <div className="p-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center p-3 mb-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-100 text-blue-600'
                    : 'hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                isActive(item.path) ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Content Padding for Mobile */}
      <div className="md:hidden h-16"></div>
    </>
  );
};

export default BottomNav; 