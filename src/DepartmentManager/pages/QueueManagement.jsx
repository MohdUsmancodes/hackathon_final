import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { queueManagement } from '../../services/queueManagement';
import { FaPlay, FaCheck, FaUserClock } from 'react-icons/fa';
import toast from 'react-hot-toast';

export const QueueManagement = () => {
  const { user } = useAuth();
  const [queueStatus, setQueueStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentNumber, setCurrentNumber] = useState(null);

  useEffect(() => {
    const fetchQueueStatus = async () => {
      try {
        const status = await queueManagement.getDepartmentQueueStatus(user.departmentId);
        setQueueStatus(status);
        setCurrentNumber(status.currentlyServing);
      } catch (error) {
        console.error('Error fetching queue status:', error);
        toast.error('Failed to fetch queue status');
      } finally {
        setLoading(false);
      }
    };

    fetchQueueStatus();
    const interval = setInterval(fetchQueueStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [user.departmentId]);

  const handleCallNext = async () => {
    try {
      // Mark current number as completed if exists
      if (currentNumber) {
        await queueManagement.updateQueueStatus(currentNumber, 'completed');
      }

      // Get next waiting number
      const nextNumber = queueStatus.waitingNumbers[0];
      if (nextNumber) {
        await queueManagement.updateQueueStatus(nextNumber, 'serving');
        setCurrentNumber(nextNumber);
        
        // Refresh queue status
        const newStatus = await queueManagement.getDepartmentQueueStatus(user.departmentId);
        setQueueStatus(newStatus);
        
        toast.success('Called next number');
      } else {
        toast.info('No more numbers in queue');
      }
    } catch (error) {
      console.error('Error calling next number:', error);
      toast.error('Failed to call next number');
    }
  };

  const handleComplete = async () => {
    try {
      if (currentNumber) {
        await queueManagement.updateQueueStatus(currentNumber, 'completed');
        setCurrentNumber(null);
        
        // Refresh queue status
        const newStatus = await queueManagement.getDepartmentQueueStatus(user.departmentId);
        setQueueStatus(newStatus);
        
        toast.success('Marked as completed');
      }
    } catch (error) {
      console.error('Error completing service:', error);
      toast.error('Failed to complete service');
    }
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
      {/* Current Status */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Queue Management</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Now Serving</p>
                <p className="mt-1 text-3xl font-semibold text-blue-900">
                  {currentNumber || '-'}
                </p>
              </div>
              <FaUserClock className="text-blue-500 text-2xl" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed Today</p>
                <p className="mt-1 text-3xl font-semibold text-green-900">
                  {queueStatus.completedNumbers}
                </p>
              </div>
              <FaCheck className="text-green-500 text-2xl" />
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Waiting</p>
                <p className="mt-1 text-3xl font-semibold text-yellow-900">
                  {queueStatus.waitingNumbers.length}
                </p>
              </div>
              <div className="text-yellow-500 text-sm font-medium">
                ~{queueStatus.estimatedWaitTime} min/person
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleCallNext}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <FaPlay className="mr-2" />
            Call Next
          </button>
          {currentNumber && (
            <button
              onClick={handleComplete}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              <FaCheck className="mr-2" />
              Complete Current
            </button>
          )}
        </div>
      </div>

      {/* Waiting List */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Waiting List</h3>
        <div className="space-y-2">
          {queueStatus.waitingNumbers.map((number, index) => (
            <div
              key={number}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900">{number}</p>
                <p className="text-sm text-gray-500">
                  Estimated wait: ~{(index + 1) * queueStatus.estimatedWaitTime} minutes
                </p>
              </div>
              <div className="text-sm font-medium text-gray-500">
                Position: {index + 1}
              </div>
            </div>
          ))}
          {queueStatus.waitingNumbers.length === 0 && (
            <p className="text-center text-gray-500 py-4">No customers waiting</p>
          )}
        </div>
      </div>
    </div>
  );
}; 