<div align="center">

# 🚀 LMSQ - AI Powered Learning Management System

A full-stack AI-powered Learning Management System built using the MERN Stack that enables users to learn through AI-generated courses, interactive quizzes, and personalized progress tracking.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

</div>

---

# ✨ Features

## 🔐 Authentication
- Secure JWT Authentication
- User Registration & Login
- Protected Routes
- Password Encryption using bcrypt

## 📚 Learning Management
- Browse Programming Courses
- Chapter-wise Learning
- Track Learning Progress
- Resume Learning

## 🤖 AI Learning Assistant
- AI-generated learning content
- Topic explanations
- Personalized learning experience

## 📝 Quiz Module
- Dynamic quizzes
- Score calculation
- Quiz review
- Progress analysis

## 📊 Dashboard
- Learning statistics
- Quiz performance
- Completed courses
- Overall progress tracking

---

# 🛠 Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt.js

---

# 🏗️ System Architecture

```
                React + Vite
                      │
              React Router
                      │
                 REST APIs
                      │
          Express.js + Node.js
                      │
        JWT Authentication Layer
                      │
               MongoDB Database
```

---

# 📂 Project Structure

```
LMSQ
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── utils
│   └── server.js
│
├── frontend
│   ├── src
│   │   ├── assets
│   │   ├── components
│   │   ├── pages
│   │   ├── services
│   │   └── App.jsx
│   └── vite.config.js
│
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/Vedhasri08/lmq.git
cd lmq
```

## Backend

```bash
cd backend
npm install
npm run dev
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# 🔑 Environment Variables

Create a `.env` file inside the backend directory.

```env
PORT=

MONGO_URI=

JWT_SECRET=
```

---

# 📈 Future Enhancements

- AI Chat Support
- Course Recommendations
- Certificates
- Admin Dashboard
- Notifications
- Leaderboards



---

## ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.
