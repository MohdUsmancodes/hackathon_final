import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { serviceManagement } from '../services/serviceManagement';
import { adminService } from '../services/adminService';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { FaUsers, FaTicketAlt, FaChartLine, FaBell, FaCog, FaBuilding, FaClock, FaChartBar, FaUserClock, FaCalendarAlt, FaTimes, FaStar } from 'react-icons/fa';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalServices: 0,
    activeServices: 0,
    totalTickets: 0,
    verifiedTickets: 0,
    pendingTickets: 0,
    totalUsers: 0,
    activeUsers: 0,
    systemHealth: {
      status: 'healthy',
      lastCheck: null,
      issues: []
    }
  });
  
  const [ticketGroups, setTicketGroups] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [userActivity, setUserActivity] = useState([]);
  const [serviceAnalytics, setServiceAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('overview');
  const [systemHealth, setSystemHealth] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [departmentForm, setDepartmentForm] = useState({
    name: '',
    building: '',
    floor: '',
    room: '',
    directions: ''
  });
  const [detailedAnalytics, setDetailedAnalytics] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceMetrics, setServiceMetrics] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [dateRange, setDateRange] = useState('week'); // 'week', 'month', 'year'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchDetailedAnalytics();
    const interval = setInterval(fetchSystemHealth, 60000);
    return () => clearInterval(interval);
  }, [dateRange]);

    const fetchDashboardData = async () => {
      try {
      // Fetch all required data
      const [
        services,
        tickets,
        departments,
        health,
        activity
      ] = await Promise.all([
        serviceManagement.getAllServices(),
        adminService.getAllTickets(),
        adminService.getDepartments(),
        adminService.getSystemHealth(),
        adminService.getUserActivity()
      ]);

      // Calculate stats
        const activeServices = services.filter(service => service.isActive);
      const verifiedTickets = tickets.filter(ticket => ticket.status === 'verified');
      const pendingTickets = tickets.filter(ticket => ticket.status === 'pending');

      // Group tickets by user
      const groups = tickets.reduce((acc, ticket) => {
        const key = ticket.userId;
        if (!acc[key]) {
          acc[key] = {
            userId: ticket.userId,
            userName: ticket.userName,
            userEmail: ticket.userEmail,
            tickets: []
          };
        }
        acc[key].tickets.push(ticket);
        return acc;
      }, {});

      // Process user activity
      const processedActivity = activity.reduce((acc, act) => {
        const date = format(new Date(act.timestamp), 'yyyy-MM-dd');
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date]++;
        return acc;
      }, {});

        setStats({
          totalServices: services.length,
          activeServices: activeServices.length,
        totalTickets: tickets.length,
        verifiedTickets: verifiedTickets.length,
        pendingTickets: pendingTickets.length,
        totalUsers: Object.keys(groups).length,
        activeUsers: activity.filter(a => 
          new Date(a.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
        ).length
      });

      setTicketGroups(Object.values(groups));
      setDepartments(departments);
      setSystemHealth(health);
      setUserActivity(processedActivity);

      // Fetch service analytics for each service
      const analyticsPromises = services.map(service => 
        adminService.getServiceAnalytics(service.id)
      );
      const analytics = await Promise.all(analyticsPromises);
      setServiceAnalytics(analytics.filter(Boolean));

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

  const fetchSystemHealth = async () => {
    try {
      const health = await adminService.getSystemHealth();
      setSystemHealth(health);
    } catch (error) {
      console.error('Error fetching system health:', error);
    }
  };

  const fetchDetailedAnalytics = async () => {
    try {
      const analytics = await adminService.getDetailedAnalytics();
      setDetailedAnalytics(analytics);
    } catch (error) {
      console.error('Error fetching detailed analytics:', error);
      toast.error('Failed to fetch analytics');
    }
  };

  const handleServiceSelect = async (serviceId) => {
    try {
      setSelectedService(serviceId);
      const metrics = await adminService.getServiceMetrics(serviceId);
      setServiceMetrics(metrics);
      setShowServiceModal(true);
    } catch (error) {
      console.error('Error fetching service metrics:', error);
      toast.error('Failed to fetch service metrics');
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    try {
      await adminService.addDepartment(departmentForm);
      setShowDepartmentModal(false);
      setDepartmentForm({
        name: '',
        building: '',
        floor: '',
        room: '',
        directions: ''
      });
    fetchDashboardData();
      toast.success('Department added successfully');
    } catch (error) {
      console.error('Error adding department:', error);
      toast.error('Failed to add department');
    }
  };

  const handleOpenUserDetails = async (userId) => {
    try {
      const user = await adminService.getUserDetails(userId);
      setSelectedUser(user);
      setShowUserDetails(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to fetch user details');
    }
  };

  // Add new sections to the analytics view
  const renderAnalyticsView = () => (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => setDateRange('week')}
          className={`px-4 py-2 rounded ${
            dateRange === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Week
        </button>
        <button
          onClick={() => setDateRange('month')}
          className={`px-4 py-2 rounded ${
            dateRange === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Month
        </button>
        <button
          onClick={() => setDateRange('year')}
          className={`px-4 py-2 rounded ${
            dateRange === 'year' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Year
        </button>
      </div>

      {/* Peak Hours Analysis */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Peak Hours Analysis</h2>
        <div className="h-64">
          {detailedAnalytics?.peakHours && (
            <div className="grid grid-cols-24 gap-1 h-full">
              {Object.entries(detailedAnalytics.peakHours).map(([hour, count]) => (
                <div
                  key={hour}
                  className="bg-blue-100 relative"
                  style={{ height: `${(count / Math.max(...Object.values(detailedAnalytics.peakHours))) * 100}%` }}
                >
                  <span className="absolute bottom-0 left-0 right-0 text-xs text-center">
                    {hour}h
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Service Utilization */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Service Utilization</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {detailedAnalytics?.serviceUtilization && 
            Object.entries(detailedAnalytics.serviceUtilization).map(([id, data]) => (
              <div 
                key={id} 
                className="border rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleServiceSelect(id)}
              >
                <h3 className="font-medium text-gray-900">{data.name}</h3>
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-gray-600">
                    Total Tickets: {data.total}
                  </p>
                  <p className="text-sm text-gray-600">
                    Utilization Rate: {(data.utilizationRate * 100).toFixed(1)}%
                  </p>
                  <div className="h-2 bg-gray-200 rounded">
                    <div 
                      className="h-2 bg-blue-500 rounded"
                      style={{ width: `${data.utilizationRate * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* User Retention */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">User Retention</h2>
        {detailedAnalytics?.userRetention && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              icon={<FaUsers className="text-blue-500" />}
              title="Total Users"
              value={detailedAnalytics.userRetention.totalUsers}
            />
            <StatCard
              icon={<FaUserClock className="text-green-500" />}
              title="Returning Users"
              value={detailedAnalytics.userRetention.returningUsers}
            />
            <StatCard
              icon={<FaChartLine className="text-purple-500" />}
              title="Avg Visits/User"
              value={detailedAnalytics.userRetention.averageVisitsPerUser.toFixed(1)}
            />
          </div>
        )}
      </div>

      {/* Department Efficiency */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Department Efficiency</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {detailedAnalytics?.departmentEfficiency &&
            Object.entries(detailedAnalytics.departmentEfficiency).map(([id, data]) => (
              <div key={id} className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900">{data.name}</h3>
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-gray-600">
                    Efficiency Rate: {(data.efficiency * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">
                    Avg Processing: {formatDuration(data.averageProcessingTime)}
                  </p>
                  <div className="h-2 bg-gray-200 rounded">
                    <div 
                      className={`h-2 rounded ${
                        data.efficiency > 0.8 
                          ? 'bg-green-500' 
                          : data.efficiency > 0.5 
                            ? 'bg-yellow-500' 
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${data.efficiency * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );

  // Service Metrics Modal
  const renderServiceMetricsModal = () => (
    showServiceModal && serviceMetrics && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Service Metrics</h2>
            <button
              onClick={() => setShowServiceModal(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Wait Time Analysis</h3>
                <p className="text-sm text-gray-600">
                  Average: {formatDuration(serviceMetrics.averageWaitTime)}
                </p>
                <p className="text-sm text-gray-600">
                  Minimum: {formatDuration(serviceMetrics.minWaitTime)}
                </p>
                <p className="text-sm text-gray-600">
                  Maximum: {formatDuration(serviceMetrics.maxWaitTime)}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Satisfaction Score</h3>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={star <= serviceMetrics.satisfactionScore 
                        ? 'text-yellow-400' 
                        : 'text-gray-300'
                      }
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    ({serviceMetrics.satisfactionScore.toFixed(1)})
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Peak Usage Times</h3>
                <div className="space-y-2">
                  {serviceMetrics.peakUsageTime.map((peak, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-sm text-gray-600">{peak.time}</span>
                      <span className="text-sm font-medium">{peak.count} tickets</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Performance Metrics</h3>
                <div className="space-y-2">
                  {Object.entries(serviceMetrics.performanceMetrics).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-sm font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );

  // Helper function to format duration
  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setSelectedView('overview')}
          className={`pb-2 px-4 ${selectedView === 'overview' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setSelectedView('services')}
          className={`pb-2 px-4 ${selectedView === 'services' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
        >
          Services
        </button>
        <button
          onClick={() => setSelectedView('users')}
          className={`pb-2 px-4 ${selectedView === 'users' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
        >
          Users
        </button>
        <button
          onClick={() => setSelectedView('analytics')}
          className={`pb-2 px-4 ${selectedView === 'analytics' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
        >
          Analytics
        </button>
        </div>
        
      {/* System Health Indicator */}
      <div className={`p-4 rounded-lg ${
        systemHealth?.status === 'healthy' ? 'bg-green-100' : 'bg-red-100'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">
              System Status: {systemHealth?.status || 'Unknown'}
            </h3>
            <p className="text-sm text-gray-600">
              Last checked: {systemHealth?.lastCheck ? format(new Date(systemHealth.lastCheck), 'PPp') : 'Never'}
            </p>
          </div>
          {systemHealth?.issues?.length > 0 && (
            <div className="text-red-600">
              {systemHealth.issues.length} active issues
            </div>
          )}
          </div>
        </div>
        
      {/* Main Content */}
      {selectedView === 'overview' && (
        <>
          {/* Statistics Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<FaUsers className="text-blue-500" />}
              title="Total Users"
              value={stats.totalUsers}
              subtext={`${stats.activeUsers} active today`}
            />
            <StatCard
              icon={<FaTicketAlt className="text-green-500" />}
              title="Total Tickets"
              value={stats.totalTickets}
              subtext={`${stats.verifiedTickets} verified`}
            />
            <StatCard
              icon={<FaChartLine className="text-purple-500" />}
              title="Services"
              value={stats.totalServices}
              subtext={`${stats.activeServices} active`}
            />
            <StatCard
              icon={<FaBell className="text-yellow-500" />}
              title="Pending Tickets"
              value={stats.pendingTickets}
            />
          </div>

          {/* Recent Activity */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {Object.entries(userActivity).slice(0, 5).map(([date, count]) => (
                <div key={date} className="flex justify-between items-center">
                  <span className="text-gray-600">{format(new Date(date), 'PP')}</span>
                  <span className="text-gray-900">{count} activities</span>
                </div>
              ))}
        </div>
      </div>
        </>
      )}

      {selectedView === 'services' && (
        <div className="space-y-6">
          {/* Service Analytics */}
      <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Service Performance</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {serviceAnalytics.map((analytics, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900">{analytics.name}</h3>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-gray-600">
                      Bookings: {analytics.totalBookings || 0}
                    </p>
                    <p className="text-sm text-gray-600">
                      Rating: {analytics.averageRating?.toFixed(1) || 'N/A'} ⭐
                    </p>
                    <div className="h-2 bg-gray-200 rounded">
                      <div 
                        className="h-2 bg-blue-500 rounded"
                        style={{ width: `${(analytics.totalBookings / 100) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedView === 'users' && (
        <div className="space-y-6">
          {/* Search and Filter Controls */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
              <div className="flex-1 w-full">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full px-4 py-2 border rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <select
                  className="px-4 py-2 border rounded-lg"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name">Sort by Name</option>
                  <option value="tickets">Sort by Tickets</option>
                  <option value="date">Sort by Date</option>
                </select>
                <select
                  className="px-4 py-2 border rounded-lg"
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                >
                  <option value="all">All Users</option>
                  <option value="active">Active Users</option>
                  <option value="verified">Verified Users</option>
                </select>
              </div>
        </div>
      </div>

          {/* User Groups */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">User Activity</h2>
        <div className="space-y-6">
              {ticketGroups.map((group) => (
                <div key={group.userId} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                <div>
                      <h3 className="text-lg font-medium text-gray-900">{group.userName}</h3>
                      <p className="text-sm text-gray-500">{group.userEmail}</p>
                  <p className="text-sm text-gray-500">
                        Status: {group.isActive ? 'Active' : 'Inactive'} | 
                        {group.isVerified ? 'Verified' : 'Unverified'}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="text-sm font-medium text-gray-900">
                        {group.tickets.length} tickets
                      </p>
                      <button
                        onClick={() => handleOpenUserDetails(group.userId)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Details Modal */}
          {showUserDetails && selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">User Details</h2>
                  <button
                    onClick={() => setShowUserDetails(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* User Info */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">User Information</h3>
                    <p>Name: {selectedUser.userName}</p>
                    <p>Email: {selectedUser.userEmail}</p>
                    <p>Phone: {selectedUser.phoneNumber || 'N/A'}</p>
                    <p>Status: {selectedUser.isActive ? 'Active' : 'Inactive'}</p>
                    <p>Verified: {selectedUser.isVerified ? 'Yes' : 'No'}</p>
              </div>

                  {/* Ticket History */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Ticket History</h3>
                    <div className="space-y-2">
                      {selectedUser.tickets.map((ticket) => (
                        <div key={ticket.id} className="border rounded p-2">
                          <p className="font-medium">{ticket.serviceName}</p>
                          <p className="text-sm text-gray-500">
                            Queue #: {ticket.queueNumber}
                          </p>
                        <p className="text-sm text-gray-500">
                            Status: {ticket.status}
                        </p>
                          <p className="text-sm text-gray-500">
                            Created: {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedView === 'analytics' ? renderAnalyticsView() : (
        <div className="space-y-6">
          {/* Department Performance */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Department Performance</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {departments.map((dept) => (
                <div key={dept.id} className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900">{dept.name}</h3>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-gray-600">
                      Location: {dept.building}, Floor {dept.floor}
                    </p>
                    <p className="text-sm text-gray-600">
                      Current Load: {dept.activeCounters || 0}/{dept.maxCapacity || 'N/A'}
                    </p>
                    <div className="h-2 bg-gray-200 rounded">
                      <div 
                        className={`h-2 rounded ${
                          (dept.activeCounters / dept.maxCapacity) > 0.8 
                            ? 'bg-red-500' 
                            : (dept.activeCounters / dept.maxCapacity) > 0.5 
                              ? 'bg-yellow-500' 
                              : 'bg-green-500'
                        }`}
                        style={{ 
                          width: `${(dept.activeCounters / dept.maxCapacity) * 100}%` 
                        }}
                      ></div>
                </div>
              </div>
            </div>
          ))}
            </div>
          </div>
        </div>
      )}

      {/* Department Modal */}
      {showDepartmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Add Department</h2>
            <form onSubmit={handleAddDepartment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Department Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={departmentForm.name}
                  onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Building</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={departmentForm.building}
                  onChange={(e) => setDepartmentForm({ ...departmentForm, building: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Floor</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={departmentForm.floor}
                  onChange={(e) => setDepartmentForm({ ...departmentForm, floor: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Room</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={departmentForm.room}
                  onChange={(e) => setDepartmentForm({ ...departmentForm, room: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Directions</label>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={departmentForm.directions}
                  onChange={(e) => setDepartmentForm({ ...departmentForm, directions: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDepartmentModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Department
                </button>
              </div>
            </form>
        </div>
      </div>
      )}

      {/* Service Metrics Modal */}
      {renderServiceMetricsModal()}
    </div>
  );
}; 

const StatCard = ({ icon, title, value, subtext }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">{icon}</div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
              {subtext && (
                <div className="ml-2 text-sm text-gray-600">{subtext}</div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
); 