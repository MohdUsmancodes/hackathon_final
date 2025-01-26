import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, increment, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const serviceManagement = {
  // Create a new service
  createService: async (serviceData) => {
    try {
      const service = {
        ...serviceData,
        createdAt: serverTimestamp(),
        isActive: true,
        interactions: 0
      };

      const docRef = await addDoc(collection(db, 'services'), service);
      return { id: docRef.id, ...service };
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  },

  // Get all services
  getAllServices: async () => {
    try {
      const servicesSnapshot = await getDocs(collection(db, 'services'));
      return servicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },

  // Update a service
  updateService: async (serviceId, updateData) => {
    try {
      const serviceRef = doc(db, 'services', serviceId);
      await updateDoc(serviceRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  },

  // Delete a service
  deleteService: async (serviceId) => {
    try {
      await deleteDoc(doc(db, 'services', serviceId));
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  },

  // Track service interaction
  trackInteraction: async (serviceId) => {
    try {
      const serviceRef = doc(db, 'services', serviceId);
      await updateDoc(serviceRef, {
        interactions: increment(1),
        lastInteraction: serverTimestamp()
      });
    } catch (error) {
      console.error('Error tracking interaction:', error);
      throw error;
    }
  },

  // Get active services for users
  getActiveServices: async () => {
    try {
      const q = query(
        collection(db, 'services'),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );
      const servicesSnapshot = await getDocs(q);
      return servicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching active services:', error);
      throw error;
    }
  },

  // Get service by ID
  getServiceById: async (serviceId) => {
    try {
      const serviceDoc = await getDoc(doc(db, 'services', serviceId));
      if (!serviceDoc.exists()) {
        throw new Error('Service not found');
      }
      return {
        id: serviceDoc.id,
        ...serviceDoc.data()
      };
    } catch (error) {
      console.error('Error fetching service:', error);
      throw error;
    }
  },

  // Get service tickets
  getServiceTickets: async (serviceId) => {
    try {
      const q = query(
        collection(db, 'tickets'),
        where('serviceId', '==', serviceId),
        orderBy('createdAt', 'desc')
      );
      const ticketsSnapshot = await getDocs(q);
      return ticketsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  },

  // Create a ticket
  createTicket: async (ticketData) => {
    try {
      const ticket = {
        ...ticketData,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, 'tickets'), ticket);
      return { id: docRef.id, ...ticket };
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  },

  // Verify ticket
  verifyTicket: async (ticketId) => {
    try {
      const ticketRef = doc(db, 'tickets', ticketId);
      await updateDoc(ticketRef, {
        status: 'verified',
        verifiedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error verifying ticket:', error);
      throw error;
    }
  }
}; 