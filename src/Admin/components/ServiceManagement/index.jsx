import React, { useState, useEffect } from 'react';
import { serviceManagement } from '../../services/serviceManagement';
import { ServiceForm } from './ServiceForm';
import { ServiceList } from './ServiceList';
import toast from 'react-hot-toast';

export const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const fetchedServices = await serviceManagement.getAllServices();
      setServices(fetchedServices);
    } catch (error) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async (serviceData) => {
    try {
      const newService = await serviceManagement.createService(serviceData);
      setServices([newService, ...services]);
      setShowForm(false);
      toast.success('Service created successfully');
    } catch (error) {
      toast.error('Failed to create service');
    }
  };

  const handleUpdateService = async (serviceId, updateData) => {
    try {
      await serviceManagement.updateService(serviceId, updateData);
      const updatedServices = services.map(service => 
        service.id === serviceId ? { ...service, ...updateData } : service
      );
      setServices(updatedServices);
      setEditingService(null);
      toast.success('Service updated successfully');
    } catch (error) {
      toast.error('Failed to update service');
    }
  };

  const handleDeleteService = async (serviceId) => {
    try {
      await serviceManagement.deleteService(serviceId);
      setServices(services.filter(service => service.id !== serviceId));
      toast.success('Service deleted successfully');
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  const handleToggleActive = async (serviceId, isActive) => {
    try {
      await serviceManagement.updateService(serviceId, { isActive });
      const updatedServices = services.map(service => 
        service.id === serviceId ? { ...service, isActive } : service
      );
      setServices(updatedServices);
      toast.success(`Service ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error('Failed to update service status');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse p-4">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Service Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
            transition-colors"
        >
          Add New Service
        </button>
      </div>

      {showForm && (
        <ServiceForm
          onSubmit={handleCreateService}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingService && (
        <ServiceForm
          service={editingService}
          onSubmit={(data) => handleUpdateService(editingService.id, data)}
          onCancel={() => setEditingService(null)}
        />
      )}

      <ServiceList
        services={services}
        onEdit={setEditingService}
        onDelete={handleDeleteService}
        onToggleActive={handleToggleActive}
      />
    </div>
  );
}; 