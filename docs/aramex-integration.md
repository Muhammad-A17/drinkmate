# Aramex Integration Documentation

## Overview

This document describes the complete Aramex shipping integration implementation for the DrinkMate application. The integration provides order tracking, shipment creation, and real-time status updates using the Aramex Shipping API.

## Architecture

### Backend Components

1. **Aramex Service** (`server/Services/aramex-service.js`)
   - Handles SOAP API communication with Aramex
   - Manages authentication and request formatting
   - Parses XML responses and formats data

2. **Aramex Controller** (`server/Controller/aramex-controller.js`)
   - Handles HTTP requests and responses
   - Validates input data
   - Manages order updates with tracking information

3. **Aramex Router** (`server/Router/aramex-router.js`)
   - Defines API endpoints
   - Implements request validation
   - Handles routing logic

4. **Order Model Updates** (`server/Models/order-model.js`)
   - Added Aramex-specific tracking fields
   - Includes tracking history and status management

### Frontend Components

1. **Tracking Pages**
   - `/track-order` - Main tracking page with search
   - `/track-order/[waybillNumber]` - Detailed tracking results

2. **API Routes**
   - `/api/aramex/track/[waybillNumber]` - Track shipments
   - `/api/aramex/create-shipment/[orderId]` - Create shipments

3. **Components**
   - `OrderTracking.tsx` - Reusable tracking component
   - `use-aramex-tracking.ts` - Custom hook for tracking functionality

## API Endpoints

### Backend Endpoints

#### Track Shipment
```
GET /api/aramex/track/:waybillNumber
```
- **Description**: Track a shipment by waybill number
- **Parameters**: 
  - `waybillNumber` (string): Aramex waybill number
- **Response**: Tracking information with status updates

#### Track Shipment by Order ID
```
GET /api/aramex/track-order/:orderId
```
- **Description**: Track a shipment using order ID
- **Parameters**: 
  - `orderId` (string): MongoDB ObjectId of the order
- **Response**: Tracking information for the order's shipment

#### Create Shipment
```
POST /api/aramex/create-shipment/:orderId
```
- **Description**: Create a new shipment for an order
- **Parameters**: 
  - `orderId` (string): MongoDB ObjectId of the order
- **Body**: Optional shipment data (shipper, consignee, details)
- **Response**: Created shipment with waybill number and tracking URL

#### Get Shipment History
```
GET /api/aramex/history/:waybillNumber
```
- **Description**: Get complete shipment history
- **Parameters**: 
  - `waybillNumber` (string): Aramex waybill number
- **Response**: Complete tracking history

#### Create Pickup
```
POST /api/aramex/pickup
```
- **Description**: Create a pickup request
- **Body**: Pickup data (address, contact, pickupDate, etc.)
- **Response**: Created pickup with GUID and reference

#### Cancel Pickup
```
DELETE /api/aramex/pickup/:pickupGUID
```
- **Description**: Cancel a pickup request
- **Parameters**: 
  - `pickupGUID` (string): Pickup GUID to cancel
- **Body**: Optional comments
- **Response**: Confirmation of cancellation

#### Print Label
```
POST /api/aramex/print-label/:waybillNumber
```
- **Description**: Print shipping label
- **Parameters**: 
  - `waybillNumber` (string): Waybill number for label
- **Body**: Label options (reportID, reportType)
- **Response**: Label URL or content

#### Get Orders with Tracking
```
GET /api/aramex/orders
```
- **Description**: Get all orders with tracking information
- **Query Parameters**: 
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 10, max: 100)
  - `status` (string): Filter by status
- **Response**: Paginated list of orders with tracking

### Frontend API Routes

#### Track Shipment (Frontend)
```
GET /api/aramex/track/[waybillNumber]
```
- **Description**: Frontend API route that proxies to backend
- **Parameters**: 
  - `waybillNumber` (string): Aramex waybill number
- **Response**: Tracking information

#### Create Shipment (Frontend)
```
POST /api/aramex/create-shipment/[orderId]
```
- **Description**: Frontend API route that proxies to backend
- **Parameters**: 
  - `orderId` (string): MongoDB ObjectId of the order
- **Body**: Shipment data
- **Response**: Created shipment information

## Configuration

### Environment Variables

#### Backend
```env
# Aramex API Configuration
ARAMEX_ACCOUNT_COUNTRY_CODE=SA
ARAMEX_ACCOUNT_ENTITY=RUH
ARAMEX_ACCOUNT_NUMBER=4004636
ARAMEX_ACCOUNT_PIN=432432
ARAMEX_USERNAME=testingapi@aramex.com
ARAMEX_PASSWORD=R123456789$r
ARAMEX_VERSION=1.0
ARAMEX_BASE_URL=http://ws.sbx.aramex.net/shippingapi/shipping/service_1_0.svc

# Frontend URL for tracking links
FRONTEND_URL=http://localhost:3002
```

#### Frontend
```env
# Backend API URL
BACKEND_URL=http://localhost:5000
```

### Aramex Credentials

The integration uses the provided testing credentials:
- **Account Country Code**: SA
- **Account Entity**: RUH
- **Account Number**: 4004636
- **Account Pin**: 432432
- **Username**: testingapi@aramex.com
- **Password**: R123456789$r
- **Version**: 1.0
- **Environment**: Sandbox (ws.sbx.aramex.net)

## Data Models

### Order Model Updates

The order model has been extended with Aramex tracking fields:

```javascript
shipping: {
  // Aramex specific fields
  aramexWaybillNumber: String (unique, sparse),
  aramexLabelUrl: String,
  trackingUrl: String,
  status: {
    type: String,
    enum: ['pending', 'shipped', 'in_transit', 'delivered', 'exception'],
    default: 'pending'
  },
  shippedAt: Date,
  deliveredAt: Date,
  lastTrackingUpdate: Date,
  currentStatus: String,
  
  // Tracking history from Aramex
  trackingHistory: [{
    waybillNumber: String,
    updateCode: String,
    updateDescription: String,
    updateDateTime: Date,
    updateLocation: String,
    comments: String,
    problemCode: String
  }],
  
  // Shipping method and details
  method: String (default: 'aramex'),
  serviceType: String (default: 'ONX'),
  estimatedDelivery: Date,
  
  // Delivery confirmation
  deliveryConfirmation: {
    deliveredBy: String,
    deliveryNotes: String,
    recipientName: String,
    deliveryPhoto: String
  }
}
```

## Usage Examples

### Frontend Usage

#### Using the OrderTracking Component

```tsx
import OrderTracking from '@/components/order/OrderTracking';

function OrderDetailsPage({ order }) {
  return (
    <div>
      <h1>Order #{order.orderNumber}</h1>
      <OrderTracking 
        orderId={order._id}
        waybillNumber={order.shipping?.aramexWaybillNumber}
        onTrackingUpdate={(data) => console.log('Tracking updated:', data)}
      />
    </div>
  );
}
```

#### Using the useAramexTracking Hook

```tsx
import { useAramexTracking } from '@/hooks/use-aramex-tracking';

function TrackingPage() {
  const { trackShipment, loading, error } = useAramexTracking();
  
  const handleTrack = async (waybillNumber) => {
    const result = await trackShipment(waybillNumber);
    if (result) {
      console.log('Tracking data:', result);
    }
  };
  
  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {/* Your tracking UI */}
    </div>
  );
}
```

### Backend Usage

#### Creating a Shipment

```javascript
const aramexController = require('./Controller/aramex-controller');

// Create shipment for an order
app.post('/create-shipment/:orderId', aramexController.createShipment);
```

#### Tracking a Shipment

```javascript
// Track by waybill number
app.get('/track/:waybillNumber', aramexController.trackShipment);

// Track by order ID
app.get('/track-order/:orderId', aramexController.trackShipmentByOrderId);
```

## Error Handling

### Common Error Scenarios

1. **Invalid Waybill Number**
   - Error: "Invalid waybill number format"
   - Solution: Ensure waybill number is 8-20 characters, alphanumeric

2. **Order Not Found**
   - Error: "Order not found"
   - Solution: Verify order ID exists in database

3. **Aramex API Errors**
   - Error: "Failed to track shipment"
   - Solution: Check Aramex service status and credentials

4. **Network Timeouts**
   - Error: "Request timeout"
   - Solution: Retry request or check network connectivity

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "details": "Additional error context"
}
```

## Testing

### Test the Integration

1. **Start the Backend Server**
   ```bash
   cd server
   npm start
   ```

2. **Start the Frontend Server**
   ```bash
   cd drinkmate-main
   npm run dev
   ```

3. **Test Tracking**
   - Visit `/track-order`
   - Enter a test waybill number
   - Verify tracking information displays

4. **Test API Endpoints**
   ```bash
   # Track shipment
   curl http://localhost:5000/api/aramex/track/TEST123456
   
   # Create shipment
   curl -X POST http://localhost:5000/api/aramex/create-shipment/ORDER_ID
   ```

### Test Data

Use the provided Aramex testing credentials and any valid waybill number format for testing.

## Security Considerations

1. **API Key Protection**
   - Store Aramex credentials in environment variables
   - Never commit credentials to version control

2. **Input Validation**
   - Validate all waybill numbers and order IDs
   - Sanitize user inputs

3. **Rate Limiting**
   - Implement rate limiting for tracking requests
   - Cache tracking results to reduce API calls

4. **Error Information**
   - Don't expose sensitive error details to frontend
   - Log detailed errors server-side only

## Performance Optimization

1. **Caching**
   - Cache tracking results for a short period
   - Implement Redis for distributed caching

2. **Async Processing**
   - Use background jobs for shipment creation
   - Implement webhooks for status updates

3. **Database Indexing**
   - Index waybill numbers for fast lookups
   - Index order status for filtering

## Monitoring and Logging

1. **API Monitoring**
   - Monitor Aramex API response times
   - Track error rates and success rates

2. **Logging**
   - Log all tracking requests and responses
   - Monitor for failed shipments

3. **Alerts**
   - Set up alerts for API failures
   - Monitor for high error rates

## Troubleshooting

### Common Issues

1. **SOAP Parsing Errors**
   - Check XML response format
   - Verify SOAP envelope structure

2. **Authentication Failures**
   - Verify Aramex credentials
   - Check account status

3. **Network Issues**
   - Check firewall settings
   - Verify DNS resolution

4. **Database Issues**
   - Check MongoDB connection
   - Verify order model schema

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=aramex:*
```

## Future Enhancements

1. **Webhook Integration**
   - Implement Aramex webhooks for real-time updates
   - Automatic status synchronization

2. **Bulk Operations**
   - Support bulk shipment creation
   - Batch tracking updates

3. **Advanced Features**
   - Delivery scheduling
   - Address validation
   - Cost calculation

4. **Analytics**
   - Tracking performance metrics
   - Delivery time analysis

## Support

For issues related to:
- **Aramex API**: Contact Aramex support
- **Integration Issues**: Check this documentation
- **Code Problems**: Review error logs and stack traces

## Changelog

### Version 1.0.0
- Initial Aramex integration
- Basic tracking functionality
- Shipment creation
- Frontend tracking pages
- Order model updates
