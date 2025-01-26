import { collection, query, where, getDocs, orderBy, limit, startOfDay, endOfDay } from 'firebase/firestore';
import { db } from '../config/firebase';

class AnalyticsService {
  constructor() {
    this.ticketsRef = collection(db, 'tickets');
    this.departmentsRef = collection(db, 'departments');
    this.servicesRef = collection(db, 'services');
  }

  // Get department performance metrics
  getDepartmentMetrics = async (departmentId, startDate, endDate) => {
    try {
      const q = query(
        this.ticketsRef,
        where('departmentId', '==', departmentId),
        where('createdAt', '>=', startDate),
        where('createdAt', '<=', endDate)
      );
      
      const tickets = await getDocs(q);
      const ticketData = tickets.docs.map(doc => doc.data());
      
      // Calculate metrics
      const totalTickets = ticketData.length;
      const completedTickets = ticketData.filter(t => t.status === 'completed').length;
      const averageWaitTime = ticketData.reduce((sum, ticket) => {
        if (ticket.verifiedAt && ticket.createdAt) {
          return sum + (new Date(ticket.verifiedAt) - new Date(ticket.createdAt)) / 60000;
        }
        return sum;
      }, 0) / completedTickets || 0;
      
      return {
        totalTickets,
        completedTickets,
        averageWaitTime,
        completionRate: (completedTickets / totalTickets) * 100,
        peakHours: this.calculatePeakHours(ticketData)
      };
    } catch (error) {
      console.error('Error getting department metrics:', error);
      throw error;
    }
  };

  // Calculate peak hours
  calculatePeakHours = (tickets) => {
    const hourCounts = Array(24).fill(0);
    
    tickets.forEach(ticket => {
      const hour = new Date(ticket.createdAt).getHours();
      hourCounts[hour]++;
    });
    
    const peakHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    
    return peakHours;
  };

  // Get service utilization report
  getServiceUtilization = async (serviceId, period = 30) => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);
      
      const q = query(
        this.ticketsRef,
        where('serviceId', '==', serviceId),
        where('createdAt', '>=', startDate)
      );
      
      const tickets = await getDocs(q);
      const ticketData = tickets.docs.map(doc => doc.data());
      
      // Calculate daily utilization
      const dailyUtilization = {};
      ticketData.forEach(ticket => {
        const date = new Date(ticket.createdAt).toISOString().split('T')[0];
        dailyUtilization[date] = (dailyUtilization[date] || 0) + 1;
      });
      
      return {
        totalUtilization: ticketData.length,
        averageDaily: ticketData.length / period,
        dailyUtilization,
        status: this.calculateServiceStatus(ticketData)
      };
    } catch (error) {
      console.error('Error getting service utilization:', error);
      throw error;
    }
  };

  // Calculate service status
  calculateServiceStatus = (tickets) => {
    const total = tickets.length;
    const completed = tickets.filter(t => t.status === 'completed').length;
    const cancelled = tickets.filter(t => t.status === 'cancelled').length;
    
    return {
      completed,
      cancelled,
      pending: total - completed - cancelled,
      successRate: (completed / total) * 100
    };
  };

  // Get real-time department status
  getRealTimeDepartmentStatus = async (departmentId) => {
    try {
      const today = new Date();
      const startOfToday = startOfDay(today);
      const endOfToday = endOfDay(today);
      
      const q = query(
        this.ticketsRef,
        where('departmentId', '==', departmentId),
        where('createdAt', '>=', startOfToday),
        where('createdAt', '<=', endOfToday)
      );
      
      const tickets = await getDocs(q);
      const ticketData = tickets.docs.map(doc => doc.data());
      
      const activeTickets = ticketData.filter(t => 
        t.status === 'pending' || t.status === 'in-progress'
      );
      
      return {
        currentLoad: activeTickets.length,
        todayTotal: ticketData.length,
        averageWaitTime: this.calculateAverageWaitTime(ticketData),
        status: this.calculateDepartmentStatus(activeTickets.length)
      };
    } catch (error) {
      console.error('Error getting real-time department status:', error);
      throw error;
    }
  };

  // Calculate average wait time
  calculateAverageWaitTime = (tickets) => {
    const completedTickets = tickets.filter(t => 
      t.status === 'completed' && t.verifiedAt && t.createdAt
    );
    
    if (completedTickets.length === 0) return 0;
    
    const totalWaitTime = completedTickets.reduce((sum, ticket) => {
      return sum + (new Date(ticket.verifiedAt) - new Date(ticket.createdAt));
    }, 0);
    
    return Math.round(totalWaitTime / completedTickets.length / 60000); // Convert to minutes
  };

  // Calculate department status
  calculateDepartmentStatus = (currentLoad) => {
    if (currentLoad < 5) return 'Low';
    if (currentLoad < 15) return 'Moderate';
    if (currentLoad < 30) return 'High';
    return 'Very High';
  };

  // Get user visit patterns
  getUserVisitPatterns = async (userId) => {
    try {
      const q = query(
        this.ticketsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const tickets = await getDocs(q);
      const ticketData = tickets.docs.map(doc => doc.data());
      
      return {
        visitFrequency: this.calculateVisitFrequency(ticketData),
        preferredServices: this.calculatePreferredServices(ticketData),
        visitTimes: this.calculateVisitTimes(ticketData)
      };
    } catch (error) {
      console.error('Error getting user visit patterns:', error);
      throw error;
    }
  };

  // Calculate visit frequency
  calculateVisitFrequency = (tickets) => {
    if (tickets.length < 2) return 'Insufficient data';
    
    const dates = tickets.map(t => new Date(t.createdAt));
    const timeDiffs = [];
    
    for (let i = 1; i < dates.length; i++) {
      timeDiffs.push(dates[i - 1] - dates[i]);
    }
    
    const avgDays = Math.round(
      timeDiffs.reduce((sum, diff) => sum + diff, 0) / 
      timeDiffs.length / 
      (1000 * 60 * 60 * 24)
    );
    
    return `Average ${avgDays} days between visits`;
  };

  // Calculate preferred services
  calculatePreferredServices = (tickets) => {
    const serviceCounts = {};
    tickets.forEach(ticket => {
      serviceCounts[ticket.serviceId] = (serviceCounts[ticket.serviceId] || 0) + 1;
    });
    
    return Object.entries(serviceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([serviceId, count]) => ({
        serviceId,
        count,
        percentage: (count / tickets.length) * 100
      }));
  };

  // Calculate visit times
  calculateVisitTimes = (tickets) => {
    const hourCounts = Array(24).fill(0);
    tickets.forEach(ticket => {
      const hour = new Date(ticket.createdAt).getHours();
      hourCounts[hour]++;
    });
    
    const preferredHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    
    return preferredHours;
  };
}

export const analyticsService = new AnalyticsService(); 