'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Package, MapPin, Clock, CheckCircle, AlertCircle, Truck, Home } from 'lucide-react';
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

export default function TrackOrderPage() {
  const params = useParams();
  const waybillNumber = params?.waybillNumber as string;
  
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchWaybill, setSearchWaybill] = useState(waybillNumber || '');

  const fetchTrackingData = async (waybill: string) => {
    if (!waybill.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/aramex/track/${waybill}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch tracking data');
      }
      
      setTrackingData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (waybillNumber) {
      fetchTrackingData(waybillNumber);
    }
  }, [waybillNumber]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchWaybill.trim()) {
      fetchTrackingData(searchWaybill.trim());
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-600">Enter your Aramex waybill number to track your shipment</p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="waybill">Waybill Number</Label>
                <Input
                  id="waybill"
                  type="text"
                  placeholder="Enter your waybill number"
                  value={searchWaybill}
                  onChange={(e) => setSearchWaybill(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button type="submit" disabled={loading || !searchWaybill.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Tracking...
                  </>
                ) : (
                  'Track Order'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Tracking Results */}
        {trackingData && trackingData.success && trackingData.data && (
          <div className="space-y-6">
            {trackingData.data.shipments.map((shipment, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Waybill: {shipment.waybillNumber}
                    </CardTitle>
                    {shipment.trackingResults.length > 0 && (
                      <Badge 
                        className={statusColors[getStatusFromDescription(shipment.trackingResults[0].updateDescription)]}
                      >
                        {statusIcons[getStatusFromDescription(shipment.trackingResults[0].updateDescription)]}
                        <span className="ml-1">
                          {shipment.trackingResults[0].updateDescription}
                        </span>
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {shipment.trackingResults.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg mb-4">Tracking History</h3>
                      <div className="relative">
                        {/* Timeline */}
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                        
                        {shipment.trackingResults.map((result, resultIndex) => {
                          const status = getStatusFromDescription(result.updateDescription);
                          const isLatest = resultIndex === 0;
                          
                          return (
                            <div key={resultIndex} className="relative flex items-start pb-6">
                              {/* Timeline dot */}
                              <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${
                                isLatest 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-gray-200 text-gray-600'
                              }`}>
                                {statusIcons[status]}
                              </div>
                              
                              {/* Content */}
                              <div className="ml-4 flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className={`font-medium ${
                                    isLatest ? 'text-gray-900' : 'text-gray-700'
                                  }`}>
                                    {result.updateDescription}
                                  </h4>
                                  <span className="text-sm text-gray-500">
                                    {formatDateTime(result.updateDateTime)}
                                  </span>
                                </div>
                                
                                {result.updateLocation && (
                                  <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                                    <MapPin className="h-3 w-3" />
                                    {result.updateLocation}
                                  </div>
                                )}
                                
                                {result.comments && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {result.comments}
                                  </p>
                                )}
                                
                                {result.problemCode && (
                                  <Badge variant="destructive" className="mt-2">
                                    Problem Code: {result.problemCode}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No tracking information available yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {trackingData && !trackingData.success && (
          <Card>
            <CardContent className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Tracking Information Found</h3>
              <p className="text-gray-600">
                We couldn't find any tracking information for waybill number: <strong>{searchWaybill}</strong>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Please check the waybill number and try again, or contact our support team.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Can't find your waybill number?</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Your waybill number was sent to your email when your order was shipped. 
                  Check your inbox or spam folder.
                </p>
                <Button variant="outline" size="sm">
                  Check Email
                </Button>
              </div>
              <div>
                <h4 className="font-medium mb-2">Still having issues?</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Our support team is here to help you track your order.
                </p>
                <Button variant="outline" size="sm">
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
