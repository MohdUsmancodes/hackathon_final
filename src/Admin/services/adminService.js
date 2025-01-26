import { collection, addDoc, getDocs, query, where, serverTimestamp, orderBy, updateDoc, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const adminService = {
  // Enhanced user notifications with auth events
  sendUserNotification: async (userData, actionType) => {
    try {
      const notification = {
        userId: userData?.uid || 'unknown',
        userEmail: userData?.email || 'unknown',
        fullName: userData?.fullName || 'Unknown User',
        actionType: actionType || 'GENERAL_UPDATE',
        timestamp: serverTimestamp(),
        isRead: false,
        details: {
          fullName: userData?.fullName || 'Unknown User',
          email: userData?.email || 'unknown',
          phoneNumber: userData?.phoneNumber || 'N/A',
          qrCode: userData?.qrCode || null,
          role: userData?.role || 'user',
          isVerified: userData?.isVerified || false,
          createdAt: userData?.createdAt || serverTimestamp(),
          lastLogin: userData?.lastLogin || serverTimestamp(),
          loginCount: userData?.loginCount || 1,
          deviceInfo: userData?.deviceInfo || 'Not available',
          browser: userData?.browser || 'Not available',
          platform: userData?.platform || 'Not available'
        }
      };

      await addDoc(collection(db, 'adminNotifications'), notification);
    } catch (error) {
      console.error('Error sending notification to admin:', error);
      throw error;
    }
  },

  // Enhanced service management
  createService: async (serviceData) => {
    try {
      const service = {
        name: serviceData.name,
        description: serviceData.description,
        image: serviceData.image || null, // Base64 image
        category: serviceData.category || 'general',
        departmentId: serviceData.departmentId,
        estimatedTime: serviceData.estimatedTime || 30, // in minutes
        maxDailyCapacity: serviceData.maxDailyCapacity || 50,
        requirements: serviceData.requirements || [],
        instructions: serviceData.instructions || '',
        status: 'active',
        isPopular: false,
        totalBookings: 0,
        averageRating: 0,
        reviews: [],
        tags: serviceData.tags || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'services'), service);
      return { id: docRef.id, ...service };
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  },

  // Update service with enhanced fields
  updateService: async (serviceId, updateData) => {
    try {
      const serviceRef = doc(db, 'services', serviceId);
      await updateDoc(serviceRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });

      // Update service analytics
      if (updateData.isPopular !== undefined) {
        await this.updateServiceAnalytics(serviceId, { isPopular: updateData.isPopular });
      }
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  },

  // Service analytics
  updateServiceAnalytics: async (serviceId, data) => {
    try {
      const analyticsRef = doc(db, 'serviceAnalytics', serviceId);
      const analyticsDoc = await getDoc(analyticsRef);

      if (analyticsDoc.exists()) {
        await updateDoc(analyticsRef, {
          ...data,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'serviceAnalytics'), {
          serviceId,
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating service analytics:', error);
      throw error;
    }
  },

  // Get service analytics
  getServiceAnalytics: async (serviceId) => {
    try {
      const analyticsRef = doc(db, 'serviceAnalytics', serviceId);
      const analyticsDoc = await getDoc(analyticsRef);
      return analyticsDoc.exists() ? analyticsDoc.data() : null;
    } catch (error) {
      console.error('Error getting service analytics:', error);
      throw error;
    }
  },

  // Get service reviews
  getServiceReviews: async (serviceId) => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('serviceId', '==', serviceId),
        orderBy('createdAt', 'desc')
      );
      const reviewsSnapshot = await getDocs(q);
      return reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting service reviews:', error);
      throw error;
    }
  },

  // Get user activity
  getUserActivity: async (userId = null) => {
    try {
      let q;
      if (userId) {
        q = query(
          collection(db, 'userActivity'),
          where('userId', '==', userId),
          orderBy('timestamp', 'desc')
        );
      } else {
        q = query(
          collection(db, 'userActivity'),
          orderBy('timestamp', 'desc')
        );
      }
      const activitySnapshot = await getDocs(q);
      return activitySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user activity:', error);
      throw error;
    }
  },

  // Track user activity
  trackUserActivity: async (userId, activity) => {
    try {
      await addDoc(collection(db, 'userActivity'), {
        userId,
        ...activity,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error tracking user activity:', error);
      throw error;
    }
  },

  // Get system health
  getSystemHealth: async () => {
    try {
      const healthRef = doc(db, 'system', 'health');
      const healthDoc = await getDoc(healthRef);
      return healthDoc.exists() ? healthDoc.data() : null;
    } catch (error) {
      console.error('Error getting system health:', error);
      throw error;
    }
  },

  // Update system health
  updateSystemHealth: async (healthData) => {
    try {
      const healthRef = doc(db, 'system', 'health');
      await updateDoc(healthRef, {
        ...healthData,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating system health:', error);
      throw error;
    }
  },

  // Get department performance
  getDepartmentPerformance: async (departmentId) => {
    try {
      const performanceRef = doc(db, 'departmentPerformance', departmentId);
      const performanceDoc = await getDoc(performanceRef);
      return performanceDoc.exists() ? performanceDoc.data() : null;
    } catch (error) {
      console.error('Error getting department performance:', error);
      throw error;
    }
  },

  // User options management
  getUserOptions: async () => {
    try {
      const optionsSnapshot = await getDocs(collection(db, 'adminOptions'));
      return optionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching admin options:', error);
      throw error;
    }
  },

  // Get all tickets
  getAllTickets: async () => {
    try {
      const q = query(
        collection(db, 'tickets'),
        orderBy('createdAt', 'desc')
      );
      const ticketsSnapshot = await getDocs(q);
      return ticketsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convert Firestore Timestamp to ISO string if it exists
          createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
          verifiedAt: data.verifiedAt?.toDate?.()?.toISOString() || null
        };
      });
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  },

  // Get tickets by user
  getUserTickets: async (userId) => {
    try {
      const q = query(
        collection(db, 'tickets'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const ticketsSnapshot = await getDocs(q);
      return ticketsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convert Firestore Timestamp to ISO string if it exists
          createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
          verifiedAt: data.verifiedAt?.toDate?.()?.toISOString() || null
        };
      });
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      throw error;
    }
  },

  // Department management
  addDepartment: async (departmentData) => {
    try {
      const department = {
        ...departmentData,
        createdAt: serverTimestamp(),
        isActive: true
      };
      const docRef = await addDoc(collection(db, 'departments'), department);
      return {
        id: docRef.id,
        ...department
      };
    } catch (error) {
      console.error('Error adding department:', error);
      throw error;
    }
  },

  getDepartments: async () => {
    try {
      const q = query(
        collection(db, 'departments'),
        where('isActive', '==', true),
        orderBy('name', 'asc')
      );
      const departmentsSnapshot = await getDocs(q);
      return departmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  },

  // Get unread notifications count
  getUnreadNotificationsCount: async () => {
    try {
      const q = query(
        collection(db, 'adminNotifications'),
        where('isRead', '==', false)
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread notifications:', error);
      throw error;
    }
  },

  // Get ticket statistics
  getTicketStats: async () => {
    try {
      const ticketsSnapshot = await getDocs(collection(db, 'tickets'));
      const tickets = ticketsSnapshot.docs.map(doc => doc.data());

      return {
        total: tickets.length,
        verified: tickets.filter(t => t.status === 'verified').length,
        pending: tickets.filter(t => t.status === 'pending').length,
        byDepartment: tickets.reduce((acc, ticket) => {
          if (!acc[ticket.departmentId]) {
            acc[ticket.departmentId] = 0;
          }
          acc[ticket.departmentId]++;
          return acc;
        }, {})
      };
    } catch (error) {
      console.error('Error getting ticket statistics:', error);
      throw error;
    }
  },

  // Enhanced Analytics Features
  getDetailedAnalytics: async () => {
    try {
      const [tickets, services, users, departments] = await Promise.all([
        adminService.getAllTickets(),
        adminService.getAllServices(),
        adminService.getAllUsers(),
        adminService.getDepartments()
      ]);

      return {
        peakHours: calculatePeakHours(tickets),
        serviceUtilization: calculateServiceUtilization(tickets, services),
        userRetention: calculateUserRetention(tickets, users),
        departmentEfficiency: calculateDepartmentEfficiency(tickets, departments),
        waitingTimeAnalytics: calculateWaitingTimes(tickets)
      };
    } catch (error) {
      console.error('Error getting detailed analytics:', error);
      throw error;
    }
  },

  // Enhanced User Tracking
  getAllUsers: async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      return usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  },

  getUserBehaviorAnalytics: async (userId) => {
    try {
      const [activity, tickets, reviews] = await Promise.all([
        adminService.getUserActivity(userId),
        adminService.getUserTickets(userId),
        adminService.getUserReviews(userId)
      ]);

      return {
        visitPatterns: analyzeVisitPatterns(activity),
        servicePreferences: analyzeServicePreferences(tickets),
        feedbackSentiment: analyzeFeedbackSentiment(reviews),
        userJourney: createUserJourney(activity, tickets)
      };
    } catch (error) {
      console.error('Error getting user behavior analytics:', error);
      throw error;
    }
  },

  // Enhanced Service Management
  getAllServices: async () => {
    try {
      const servicesSnapshot = await getDocs(collection(db, 'services'));
      return servicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting all services:', error);
      throw error;
    }
  },

  getServiceMetrics: async (serviceId) => {
    try {
      const [tickets, reviews, analytics] = await Promise.all([
        adminService.getServiceTickets(serviceId),
        adminService.getServiceReviews(serviceId),
        adminService.getServiceAnalytics(serviceId)
      ]);

      return {
        averageWaitTime: calculateAverageWaitTime(tickets),
        satisfactionScore: calculateSatisfactionScore(reviews),
        peakUsageTime: findPeakUsageTime(tickets),
        userDemographics: analyzeUserDemographics(tickets),
        performanceMetrics: calculatePerformanceMetrics(tickets, analytics)
      };
    } catch (error) {
      console.error('Error getting service metrics:', error);
      throw error;
    }
  },

  // Additional Admin Controls
  manageUserAccess: async (userId, accessLevel) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        accessLevel,
        updatedAt: serverTimestamp(),
        lastModifiedBy: 'admin'
      });
    } catch (error) {
      console.error('Error managing user access:', error);
      throw error;
    }
  },

  manageDepartmentSettings: async (departmentId, settings) => {
    try {
      const deptRef = doc(db, 'departments', departmentId);
      await updateDoc(deptRef, {
        ...settings,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error managing department settings:', error);
      throw error;
    }
  },

  // Helper functions for analytics
  getUserReviews: async (userId) => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const reviewsSnapshot = await getDocs(q);
      return reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user reviews:', error);
      throw error;
    }
  },

  // Get user details with ticket history
  getUserDetails: async (userId) => {
    try {
      // Get user data
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      // Get user's tickets
      const tickets = await adminService.getUserTickets(userId);

      // Get service details for each ticket
      const ticketsWithServices = await Promise.all(
        tickets.map(async (ticket) => {
          const serviceDoc = await getDoc(doc(db, 'services', ticket.serviceId));
          return {
            ...ticket,
            serviceName: serviceDoc.exists() ? serviceDoc.data().name : 'Unknown Service'
          };
        })
      );

      // Get user activity
      const activity = await adminService.getUserActivity(userId);

      return {
        ...userDoc.data(),
        userId: userDoc.id,
        tickets: ticketsWithServices,
        activity: activity,
        stats: {
          totalTickets: tickets.length,
          completedTickets: tickets.filter(t => t.status === 'completed').length,
          averageWaitTime: calculateAverageWaitTime(tickets)
        }
      };
    } catch (error) {
      console.error('Error getting user details:', error);
      throw error;
    }
  },

  // Update user status
  updateUserStatus: async (userId, updates) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  // Get filtered and sorted users
  getFilteredUsers: async (searchQuery = '', sortBy = 'name', filterBy = 'all') => {
    try {
      let q = query(collection(db, 'users'));

      // Apply filters
      if (filterBy === 'active') {
        q = query(q, where('isActive', '==', true));
      } else if (filterBy === 'verified') {
        q = query(q, where('isVerified', '==', true));
      }

      const usersSnapshot = await getDocs(q);
      let users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Apply search
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        users = users.filter(user => 
          user.userName?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.phoneNumber?.includes(searchQuery)
        );
      }

      // Apply sorting
      users.sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return (a.userName || '').localeCompare(b.userName || '');
          case 'tickets':
            return (b.ticketCount || 0) - (a.ticketCount || 0);
          case 'date':
            return new Date(b.createdAt) - new Date(a.createdAt);
          default:
            return 0;
        }
      });

      return users;
    } catch (error) {
      console.error('Error getting filtered users:', error);
      throw error;
    }
  }
};

// Analytics Helper Functions
const calculatePeakHours = (tickets) => {
  const hourCounts = {};
  tickets.forEach(ticket => {
    if (ticket.createdAt) {
      const hour = new Date(ticket.createdAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
  });
  return hourCounts;
};

const calculateServiceUtilization = (tickets, services) => {
  const utilization = {};
  services.forEach(service => {
    const serviceTickets = tickets.filter(t => t.serviceId === service.id);
    utilization[service.id] = {
      name: service.name,
      total: serviceTickets.length,
      verified: serviceTickets.filter(t => t.status === 'verified').length,
      utilizationRate: serviceTickets.length / (service.maxDailyCapacity || 1)
    };
  });
  return utilization;
};

const calculateUserRetention = (tickets, users) => {
  const userVisits = {};
  tickets.forEach(ticket => {
    if (!userVisits[ticket.userId]) {
      userVisits[ticket.userId] = [];
    }
    userVisits[ticket.userId].push(new Date(ticket.createdAt));
  });

  return {
    totalUsers: users.length,
    returningUsers: Object.keys(userVisits).filter(userId => 
      userVisits[userId].length > 1
    ).length,
    averageVisitsPerUser: Object.values(userVisits).reduce((acc, visits) => 
      acc + visits.length, 0) / users.length
  };
};

const calculateDepartmentEfficiency = (tickets, departments) => {
  const efficiency = {};
  departments.forEach(dept => {
    const deptTickets = tickets.filter(t => t.departmentId === dept.id);
    const verifiedTickets = deptTickets.filter(t => t.status === 'verified');
    
    efficiency[dept.id] = {
      name: dept.name,
      totalTickets: deptTickets.length,
      verifiedTickets: verifiedTickets.length,
      averageProcessingTime: calculateAverageProcessingTime(verifiedTickets),
      efficiency: verifiedTickets.length / (deptTickets.length || 1)
    };
  });
  return efficiency;
};

const calculateWaitingTimes = (tickets) => {
  const waitTimes = tickets
    .filter(t => t.verifiedAt && t.createdAt)
    .map(t => new Date(t.verifiedAt) - new Date(t.createdAt));

  return {
    averageWaitTime: waitTimes.reduce((acc, time) => acc + time, 0) / (waitTimes.length || 1),
    minWaitTime: Math.min(...waitTimes),
    maxWaitTime: Math.max(...waitTimes),
    medianWaitTime: calculateMedian(waitTimes)
  };
};

const calculateMedian = (numbers) => {
  const sorted = numbers.sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
};

const analyzeVisitPatterns = (activity) => {
  const patterns = {
    byDay: {},
    byHour: {},
    byMonth: {}
  };

  activity.forEach(act => {
    const date = new Date(act.timestamp);
    const day = date.getDay();
    const hour = date.getHours();
    const month = date.getMonth();

    patterns.byDay[day] = (patterns.byDay[day] || 0) + 1;
    patterns.byHour[hour] = (patterns.byHour[hour] || 0) + 1;
    patterns.byMonth[month] = (patterns.byMonth[month] || 0) + 1;
  });

  return patterns;
};

const calculateAverageProcessingTime = (tickets) => {
  if (!tickets.length) return 0;
  const processingTimes = tickets
    .filter(t => t.verifiedAt && t.createdAt)
    .map(t => new Date(t.verifiedAt) - new Date(t.createdAt));
  return processingTimes.reduce((acc, time) => acc + time, 0) / processingTimes.length;
};