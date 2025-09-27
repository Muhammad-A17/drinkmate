# 🥤 DrinkMates - Premium Soda Making Experience

A modern, full-stack e-commerce platform for premium soda makers, CO2 cylinders, Italian flavors, and accessories. Built with Next.js 15, Node.js, and MongoDB.

## ✨ Features

### 🛍️ **E-commerce Platform**
- **Product Catalog**: Soda makers, CO2 cylinders, Italian flavors, and accessories
- **Shopping Cart**: Advanced cart management with animations
- **Order Management**: Complete order processing and tracking
- **Payment Integration**: Secure payment processing with Urways
- **User Authentication**: JWT-based authentication system

### 💬 **Real-time Chat Support**
- **Live Chat Widget**: Real-time customer support
- **Admin Dashboard**: Chat management and assignment
- **Message History**: Persistent chat conversations
- **Typing Indicators**: Real-time user activity
- **WebSocket Integration**: Socket.io for instant messaging

### 🌐 **Multi-language Support**
- **Arabic & English**: Full RTL/LTR support
- **Dynamic Translations**: Context-aware translations
- **Font Optimization**: Cairo (Arabic) and Montserrat (English)

### 🎨 **Modern UI/UX**
- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: Theme switching capability
- **Smooth Animations**: CSS transitions and micro-interactions
- **Image Optimization**: Next.js Image component with Cloudinary
- **SEO Optimized**: Meta tags, structured data, and sitemaps

## 🚀 Tech Stack

### **Frontend**
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Real-time**: Socket.io Client
- **Images**: Cloudinary Integration
- **Fonts**: Cairo (Arabic), Montserrat (English)

### **Backend**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Real-time**: Socket.io
- **File Upload**: Cloudinary
- **Security**: Helmet, CORS, Rate Limiting

### **Deployment**
- **Frontend**: Vercel
- **Backend**: Render.com
- **Database**: MongoDB Atlas
- **CDN**: Cloudinary

## 📁 Project Structure

```
drinkmates/
├── drinkmate-main/          # Next.js Frontend
│   ├── app/                # App Router pages
│   │   ├── admin/          # Admin dashboard
│   │   ├── api/            # API routes
│   │   ├── shop/           # Product pages
│   │   ├── account/        # User account pages
│   │   └── layout.tsx      # Root layout
│   ├── components/         # Reusable components
│   │   ├── ui/            # UI components
│   │   ├── chat/          # Chat components
│   │   ├── cart/          # Cart components
│   │   └── layout/        # Layout components
│   ├── lib/               # Utilities and contexts
│   │   ├── contexts/      # React contexts
│   │   ├── api/           # API utilities
│   │   └── utils/         # Helper functions
│   └── public/            # Static assets
│
├── server/                 # Node.js Backend
│   ├── Controller/        # Route controllers
│   ├── Models/           # Database models
│   ├── Router/           # Express routes
│   ├── Middleware/       # Custom middleware
│   ├── Services/         # Business logic
│   └── Utils/            # Server utilities
│
└── README.md             # This file
```

## 🛠️ Installation & Setup

### **Prerequisites**
- Node.js 18+ 
- MongoDB Atlas account
- Cloudinary account
- Git

### **1. Clone Repository**
```bash
git clone https://github.com/muhammadfaizanhassan/drinkmates.git
cd drinkmates
```

### **2. Frontend Setup**
```bash
cd drinkmate-main
npm install
cp .env.example .env.local
# Update environment variables
npm run dev
```

### **3. Backend Setup**
```bash
cd server
npm install
cp env-template.txt .env
# Update environment variables
npm start
```

### **4. Environment Variables**

#### **Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset
```

#### **Backend (.env)**
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🔧 Recent Updates

### **WebSocket Connection Fixes** (Latest)
- ✅ Fixed CSP configuration for WebSocket connections
- ✅ Enhanced socket connection logic with environment detection
- ✅ Improved error handling and retry mechanisms
- ✅ Updated server CORS configuration
- ✅ Added detailed logging for debugging

### **Image Optimization**
- ✅ Fixed aspect ratio warnings for Cloudinary images
- ✅ Added proper CSS styles for image scaling
- ✅ Optimized image loading performance

### **Security Enhancements**
- ✅ Updated Content Security Policy
- ✅ Enhanced CORS configuration
- ✅ Improved authentication middleware
- ✅ Added rate limiting and security headers

## 🚀 Running the Application

### **Development Mode**
```bash
# Terminal 1: Start Backend
cd server
npm start

# Terminal 2: Start Frontend
cd drinkmate-main
npm run dev
```

### **Access Points**
- **Frontend**: http://localhost:3002
- **Backend API**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3002/admin

## 🚀 Deployment

### **Frontend (Vercel)**
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### **Backend (Render)**
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy automatically on push to main branch

### **Database (MongoDB Atlas)**
1. Create a MongoDB Atlas cluster
2. Configure network access and database user
3. Update connection string in environment variables

## 📱 Features Overview

### **Customer Features**
- Browse products by category
- Add items to cart with animations
- Secure checkout process
- Order tracking and history
- Real-time chat support
- Multi-language interface

### **Admin Features**
- Product management
- Order management
- Chat assignment and monitoring
- User management
- Analytics dashboard
- Content management

## 🔒 Security Features

- JWT-based authentication
- CSRF protection
- XSS prevention
- SQL injection protection
- Rate limiting
- Secure headers
- Input validation and sanitization

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📞 Support

For support and questions:
- **Email**: support@drinkmates.com
- **Live Chat**: Available on the website
- **GitHub Issues**: Report bugs and feature requests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature-name`)
3. Commit your changes (`git commit -m "Add new feature"`)
4. Push to the branch (`git push origin feature-name`)
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Muhammad Faizan Hassan**  
🚀 Passionate Software Engineer | 💡 Focused on MERN, ML & AI  
📍 Lahore, Pakistan  
🔗 [GitHub Profile](https://github.com/faizanhassan)

---

**Made with ❤️ for the ultimate soda making experience**