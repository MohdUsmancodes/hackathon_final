import React, { useState, useEffect } from 'react';
import { FaUserTie, FaBuilding, FaTrash, FaEdit, FaChartLine, FaSearch, FaFilter, FaCalendarAlt } from 'react-icons/fa';
import { managerService } from '../services/managerService';
import { adminService } from '../services/adminService';
import toast from 'react-hot-toast';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const DepartmentManagerAssignment = () => {
  const [managers, setManagers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedManager, setSelectedManager] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showPerformance, setShowPerformance] = useState(false);
  const [performanceData, setPerformanceData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [performanceHistory, setPerformanceHistory] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [managersData, departmentsData, assignmentsData] = await Promise.all([
        managerService.getDepartmentManagers(),
        adminService.getDepartments(),
        managerService.getManagerAssignments()
      ]);
      setManagers(managersData);
      setDepartments(departmentsData);
      setAssignments(assignmentsData);
    } catch (error) {
      toast.error('Error fetching data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedManager || !selectedDepartment) {
      toast.error('Please select both manager and department');
      return;
    }

    try {
      await managerService.assignManager(selectedManager.id, selectedDepartment.id);
      toast.success('Manager assigned successfully');
      fetchData();
      setSelectedManager(null);
      setSelectedDepartment(null);
    } catch (error) {
      toast.error('Error assigning manager');
      console.error('Error assigning manager:', error);
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    try {
      await managerService.removeManagerAssignment(assignmentId);
      toast.success('Assignment removed successfully');
      fetchData();
    } catch (error) {
      toast.error('Error removing assignment');
      console.error('Error removing assignment:', error);
    }
  };

  const handleViewPerformance = async (managerId) => {
    try {
      const [performance, history] = await Promise.all([
        managerService.getManagerPerformance(managerId),
        managerService.getPerformanceHistory(managerId)
      ]);
      setPerformanceData(performance);
      setPerformanceHistory(history);
      setShowPerformance(true);
    } catch (error) {
      toast.error('Error fetching performance data');
      console.error('Error fetching performance:', error);
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.managerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assignment.departmentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || assignment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const performanceChartData = {
    labels: performanceHistory?.dates || [],
    datasets: [
      {
        label: 'Service Time (min)',
        data: performanceHistory?.serviceTimes || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Customer Satisfaction',
        data: performanceHistory?.satisfaction || [],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Performance Trends'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Department Manager Assignment</h2>
      
      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search managers or departments..."
                className="w-full pl-10 pr-4 py-2 border rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-400" />
            <select
              className="border rounded-md p-2"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignment Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Manager
            </label>
            <select
              className="w-full border rounded-md p-2"
              value={selectedManager?.id || ''}
              onChange={(e) => {
                const manager = managers.find(m => m.id === e.target.value);
                setSelectedManager(manager);
              }}
            >
              <option value="">Select a manager</option>
              {managers.map(manager => (
                <option key={manager.id} value={manager.id}>
                  {manager.userName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Department
            </label>
            <select
              className="w-full border rounded-md p-2"
              value={selectedDepartment?.id || ''}
              onChange={(e) => {
                const department = departments.find(d => d.id === e.target.value);
                setSelectedDepartment(department);
              }}
            >
              <option value="">Select a department</option>
              {departments.map(department => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          onClick={handleAssign}
        >
          Assign Manager
        </button>
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Current Assignments</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Manager
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssignments.map(assignment => (
                  <tr key={assignment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaUserTie className="text-gray-500 mr-2" />
                        <span>{assignment.managerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaBuilding className="text-gray-500 mr-2" />
                        <span>{assignment.departmentName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaCalendarAlt className="text-gray-500 mr-2" />
                        {new Date(assignment.assignedAt?.seconds * 1000).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        assignment.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {assignment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewPerformance(assignment.managerId)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Performance"
                        >
                          <FaChartLine />
                        </button>
                        <button
                          onClick={() => handleRemoveAssignment(assignment.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Remove Assignment"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Performance Modal */}
      {showPerformance && performanceData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Manager Performance</h3>
              <button
                onClick={() => setShowPerformance(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaEdit />
              </button>
            </div>
            
            {/* Performance Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Total Completed</p>
                <p className="text-2xl font-bold">{performanceData.totalCompleted}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Avg. Service Time</p>
                <p className="text-2xl font-bold">
                  {performanceData.averageServiceTime.toFixed(1)} min
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Customer Satisfaction</p>
                <p className="text-2xl font-bold">
                  {performanceData.customerSatisfaction.toFixed(1)}/5
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Efficiency Score</p>
                <p className="text-2xl font-bold">
                  {performanceData.efficiency.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Performance Chart */}
            {performanceHistory && (
              <div className="bg-white p-4 rounded-lg mb-6">
                <Line data={performanceChartData} options={chartOptions} />
              </div>
            )}

            <button
              onClick={() => setShowPerformance(false)}
              className="mt-6 w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 