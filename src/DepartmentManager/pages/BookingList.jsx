import React, { useState, useEffect } from 'react';
import { bookingService } from '../services/bookingService';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { adminService } from '../../Admin/services/adminService';
import toast from 'react-hot-toast';

export const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [showScanner, setShowScanner] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [verificationStep, setVerificationStep] = useState('initial'); // initial, scanning, details, complete

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  useEffect(() => {
    let scanner = null;
    if (showScanner) {
      scanner = new Html5QrcodeScanner('reader', {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5,
      });
      
      scanner.render(handleScan, handleScanError);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [showScanner]);

  const fetchBookings = async () => {
    try {
      const data = filter === 'pending' 
        ? await bookingService.getPendingBookings()
        : await bookingService.getAllBookings();
      setBookings(data);
    } catch (error) {
      toast.error('Failed to fetch bookings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyQR = async (bookingId, booking) => {
    try {
      setSelectedBooking(booking);
      setShowScanner(true);
      setVerificationStep('scanning');
    } catch (error) {
      toast.error('Failed to start QR verification');
      console.error(error);
    }
  };

  const handleScan = async (decodedText) => {
    try {
      if (!selectedBooking) {
        toast.error('No booking selected for verification');
        return;
      }

      if (selectedBooking.userQrCode !== decodedText) {
        toast.error('QR code does not match the booking');
        return;
      }

      // Close scanner and update status
      setShowScanner(false);
      await bookingService.verifyQRCode(selectedBooking.id);
      
      // Format notification data properly
      const notificationData = {
        uid: selectedBooking.userId,
        email: selectedBooking.userEmail,
        fullName: selectedBooking.userName,
        phoneNumber: selectedBooking.userContact,
        qrCode: selectedBooking.userQrCode,
        role: 'user',
        isVerified: true,
        createdAt: new Date().toISOString(),
        details: {
          fullName: selectedBooking.userName,
          email: selectedBooking.userEmail,
          phoneNumber: selectedBooking.userContact,
          qrCode: selectedBooking.userQrCode,
          role: 'user',
          isVerified: true,
          createdAt: new Date().toISOString()
        }
      };

      // Send notification to admin
      await adminService.sendUserNotification(notificationData, 'BOOKING_VERIFIED');
      
      setVerificationStep('complete');
      toast.success('QR code verified successfully');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to verify QR code');
      console.error(error);
    }
  };

  const handleScanError = (error) => {
    // Ignore frequent scan errors
    if (error?.message?.includes('NotFound')) return;
    console.warn('QR scan error:', error);
  };

  const handleGenerateSlip = async (booking) => {
    try {
      // Generate queue number based on timestamp and random number
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      const queueNumber = `Q${timestamp.toString().slice(-4)}${random.toString().padStart(3, '0')}`;
      
      const slip = await bookingService.generateBookingSlip({
        ...booking,
        queueNumber,
        verificationTime: new Date().toISOString()
      });
      
      toast.success(`Slip generated successfully. Queue number: ${queueNumber}`);
    } catch (error) {
      toast.error('Failed to generate slip');
      console.error(error);
    }
  };

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      await bookingService.updateBookingStatus(bookingId, status);
      toast.success('Booking status updated successfully');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to update booking status');
      console.error(error);
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
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Service Bookings</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowScanner(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Scan QR Code
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Bookings
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md ${
              filter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
        </div>
      </div>

      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Verify QR Code</h2>
              <button
                onClick={() => {
                  setShowScanner(false);
                  setVerificationStep('initial');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div id="reader" className="w-full"></div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              Scan the QR code to verify the booking
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between">
              <div className="space-y-2 flex-1">
                <h2 className="text-xl font-semibold">{booking.userName}</h2>
                <p className="text-gray-600">{booking.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Contact</p>
                    <p className="text-sm text-gray-900">{booking.userContact}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{booking.userEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Booking Code</p>
                    <p className="text-sm text-gray-900">{booking.userQrCode}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span className={`px-2 py-1 text-sm rounded-full inline-block ${
                      booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : booking.status === 'verified'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-center space-y-2 ml-6">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-200">
                  <QRCodeSVG 
                    value={booking.userQrCode} 
                    size={120}
                    level="L"
                    includeMargin={false}
                  />
                </div>
                {booking.status === 'pending' && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleVerifyQR(booking.id, booking)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Verify QR
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(booking.id, 'rejected')}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
                {booking.status === 'verified' && !booking.slipGenerated && (
                  <button
                    onClick={() => handleGenerateSlip(booking)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Generate Slip
                  </button>
                )}
                {booking.slipGenerated && (
                  <div className="text-sm text-gray-500">
                    Slip Generated: {booking.queueNumber}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {bookings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No bookings found</p>
          </div>
        )}
      </div>
    </div>
  );
}; 