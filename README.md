# Hostel Management System (HMS-NSBM)

A full-stack hostel management platform for student outings with role-based dashboards for Student, Parent, Warden, and Security.

## Overview

This project manages outing requests and approvals across multiple roles:

- Student creates outing/going-home requests
- Parent approves or rejects child requests
- Warden manages registrations, approvals, search, and summaries
- Security marks student exit/return in real time

The system uses JWT authentication and strict role-based route protection.

## Tech Stack

### Frontend
- React
- React Router
- Axios

### Backend
- Node.js + Express
- PostgreSQL (pg)
- JWT (jsonwebtoken)
- Password hashing (bcrypt)

## Project Structure

```text
HMS-nsbm/
	backend/
		controllers/
		routes/
		middleware/
		utils/
		config/
		server.js
	frontend/
		src/
			pages/
			components/
			services/
```

## Core Features

### Authentication & Access Control
- Role-based login for student, parent, warden, and security
- Parent login uses student_id + parent_password + device_id
- Role mismatch login is blocked (example: student cannot log in via warden login)
- Protected routes in frontend + backend middleware checks

### Student
- Create outing / home-going request
- View own requests
- View outing history timeline

### Parent
- Approve or reject child outing requests
- View child request list

### Warden
- Register student, parent, and security accounts
- Search student + parent by student ID
- Search security staff by name
- Remove student (with confirmation)
- Remove security staff (with confirmation)
- Set custom new passwords for student/parent from search page
- Update security staff password from Search Staff section
- Approve/reject new requests
- View separate daily cards:
	- New Requests
	- Today's Going Homes
	- Returned Students
- View daily summary counters:
	- Total students registered
	- Students outside hostel (today)
	- Students in home today
- Search past outings/going-home summaries by date
- Sidebar logout
- On staff password update, the newly set password is shown briefly in the dashboard row and then auto-hidden

### Security
- Mark student exit
- Mark student return
- View today list relevant to security

## Important Password Note

Stored passwords are hashed and cannot be decrypted/retrieved as plain text.

If a student, parent, or security staff account forgets a password, warden should use the password reset section to set a new password manually.

## Backend API Summary

Base URL: http://localhost:5000/api

### Auth
- POST /auth/register
- POST /auth/login
- POST /auth/parent-login

### Outings (Student)
- POST /outings/create
- GET /outings/my-requests
- GET /outings/history

### Parent
- PUT /parent/approve/:id
- PUT /parent/reject/:id
- GET /parent/requests

### Warden
- POST /warden/register-student
- POST /warden/register-parent
- GET /warden/search/:studentId
- POST /warden/reset-passwords/:studentId
- DELETE /warden/remove-student/:studentId
- GET /warden/search-staff?name=<staff_name>
- POST /warden/reset-staff-password/:id
- DELETE /warden/remove-staff/:id
- PUT /warden/approve/:id
- PUT /warden/reject/:id

### Dashboard
- GET /dashboard/warden
- GET /dashboard/warden/past-summaries?date=YYYY-MM-DD

### Security
- PUT /security/exit/:id
- PUT /security/return/:id
- GET /security/today

### User
- GET /users/me

## Environment Setup

### Backend

Create `backend/.env` (you can copy from `backend/.env.example`):

```env
PORT=5000
JWT_SECRET=your_secure_secret
DB_USER=your_db_user
DB_HOST=localhost
DB_NAME=your_db_name
DB_PASSWORD=your_db_password
DB_PORT=5432
```

Make sure PostgreSQL is running and the required tables exist (users, students, parents, outing_requests, outing_history, etc.).

### Frontend

Create `frontend/.env` (you can copy from `frontend/.env.example`):

```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

For Vercel frontend deployments, set this environment variable in the project settings:

- `REACT_APP_API_BASE_URL=https://<your-backend-domain>/api`

## Installation & Run

### 1) Install backend dependencies
```bash
cd backend
npm install
```

### 2) Install frontend dependencies
```bash
cd ../frontend
npm install
```

### 3) Start backend
```bash
cd ../backend
npm run dev
```

### 4) Start frontend
```bash
cd ../frontend
npm start
```
Before start the frontend make sure the package-lock.json 
packages looks exactly like this,

"packages": {
    "": {
      "name": "frontend",
      "version": "0.1.0",
      "dependencies": {
        "@testing-library/dom": "^10.4.1",
        "@testing-library/jest-dom": "^6.9.1",
        "@testing-library/react": "^16.3.2",
        "@testing-library/user-event": "^13.5.0",
        "axios": "^1.13.6",
        "react": "^19.2.4",
        "react-dom": "^19.2.4",
        "react-icons": "^5.6.0",
        "react-router-dom": "^7.13.1",
        "react-scripts": "^5.0.1",
        "web-vitals": "^2.1.4"

		}

Then

Frontend: http://localhost:3000

## Scripts

### Backend
- npm run dev - Start backend with nodemon

### Frontend
- npm start - Start React dev server
- npm run build - Production build
- npm test - Run tests

## Recent Functional Updates Included

- Inline login error messages (no browser alert popups)
- Top professional login error banner
- Role-safe login enforcement
- Warden dashboard sidebar enhancements
- Past outing search section
- Daily movement separation and date filtering
- Warden-managed custom password reset flow
- Warden Search Staff with update-password and remove-security actions
- Working logout buttons for student, parent, security, and warden dashboards

## Troubleshooting

- If new backend route changes are not reflected, restart backend server.
- If token errors appear, re-login (expired/invalid token is auto-cleared on frontend API interceptor).
- If CORS or network issues appear, ensure backend is running on port 5000 and frontend on 3000.

---

Detailed request/response examples are available in docs/API.md.

Additional documentation:
- docs/DB_SCHEMA.md - Database tables, relationships, and index suggestions
- docs/POSTMAN_COLLECTION.md - Postman environment and endpoint testing guide

If needed, this README can be extended with SQL schema and seed instructions in a separate docs/ section.
## Contributors
- [Gayathma](https://github.com/gayathma2004-afk) - Initial contributions and updates.