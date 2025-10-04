import { useState, useCallback } from 'react';

interface TrackingResult {
  waybillNumber: string;
  updateCode: string;
  updateDescription: string;
  updateDateTime: string;
  updateLocation: string;
  comments: string;
  problemCode?: string;
}

interface TrackingData {
  success: boolean;
  message: string;
  data?: {
    shipments: Array<{
      waybillNumber: string;
      trackingResults: TrackingResult[];
    }>;
  };
  error?: string;
}

interface CreateShipmentData {
  success: boolean;
  message: string;
  data?: {
    orderId: string;
    waybillNumber: string;
    labelUrl?: string;
    trackingUrl: string;
  };
  error?: string;
}

export function useAramexTracking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trackShipment = useCallback(async (waybillNumber: string): Promise<TrackingData | null> => {
    if (!waybillNumber.trim()) {
      setError('Waybill number is required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/aramex/track/${waybillNumber}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to track shipment');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createShipment = useCallback(async (
    orderId: string,
    shipperData?: any,
    consigneeData?: any,
    shipmentDetails?: any
  ): Promise<CreateShipmentData | null> => {
    if (!orderId.trim()) {
      setError('Order ID is required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/aramex/create-shipment/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shipperData,
          consigneeData,
          shipmentDetails,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create shipment');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getShipmentHistory = useCallback(async (waybillNumber: string): Promise<TrackingData | null> => {
    if (!waybillNumber.trim()) {
      setError('Waybill number is required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/aramex/history/${waybillNumber}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get shipment history');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    trackShipment,
    createShipment,
    getShipmentHistory,
    clearError,
  };
}
