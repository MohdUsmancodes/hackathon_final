import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DepartmentLayout } from '../layouts/DepartmentLayout';
import { ManagerDashboard } from '../pages/ManagerDashboard';
import { QueueManagement } from '../pages/QueueManagement';
import { ScanQR } from '../pages/ScanQR';
import { ManagerAnalytics } from '../pages/ManagerAnalytics';
import { ManagerProfile } from '../pages/ManagerProfile';

export const DepartmentManagerRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<DepartmentLayout />}>
        <Route index element={<ManagerDashboard />} />
        <Route path="scan" element={<ScanQR />} />
        <Route path="queue" element={<QueueManagement />} />
        <Route path="analytics" element={<ManagerAnalytics />} />
        <Route path="profile" element={<ManagerProfile />} />
      </Route>
    </Routes>
  );
}; 