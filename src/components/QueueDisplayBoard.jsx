import React, { useState, useEffect } from 'react';
import { queueManagement } from '../services/queueManagement';
import { FaBell, FaUserClock, FaHourglassHalf } from 'react-icons/fa';

export const QueueDisplayBoard = ({ departmentId }) => {
  const [queueStatus, setQueueStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueueStatus = async () => {
      try {
        const status = await queueManagement.getDepartmentQueueStatus(departmentId);
        setQueueStatus(status);
      } catch (error) {
        console.error('Error fetching queue status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQueueStatus();
    // Update every 10 seconds
    const interval = setInterval(fetchQueueStatus, 10000);
    return () => clearInterval(interval);
  }, [departmentId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Current Number Display */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Now Serving</h1>
            <div className="text-6xl font-bold text-blue-600 mb-4 animate-pulse">
              {queueStatus.currentlyServing || '-'}
            </div>
            <div className="flex items-center justify-center text-gray-500">
              <FaBell className="mr-2" />
              {queueStatus.currentlyServing ? 'Please proceed to the counter' : 'Waiting for next number'}
            </div>
          </div>
        </div>

        {/* Next Numbers */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Next in Line</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {queueStatus.waitingNumbers.slice(0, 3).map((number, index) => (
                <div
                  key={number}
                  className="bg-gray-50 rounded-lg p-4 text-center border-l-4 border-blue-500"
                >
                  <div className="text-2xl font-bold text-gray-900 mb-2">{number}</div>
                  <div className="text-sm text-gray-500">
                    Estimated wait: ~{(index + 1) * queueStatus.estimatedWaitTime} min
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <FaUserClock className="text-blue-500 text-3xl" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Waiting</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {queueStatus.waitingNumbers.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <FaHourglassHalf className="text-green-500 text-3xl" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average Wait Time</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ~{queueStatus.estimatedWaitTime} min
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <FaBell className="text-yellow-500 text-3xl" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed Today</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {queueStatus.completedNumbers}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 