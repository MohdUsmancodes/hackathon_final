import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { departmentManagerAuth } from '../../services/departmentManagerAuth';
import { FaUser, FaBuilding, FaEnvelope, FaClock } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [department, setDepartment] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // Get current user ID from auth state
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        navigate('/department-manager/login');
        return;
      }

      const profileData = await departmentManagerAuth.getManagerProfile(user.uid);
      setProfile(profileData);

      // Load department details
      const departments = await departmentManagerAuth.getAvailableDepartments();
      const dept = departments.find(d => d.id === profileData.departmentId);
      setDepartment(dept);
    } catch (error) {
      toast.error('Failed to load profile');
    }
  };

  const handleLogout = async () => {
    try {
      await departmentManagerAuth.logoutManager();
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
      navigate('/department-manager/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue-600 p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="bg-white p-3 rounded-full">
              <FaUser size={24} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile.fullName}</h1>
              <p className="text-blue-100">Department Manager</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <FaEnvelope className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaBuilding className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">{department?.name || 'Loading...'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaClock className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Last Login</p>
                <p className="font-medium">
                  {new Date(profile.lastLogin).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t">
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 