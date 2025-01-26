import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { serviceManagement } from '../../services/serviceManagement';
import toast from 'react-hot-toast';

export const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const allServices = await serviceManagement.getActiveServices();
        setServices(allServices);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(allServices.map(service => service.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        toast.error('Failed to fetch services');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(service => service.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Available Services</h1>
        <p className="mt-2 text-gray-600">Browse and book our services</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Services
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex flex-col h-full">
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {service.category}
                    </span>
                    <span className="text-lg font-semibold text-gray-900">
                      ${service.price}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {service.description}
                  </p>
                </div>
                <div className="mt-4">
                  <Link
                    to={`/user/services/${service.id}`}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent 
                      text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No services found</h3>
            <p className="mt-2 text-gray-500">
              {selectedCategory === 'all'
                ? 'There are no services available at the moment.'
                : `There are no services in the ${selectedCategory} category.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}; 