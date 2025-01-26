import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminDashboard } from '../pages/AdminDashboard';
import { DepartmentManagerAssignment } from '../components/DepartmentManagerAssignment';
import { AdminLayout } from '../layouts/AdminLayout';

export const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="managers" element={<DepartmentManagerAssignment />} />
      </Route>
    </Routes>
  );
}; 