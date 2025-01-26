import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { BottomNav } from '../../components/BottomNav';

export const UserLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <BottomNav userType="user" />
      
      {/* Main Content */}
      <main className="md:ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}; 