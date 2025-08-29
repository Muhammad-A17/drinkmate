# Drinkmate

A modern e-commerce platform for selling soda makers, flavors, and accessories.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (optional – the app can run with demo data if MongoDB is not available)

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd drinkmate
   ```

2. Install dependencies for both **frontend** and **backend**:
   ```bash
   # Install frontend dependencies
   npm install

   # Install backend dependencies
   cd server
   npm install
   cd ..
   ```

---

## ▶️ Running the Application

You can start the application using the provided batch files:

```bash
# On Windows - Start both frontend and backend
start-servers.bat

# Or use a local MongoDB instance
start-local-mongo.bat
```

Alternatively, run them manually:

```bash
# Start backend server (from project root)
cd server
node server.js

# In another terminal, start frontend server (from project root)
npm run dev
```

- **Frontend:** http://localhost:3001  
- **Backend API:** http://localhost:3000  

---

## 🗄️ MongoDB Connection

The application supports two modes:

1. **Connected Mode** – Uses MongoDB (local or cloud)
2. **Offline Mode** – Uses in-memory data if MongoDB is unavailable

### MongoDB Setup

1. Create a `server/.env` file and add:
   ```env
   MONGODB_URI=mongodb://localhost:27017/drinkmate
   JWT_SECRET=your_secret_key
   PORT=3000
   FRONTEND_URL=http://localhost:3001
   ```

2. If using local MongoDB:
   ```bash
   start-local-mongo.bat
   ```

---

## 📂 Project Structure

```
drinkmate/
│
├── server/                # Backend (Express + MongoDB)
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── controllers/       # Business logic
│   ├── middleware/        # Auth & error handling
│   ├── config/            # Database & environment setup
│   └── server.js          # Entry point for backend
│
├── src/                   # Frontend (React + Vite)
│   ├── components/        # Reusable UI components
│   ├── pages/             # Page-level components
│   ├── hooks/             # Custom hooks
│   ├── context/           # Global state (auth, cart, etc.)
│   ├── assets/            # Images, fonts, static files
│   └── main.jsx           # Entry point for frontend
│
├── start-servers.bat      # Batch file to run backend + frontend
├── start-local-mongo.bat  # Batch file to run app with local MongoDB
└── README.md              # Documentation
```

---

## 🛠️ Tech Stack

### Frontend
- ⚛️ Next js 
- 🎨 TailwindCSS  
- 🔄 Axios (API calls)  

### Backend
- 🟢 Node.js  
- 🚂 Express.js  
- 🍃 MongoDB + Mongoose  
- 🔐 JWT Authentication  

---

## ✨ Features

- 🔑 User authentication (login/register)  
- 🛒 Shopping cart functionality  
- 📦 Product browsing by category (Soda Makers, Flavors, Accessories)  
- 📝 Detailed product pages (images, descriptions, specifications)  
- 🎁 Bundle packages with discounts  
- 📱 Responsive design (mobile + desktop)  

---

## 🤝 Contributing

1. Fork the repo  
2. Create a feature branch (`git checkout -b feature-name`)  
3. Commit your changes (`git commit -m "Add new feature"`)  
4. Push to the branch (`git push origin feature-name`)  
5. Open a Pull Request  

---

## 📜 License

This project is licensed under the **MIT License**.  
You are free to use, modify, and distribute it.

---

## 👨‍💻 Author

**Muhammad Faizan Hassan**  
🚀 Passionate Software Engineer | 💡 Focused on MERN, ML & AI  
📍 Lahore, Pakistan  
🔗 [GitHub Profile](https://github.com/faizanhassan)  

