import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaQrcode,
  FaEdit,
  FaSave,
  FaTimes,
  FaHistory,
  FaCheckCircle
} from 'react-icons/fa';

export const Profile = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    bio: ''
  });
  const [bookingHistory, setBookingHistory] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (user?.uid) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            setEditForm({
              fullName: data.fullName || '',
              phoneNumber: data.phoneNumber || '',
              address: data.address || '',
              bio: data.bio || ''
            });

            // Fetch booking history with tickets
            const bookings = [
              {
                id: 1,
                service: 'Fish Supply',
                date: '2024-02-20',
                status: 'completed',
                amount: 2500,
                ticketId: 'TKT001',
                qrCode: 'https://example.com/qr1.png',
                department: 'Supply Chain',
                timeSlot: '10:00 AM',
                description: 'Fresh fish supply delivery',
                location: 'Warehouse A'
              },
              {
                id: 2,
                service: 'Equipment Maintenance',
                date: '2024-02-15',
                status: 'pending',
                amount: 1500,
                ticketId: 'TKT002',
                qrCode: 'https://example.com/qr2.png',
                department: 'Maintenance',
                timeSlot: '2:00 PM',
                description: 'Monthly equipment check and maintenance',
                location: 'Workshop B'
              }
            ];
            setBookingHistory(bookings);
          }
        }
      } catch (error) {
        toast.error('Failed to fetch user data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      await updateDoc(doc(db, 'users', user.uid), editForm);
      setUserData(prev => ({ ...prev, ...editForm }));
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-6"
          >
            <div className="h-24 w-24 rounded-full bg-white/10 flex items-center justify-center">
              <FaUser className="h-12 w-12 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {userData?.fullName || user.displayName || 'User Profile'}
              </h1>
              <p className="text-green-100 mt-1">{user.email}</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Profile Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center text-sm font-medium text-green-600 hover:text-green-700"
                >
                  {isEditing ? (
                    <>
                      <FaTimes className="h-4 w-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <FaEdit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </button>
          </div>
          
            <div className="space-y-6">
                {isEditing ? (
                  // Edit Form
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={editForm.fullName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={editForm.phoneNumber}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={editForm.address}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bio
                        </label>
                        <textarea
                          name="bio"
                          value={editForm.bio}
                          onChange={handleInputChange}
                          rows="4"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={handleSubmit}
                        className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <FaSave className="h-4 w-4 mr-2" />
                        Save Changes
                      </button>
                    </div>
                  </>
                ) : (
                  // Display Information
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start space-x-3">
                      <FaUser className="h-5 w-5 text-green-600 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Full Name</p>
                        <p className="mt-1 text-gray-900">{userData?.fullName || 'Not set'}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <FaEnvelope className="h-5 w-5 text-green-600 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="mt-1 text-gray-900">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <FaPhone className="h-5 w-5 text-green-600 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone Number</p>
                        <p className="mt-1 text-gray-900">{userData?.phoneNumber || 'Not set'}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <FaMapMarkerAlt className="h-5 w-5 text-green-600 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Address</p>
                        <p className="mt-1 text-gray-900">{userData?.address || 'Not set'}</p>
                      </div>
                    </div>
                    {userData?.bio && (
                      <div className="md:col-span-2 flex items-start space-x-3">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Bio</p>
                          <p className="mt-1 text-gray-900">{userData.bio}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Booking History */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Booking History</h2>
                <div className="flex items-center space-x-2">
                  <span className="flex items-center text-sm text-gray-600">
                    <span className="w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                    Completed
                  </span>
                  <span className="flex items-center text-sm text-gray-600">
                    <span className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>
                    Pending
                  </span>
                </div>
              </div>
              <div className="space-y-6">
                {bookingHistory.map((booking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                <div>
                          <h3 className="text-xl font-semibold text-gray-900">{booking.service}</h3>
                          <p className="text-gray-600 mt-1">{booking.description}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            booking.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                </div>
                
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Ticket ID</p>
                          <p className="font-medium text-gray-900">{booking.ticketId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Department</p>
                          <p className="font-medium text-gray-900">{booking.department}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="font-medium text-gray-900">{booking.date}</p>
                        </div>
                <div>
                          <p className="text-sm text-gray-500">Time</p>
                          <p className="font-medium text-gray-900">{booking.timeSlot}</p>
                        </div>
                </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium text-gray-900">{booking.location}</p>
                        </div>
                <div>
                          <p className="text-sm text-gray-500">Amount</p>
                          <p className="font-medium text-gray-900">PKR {booking.amount}</p>
                        </div>
                        {booking.qrCode && (
                          <div className="flex justify-end md:col-span-1">
                            <img
                              src={booking.qrCode}
                              alt="Ticket QR Code"
                              className="h-16 w-16 object-contain"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end items-center pt-4 border-t border-gray-100">
                        {booking.status === 'pending' && (
                          <button
                            className="flex items-center text-sm font-medium text-green-600 hover:text-green-700"
                          >
                            <FaQrcode className="h-4 w-4 mr-2" />
                            Show QR Code
                          </button>
                        )}
                        <button
                          className="ml-4 flex items-center text-sm font-medium text-gray-600 hover:text-gray-700"
                        >
                          <FaHistory className="h-4 w-4 mr-2" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {bookingHistory.length === 0 && (
                  <div className="text-center py-12">
                    <FaHistory className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No Bookings Yet</h3>
                    <p className="mt-1 text-gray-500">Your booking history will appear here</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* QR Code */}
            {userData?.qrCode && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your QR Code</h3>
                <div className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <img
                      src={userData.qrCode}
                      alt="QR Code"
                      className="w-48 h-48"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    Use this QR code for quick verification at our locations
                  </p>
                </div>
              </motion.div>
            )}

            {/* Account Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="flex items-center text-green-600">
                    <FaCheckCircle className="h-4 w-4 mr-1" />
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="flex items-center text-gray-900">
                    <FaCalendarAlt className="h-4 w-4 mr-1" />
                    {new Date(userData?.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Verification</span>
                  <span
                    className={`flex items-center ${
                      userData?.isVerified ? 'text-green-600' : 'text-yellow-600'
                    }`}
                  >
                    {userData?.isVerified ? (
                      <>
                        <FaCheckCircle className="h-4 w-4 mr-1" />
                        Verified
                      </>
                    ) : (
                      'Pending'
                    )}
                  </span>
                </div>
              </div>
            </motion.div>
            </div>
        </div>
      </div>
    </div>
  );
}; 