# HMS-NSBM API Reference

Base URL: `http://localhost:5000/api`

## Authentication

Most protected endpoints require:

- Header: `Authorization: Bearer <jwt_token>`
- Header: `Content-Type: application/json`

---

## Auth Endpoints

### POST /auth/register
Register a user (used mainly for generic registration flow).

Request body:
```json
{
  "name": "Nimal Perera",
  "email": "nimal@example.com",
  "password": "123456",
  "role": "student",
  "student_id": "STU001",
  "parent_password": "parent123"
}
```

Success response:
```json
{
  "message": "User registered successfully"
}
```

### POST /auth/login
Role-aware login for student/warden/security (email + password + role).

Request body:
```json
{
  "email": "warden@hostel.com",
  "password": "secret123",
  "role": "warden"
}
```

Success response:
```json
{
  "message": "Login successful",
  "token": "<jwt>",
  "user": {
    "id": 1,
    "name": "Warden User",
    "role": "warden"
  }
}
```

### POST /auth/parent-login
Parent login using child student ID + parent password + device ID.

Request body:
```json
{
  "student_id": "STU001",
  "parent_password": "parent123",
  "device_id": "7f4c7a8b-8e22-4f65-b9a3-2db98b54d0bb"
}
```

Success response:
```json
{
  "message": "Parent login successful",
  "token": "<jwt>",
  "user": {
    "id": 5,
    "role": "parent",
    "student_id": "STU001",
    "parent_name": "Parent Name"
  }
}
```

---

## Student Endpoints

### POST /outings/create
Create outing / going-home request.

Request body:
```json
{
  "student_id": "STU001",
  "room_number": "A-203",
  "destination": "Colombo",
  "type": "outing",
  "leaving_date": "2026-03-18",
  "leaving_time": "14:30",
  "emergency": false
}
```

### GET /outings/my-requests
Get current student's own requests.

### GET /outings/history
Get current student's outing history timeline.

---

## Parent Endpoints

### PUT /parent/approve/:id
Approve child outing request.

### PUT /parent/reject/:id
Reject child outing request.

### GET /parent/requests
List child outing requests for logged-in parent.

---

## Warden Endpoints

### POST /warden/register-student
Register a student.

Request body:
```json
{
  "full_name": "Hirushi Perera",
  "student_id": "37380",
  "room_number": "2505",
  "email": "hirushi@gmail.com",
  "password": "student123"
}
```

### POST /warden/register-parent
Register a parent.

Request body:
```json
{
  "parent_name": "Nihari Perera",
  "email": "nihari@gmail.com",
  "student_name": "Hirushi Perera",
  "student_id": "37380",
  "phone_number": "0763315889",
  "password": "parent123"
}
```

### GET /warden/search/:studentId
Search student and parent by student ID.

Success response:
```json
{
  "student": {
    "full_name": "Hirushi Perera",
    "student_id": "37380",
    "room_number": "2505",
    "email": "hirushi@gmail.com"
  },
  "parent": {
    "parent_name": "Nihari Perera",
    "email": "nihari@gmail.com",
    "student_name": "Hirushi Perera",
    "student_id": "37380",
    "phone_number": "0763315889"
  }
}
```

### POST /warden/reset-passwords/:studentId
Set new custom passwords for student and parent (warden-entered values).

Request body:
```json
{
  "studentPassword": "newStudent@123",
  "parentPassword": "newParent@123"
}
```

Success response:
```json
{
  "message": "Passwords reset successfully",
  "credentials": {
    "student_password": "newStudent@123",
    "parent_password": "newParent@123"
  }
}
```

### DELETE /warden/remove-student/:studentId
Delete student and linked records (with warden confirmation in UI).

Success response:
```json
{
  "message": "Student removed successfully"
}
```

### GET /warden/search-staff?name=<staff_name>
Search security staff by name.

Example:
`GET /warden/search-staff?name=chan`

Success response:
```json
{
  "staffs": [
    {
      "id": 17,
      "name": "Security Chandra",
      "email": "security@student.com",
      "role": "security"
    }
  ]
}
```

### POST /warden/reset-staff-password/:id
Set a new custom password for a security staff account.

Request body:
```json
{
  "newPassword": "newSecurity@123"
}
```

Success response:
```json
{
  "message": "Security password updated successfully"
}
```

### DELETE /warden/remove-staff/:id
Remove a security staff account.

Success response:
```json
{
  "message": "Security staff removed successfully"
}
```

### PUT /warden/approve/:id
Approve warden-pending outing request.

### PUT /warden/reject/:id
Reject warden-pending outing request.

---

## Dashboard Endpoints

### GET /dashboard/warden
Get warden dashboard data:

- today outings
- today going homes
- daily summary counts
- pending lists

Sample response shape:
```json
{
  "today_outings": [],
  "today_going_homes": [],
  "daily_summary": {
    "total_students_registered": 0,
    "students_outside_hostel": 0,
    "students_in_home_today": 0,
    "date": "2026-03-18"
  }
}
```

### GET /dashboard/warden/past-summaries?date=YYYY-MM-DD
Get past outing and going-home summaries for selected date.

Sample response:
```json
{
  "past_outings": [],
  "past_going_homes": []
}
```

---

## Security Endpoints

### PUT /security/exit/:id
Mark student as left hostel.

### PUT /security/return/:id
Mark student as returned.

### GET /security/today
Get today's approved/left list for security operations.

---

## User Endpoint

### GET /users/me
Get current authenticated user info from token.

Sample response:
```json
{
  "id": 12,
  "role": "warden"
}
```

---

## Common Error Responses

```json
{ "message": "Required fields missing" }
```

```json
{ "message": "Invalid token" }
```

```json
{ "message": "Access denied" }
```

```json
{ "message": "Server error" }
```
