import { db } from '../config/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { queueManagement } from './queueManagement';
import { notificationService } from './notificationService';
import { analyticsService } from './analyticsService';

class AutomationEnhancer {
  constructor() {
    this.ticketsRef = collection(db, 'tickets');
    this.departmentsRef = collection(db, 'departments');
    this.servicesRef = collection(db, 'services');
  }

  // Automated load balancing between departments
  balanceLoad = async () => {
    try {
      const departments = await getDocs(this.departmentsRef);
      const loads = [];

      for (const dept of departments.docs) {
        const status = await analyticsService.getRealTimeDepartmentStatus(dept.id);
        loads.push({ id: dept.id, ...status });
      }

      const overloadedDepts = loads.filter(l => l.status === 'Very High');
      const underloadedDepts = loads.filter(l => l.status === 'Low');

      for (const dept of overloadedDepts) {
        if (underloadedDepts.length > 0) {
          await this.redistributeLoad(dept.id, underloadedDepts[0].id);
        }
      }
    } catch (error) {
      console.error('Load balancing failed:', error);
      throw error;
    }
  };

  // Smart ticket routing based on service type and load
  smartRouting = async (ticketId) => {
    try {
      const ticket = await getDocs(doc(this.ticketsRef, ticketId));
      if (!ticket.exists()) throw new Error('Ticket not found');

      const service = await getDocs(doc(this.servicesRef, ticket.data().serviceId));
      const eligibleDepts = service.data().eligibleDepartments || [];

      const deptLoads = await Promise.all(
        eligibleDepts.map(async deptId => {
          const status = await analyticsService.getRealTimeDepartmentStatus(deptId);
          return { deptId, ...status };
        })
      );

      const optimalDept = deptLoads.sort((a, b) => a.currentLoad - b.currentLoad)[0];
      
      await updateDoc(doc(this.ticketsRef, ticketId), {
        departmentId: optimalDept.deptId,
        routedAt: serverTimestamp()
      });

      return optimalDept.deptId;
    } catch (error) {
      console.error('Smart routing failed:', error);
      throw error;
    }
  };

  // Predictive staffing recommendations
  getPredictiveStaffing = async (departmentId) => {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      
      const metrics = await analyticsService.getDepartmentMetrics(
        departmentId, 
        startDate, 
        new Date()
      );

      const peakHours = metrics.peakHours;
      const avgWaitTime = metrics.averageWaitTime;
      
      const staffingRecommendations = peakHours.map(peak => ({
        hour: peak.hour,
        recommendedStaff: Math.ceil(peak.count / 15), // Assuming 15 tickets per staff
        expectedWaitTime: avgWaitTime / Math.ceil(peak.count / 15)
      }));

      return staffingRecommendations;
    } catch (error) {
      console.error('Predictive staffing failed:', error);
      throw error;
    }
  };

  // Automated service time optimization
  optimizeServiceTime = async (departmentId) => {
    try {
      const q = query(
        this.ticketsRef,
        where('departmentId', '==', departmentId),
        where('status', '==', 'completed')
      );

      const tickets = await getDocs(q);
      const serviceTimes = tickets.docs.map(doc => {
        const data = doc.data();
        return {
          serviceId: data.serviceId,
          time: (new Date(data.completedAt) - new Date(data.verifiedAt)) / 60000
        };
      });

      const optimizations = {};
      serviceTimes.forEach(({ serviceId, time }) => {
        if (!optimizations[serviceId]) {
          optimizations[serviceId] = {
            times: [],
            average: 0,
            recommendation: ''
          };
        }
        optimizations[serviceId].times.push(time);
      });

      Object.keys(optimizations).forEach(serviceId => {
        const avg = optimizations[serviceId].times.reduce((a, b) => a + b) / 
                   optimizations[serviceId].times.length;
        optimizations[serviceId].average = avg;
        optimizations[serviceId].recommendation = this.getOptimizationRecommendation(avg);
      });

      return optimizations;
    } catch (error) {
      console.error('Service optimization failed:', error);
      throw error;
    }
  };

  // Helper method for optimization recommendations
  getOptimizationRecommendation = (avgTime) => {
    if (avgTime > 30) return 'Consider splitting this service into smaller sub-services';
    if (avgTime > 20) return 'Review service process for optimization opportunities';
    if (avgTime < 5) return 'Consider combining with other quick services';
    return 'Service time is optimal';
  };

  // Automated emergency protocols
  handleEmergencyProtocol = async (departmentId, type) => {
    try {
      const emergencyActions = {
        'overcapacity': async () => {
          const capacity = await queueManagement.monitorDepartmentCapacity(departmentId);
          if (capacity.isFull) {
            await this.balanceLoad();
            await notificationService.sendCapacityWarning(
              departmentId, 
              capacity.currentCapacity, 
              capacity.maxCapacity
            );
          }
        },
        'staffShortage': async () => {
          const recommendations = await this.getPredictiveStaffing(departmentId);
          await this.smartRouting(departmentId);
          // Notify management of staffing recommendations
          await addDoc(collection(db, 'adminNotifications'), {
            type: 'STAFF_SHORTAGE',
            departmentId,
            recommendations,
            timestamp: serverTimestamp()
          });
        }
      };

      if (emergencyActions[type]) {
        await emergencyActions[type]();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Emergency protocol failed:', error);
      throw error;
    }
  };
}

export const automationEnhancer = new AutomationEnhancer(); 