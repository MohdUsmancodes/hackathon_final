import { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

class NotificationService {
  constructor() {
    this.notificationsRef = collection(db, 'notifications');
    this.adminNotificationsRef = collection(db, 'adminNotifications');
    this.ticketsRef = collection(db, 'tickets');
    this.usersRef = collection(db, 'users');
  }

  // Send admin notification with enhanced types
  sendAdminNotification = async (type, details) => {
    try {
      const notification = {
        type,
        title: this.getNotificationTitle(type),
        message: this.getNotificationMessage(type, details),
        details: {
          ...details,
          userId: details.userId || 'unknown',
          userEmail: details.userEmail || 'unknown',
          phoneNumber: details.phoneNumber || 'N/A',
          departmentId: details.departmentId || 'unknown',
          serviceId: details.serviceId || 'unknown'
        },
        priority: this.getNotificationPriority(type),
        category: this.getNotificationCategory(type),
        timestamp: serverTimestamp(),
        isRead: false,
        actions: this.getNotificationActions(type)
      };
      
      await addDoc(this.adminNotificationsRef, notification);
      
      // Send immediate alerts for high-priority notifications
      if (notification.priority === 'high') {
        await this.sendImmediateAlert(notification);
      }
    } catch (error) {
      console.error('Error sending admin notification:', error);
      throw error;
    }
  };

  // Get notification priority
  getNotificationPriority = (type) => {
    const priorities = {
      'EMERGENCY': 'high',
      'CAPACITY_WARNING': 'high',
      'SECURITY_ALERT': 'high',
      'SYSTEM_ERROR': 'high',
      'BOOKING_VERIFIED': 'medium',
      'BOOKING_COMPLETED': 'medium',
      'STAFF_UPDATE': 'medium',
      'BOOKING_CREATED': 'low',
      'USER_REGISTERED': 'low',
      'GENERAL_UPDATE': 'low'
    };
    return priorities[type] || 'low';
  };

  // Get notification category
  getNotificationCategory = (type) => {
    const categories = {
      'EMERGENCY': 'alert',
      'CAPACITY_WARNING': 'system',
      'SECURITY_ALERT': 'security',
      'SYSTEM_ERROR': 'system',
      'BOOKING_VERIFIED': 'booking',
      'BOOKING_COMPLETED': 'booking',
      'STAFF_UPDATE': 'staff',
      'BOOKING_CREATED': 'booking',
      'USER_REGISTERED': 'user',
      'GENERAL_UPDATE': 'general'
    };
    return categories[type] || 'general';
  };

  // Get notification actions
  getNotificationActions = (type) => {
    const actions = {
      'EMERGENCY': ['view', 'respond', 'escalate'],
      'CAPACITY_WARNING': ['view', 'adjust-capacity'],
      'SECURITY_ALERT': ['view', 'acknowledge', 'investigate'],
      'SYSTEM_ERROR': ['view', 'retry', 'report'],
      'BOOKING_VERIFIED': ['view', 'process'],
      'BOOKING_COMPLETED': ['view', 'feedback'],
      'STAFF_UPDATE': ['view', 'acknowledge'],
      'BOOKING_CREATED': ['view', 'assign'],
      'USER_REGISTERED': ['view', 'verify'],
      'GENERAL_UPDATE': ['view']
    };
    return actions[type] || ['view'];
  };

  // Enhanced notification titles
  getNotificationTitle = (type) => {
    const titles = {
      'EMERGENCY': '🚨 Emergency Alert',
      'CAPACITY_WARNING': '⚠️ Capacity Warning',
      'SECURITY_ALERT': '🔒 Security Alert',
      'SYSTEM_ERROR': '❌ System Error',
      'BOOKING_VERIFIED': '✅ Booking Verified',
      'BOOKING_COMPLETED': '🎉 Booking Completed',
      'STAFF_UPDATE': '👥 Staff Update',
      'BOOKING_CREATED': '📝 New Booking',
      'USER_REGISTERED': '👤 New User',
      'GENERAL_UPDATE': 'ℹ️ General Update'
    };
    return titles[type] || 'Notification';
  };

  // Enhanced notification messages
  getNotificationMessage = (type, details) => {
    switch (type) {
      case 'EMERGENCY':
        return `Emergency situation reported in ${details.departmentId}: ${details.message}`;
      case 'SECURITY_ALERT':
        return `Security alert: ${details.message}`;
      case 'SYSTEM_ERROR':
        return `System error detected: ${details.message}`;
      case 'STAFF_UPDATE':
        return `Staff update for ${details.departmentId}: ${details.message}`;
      case 'BOOKING_CREATED':
        return `New booking created by ${details.userEmail || 'a user'} for ${details.serviceName || 'a service'}`;
      case 'BOOKING_VERIFIED':
        return `Booking verified for ${details.userEmail || 'a user'} at ${new Date().toLocaleTimeString()}`;
      case 'BOOKING_COMPLETED':
        return `Booking completed for ${details.userEmail || 'a user'}. Service: ${details.serviceName || 'Unknown'}`;
      case 'USER_REGISTERED':
        return `New user registered: ${details.userEmail || 'Unknown email'}`;
      case 'CAPACITY_WARNING':
        return `Department ${details.departmentId} is at ${details.currentCapacity}/${details.maxCapacity} capacity`;
      default:
        return details.message || 'New notification received';
    }
  };

  // Send immediate alert for high-priority notifications
  sendImmediateAlert = async (notification) => {
    try {
      // Add to urgent notifications collection
      await addDoc(collection(db, 'urgentNotifications'), {
        ...notification,
        sentAt: serverTimestamp()
      });

      // You could integrate with external services here
      // For example: SMS, Email, or Push notifications
    } catch (error) {
      console.error('Error sending immediate alert:', error);
    }
  };

  // Get notifications with filtering
  getNotifications = async (filters = {}) => {
    try {
      let q = query(this.notificationsRef, orderBy('timestamp', 'desc'));

      if (filters.userId) {
        q = query(q, where('userId', '==', filters.userId));
      }
      if (filters.type) {
        q = query(q, where('type', '==', filters.type));
      }
      if (filters.priority) {
        q = query(q, where('priority', '==', filters.priority));
      }
      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }
      if (filters.isRead !== undefined) {
        q = query(q, where('isRead', '==', filters.isRead));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  };

  // Send queue position update
  sendQueueUpdate = async (ticketId, newPosition, estimatedWaitTime) => {
    try {
      const ticketDoc = await getDocs(doc(this.ticketsRef, ticketId));
      if (!ticketDoc.exists()) throw new Error('Ticket not found');
      
      const ticket = ticketDoc.data();
      
      const notification = {
        userId: ticket.userId,
        type: 'QUEUE_UPDATE',
        title: 'Queue Position Update',
        message: `Your current position is ${newPosition}. Estimated wait time: ${estimatedWaitTime} minutes.`,
        ticketId,
        queueNumber: ticket.queueNumber,
        timestamp: serverTimestamp(),
        isRead: false,
        data: {
          position: newPosition,
          estimatedWaitTime,
          departmentId: ticket.departmentId
        }
      };
      
      await addDoc(this.notificationsRef, notification);
    } catch (error) {
      console.error('Error sending queue update:', error);
      throw error;
    }
  };

  // Send approaching turn reminder
  sendApproachingTurnReminder = async (ticketId) => {
    try {
      const ticketDoc = await getDocs(doc(this.ticketsRef, ticketId));
      if (!ticketDoc.exists()) throw new Error('Ticket not found');
      
      const ticket = ticketDoc.data();
      
      const notification = {
        userId: ticket.userId,
        type: 'APPROACHING_TURN',
        title: 'Almost Your Turn',
        message: 'Please be ready. Your turn is coming up soon.',
        ticketId,
        queueNumber: ticket.queueNumber,
        timestamp: serverTimestamp(),
        isRead: false,
        data: {
          departmentId: ticket.departmentId,
          serviceId: ticket.serviceId
        }
      };
      
      await addDoc(this.notificationsRef, notification);
    } catch (error) {
      console.error('Error sending approaching turn reminder:', error);
      throw error;
    }
  };

  // Send capacity warning to department
  sendCapacityWarning = async (departmentId, currentCapacity, maxCapacity) => {
    try {
      const notification = {
        type: 'CAPACITY_WARNING',
        title: 'Department Capacity Warning',
        message: `Department is at ${Math.round((currentCapacity / maxCapacity) * 100)}% capacity`,
        departmentId,
        timestamp: serverTimestamp(),
        isRead: false,
        data: {
          currentCapacity,
          maxCapacity,
          percentage: (currentCapacity / maxCapacity)
        }
      };
      
      await addDoc(collection(db, 'adminNotifications'), notification);
    } catch (error) {
      console.error('Error sending capacity warning:', error);
      throw error;
    }
  };

  // Send batch notifications
  sendBatchNotifications = async (notifications) => {
    try {
      const batch = db.batch();
      
      notifications.forEach(notification => {
        const notificationRef = doc(this.notificationsRef);
        batch.set(notificationRef, {
          ...notification,
          timestamp: serverTimestamp(),
          isRead: false
        });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error sending batch notifications:', error);
      throw error;
    }
  };

  // Get user's unread notifications
  getUnreadNotifications = async (userId) => {
    try {
      const q = query(
        this.notificationsRef,
        where('userId', '==', userId),
        where('isRead', '==', false),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting unread notifications:', error);
      throw error;
    }
  };

  // Mark notifications as read
  markAsRead = async (notificationIds) => {
    try {
      const batch = db.batch();
      
      notificationIds.forEach(id => {
        const notificationRef = doc(this.notificationsRef, id);
        batch.update(notificationRef, {
          isRead: true,
          readAt: serverTimestamp()
        });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  };

  // Send service completion notification
  sendServiceCompletionNotification = async (ticketId) => {
    try {
      const ticketDoc = await getDocs(doc(this.ticketsRef, ticketId));
      if (!ticketDoc.exists()) throw new Error('Ticket not found');
      
      const ticket = ticketDoc.data();
      
      const notification = {
        userId: ticket.userId,
        type: 'SERVICE_COMPLETED',
        title: 'Service Completed',
        message: 'Thank you for using our service. Please rate your experience.',
        ticketId,
        timestamp: serverTimestamp(),
        isRead: false,
        data: {
          serviceId: ticket.serviceId,
          departmentId: ticket.departmentId,
          queueNumber: ticket.queueNumber
        }
      };
      
      await addDoc(this.notificationsRef, notification);
    } catch (error) {
      console.error('Error sending service completion notification:', error);
      throw error;
    }
  };
}

export const notificationService = new NotificationService(); 