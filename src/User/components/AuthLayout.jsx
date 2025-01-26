import React from 'react';
import { motion } from 'framer-motion';

export const AuthLayout = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Saylani Fishery Management</h1>
          <p className="text-gray-600 mt-2">{title}</p>
        </div>
        {children}
      </motion.div>
    </div>
  );
}; 