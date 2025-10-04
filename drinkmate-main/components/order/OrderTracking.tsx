'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Truck, 
  Loader2,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

interface TrackingResult {
  waybillNumber: string;
  updateCode: string;
  updateDescription: string;
  updateDateTime: string;
  updateLocation: string;
  comments: string;
  problemCode?: string;
}

interface OrderTrackingProps {
  orderId: string;
  waybillNumber?: string;
  onTrackingUpdate?: (trackingData: any) => void;
}

const statusIcons = {
  'shipped': <Truck className="h-4 w-4" />,
  'in_transit': <Truck className="h-4 w-4" />,
  'delivered': <CheckCircle className="h-4 w-4" />,
  'exception': <AlertCircle className="h-4 w-4" />,
  'pending': <Clock className="h-4 w-4" />
};

const statusColors = {
  'shipped': 'bg-blue-100 text-blue-800',
  'in_transit': 'bg-yellow-100 text-yellow-800',
  'delivered': 'bg-green-100 text-green-800',
  'exception': 'bg-red-100 text-red-800',
  'pending': 'bg-gray-100 text-gray-800'
};

export default function OrderTracking({ orderId, waybillNumber, onTrackingUpdate }: OrderTrackingProps) {
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrackingData = async () => {
    if (!waybillNumber) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/aramex/track/${waybillNumber}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch tracking data');
      }
      
      setTrackingData(data);
      onTrackingUpdate?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (waybillNumber) {
      fetchTrackingData();
    }
  }, [waybillNumber]);

  const getStatusFromDescription = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('delivered')) return 'delivered';
    if (desc.includes('in transit') || desc.includes('on the way')) return 'in_transit';
    if (desc.includes('shipped') || desc.includes('dispatched')) return 'shipped';
    if (desc.includes('exception') || desc.includes('problem')) return 'exception';
    return 'pending';
  };

  const formatDateTime = (dateTime: string) => {
    try {
      return format(new Date(dateTime), 'MMM dd, yyyy - HH:mm');
    } catch {
      return dateTime;
    }
  };

  if (!waybillNumber) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No tracking information available yet.</p>
            <p className="text-sm text-gray-500 mt-1">
              Your order will be assigned a tracking number once it's shipped.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Tracking
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTrackingData}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Refresh'
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/track-order/${waybillNumber}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Full View
            </Button>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          Waybill: <span className="font-mono font-medium">{waybillNumber}</span>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {trackingData && trackingData.success && trackingData.data && (
          <div className="space-y-4">
            {trackingData.data.shipments.map((shipment: any, index: number) => (
              <div key={index}>
                {shipment.trackingResults && shipment.trackingResults.length > 0 ? (
                  <div className="space-y-3">
                    {/* Current Status */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {statusIcons[getStatusFromDescription(shipment.trackingResults[0].updateDescription)]}
                        <span className="font-medium">
                          {shipment.trackingResults[0].updateDescription}
                        </span>
                      </div>
                      <Badge 
                        className={statusColors[getStatusFromDescription(shipment.trackingResults[0].updateDescription)]}
                      >
                        {getStatusFromDescription(shipment.trackingResults[0].updateDescription).replace('_', ' ')}
                      </Badge>
                    </div>

                    {/* Latest Update Details */}
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-1 mb-1">
                        <Clock className="h-3 w-3" />
                        {formatDateTime(shipment.trackingResults[0].updateDateTime)}
                      </div>
                      {shipment.trackingResults[0].updateLocation && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {shipment.trackingResults[0].updateLocation}
                        </div>
                      )}
                    </div>

                    {/* Recent History (last 3 updates) */}
                    {shipment.trackingResults.length > 1 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Updates</h4>
                        <div className="space-y-2">
                          {shipment.trackingResults.slice(1, 4).map((result: TrackingResult, resultIndex: number) => (
                            <div key={resultIndex} className="flex items-start gap-3 text-sm">
                              <div className="w-2 h-2 bg-gray-300 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                  {result.updateDescription}
                                </div>
                                <div className="text-gray-500">
                                  {formatDateTime(result.updateDateTime)}
                                  {result.updateLocation && (
                                    <span className="ml-2">• {result.updateLocation}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No tracking updates available yet.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {trackingData && !trackingData.success && (
          <div className="text-center py-4">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Unable to load tracking information.</p>
            <p className="text-sm text-gray-500 mt-1">
              Please try refreshing or contact support if the issue persists.
            </p>
          </div>
        )}

        {!trackingData && !loading && (
          <div className="text-center py-4">
            <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Click refresh to load tracking information.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
