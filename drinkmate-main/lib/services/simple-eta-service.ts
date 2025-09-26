// Simple ETA Service - provides static fallback data without API calls
// This eliminates rate limiting issues and provides a better user experience

export interface SimpleETA {
  estimatedWaitTime: number; // in minutes
  estimatedResponseTime: string; // formatted time (e.g., "2-3 minutes")
  isOnline: boolean;
  averageResponseTime: number; // in minutes
  currentLoad: 'low' | 'medium' | 'high' | 'critical';
  nextAvailable?: string; // when chat will be available if offline
  queuePosition?: number; // position in queue
}

class SimpleETAService {
  private static instance: SimpleETAService;
  
  private constructor() {}
  
  static getInstance(): SimpleETAService {
    if (!SimpleETAService.instance) {
      SimpleETAService.instance = new SimpleETAService();
    }
    return SimpleETAService.instance;
  }

  // Get static ETA data (no API calls)
  getResponseETA(): SimpleETA {
    // Simulate different load levels based on time of day
    const hour = new Date().getHours();
    let load: 'low' | 'medium' | 'high' | 'critical';
    let estimatedWaitTime: number;
    let isOnline: boolean;

    if (hour >= 9 && hour <= 17) {
      // Business hours - medium load
      load = 'medium';
      estimatedWaitTime = 3;
      isOnline = true;
    } else if (hour >= 18 && hour <= 22) {
      // Evening - high load
      load = 'high';
      estimatedWaitTime = 5;
      isOnline = true;
    } else if (hour >= 23 || hour <= 8) {
      // Night/early morning - low load
      load = 'low';
      estimatedWaitTime = 1;
      isOnline = true;
    } else {
      // Default
      load = 'medium';
      estimatedWaitTime = 3;
      isOnline = true;
    }

    // Format response time
    let estimatedResponseTime: string;
    if (estimatedWaitTime <= 1) {
      estimatedResponseTime = 'Less than 1 minute';
    } else if (estimatedWaitTime <= 5) {
      estimatedResponseTime = `${estimatedWaitTime} minutes`;
    } else {
      estimatedResponseTime = `${estimatedWaitTime}-${estimatedWaitTime + 2} minutes`;
    }

    return {
      estimatedWaitTime,
      estimatedResponseTime,
      isOnline,
      averageResponseTime: 3,
      currentLoad: load,
      nextAvailable: !isOnline ? '9:00 AM' : undefined,
      queuePosition: isOnline ? 0 : undefined
    };
  }

  // Get load status color
  getLoadStatusColor(load: 'low' | 'medium' | 'high' | 'critical'): string {
    switch (load) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  // Get load status text
  getLoadStatusText(load: 'low' | 'medium' | 'high' | 'critical'): string {
    switch (load) {
      case 'low': return 'Low Load';
      case 'medium': return 'Medium Load';
      case 'high': return 'High Load';
      case 'critical': return 'Critical Load';
      default: return 'Unknown';
    }
  }
}

// Export singleton instance
export const simpleETAService = SimpleETAService.getInstance();
export default simpleETAService;
