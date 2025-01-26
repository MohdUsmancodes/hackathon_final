import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { serviceManagement } from '../../services/serviceManagement';
import { FaTicketAlt, FaCheckCircle, FaClock, FaUser } from 'react-icons/fa';

export const UserDashboard = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState({
    totalTickets: 0,
    activeTickets: 0,
    completedTickets: 0,
    lastBooking: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const tickets = await serviceManagement.getUserTickets(user.uid);
        const stats = {
          totalTickets: tickets.length,
          activeTickets: tickets.filter(t => t.status === 'pending').length,
          completedTickets: tickets.filter(t => t.status === 'completed').length,
          lastBooking: tickets.length > 0 ? 
            new Date(Math.max(...tickets.map(t => new Date(t.createdAt)))) : null
        };
        setUserStats(stats);
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user.uid]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center">
              <FaUser className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Welcome back, {user.displayName || 'User'}
              </h1>
              <p className="text-green-100 mt-1">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{userStats.totalTickets}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <FaTicketAlt className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Tickets</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{userStats.activeTickets}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <FaClock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Completed</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{userStats.completedTickets}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FaCheckCircle className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Booking</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {userStats.lastBooking ? 
                      userStats.lastBooking.toLocaleDateString() : 
                      'No bookings yet'}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FaClock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link
                to="/user/services"
                className="flex items-center p-6 bg-green-50 rounded-xl hover:bg-green-100 transition-colors duration-200"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900">Book New Service</h3>
                  <p className="text-green-700 text-sm mt-1">Browse available services</p>
                </div>
                <FaTicketAlt className="h-6 w-6 text-green-600" />
              </Link>

              <Link
                to="/user/tickets"
                className="flex items-center p-6 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors duration-200"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900">View Active Tickets</h3>
                  <p className="text-yellow-700 text-sm mt-1">{userStats.activeTickets} active tickets</p>
                </div>
                <FaClock className="h-6 w-6 text-yellow-600" />
              </Link>

              <Link
                to="/user/profile"
                className="flex items-center p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors duration-200"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900">Profile Settings</h3>
                  <p className="text-blue-700 text-sm mt-1">Update your information</p>
                </div>
                <FaUser className="h-6 w-6 text-blue-600" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar (Mobile Only) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-4">
          <Link
            to="/user/dashboard"
            className="flex flex-col items-center text-green-600"
          >
            <span className="text-xs">Home</span>
          </Link>
          <Link
            to="/user/tickets"
            className="flex flex-col items-center text-gray-600"
          >
            <span className="text-xs">Tickets</span>
          </Link>
          <Link
            to="/user/profile"
            className="flex flex-col items-center text-gray-600"
          >
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}; 