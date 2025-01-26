import { collection, query, where, getDocs, updateDoc, doc, orderBy, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const bookingService = {
  // Get all pending bookings
  getPendingBookings: async () => {
    try {
      const q = query(
        collection(db, 'tickets'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      const bookingsSnapshot = await getDocs(q);
      return bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
      throw error;
    }
  },

  // Get all bookings
  getAllBookings: async () => {
    try {
      const q = query(
        collection(db, 'tickets'),
        orderBy('createdAt', 'desc')
      );
      const bookingsSnapshot = await getDocs(q);
      return bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      throw error;
    }
  },

  // Update booking status
  updateBookingStatus: async (bookingId, status) => {
    try {
      const bookingRef = doc(db, 'tickets', bookingId);
      await updateDoc(bookingRef, {
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  },

  // Verify QR code
  verifyQRCode: async (bookingId) => {
    try {
      const bookingRef = doc(db, 'tickets', bookingId);
      await updateDoc(bookingRef, {
        status: 'verified',
        verifiedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error verifying QR code:', error);
      throw error;
    }
  },

  // Generate booking slip
  generateBookingSlip: async (booking) => {
    try {
      // Create a slip object with all necessary information
      const slip = {
        slipNumber: `SLIP-${Date.now().toString().slice(-6)}`,
        queueNumber: booking.queueNumber,
        bookingId: booking.id,
        userDetails: {
          name: booking.userName,
          contact: booking.userContact,
          email: booking.userEmail
        },
        serviceDetails: {
          id: booking.serviceId,
          description: booking.description
        },
        verificationDetails: {
          verifiedAt: booking.verificationTime || new Date().toISOString(),
          verifiedBy: 'Department Manager',
          qrCode: booking.userQrCode
        },
        generatedAt: new Date().toISOString()
      };

      // Save slip to Firestore
      const slipRef = await addDoc(collection(db, 'slips'), slip);
      
      // Update booking with slip reference and queue number
      const bookingRef = doc(db, 'tickets', booking.id);
      await updateDoc(bookingRef, {
        slipId: slipRef.id,
        slipGenerated: true,
        queueNumber: booking.queueNumber
      });

      return {
        ...slip,
        id: slipRef.id
      };
    } catch (error) {
      console.error('Error generating booking slip:', error);
      throw error;
    }
  }
}; 