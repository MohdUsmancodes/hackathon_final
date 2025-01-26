import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { BottomNav } from '../../components/BottomNav';

export const DepartmentLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || user.role !== 'department_manager') {
        navigate('/department-manager/login');
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <BottomNav userType="manager" />
      
      {/* Main Content */}
      <main className="md:ml-64 min-h-screen pb-16 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}; 