// Response ETA Service - calculates estimated response times for chat
import { getAuthToken } from '../contexts/auth-context';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface ResponseETA {
  estimatedWaitTime: number; // in minutes
  estimatedResponseTime: string; // formatted time (e.g., "2-3 minutes")
  queuePosition?: number;
  isOnline: boolean;
  nextAvailable?: string; // when chat will be available if offline
  averageResponseTime: number; // in minutes
  currentLoad: 'low' | 'medium' | 'high' | 'critical';
}

export interface QueueStats {
  totalActiveChats: number;
  totalAgents: number;
  availableAgents: number;
  averageResponseTime: number; // in minutes
  currentLoad: 'low' | 'medium' | 'high' | 'critical';
}

class ResponseETAService {
  private cache: ResponseETA | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 300000; // 5 minutes - increased cache duration
  private lastRequestTime: number = 0;
  private readonly MIN_REQUEST_INTERVAL = 30000; // 30 seconds minimum between requests
  private requestCount: number = 0;
  private readonly MAX_REQUESTS_PER_HOUR = 20; // Rate limit
  private requestResetTime: number = Date.now() + 3600000; // Reset every hour

  // Get auth token
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') {
      return null; // Server-side rendering
    }
    return getAuthToken();
  }

  // Check if cache is still valid
  private isCacheValid(): boolean {
    return this.cache !== null && (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION;
  }

  // Check if we can make a request (rate limiting)
  private canMakeRequest(): boolean {
    const now = Date.now();
    
    // Reset request count if an hour has passed
    if (now > this.requestResetTime) {
      this.requestCount = 0;
      this.requestResetTime = now + 3600000;
    }
    
    // Check if we've exceeded the rate limit
    if (this.requestCount >= this.MAX_REQUESTS_PER_HOUR) {
      return false;
    }
    
    // Check minimum interval between requests
    if (now - this.lastRequestTime < this.MIN_REQUEST_INTERVAL) {
      return false;
    }
    
    return true;
  }

  // Calculate response ETA based on current queue status
  async getResponseETA(): Promise<ResponseETA> {
    // Check if service is disabled
    if (this.isServiceDisabled()) {
      const fallbackETA: ResponseETA = {
        estimatedWaitTime: 5,
        estimatedResponseTime: '5-10 minutes',
        isOnline: true,
        averageResponseTime: 5,
        currentLoad: 'medium'
      };
      return fallbackETA;
    }

    // Return cached data if available and valid
    if (this.isCacheValid()) {
      return this.cache!;
    }

    // Don't run on server side
    if (typeof window === 'undefined') {
      const fallbackETA: ResponseETA = {
        estimatedWaitTime: 5,
        estimatedResponseTime: '5-10 minutes',
        isOnline: true,
        averageResponseTime: 5,
        currentLoad: 'medium'
      };
      return fallbackETA;
    }

    // Check if we can make a request (rate limiting)
    if (!this.canMakeRequest()) {
      // Return cached data or fallback
      if (this.cache) {
        return this.cache;
      }
      
      const fallbackETA: ResponseETA = {
        estimatedWaitTime: 5,
        estimatedResponseTime: '5-10 minutes',
        isOnline: true,
        averageResponseTime: 5,
        currentLoad: 'medium'
      };
      
      this.cache = fallbackETA;
      this.cacheTimestamp = Date.now();
      return fallbackETA;
    }

    try {
      
      // Update request tracking
      this.lastRequestTime = Date.now();
      this.requestCount++;
      
      // Fetch current queue statistics
      const queueStats = await this.getQueueStats();
      
      // Calculate ETA based on queue stats
      const eta = this.calculateETA(queueStats);
      
      // Cache the result
      this.cache = eta;
      this.cacheTimestamp = Date.now();
      
      return eta;
    } catch (error) {
      
      // Return fallback ETA
      const fallbackETA: ResponseETA = {
        estimatedWaitTime: 5,
        estimatedResponseTime: '5-10 minutes',
        isOnline: true,
        averageResponseTime: 5,
        currentLoad: 'medium'
      };
      
      this.cache = fallbackETA;
      this.cacheTimestamp = Date.now();
      return fallbackETA;
    }
  }

  // Get current queue statistics
  private async getQueueStats(): Promise<QueueStats> {
    try {
      // Use the public queue status endpoint (no auth required)
      const response = await fetch(`${API_BASE_URL}/chat/queue-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 429) {
          throw new Error('Rate limited');
        } else if (response.status >= 500) {
          throw new Error('Server error');
        } else {
          throw new Error(`Failed to fetch queue stats: ${response.statusText}`);
        }
      }

      const data = await response.json();
      
      if (data.success) {
        const stats = data.data;
        
        // Calculate available agents (simplified - in real app, you'd track actual agent status)
        const totalAgents = 3; // This should come from your agent management system
        const availableAgents = Math.max(1, totalAgents - Math.floor(stats.totalActiveChats / 2)); // Rough estimate
        
        return {
          totalActiveChats: stats.totalActiveChats || 0,
          totalAgents,
          availableAgents,
          averageResponseTime: stats.averageResponseTime || 5,
          currentLoad: stats.currentLoad || 'medium'
        };
      } else {
        throw new Error(data.message || 'Failed to fetch queue stats');
      }
    } catch (error) {
      
      // Return default stats based on error type
      const isRateLimit = error instanceof Error && error.message.includes('Rate limited');
      const isServerError = error instanceof Error && error.message.includes('Server error');
      
      if (isRateLimit || isServerError) {
        // Use cached data if available for rate limit/server errors
        if (this.cache) {
          return {
            totalActiveChats: 0,
            totalAgents: 3,
            availableAgents: 3,
            averageResponseTime: 5,
            currentLoad: 'medium'
          };
        }
      }
      
      // Return default stats
      return {
        totalActiveChats: 0,
        totalAgents: 3,
        availableAgents: 3,
        averageResponseTime: 5,
        currentLoad: 'medium'
      };
    }
  }

  // Calculate ETA based on queue statistics
  private calculateETA(stats: QueueStats): ResponseETA {
    const { totalActiveChats, availableAgents, averageResponseTime, currentLoad } = stats;
    
    // Calculate estimated wait time
    let estimatedWaitTime: number;
    
    if (availableAgents === 0) {
      // No agents available
      estimatedWaitTime = averageResponseTime * 2; // Double the average time
    } else if (totalActiveChats === 0) {
      // No active chats, immediate response
      estimatedWaitTime = 1;
    } else {
      // Calculate based on queue position and agent availability
      const queuePosition = Math.max(0, totalActiveChats - availableAgents);
      estimatedWaitTime = Math.max(1, Math.ceil(queuePosition / availableAgents) * averageResponseTime);
    }
    
    // Format response time
    let estimatedResponseTime: string;
    if (estimatedWaitTime <= 1) {
      estimatedResponseTime = 'Less than 1 minute';
    } else if (estimatedWaitTime <= 5) {
      estimatedResponseTime = `${estimatedWaitTime} minutes`;
    } else if (estimatedWaitTime <= 10) {
      estimatedResponseTime = `${estimatedWaitTime}-${estimatedWaitTime + 2} minutes`;
    } else {
      estimatedResponseTime = `${estimatedWaitTime}-${estimatedWaitTime + 5} minutes`;
    }
    
    // Determine if chat is online
    const isOnline = availableAgents > 0;
    
    // Calculate next available time if offline
    let nextAvailable: string | undefined;
    if (!isOnline) {
      const now = new Date();
      const nextHour = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
      nextAvailable = nextHour.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
    
    return {
      estimatedWaitTime,
      estimatedResponseTime,
      queuePosition: Math.max(0, totalActiveChats - availableAgents),
      isOnline,
      nextAvailable,
      averageResponseTime,
      currentLoad
    };
  }

  // Get ETA for specific chat (if user is already in queue)
  async getChatETA(chatId: string): Promise<ResponseETA> {
    try {
      const token = this.getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/chat/${chatId}/eta`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // Fallback to general ETA if specific chat ETA not available
        return this.getResponseETA();
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch chat ETA');
      }
    } catch (error) {
      // Fallback to general ETA
      return this.getResponseETA();
    }
  }

  // Clear cache
  clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
  }

  // Disable ETA service (for debugging or when not needed)
  private isDisabled: boolean = false;
  
  disable(): void {
    this.isDisabled = true;
  }
  
  enable(): void {
    this.isDisabled = false;
  }
  
  // Check if service is disabled
  private isServiceDisabled(): boolean {
    return this.isDisabled;
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
export const responseETAService = new ResponseETAService();
export default responseETAService;
