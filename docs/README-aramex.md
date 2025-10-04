# Aramex Integration - Quick Start Guide

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
cd server
npm install xml2js
```

### 2. Environment Variables
Add to your `.env` file:
```env
# Aramex Configuration
ARAMEX_ACCOUNT_COUNTRY_CODE=SA
ARAMEX_ACCOUNT_ENTITY=RUH
ARAMEX_ACCOUNT_NUMBER=4004636
ARAMEX_ACCOUNT_PIN=432432
ARAMEX_USERNAME=testingapi@aramex.com
ARAMEX_PASSWORD=R123456789$r
ARAMEX_VERSION=1.0
ARAMEX_BASE_URL=http://ws.sbx.aramex.net/shippingapi/shipping/service_1_0.svc

# Frontend URL
FRONTEND_URL=http://localhost:3002
BACKEND_URL=http://localhost:5000
```

### 3. Test the Integration
```bash
cd server
node scripts/test-aramex.js
```

## 📋 Features Implemented

### Backend
- ✅ Aramex SOAP API integration
- ✅ Shipment tracking
- ✅ Shipment creation
- ✅ Order model updates
- ✅ API endpoints with validation
- ✅ Error handling and logging

### Frontend
- ✅ Order tracking pages
- ✅ Reusable tracking component
- ✅ Custom tracking hook
- ✅ API route proxies
- ✅ Responsive UI design

## 🔗 API Endpoints

### Track Shipment
```
GET /api/aramex/track/{waybillNumber}
```

### Create Shipment
```
POST /api/aramex/create-shipment/{orderId}
```

### Track by Order ID
```
GET /api/aramex/track-order/{orderId}
```

## 🎯 Usage Examples

### Track an Order
```javascript
// Using the hook
const { trackShipment } = useAramexTracking();
const result = await trackShipment('WAYBILL123');
```

### Create a Shipment
```javascript
// Using the hook
const { createShipment } = useAramexTracking();
const result = await createShipment('ORDER_ID', shipperData, consigneeData);
```

### Use the Component
```tsx
<OrderTracking 
  orderId={order._id}
  waybillNumber={order.shipping?.aramexWaybillNumber}
/>
```

## 🧪 Testing

### Test Pages
- `/track-order` - Main tracking page
- `/track-order/WAYBILL123` - Detailed tracking view

### Test API
```bash
# Track shipment
curl http://localhost:5000/api/aramex/track/TEST123456

# Health check
curl http://localhost:5000/api/aramex/health
```

## 📁 File Structure

```
server/
├── Services/
│   └── aramex-service.js          # Aramex SOAP integration
├── Controller/
│   └── aramex-controller.js       # API controllers
├── Router/
│   └── aramex-router.js           # API routes
├── Models/
│   └── order-model.js             # Updated with tracking fields
└── scripts/
    └── test-aramex.js             # Integration tests

drinkmate-main/
├── app/
│   ├── track-order/
│   │   ├── page.tsx               # Main tracking page
│   │   └── [waybillNumber]/
│   │       └── page.tsx           # Detailed tracking
│   └── api/
│       └── aramex/
│           ├── track/[waybillNumber]/
│           │   └── route.ts       # Track API route
│           └── create-shipment/[orderId]/
│               └── route.ts       # Create shipment API route
├── components/
│   └── order/
│       └── OrderTracking.tsx      # Reusable tracking component
└── hooks/
    └── use-aramex-tracking.ts     # Tracking hook
```

## 🔧 Configuration

### Aramex Credentials
The integration uses the provided testing credentials:
- **Environment**: Sandbox (testing)
- **Account**: 4004636
- **Entity**: RUH (Riyadh)
- **Country**: SA (Saudi Arabia)

### Order Model Updates
The order model now includes:
- `shipping.aramexWaybillNumber` - Unique waybill number
- `shipping.trackingHistory` - Complete tracking history
- `shipping.status` - Current shipping status
- `shipping.trackingUrl` - Direct tracking link

## 🚨 Important Notes

1. **Sandbox Environment**: Currently using Aramex sandbox for testing
2. **Credentials**: Use provided test credentials only
3. **Rate Limiting**: Implement rate limiting for production
4. **Error Handling**: All errors are logged and handled gracefully
5. **Validation**: All inputs are validated before API calls

## 📞 Support

For issues:
1. Check the logs in `server/logs/`
2. Run the test script: `node scripts/test-aramex.js`
3. Verify environment variables
4. Check network connectivity to Aramex

## 🔄 Next Steps

1. **Production Setup**: Switch to production Aramex credentials
2. **Webhooks**: Implement real-time status updates
3. **Bulk Operations**: Add bulk shipment creation
4. **Analytics**: Add tracking performance metrics
5. **Notifications**: Add email/SMS notifications for status changes

## 📚 Documentation

- [Full Integration Documentation](aramex-integration.md)
- [API Reference](aramex-integration.md#api-endpoints)
- [Error Handling](aramex-integration.md#error-handling)
- [Troubleshooting](aramex-integration.md#troubleshooting)
