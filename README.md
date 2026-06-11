# Avidus Workspace - RBAC & Activity Log System

## Introduction
Avidus Workspace is a secure full-stack web application featuring Role-Based Access Control (RBAC) and activity log tracking. It allows users to register, log in, and manage their tasks. Administrators get a powerful dashboard to manage user access (Active/Inactive), inspect all tasks in the system, and audit security-relevant activity logs (logins, task creations, status updates, and deletions).

## Project Type
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Frontend**: React (Vite, Lucide React, Vanilla CSS)

## Deployed App
- **Backend**: https://avidus-assignment-upt2.onrender.com/ (Deployed on Render)
- **Frontend**: https://avidus-assignment.netlify.app/ (Deployed on Netlify)

## Directory Structure
```
Avidus-Assignment/
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── adminController.js
│   │   │   ├── authController.js
│   │   │   └── taskController.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── models/
│   │   │   ├── ActivityLog.js
│   │   │   ├── Task.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── adminRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   └── taskRoutes.js
│   │   └── server.js
│   ├── .env
│   ├── .gitignore
│   ├── package-lock.json
│   └── package.json
└── Frontend/
    ├── public/
    │   ├── favicon.svg
    │   └── icons.svg
    ├── src/
    │   ├── assets/
    │   │   ├── react.svg
    │   │   └── vite.svg
    │   ├── components/
    │   │   ├── ProtectedRoute.jsx
    │   │   └── TaskAnalytics.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── AdminDashboard.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Login.jsx
    │   │   └── Register.jsx
    │   ├── App.css
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── .gitignore
    ├── package-lock.json
    ├── package.json
    └── vite.config.js
```

## Features
- **User Authentication**: Secure signup and login with JWT tokens and salted password hashing (using bcrypt/argon2).
- **Role-Based Access Control (RBAC)**: Protected pages and API routes tailored to `User` and `Admin` roles.
- **User Status Toggle**: Admins can activate or deactivate user accounts. Inactive accounts are immediately denied access on any authenticated routes.
- **Task Management**: Create, read, update, and delete tasks. Regular users see only their tasks, while Admins can view and delete tasks globally.
- **Security Audit Logs**: Automated server-side log generation capturing important system events (`LOGIN`, `TASK_CREATE`, `TASK_UPDATE`, `TASK_DELETE`) with descriptive information and user details.
- **Interactive Analytics**: Visual widgets showing total metrics (users, tasks, logs, completion rates) and tracking productivity over time.
- **Premium Glassmorphic Design**: Modern dark UI styling with responsive layouts and smooth transition animations.

## Design Decisions & Assumptions
- **Stateless Authentication**: JWT token authentication is used to keep the API server stateless. The client stores the token and appends it to requests under `Authorization: Bearer <token>`.
- **Active User Checks**: To prevent deactivated users from keeping active sessions, the authorization middleware validates the user's status (`Active`/`Inactive`) on MongoDB for every request.
- **Cascading Deletions**: Deleting a user profile removes all associated task documents from the database to keep the storage clean and free of orphaned records.
- **Centralized Activity Tracking**: All task actions (creation, status update, deletion) are caught in the controllers and asynchronously dispatched to the `ActivityLog` collection.

## Installation & Getting Started
Follow these steps to set up the project locally:

### 1. Set Up the Backend
1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the `Backend/` directory and configure the environment variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 2. Set Up the Frontend
1. Navigate to the frontend directory:
   ```bash
   cd ../Frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Credentials
For testing role-based access control, use the following default user credentials:

### Admin User
- **Email**: `avidusadmin@gmail.com`
- **Password**: `Avidusadmin@123`

### Normal User
- **Email**: `avidususer@gmail.com`
- **Password**: `Avidususer@123`

## API Endpoints

### Authentication
- `POST` `/api/auth/register` - Register a new user
- `POST` `/api/auth/login` - Login user and return JWT token
- `GET` `/api/auth/me` - Fetch profile of the logged-in user

### Tasks
- `POST` `/api/tasks` - Create a new task (Authenticated)
- `GET` `/api/tasks` - Fetch tasks (Regular users get their own; Admins get all tasks)
- `PUT` `/api/tasks/:id` - Update task status or info (Authenticated)
- `DELETE` `/api/tasks/:id` - Delete a task (Authenticated)

### Admin Panel (Admin Access Only)
- `GET` `/api/admin/users` - Get directory listing of all registered users
- `PUT` `/api/admin/users/:id/status` - Toggle a user's status between `Active` and `Inactive`
- `DELETE` `/api/admin/users/:id` - Delete a user account and all their tasks
- `GET` `/api/admin/logs` - Fetch all system security/activity logs
- `GET` `/api/admin/analytics` - Fetch global user and task analytics

---
🚀 **Avidus Workspace Full-Stack application is successfully configured and ready to run!**
