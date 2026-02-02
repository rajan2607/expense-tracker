# Expense & Subscription Tracker

A full-stack expense and subscription management application that allows users to securely track daily expenses and recurring subscriptions with authentication and cloud persistence.

The application is built using a Node.js backend deployed on Render, a static frontend deployed on Netlify, and MongoDB Atlas for data storage.

---

## 🚀 Live Demo

- **Frontend (Netlify):** (https://expense-trackerp126.netlify.app/)
- **Backend API (Render):** https://expense-tracker-it1u.onrender.com  

---

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript
- Netlify (Deployment)

### Backend
- Node.js
- Express.js
- JWT Authentication
- MongoDB (Mongoose)
- Render (Deployment)

### Database
- MongoDB Atlas (Cloud)

---

## ✨ Features

- User authentication using JWT (Signup & Login)
- Add, view, and delete expenses
- Manage recurring subscriptions with renewal dates
- Secure backend with protected routes
- Persistent data storage using MongoDB Atlas
- Environment-based configuration using environment variables

---

## 🔐 Security

- Sensitive data handled via environment variables
- JWT-based authentication for protected API routes
- `.env` files excluded from version control

---

## 🧪 API Endpoints (Sample)

- `POST /auth/signup` – Register new user  
- `POST /auth/login` – Login user  
- `GET /expenses` – Fetch user expenses  
- `POST /expenses` – Add expense  
- `GET /subscriptions` – Fetch subscriptions  

---

## 📂 Project Structure

