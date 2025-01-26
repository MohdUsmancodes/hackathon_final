import React from 'react';
import { useField } from 'formik';

export const Input = ({ label, ...props }) => {
  const [field, meta] = useField(props);
  
  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-medium mb-1">
        {label}
      </label>
      <input
        {...field}
        {...props}
        className={`w-full px-3 py-2 border rounded-lg outline-none transition-colors
          ${meta.touched && meta.error
            ? 'border-red-500 focus:border-red-500'
            : 'border-gray-300 focus:border-blue-500'
          }`}
      />
      {meta.touched && meta.error && (
        <p className="mt-1 text-sm text-red-500">{meta.error}</p>
      )}
    </div>
  );
}; 