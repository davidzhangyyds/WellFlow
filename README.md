# WellFlow — Habit & Task Management Platform

> Track · Habit · Thrive

A full-stack web application for managing daily habits and tasks with a modern Vue.js frontend and secure Node.js/Express backend.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Authentication](#authentication)

## 🎯 Overview

WellFlow is a comprehensive habit and task management platform designed to help users track their daily activities, organize tasks by categories, and maintain consistent habits. The application features a secure authentication system, real-time task management, and an intuitive mobile-responsive UI.

## ✨ Features

### Core Features
- **User Authentication** - Secure registration, login, and JWT-based session management
- **Task Management** - Create, read, update, and delete tasks with status tracking (todo, doing, done)
- **Habit Tracking** - Organize tasks by categories (habits, work, health, etc.)
- **User Profiles** - Manage user information and settings
- **Real-time Dashboard** - View all tasks and daily progress at a glance
- **Responsive Design** - Mobile-first UI with Tailwind CSS

### Security
- Password hashing with bcrypt (12 rounds)
- JWT token-based authentication
- Session revocation support
- Token expiration handling
- CORS protection
- Helmet.js for HTTP security headers

## 🛠 Tech Stack

### Frontend
- **Vue.js 3** - Progressive JavaScript framework
- **Vite** - Next-generation build tool
- **Pinia** - Vue state management
- **Vue Router 4** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS 4** - Utility-first CSS framework

### Backend
- **Node.js** - JavaScript runtime
- **Express.js 5** - Web framework
- **MySQL 2** - Database with connection pooling
- **JWT** - Token-based authentication
- **Bcrypt** - Password hashing
- **Helmet** - Security middleware
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Environment variables

### Database
- **MySQL** - Relational database with UTF-8 support
- **Connection Pooling** - 10 concurrent connections

## 📁 Project Structure

```
WellFlow/
├── backend/                          ← Express.js API server
│   ├── app.js                        ← Main application entry
│   ├── package.json                  ← Backend dependencies
│   │
│   ├── config/
│   │   └── db.js                     ← MySQL connection pool
│   │
│   ├── controllers/                  ← Business logic
│   │   ├── authController.js         ← Registration, login, logout
│   │   ├── taskController.js         ← Task CRUD operations
│   │   └── userController.js         ← User profile management
│   │
│   ├── middleware/
│   │   └── auth.js                   ← JWT verification middleware
│   │
│   ├── routes/                       ← API endpoint definitions
│   │   ├── auth.js                   ← /api/auth routes
│   │   ├── tasks.js                  ← /api/tasks routes
│   │   ├── user.js                   ← /api/user routes
│   │   └── categories.js             ← /api/categories routes
│   │
│   └── sql/                          ← Database scripts
│       ├── schema.sql                ← Database & table definitions
│       ├── seed.sql                  ← Initial data
│       └── show_*.sql                ← Query examples
│
└── wellflow-vue/                     ← Vue.js SPA frontend
    ├── index.html                    ← Entry HTML
    ├── package.json                  ← Frontend dependencies
    ├── vite.config.js                ← Vite configuration
    │
    ├── src/
    │   ├── main.js                   ← App bootstrap
    │   ├── App.vue                   ← Root component
    │   │
    │   ├── assets/
    │   │   └── main.css              ← Global styles
    │   │
    │   ├── components/               ← Reusable components
    │   │   ├── NavBar.vue            ← Top navigation
    │   │   ├── TabBar.vue            ← Bottom tab navigation
    │   │   └── HabitItem.vue         ← Task/habit card
    │   │
    │   ├── composables/              ← Reusable logic
    │   │   ├── useApi.js             ← Axios + JWT interceptors
    │   │   └── useGreeting.js        ← Utilities (date, categories)
    │   │
    │   ├── router/
    │   │   └── index.js              ← Vue Router config + guards
    │   │
    │   ├── stores/                   ← Pinia state management
    │   │   ├── auth.js               ← Authentication state
    │   │   ├── tasks.js              ← Tasks CRUD state
    │   │   └── toast.js              ← Notifications state
    │   │
    │   └── views/                    ← Page components
    │       ├── LoginView.vue         ← Authentication page
    │       ├── DashboardView.vue     ← Home/dashboard
    │       ├── HabitsView.vue        ← All tasks list
    │       ├── NewHabitView.vue      ← Create new task
    │       └── ProfileView.vue       ← User profile
    │
    └── public/                       ← Static assets
```

## 📋 Prerequisites

- **Node.js** >= 16.x
- **npm** >= 8.x
- **MySQL** >= 5.7
- A modern web browser (Chrome, Firefox, Safari, Edge)

## 🚀 Installation & Setup

### 1. Clone & Navigate to Project

```bash
cd WellFlow
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file with database credentials
cat > .env << EOF
DB_HOST=localhost
DB_PORT=3306
DB_NAME=wellflow
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
EOF

# Create MySQL database and tables
mysql -u root -p < sql/schema.sql
mysql -u root -p wellflow < sql/seed.sql
```

### 3. Frontend Setup

```bash
cd ../wellflow-vue

# Install dependencies
npm install
```

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd wellflow-vue
npm run dev
```
Frontend will run on `http://localhost:5173`

### Production Build

**Frontend:**
```bash
cd wellflow-vue
npm run build
npm run preview
```

## 📡 API Documentation

All endpoints (except `/api/auth/register` and `/api/auth/login`) require JWT authentication via `Authorization: Bearer <token>` header.

### Authentication

#### `POST /api/auth/register`
Register a new user account.

**Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response:** `201 Created`
```json
{
  "message": "Account created successfully",
  "user_id": 1
}
```

#### `POST /api/auth/login`
Authenticate and receive JWT token.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGc...",
  "user": {
    "user_id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

#### `POST /api/auth/logout`
Revoke current session token.

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

### Tasks (Protected Routes)

#### `GET /api/tasks`
Retrieve all tasks for the authenticated user.

**Response:**
```json
[
  {
    "task_id": 1,
    "user_id": 1,
    "title": "Morning Run",
    "description": "30 minutes jog",
    "status": "todo",
    "category_id": 1,
    "scheduled_time": "2026-04-28T08:00:00Z",
    "created_at": "2026-04-28T10:00:00Z",
    "updated_at": "2026-04-28T10:00:00Z"
  }
]
```

#### `GET /api/tasks/:id`
Retrieve a specific task by ID.

#### `POST /api/tasks`
Create a new task.

**Request:**
```json
{
  "title": "Morning Run",
  "description": "30 minutes jog",
  "category_id": 1,
  "scheduled_time": "2026-04-28T08:00:00Z"
}
```

#### `PUT /api/tasks/:id`
Update an existing task.

**Request:**
```json
{
  "title": "Evening Run",
  "description": "45 minutes run",
  "category_id": 2
}
```

#### `PATCH /api/tasks/:id/status`
Update task status.

**Request:**
```json
{
  "status": "doing"
}
```

Valid statuses: `todo`, `doing`, `done`

#### `DELETE /api/tasks/:id`
Delete a task.

### User Routes

#### `GET /api/user/profile`
Get current user profile.

#### `PUT /api/user/profile`
Update user profile.

**Request:**
```json
{
  "username": "updated_name",
  "email": "newemail@example.com"
}
```

### Categories

#### `GET /api/categories`
Retrieve all available task categories.

## 🗄️ Database Schema

### Tables

#### `user`
- `user_id` (INT, PK) - Auto-increment user ID
- `username` (VARCHAR 50, UNIQUE) - Username
- `email` (VARCHAR 150, UNIQUE) - Email address
- `password_hash` (VARCHAR 255) - Bcrypt hashed password
- `created_at` (DATETIME) - Account creation timestamp
- `updated_at` (DATETIME) - Last update timestamp

#### `category`
- `category_id` (INT, PK) - Auto-increment category ID
- `name` (VARCHAR 50, UNIQUE) - Category name
- `icon` (VARCHAR 10) - Emoji or icon representation
- `color` (VARCHAR 7) - Hex color code
- `created_at` (DATETIME) - Creation timestamp

#### `task`
- `task_id` (INT, PK) - Auto-increment task ID
- `user_id` (INT, FK) - Reference to user
- `category_id` (INT, FK) - Reference to category
- `title` (VARCHAR 150) - Task title
- `description` (TEXT) - Detailed description
- `status` (VARCHAR 10) - Status: 'todo', 'doing', 'done'
- `scheduled_time` (DATETIME) - Planned execution time
- `created_at` (DATETIME) - Creation timestamp
- `updated_at` (DATETIME) - Last update timestamp

#### `session`
- `session_id` (INT, PK) - Auto-increment session ID
- `user_id` (INT, FK) - Reference to user
- `token` (VARCHAR 512, UNIQUE) - JWT token
- `is_revoked` (BOOLEAN) - Revocation status
- `ip_address` (VARCHAR 45) - Client IP
- `user_agent` (VARCHAR 255) - Browser user agent
- `expires_at` (DATETIME) - Token expiration
- `created_at` (DATETIME) - Session creation timestamp

## 🔐 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=wellflow
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development
```

## 🔑 Authentication Flow

1. **Registration**: User submits username, email, and password
   - Password is hashed with bcrypt (12 rounds)
   - User record is created in database

2. **Login**: User submits email and password
   - Password is compared against stored hash
   - JWT token is generated with 7-day expiration
   - Session record is created with token and metadata

3. **API Requests**: JWT token included in `Authorization` header
   - Middleware verifies JWT signature
   - Token validity is checked in session table
   - Request is allowed if token is valid and not revoked

4. **Logout**: Token is marked as revoked in session table
   - Frontend removes token from storage
   - Further requests with revoked token are rejected

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

## 📝 License

ISC

## 👤 Author

David ZHANG - EFREI Advanced Web Programming Project
```

App runs on: http://localhost:5173

## Connecting to the Backend

All API calls are pre-written as **TODO comments** in the stores.
Replace the demo simulations with real calls once the backend is ready.

Example in `stores/auth.js`:
```js
// TODO: replace demo with real API call
const { data } = await api.post('/auth/login', { email, password })
```

The `useApi.js` composable handles:
- Base URL → `/api` (proxied to `http://localhost:3000` via Vite)
- JWT token attached automatically to every request
- 401 → auto-redirect to login

## Dependencies

| Package | Purpose |
|---------|---------|
| `vue` | UI framework |
| `vue-router` | Client-side routing |
| `pinia` | State management |
| `axios` | HTTP client for API calls |
| `vite` | Build tool & dev server |
