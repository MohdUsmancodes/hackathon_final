import { automationEnhancer } from './automationEnhancer';

export const testEnhancedAutomation = async () => {
  try {
    console.log('Starting Enhanced Automation Tests...');
    
    // Test Load Balancing
    console.log('\nTesting Load Balancing...');
    await automationEnhancer.balanceLoad();
    
    // Test Smart Routing
    console.log('\nTesting Smart Routing...');
    const ticketId = 'test-ticket';
    const optimalDept = await automationEnhancer.smartRouting(ticketId);
    console.log('Optimal Department:', optimalDept);
    
    // Test Predictive Staffing
    console.log('\nTesting Predictive Staffing...');
    const departmentId = 'test-dept';
    const staffingRecommendations = await automationEnhancer.getPredictiveStaffing(departmentId);
    console.log('Staffing Recommendations:', staffingRecommendations);
    
    // Test Service Optimization
    console.log('\nTesting Service Optimization...');
    const optimizations = await automationEnhancer.optimizeServiceTime(departmentId);
    console.log('Service Optimizations:', optimizations);
    
    // Test Emergency Protocols
    console.log('\nTesting Emergency Protocols...');
    const overcapacityResult = await automationEnhancer.handleEmergencyProtocol(
      departmentId, 
      'overcapacity'
    );
    console.log('Overcapacity Protocol Result:', overcapacityResult);
    
    const staffShortageResult = await automationEnhancer.handleEmergencyProtocol(
      departmentId, 
      'staffShortage'
    );
    console.log('Staff Shortage Protocol Result:', staffShortageResult);
    
    console.log('\nAll Enhanced Automation Tests Completed Successfully!');
    return true;
  } catch (error) {
    console.error('Enhanced Automation Tests Failed:', error);
    return false;
  }
}; 