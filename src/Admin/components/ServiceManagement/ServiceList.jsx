import React from 'react';
import { Link } from 'react-router-dom';

export const ServiceList = ({ services, onEdit, onDelete, onToggleActive }) => {
  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {services.map((service) => (
        <div
          key={service.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{service.icon}</span>
                <h3 className="font-medium text-gray-900">{service.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleActive(service.id, !service.isActive)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    service.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {service.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-gray-100 pt-3">
              <div className="flex gap-4">
                <span className="text-sm text-gray-500">
                  Created: {formatDate(service.createdAt)}
                </span>
                <span className="text-sm text-gray-500">
                  Price: PKR {service.price}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(service)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                    transition-colors text-sm"
                >
                  VIEW
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {services.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No services</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new service.
          </p>
        </div>
      )}
    </div>
  );
}; 