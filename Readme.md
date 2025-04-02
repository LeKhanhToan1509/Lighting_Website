# Web Application

This repository contains the source code for a full-stack web application, including both the frontend (FE) and backend (BE).

## Table of Contents
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
- [Frontend Overview](#frontend-overview)
- [Backend Overview](#backend-overview)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)

---

## Project Structure

```
web/
├── fe/                # Frontend source code
│   ├── src/           # React application
│   ├── public/        # Static assets
│   ├── package.json   # Frontend dependencies
│   └── vite.config.js # Vite configuration
├── be/                # Backend source code
│   ├── src/           # Express application
│   ├── uploads/       # Uploaded files
│   ├── package.json   # Backend dependencies
│   └── app.js         # Backend entry point
└── .gitignore         # Git ignore rules
```

---

## Technologies Used

### Frontend
- **React**: UI library for building user interfaces.
- **Redux Toolkit**: State management.
- **TailwindCSS**: Utility-first CSS framework.
- **Ant Design**: UI components library.
- **Vite**: Fast development server and build tool.

### Backend
- **Express**: Web framework for Node.js.
- **MongoDB**: NoSQL database.
- **Redis**: In-memory data store for caching.
- **Mongoose**: MongoDB object modeling.
- **JWT**: Authentication using JSON Web Tokens.
- **Nodemailer**: Email sending service.

---

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- Redis
- MinIO (for file storage)

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/web.git
   cd web
   ```

2. Install dependencies for both frontend and backend:
   ```bash
   cd fe && npm install
   cd ../be && npm install
   ```

3. Configure environment variables:
   - Copy `.env` files for both `fe` and `be` directories.
   - Update the values as per your setup.

4. Start the backend:
   ```bash
   cd be
   npm start
   ```

5. Start the frontend:
   ```bash
   cd fe
   npm run dev
   ```

6. Open the application in your browser at `http://localhost:5173`.

---

## Frontend Overview

The frontend is built using React and Vite. It includes:
- **State Management**: Redux Toolkit with persisted state.
- **Styling**: TailwindCSS and Ant Design.
- **Routing**: React Router for navigation.

### Key Commands
- `npm run dev`: Start the development server.
- `npm run build`: Build the production-ready app.
- `npm run preview`: Preview the production build.

---

## Backend Overview

The backend is an Express application connected to MongoDB and Redis. It includes:
- **Authentication**: JWT-based authentication.
- **Caching**: Redis for caching frequently accessed data.
- **File Uploads**: MinIO for storing uploaded files.

### Key Commands
- `npm start`: Start the backend server.

---

## Environment Variables

### Frontend (`fe/.env`)
- `VITE_API_URL`: Base URL for the backend API.

### Backend (`be/.env`)
- `PORT`: Port for the backend server.
- `DEV_DB_HOST`: MongoDB host for development.
- `JWT_ACCESS_TOKEN`: Secret for access tokens.
- `JWT_REFRESH_TOKEN`: Secret for refresh tokens.
- `EMAIL_USER`: Email address for sending emails.
- `EMAIL_PASS`: Password for the email account.
- `MINIO_ACCESS_KEY`: MinIO access key.
- `MINIO_SECRET_KEY`: MinIO secret key.

---

## Scripts

### Frontend
- `npm run dev`: Start the development server.
- `npm run build`: Build the production app.
- `npm run preview`: Preview the production build.

### Backend
- `npm start`: Start the backend server.
