'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, Search, AlertCircle, Mail, Phone } from 'lucide-react';

export default function TrackOrderPage() {
  const router = useRouter();
  const [waybillNumber, setWaybillNumber] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!waybillNumber.trim()) {
      setError('Please enter a waybill number');
      return;
    }

    // Validate waybill number format (basic validation)
    if (waybillNumber.length < 8) {
      setError('Waybill number must be at least 8 characters long');
      return;
    }

    setError(null);
    
    // Navigate to tracking results page
    router.push(`/track-order/${waybillNumber.trim()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Package className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-600">
            Enter your Aramex waybill number to get real-time tracking information
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Track Shipment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrack} className="space-y-4">
              <div>
                <Label htmlFor="waybill">Waybill Number</Label>
                <Input
                  id="waybill"
                  type="text"
                  placeholder="Enter your waybill number (e.g., 1234567890)"
                  value={waybillNumber}
                  onChange={(e) => {
                    setWaybillNumber(e.target.value);
                    setError(null);
                  }}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  You can find your waybill number in the shipping confirmation email
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Track Order
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Information Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Check Your Email</h3>
                  <p className="text-sm text-gray-600">
                    Your waybill number was sent to your email address when your order was shipped. 
                    Check your inbox and spam folder.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Need Help?</h3>
                  <p className="text-sm text-gray-600">
                    Can't find your waybill number? Contact our support team and we'll help you track your order.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tracking Features */}
        <Card>
          <CardHeader>
            <CardTitle>What You Can Track</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Real-time Status</h4>
                <p className="text-sm text-gray-600">
                  Get live updates on your package location and delivery status
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Detailed History</h4>
                <p className="text-sm text-gray-600">
                  View complete tracking history with timestamps and locations
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Delivery Alerts</h4>
                <p className="text-sm text-gray-600">
                  Get notified about any delivery issues or exceptions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}