import React, { useState, useEffect } from 'react';
import { adminDepartmentService } from '../../services/adminDepartmentService';
import toast from 'react-hot-toast';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [pendingManagers, setPendingManagers] = useState([]);
  const [showNewDeptForm, setShowNewDeptForm] = useState(false);
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: '',
    maxCapacity: '',
    prefix: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const deps = await adminDepartmentService.getAvailableDepartments();
      setDepartments(deps);
      
      const managers = await adminDepartmentService.getPendingManagerVerifications();
      setPendingManagers(managers);
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  const handleNewDepartmentChange = (e) => {
    setNewDepartment({
      ...newDepartment,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    try {
      await adminDepartmentService.createDepartment(newDepartment);
      toast.success('Department created successfully');
      setShowNewDeptForm(false);
      setNewDepartment({ name: '', description: '', maxCapacity: '', prefix: '' });
      loadData();
    } catch (error) {
      toast.error('Failed to create department');
    }
  };

  const handleVerifyManager = async (managerId) => {
    try {
      await adminDepartmentService.verifyManager(managerId);
      toast.success('Manager verified successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to verify manager');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Departments</h2>
          <button
            onClick={() => setShowNewDeptForm(!showNewDeptForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {showNewDeptForm ? 'Cancel' : 'New Department'}
          </button>
        </div>

        {showNewDeptForm && (
          <form onSubmit={handleCreateDepartment} className="bg-white p-4 rounded-lg shadow mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={newDepartment.name}
                  onChange={handleNewDepartmentChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Prefix</label>
                <input
                  type="text"
                  name="prefix"
                  value={newDepartment.prefix}
                  onChange={handleNewDepartmentChange}
                  maxLength={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Capacity</label>
                <input
                  type="number"
                  name="maxCapacity"
                  value={newDepartment.maxCapacity}
                  onChange={handleNewDepartmentChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  name="description"
                  value={newDepartment.description}
                  onChange={handleNewDepartmentChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Create Department
            </button>
          </form>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prefix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departments.map(dept => (
                <tr key={dept.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{dept.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{dept.prefix}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{dept.maxCapacity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      dept.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {dept.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Pending Manager Verifications</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingManagers.map(manager => (
                <tr key={manager.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{manager.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{manager.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {departments.find(d => d.id === manager.departmentId)?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleVerifyManager(manager.id)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Verify
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DepartmentManagement; 