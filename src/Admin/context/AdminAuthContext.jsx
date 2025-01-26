import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      setIsAdminAuthenticated(true);
    }
  }, []);

  const adminLogin = async (secretKey) => {
    try {
      const ADMIN_SECRET_KEY = import.meta.env.VITE_ADMIN_SECRET_KEY;
      
      // Debug logging (remove in production)
      if (import.meta.env.DEV) {
        console.log('Attempting admin login...');
        console.log('Input key length:', secretKey.length);
        console.log('Env key length:', ADMIN_SECRET_KEY?.length);
      }

      if (!ADMIN_SECRET_KEY) {
        throw new Error('Admin secret key not configured');
      }

      const isValid = secretKey.trim() === ADMIN_SECRET_KEY.trim();
      
      // Debug logging (remove in production)
      if (import.meta.env.DEV) {
        console.log('Keys match:', isValid);
      }

      if (isValid) {
        localStorage.setItem('adminToken', 'true');
        setIsAdminAuthenticated(true);
        return true;
      }
      throw new Error('Invalid admin secret key');
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  };

  const adminLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdminAuthenticated(false);
  };

  const value = {
    isAdminAuthenticated,
    adminLogin,
    adminLogout
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}; 