import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  increment,
  arrayUnion
} from 'firebase/firestore';

class ServiceManagement {
  constructor() {
    this.servicesRef = collection(db, 'services');
    this.ticketsRef = collection(db, 'tickets');
    this.userAnalyticsRef = collection(db, 'userAnalytics');
    this.visitsRef = collection(db, 'visits');
    this.adminNotificationsRef = collection(db, 'adminNotifications');
  }

  // Service Methods
  async getServices() {
    try {
      const querySnapshot = await getDocs(
        query(this.servicesRef, orderBy('createdAt', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting services:', error);
      throw error;
    }
  }

  async getActiveServices() {
    try {
      const querySnapshot = await getDocs(
        query(
          this.servicesRef,
          where('isActive', '==', true),
          orderBy('createdAt', 'desc')
        )
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting active services:', error);
      throw error;
    }
  }

  async getServiceById(serviceId) {
    try {
      const serviceDoc = await getDoc(doc(this.servicesRef, serviceId));
      if (!serviceDoc.exists()) {
        throw new Error('Service not found');
      }
      return {
        id: serviceDoc.id,
        ...serviceDoc.data()
      };
    } catch (error) {
      console.error('Error getting service:', error);
      throw error;
    }
  }

  async createService(serviceData) {
    try {
      const newService = {
        ...serviceData,
        isActive: true,
        interactions: 0,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(this.servicesRef, newService);
      return {
        id: docRef.id,
        ...newService
      };
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }

  async updateService(serviceId, updateData) {
    try {
      const serviceRef = doc(this.servicesRef, serviceId);
      await updateDoc(serviceRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  }

  async toggleServiceStatus(serviceId) {
    try {
      const serviceDoc = await getDoc(doc(this.servicesRef, serviceId));
      if (!serviceDoc.exists()) {
        throw new Error('Service not found');
      }
      const currentStatus = serviceDoc.data().isActive;
      await updateDoc(doc(this.servicesRef, serviceId), {
        isActive: !currentStatus,
        updatedAt: serverTimestamp()
      });
      return !currentStatus;
    } catch (error) {
      console.error('Error toggling service status:', error);
      throw error;
    }
  }

  // User Analytics Methods
  async trackUserVisit(userId, userName) {
    try {
      const visitData = {
        userId,
        userName: userName || 'Anonymous User',
        timestamp: serverTimestamp(),
        type: 'visit'
      };
      await addDoc(this.visitsRef, visitData);

      // Update or create user analytics
      const userAnalyticsRef = doc(this.userAnalyticsRef, userId);
      const userAnalyticsDoc = await getDoc(userAnalyticsRef);

      if (userAnalyticsDoc.exists()) {
        await updateDoc(userAnalyticsRef, {
          visitCount: increment(1),
          lastVisit: serverTimestamp(),
          visits: arrayUnion(serverTimestamp())
        });
      } else {
        await addDoc(this.userAnalyticsRef, {
          userId,
          userName: userName || 'Anonymous User',
          visitCount: 1,
          ticketCount: 0,
          firstVisit: serverTimestamp(),
          lastVisit: serverTimestamp(),
          visits: [serverTimestamp()],
          tickets: []
        });
      }

      // Create admin notification for first-time visitors
      if (!userAnalyticsDoc.exists()) {
        await this.createAdminNotification({
          type: 'NEW_USER',
          title: 'New User Visit',
          message: `New user ${userName || 'Anonymous User'} has visited for the first time`,
          details: {
            userId,
            userName: userName || 'Anonymous User',
            visitTimestamp: serverTimestamp()
          }
        });
      }
    } catch (error) {
      console.error('Error tracking user visit:', error);
      throw error;
    }
  }

  async createTicket(ticketData) {
    try {
      const newTicket = {
        ...ticketData,
        createdAt: serverTimestamp(),
        status: 'pending'
      };
      const docRef = await addDoc(this.ticketsRef, newTicket);
      
      // Update service interactions
      const serviceRef = doc(this.servicesRef, ticketData.serviceId);
      const serviceDoc = await getDoc(serviceRef);
      if (serviceDoc.exists()) {
        await updateDoc(serviceRef, {
          interactions: increment(1),
          lastInteraction: serverTimestamp()
        });
      }

      // Update user analytics
      const userAnalyticsRef = doc(this.userAnalyticsRef, ticketData.userId);
      const userAnalyticsDoc = await getDoc(userAnalyticsRef);

      if (userAnalyticsDoc.exists()) {
        await updateDoc(userAnalyticsRef, {
          ticketCount: increment(1),
          tickets: arrayUnion({
            ticketId: docRef.id,
            serviceId: ticketData.serviceId,
            timestamp: serverTimestamp()
          })
        });
      } else {
        await addDoc(this.userAnalyticsRef, {
          userId: ticketData.userId,
          userName: ticketData.userName || 'Anonymous User',
          visitCount: 0,
          ticketCount: 1,
          firstVisit: serverTimestamp(),
          lastVisit: serverTimestamp(),
          visits: [],
          tickets: [{
            ticketId: docRef.id,
            serviceId: ticketData.serviceId,
            timestamp: serverTimestamp()
          }]
        });
      }

      // Create admin notification
      await this.createAdminNotification({
        type: 'NEW_TICKET',
        title: 'New Ticket Created',
        message: `A new ticket has been created by ${ticketData.userName || 'Anonymous User'}`,
        details: {
          ticketId: docRef.id,
          serviceId: ticketData.serviceId,
          userId: ticketData.userId,
          userName: ticketData.userName || 'Anonymous User'
        },
        createdAt: serverTimestamp()
      });

      return {
        id: docRef.id,
        ...newTicket
      };
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  }

  async createAdminNotification(notificationData) {
    try {
      // Ensure all required fields are present and have default values
      const notification = {
        type: notificationData.type || 'INFO',
        title: notificationData.title || 'Notification',
        message: notificationData.message || '',
        details: {
          ...notificationData.details,
          // Remove any undefined values
          ...(notificationData.details && Object.fromEntries(
            Object.entries(notificationData.details).filter(([_, v]) => v !== undefined)
          ))
        },
        createdAt: serverTimestamp(),
        read: false
      };

      await addDoc(this.adminNotificationsRef, notification);
    } catch (error) {
      console.error('Error creating admin notification:', error);
      // Don't throw the error to prevent disrupting the main flow
      // Just log it since notifications are not critical
    }
  }

  async getServiceTickets(serviceId) {
    try {
      const querySnapshot = await getDocs(
        query(
          this.ticketsRef,
          where('serviceId', '==', serviceId),
          orderBy('createdAt', 'desc')
        )
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting service tickets:', error);
      throw error;
    }
  }

  async getUserTickets(userId) {
    try {
      const querySnapshot = await getDocs(
        query(
          this.ticketsRef,
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        )
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user tickets:', error);
      throw error;
    }
  }

  async verifyTicket(ticketId) {
    try {
      const ticketRef = doc(this.ticketsRef, ticketId);
      await updateDoc(ticketRef, {
        status: 'verified',
        verifiedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error verifying ticket:', error);
      throw error;
    }
  }

  // Statistics Methods
  async getServiceStatistics(serviceId) {
    try {
      const serviceDoc = await getDoc(doc(this.servicesRef, serviceId));
      if (!serviceDoc.exists()) {
        throw new Error('Service not found');
      }

      const ticketsSnapshot = await getDocs(
        query(this.ticketsRef, where('serviceId', '==', serviceId))
      );

      const totalTickets = ticketsSnapshot.size;
      const verifiedTickets = ticketsSnapshot.docs.filter(
        doc => doc.data().status === 'verified'
      ).length;

      return {
        totalInteractions: serviceDoc.data().interactions || 0,
        totalTickets,
        verifiedTickets,
        lastInteraction: serviceDoc.data().lastInteraction
      };
    } catch (error) {
      console.error('Error getting service statistics:', error);
      throw error;
    }
  }

  async getUserAnalytics() {
    try {
      const querySnapshot = await getDocs(
        query(this.userAnalyticsRef, orderBy('visitCount', 'desc'))
      );
      
      const analytics = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          const tickets = await Promise.all(
            data.tickets.map(async (ticket) => {
              const serviceDoc = await getDoc(doc(this.servicesRef, ticket.serviceId));
              return {
                ...ticket,
                service: serviceDoc.exists() ? serviceDoc.data() : null
              };
            })
          );
          
          return {
            id: doc.id,
            ...data,
            tickets,
            visitHistory: data.visits.map(visit => ({
              timestamp: visit.toDate(),
              type: 'visit'
            }))
          };
        })
      );

      return analytics;
    } catch (error) {
      console.error('Error getting user analytics:', error);
      throw error;
    }
  }

  async getFrequentUsers(minVisits = 3) {
    try {
      const querySnapshot = await getDocs(
        query(
          this.userAnalyticsRef,
          where('visitCount', '>=', minVisits),
          orderBy('visitCount', 'desc')
        )
      );
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting frequent users:', error);
      throw error;
    }
  }
}

export const serviceManagement = new ServiceManagement(); 