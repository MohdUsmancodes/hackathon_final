import React, { useEffect, useState } from 'react';
import { serviceManagement } from '../../services/serviceManagement';
import toast from 'react-hot-toast';

export const UserOptions = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const activeServices = await serviceManagement.getActiveServices();
        setServices(activeServices);
        if (activeServices.length > 0) {
          toast.success('Please check out our available services below');
        }
      } catch (error) {
        toast.error('Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleInteraction = async (serviceId) => {
    try {
      await serviceManagement.trackInteraction(serviceId);
      toast.success('Thank you for your interest!');
    } catch (error) {
      toast.error('Failed to record interaction');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg p-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (services.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mt-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Available Services</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <div
            key={service.id}
            className="group relative bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{service.icon}</span>
              <div>
                <h4 className="font-medium text-gray-900">{service.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {service.category}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    PKR {service.price}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <a
                    href={service.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleInteraction(service.id)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                  >
                    Learn more →
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 