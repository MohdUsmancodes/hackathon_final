import { collection, addDoc, getDocs, query, where, serverTimestamp, orderBy, updateDoc, doc, getDoc, deleteDoc, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { adminService } from './adminService';

export const managerService = {
  // Assign manager to department
  assignManager: async (managerId, departmentId, role = 'manager') => {
    try {
      const managerRef = doc(db, 'users', managerId);
      const departmentRef = doc(db, 'departments', departmentId);

      // Get manager and department data
      const [managerDoc, departmentDoc] = await Promise.all([
        getDoc(managerRef),
        getDoc(departmentRef)
      ]);

      if (!managerDoc.exists()) throw new Error('Manager not found');
      if (!departmentDoc.exists()) throw new Error('Department not found');

      // Create assignment record
      const assignment = {
        managerId,
        departmentId,
        role,
        managerName: managerDoc.data().userName,
        departmentName: departmentDoc.data().name,
        assignedAt: serverTimestamp(),
        status: 'active',
        responsibilities: [
          'Queue management',
          'Service verification',
          'Customer support',
          'Department operations'
        ]
      };

      await addDoc(collection(db, 'managerAssignments'), assignment);

      // Update user record
      await updateDoc(managerRef, {
        role: 'department_manager',
        departmentId,
        lastUpdated: serverTimestamp()
      });

      // Update department record
      await updateDoc(departmentRef, {
        managerId,
        lastUpdated: serverTimestamp()
      });

      // Send notification
      await adminService.sendUserNotification(managerDoc.data(), 'MANAGER_ASSIGNED');

      return assignment;
    } catch (error) {
      console.error('Error assigning manager:', error);
      throw error;
    }
  },

  // Get department managers
  getDepartmentManagers: async () => {
    try {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'department_manager'),
        orderBy('userName')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting department managers:', error);
      throw error;
    }
  },

  // Get manager assignments
  getManagerAssignments: async (departmentId = null) => {
    try {
      let q = collection(db, 'managerAssignments');
      if (departmentId) {
        q = query(q, where('departmentId', '==', departmentId));
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting manager assignments:', error);
      throw error;
    }
  },

  // Update manager responsibilities
  updateManagerResponsibilities: async (assignmentId, responsibilities) => {
    try {
      const assignmentRef = doc(db, 'managerAssignments', assignmentId);
      await updateDoc(assignmentRef, {
        responsibilities,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating manager responsibilities:', error);
      throw error;
    }
  },

  // Remove manager assignment
  removeManagerAssignment: async (assignmentId) => {
    try {
      const assignmentRef = doc(db, 'managerAssignments', assignmentId);
      const assignmentDoc = await getDoc(assignmentRef);

      if (!assignmentDoc.exists()) throw new Error('Assignment not found');

      const { managerId, departmentId } = assignmentDoc.data();

      // Update user record
      await updateDoc(doc(db, 'users', managerId), {
        role: 'user',
        departmentId: null,
        lastUpdated: serverTimestamp()
      });

      // Update department record
      await updateDoc(doc(db, 'departments', departmentId), {
        managerId: null,
        lastUpdated: serverTimestamp()
      });

      // Delete assignment
      await deleteDoc(assignmentRef);

      // Send notification
      await adminService.sendUserNotification(
        { uid: managerId },
        'MANAGER_UNASSIGNED'
      );
    } catch (error) {
      console.error('Error removing manager assignment:', error);
      throw error;
    }
  },

  // Get manager performance metrics
  getManagerPerformance: async (managerId) => {
    try {
      const q = query(
        collection(db, 'queueNumbers'),
        where('managerId', '==', managerId),
        where('status', '==', 'completed')
      );
      const snapshot = await getDocs(q);
      const completedTickets = snapshot.docs.map(doc => doc.data());

      return {
        totalCompleted: completedTickets.length,
        averageServiceTime: calculateAverageServiceTime(completedTickets),
        customerSatisfaction: await calculateCustomerSatisfaction(managerId),
        efficiency: calculateEfficiencyScore(completedTickets)
      };
    } catch (error) {
      console.error('Error getting manager performance:', error);
      throw error;
    }
  },

  // Get manager performance history
  getPerformanceHistory: async (managerId, days = 30) => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const q = query(
        collection(db, 'queueNumbers'),
        where('managerId', '==', managerId),
        where('completedAt', '>=', startDate),
        where('completedAt', '<=', endDate),
        orderBy('completedAt')
      );

      const [ticketsSnapshot, reviewsSnapshot] = await Promise.all([
        getDocs(q),
        getDocs(query(
          collection(db, 'reviews'),
          where('managerId', '==', managerId),
          where('createdAt', '>=', startDate),
          where('createdAt', '<=', endDate),
          orderBy('createdAt')
        ))
      ]);

      const tickets = ticketsSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));

      const reviews = reviewsSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));

      // Group data by date
      const dateGroups = {};
      tickets.forEach(ticket => {
        const date = new Date(ticket.completedAt.seconds * 1000).toLocaleDateString();
        if (!dateGroups[date]) {
          dateGroups[date] = {
            serviceTimes: [],
            satisfaction: []
          };
        }
        const serviceTime = (ticket.completedAt.seconds - ticket.startTime.seconds) / 60; // minutes
        dateGroups[date].serviceTimes.push(serviceTime);
      });

      reviews.forEach(review => {
        const date = new Date(review.createdAt.seconds * 1000).toLocaleDateString();
        if (!dateGroups[date]) {
          dateGroups[date] = {
            serviceTimes: [],
            satisfaction: []
          };
        }
        dateGroups[date].satisfaction.push(review.rating);
      });

      // Calculate averages and prepare chart data
      const dates = Object.keys(dateGroups).sort();
      const serviceTimes = dates.map(date => {
        const times = dateGroups[date].serviceTimes;
        return times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0;
      });
      const satisfaction = dates.map(date => {
        const ratings = dateGroups[date].satisfaction;
        return ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
      });

      return {
        dates,
        serviceTimes,
        satisfaction
      };
    } catch (error) {
      console.error('Error getting performance history:', error);
      throw error;
    }
  },

  // Update manager status
  updateManagerStatus: async (assignmentId, status) => {
    try {
      const assignmentRef = doc(db, 'managerAssignments', assignmentId);
      await updateDoc(assignmentRef, {
        status,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating manager status:', error);
      throw error;
    }
  },

  // Get manager workload
  getManagerWorkload: async (managerId) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const q = query(
        collection(db, 'queueNumbers'),
        where('managerId', '==', managerId),
        where('createdAt', '>=', today),
        where('status', 'in', ['pending', 'in_progress'])
      );

      const snapshot = await getDocs(q);
      const pendingTickets = snapshot.docs.map(doc => doc.data());

      return {
        pendingCount: pendingTickets.length,
        estimatedWorkload: pendingTickets.reduce((total, ticket) => 
          total + (ticket.estimatedDuration || 15), 0),
        nextAvailableTime: calculateNextAvailableTime(pendingTickets)
      };
    } catch (error) {
      console.error('Error getting manager workload:', error);
      throw error;
    }
  }
};

// Helper functions
const calculateAverageServiceTime = (tickets) => {
  if (!tickets.length) return 0;
  const serviceTimes = tickets.map(ticket => {
    const start = new Date(ticket.startTime);
    const end = new Date(ticket.completedAt);
    return (end - start) / 60000; // Convert to minutes
  });
  return serviceTimes.reduce((sum, time) => sum + time, 0) / tickets.length;
};

const calculateCustomerSatisfaction = async (managerId) => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('managerId', '==', managerId)
    );
    const snapshot = await getDocs(q);
    const reviews = snapshot.docs.map(doc => doc.data());
    if (!reviews.length) return 0;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  } catch (error) {
    console.error('Error calculating customer satisfaction:', error);
    return 0;
  }
};

const calculateEfficiencyScore = (tickets) => {
  if (!tickets.length) return 0;
  const withinTarget = tickets.filter(ticket => {
    const waitTime = new Date(ticket.completedAt) - new Date(ticket.createdAt);
    return waitTime <= ticket.targetTime;
  });
  return (withinTarget.length / tickets.length) * 100;
};

// Helper function to calculate next available time
const calculateNextAvailableTime = (pendingTickets) => {
  if (!pendingTickets.length) return new Date();

  const now = new Date();
  let totalMinutes = pendingTickets.reduce((total, ticket) => 
    total + (ticket.estimatedDuration || 15), 0);

  const nextAvailable = new Date(now.getTime() + totalMinutes * 60000);
  return nextAvailable;
}; 