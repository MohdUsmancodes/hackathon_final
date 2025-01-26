import React from 'react';
import { useField } from 'formik';

const formatPhoneNumber = (value) => {
  if (!value) return value;
  const cleaned = value.replace(/[^\d]/g, '');
  if (cleaned.length <= 4) return cleaned;
  return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 11)}`;
};

const formatCNIC = (value) => {
  if (!value) return value;
  const cleaned = value.replace(/[^\d]/g, '');
  if (cleaned.length <= 5) return cleaned;
  if (cleaned.length <= 12) return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12)}`;
};

export const Input = ({ label, ...props }) => {
  const [field, meta, helpers] = useField(props);

  const handleChange = (e) => {
    let value = e.target.value;
    
    if (props.name === 'cnic') {
      value = formatCNIC(value);
    } else if (props.name === 'phoneNumber') {
      value = formatPhoneNumber(value);
    }
    
    helpers.setValue(value);
  };

  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-medium mb-1">
        {label}
      </label>
      <input
        {...field}
        {...props}
        onChange={handleChange}
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