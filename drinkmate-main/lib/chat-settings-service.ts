// Chat Settings Service - handles API calls for chat settings
import { getAuthToken } from './auth-context';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface ChatSettings {
  _id?: string;
  isEnabled: boolean;
  workingHours: {
    start: string;
    end: string;
  };
  timezone: string;
  autoAssign: boolean;
  maxConcurrentChats: number;
  offlineMessage: string;
  whatsappNumber: string;
  emailAddress: string;
  slaSettings?: {
    firstResponseTime: number;
    resolutionTime: number;
  };
  advancedSettings?: {
    enableNotifications: boolean;
    enableTypingIndicators: boolean;
    enableFileUploads: boolean;
    maxFileSize: number;
  };
  lastUpdatedBy?: string;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatStatus {
  isOnline: boolean;
  isEnabled: boolean;
  workingHours: {
    start: string;
    end: string;
  };
  timezone: string;
  nextAvailable?: string;
}

class ChatSettingsService {
  private cache: ChatSettings | null = null;
  private cacheTimestamp: number = 0;
  private cachedStatus: ChatStatus | null = null;
  private readonly CACHE_DURATION = 30000; // 30 seconds

  // Get auth token from auth context
  private getAuthToken(): string | null {
    return getAuthToken();
  }

  // Check if cache is still valid
  private isCacheValid(): boolean {
    return this.cache !== null && (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION;
  }

  // Get current chat settings
  async getSettings(): Promise<ChatSettings> {
    // Return cached data if available and valid (temporarily disabled for debugging)
    // if (this.isCacheValid()) {
    //   return this.cache!;
    // }

    try {
      console.log('Fetching chat settings from:', `${API_BASE_URL}/chat-settings`);
      const response = await fetch(`${API_BASE_URL}/chat-settings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });


      if (!response.ok) {
        if (response.status === 429) {
          // Rate limit exceeded - return cached data or default
          console.warn('Rate limit exceeded for chat settings, using cached data');
          return this.cache || {
            isEnabled: false,
            workingHours: { start: '09:00', end: '17:00' },
            timezone: 'Asia/Riyadh',
            autoAssign: true,
            maxConcurrentChats: 5,
            offlineMessage: 'Our chat support is currently offline. Please use our contact form or email us.',
            whatsappNumber: '+966501234567',
            emailAddress: 'support@drinkmates.com'
          };
        }
        throw new Error(`Failed to fetch chat settings: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        this.cache = data.data;
        this.cacheTimestamp = Date.now();
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch chat settings');
      }
    } catch (error) {
      console.error('Error fetching chat settings:', error);
      // Return default settings if API fails
      return this.getDefaultSettings();
    }
  }

  // Update chat settings (admin only)
  async updateSettings(settings: Partial<ChatSettings>): Promise<ChatSettings> {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required to update settings');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/chat-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error(`Failed to update chat settings: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        this.cache = data.data;
        this.cacheTimestamp = Date.now();
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to update chat settings');
      }
    } catch (error) {
      console.error('Error updating chat settings:', error);
      throw error;
    }
  }

  // Get chat status (public endpoint)
  async getChatStatus(): Promise<ChatStatus> {
    try {
      console.log('🔥 ChatSettingsService: Fetching chat status from:', `${API_BASE_URL}/chat-settings/status`);
      
      const response = await fetch(`${API_BASE_URL}/chat-settings/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout and retry logic
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      console.log('🔥 ChatSettingsService: Response status:', response.status);

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limit exceeded - return cached data or default
          console.warn('Rate limit exceeded for chat status, using cached data');
          return this.cachedStatus || {
            isOnline: false,
            isEnabled: false,
            workingHours: { start: '09:00', end: '17:00' },
            timezone: 'Asia/Riyadh'
          };
        }
        
        // Try to get error details
        let errorMessage = `Failed to fetch chat status: ${response.statusText}`;
        try {
          const errorData = await response.text();
          console.error('🔥 ChatSettingsService: Error response:', errorData);
          errorMessage = errorData || errorMessage;
        } catch (e) {
          console.error('🔥 ChatSettingsService: Could not parse error response');
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('🔥 ChatSettingsService: Response data:', data);
      
      if (data.success) {
        this.cachedStatus = data.data;
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch chat status');
      }
    } catch (error) {
      // Only log if it's not a timeout or network error
      if (error instanceof Error && error.name !== 'TimeoutError' && error.name !== 'TypeError') {
        console.warn('Error fetching chat status:', error.message || error);
      }
      
      // Return cached data or default if API fails
      const fallbackStatus = this.cachedStatus || {
        isOnline: false,
        isEnabled: false,
        workingHours: { start: '09:00', end: '17:00' },
        timezone: 'Asia/Riyadh'
      };
      
      console.log('🔥 ChatSettingsService: Using fallback status:', fallbackStatus);
      return fallbackStatus;
    }
  }

  // Reset to default settings (admin only)
  async resetToDefaults(): Promise<ChatSettings> {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required to reset settings');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/chat-settings/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to reset chat settings: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        this.cache = data.data;
        this.cacheTimestamp = Date.now();
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to reset chat settings');
      }
    } catch (error) {
      console.error('Error resetting chat settings:', error);
      throw error;
    }
  }

  // Clear cache
  clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
  }

  // Get default settings
  private getDefaultSettings(): ChatSettings {
    return {
      isEnabled: true,
      workingHours: {
        start: '09:00',
        end: '17:00',
      },
      timezone: 'Asia/Riyadh',
      autoAssign: true,
      maxConcurrentChats: 5,
      offlineMessage: 'Our chat support is currently offline. Please use our contact form or email us.',
      whatsappNumber: '+966501234567',
      emailAddress: 'support@drinkmates.com',
      slaSettings: {
        firstResponseTime: 300, // 5 minutes
        resolutionTime: 3600, // 1 hour
      },
      advancedSettings: {
        enableNotifications: true,
        enableTypingIndicators: true,
        enableFileUploads: true,
        maxFileSize: 10485760, // 10MB
      },
    };
  }

  // Check if chat is online based on settings
  isChatOnline(settings: ChatSettings): boolean {
    if (!settings.isEnabled) return false;
    
    // Use server timezone for accurate time calculation
    const now = new Date();
    const serverTime = new Date(now.toLocaleString("en-US", { timeZone: settings.timezone }));
    const currentHour = serverTime.getHours();
    const currentMinute = serverTime.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const [startHour, startMinute] = settings.workingHours.start.split(':').map(Number);
    const [endHour, endMinute] = settings.workingHours.end.split(':').map(Number);
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    // Handle 24/7 case (00:00 to 23:59)
    if (startTime === 0 && endTime === 1439) {
      return true;
    }
    
    // Handle overnight shifts (e.g., 22:00 to 06:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime < endTime;
    }
    
    // Normal case (e.g., 09:00 to 17:00)
    return currentTime >= startTime && currentTime < endTime;
  }
}

// Export singleton instance
export const chatSettingsService = new ChatSettingsService();
export default chatSettingsService;
