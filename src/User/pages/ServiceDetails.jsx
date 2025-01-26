import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { serviceManagement } from '../../services/serviceManagement';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FaClock,
  FaCalendar,
  FaUsers,
  FaStar,
  FaCheckCircle,
  FaShieldAlt,
  FaMoneyBillWave,
  FaArrowLeft,
  FaInfoCircle,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt
} from 'react-icons/fa';

export const ServiceDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [relatedServices, setRelatedServices] = useState([]);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        const serviceData = await serviceManagement.getServiceById(id);
        setService(serviceData);
        
        // Fetch related services
        const allServices = await serviceManagement.getActiveServices();
        const related = allServices
          .filter(s => s.category === serviceData.category && s.id !== id)
          .slice(0, 3);
        setRelatedServices(related);

        // Fetch reviews (mock data for now)
        setReviews([
          {
            id: 1,
            user: 'John Doe',
            rating: 5,
            comment: 'Excellent service! The quality was outstanding.',
            date: '2024-02-15'
          },
          {
            id: 2,
            user: 'Jane Smith',
            rating: 4,
            comment: 'Very professional and timely service.',
            date: '2024-02-10'
          }
        ]);
      } catch (error) {
        toast.error('Failed to fetch service details');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetails();
  }, [id]);

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select both date and time');
      return;
    }

    try {
      await serviceManagement.bookService({
        serviceId: id,
        userId: user.uid,
        date: selectedDate,
        time: selectedTime
      });
      toast.success('Service booked successfully!');
      setShowBookingForm(false);
    } catch (error) {
      toast.error('Failed to book service');
      console.error(error);
    }
  };

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '02:00 PM', '03:00 PM',
    '04:00 PM', '05:00 PM'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <FaInfoCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Service not found</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            to="/user/services"
            className="inline-flex items-center text-white hover:text-green-100 mb-8"
          >
            <FaArrowLeft className="mr-2" />
            Back to Services
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-white mb-4">{service.title}</h1>
            <div className="flex items-center space-x-4 text-green-100">
              <span className="flex items-center">
                <FaStar className="mr-1" />
                4.8 (24 reviews)
              </span>
              <span className="flex items-center">
                <FaUsers className="mr-1" />
                1000+ bookings
              </span>
              <span className="flex items-center">
                <FaCheckCircle className="mr-1" />
                Verified Service
              </span>
          </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Service Description */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">About This Service</h2>
              <p className="text-gray-600 leading-relaxed mb-6">{service.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="flex items-start space-x-3">
                  <FaClock className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">Duration</h3>
                    <p className="text-gray-500">1-2 hours</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FaShieldAlt className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">Guarantee</h3>
                    <p className="text-gray-500">100% Satisfaction</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FaMoneyBillWave className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">Price</h3>
                    <p className="text-gray-500">PKR {service.price}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* What's Included */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">What's Included</h2>
              <ul className="space-y-4">
                {[
                  'Professional service by experienced staff',
                  'Quality assurance and monitoring',
                  'Post-service support',
                  'Detailed documentation and reports'
                ].map((item, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <FaCheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Customer Reviews</h2>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-600 font-medium">
                            {review.user.charAt(0)}
                          </span>
                        </div>
          <div>
                          <h4 className="font-medium text-gray-900">{review.user}</h4>
                          <p className="text-sm text-gray-500">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`h-5 w-5 ${
                              i < review.rating ? 'text-yellow-400' : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Booking Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Book This Service</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Time
                    </label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Choose a time slot</option>
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
          </div>
          <button
            onClick={handleBooking}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
                    Book Now
          </button>
                </div>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <FaPhoneAlt className="h-5 w-5 text-green-600" />
                    <span className="text-gray-600">+92 300 1234567</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaEnvelope className="h-5 w-5 text-green-600" />
                    <span className="text-gray-600">support@saylanifishery.com</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaMapMarkerAlt className="h-5 w-5 text-green-600" />
                    <span className="text-gray-600">Saylani House, Karachi, Pakistan</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Related Services */}
        {relatedServices.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">Related Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedServices.map((relatedService) => (
                <motion.div
                  key={relatedService.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                      {relatedService.category}
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      PKR {relatedService.price}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {relatedService.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {relatedService.description}
                  </p>
                  <Link
                    to={`/user/services/${relatedService.id}`}
                    className="inline-flex items-center text-green-600 hover:text-green-700"
                  >
                    Learn More
                    <FaArrowLeft className="ml-2 transform rotate-180" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 