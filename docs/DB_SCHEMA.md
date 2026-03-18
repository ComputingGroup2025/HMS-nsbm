# HMS-NSBM Database Schema

This document summarizes the PostgreSQL tables used by the Hostel Management System, based on the current backend implementation.

## Overview

Main entities:

- `users` - login accounts (student, warden, security, legacy)
- `students` - student profile records
- `parents` - parent profile and parent login records
- `outing_requests` - all outing/home requests and status flow
- `outing_history` - timeline of state changes for each request

---

## Recommended Table Definitions

## 1) users

Purpose: Auth identity used in JWT and role-based access.

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) UNIQUE,
  password TEXT NOT NULL,
  role VARCHAR(30) NOT NULL CHECK (role IN ('student', 'parent', 'warden', 'security')),
  student_id VARCHAR(40),
  parent_password TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

Notes:
- For student accounts, `student_id` maps to the external student code (e.g., `STU001`, `37380`).
- Password values are hashed using `bcrypt`.

---

## 2) students

Purpose: Student profile/master data.

```sql
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(160) NOT NULL,
  student_id VARCHAR(40) UNIQUE NOT NULL,
  room_number VARCHAR(40),
  email VARCHAR(160) UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

Notes:
- `student_id` is the business identifier shown in UI.
- `password` is hashed.

---

## 3) parents

Purpose: Parent account/profile linked to one student ID.

```sql
CREATE TABLE IF NOT EXISTS parents (
  id SERIAL PRIMARY KEY,
  parent_name VARCHAR(160) NOT NULL,
  email VARCHAR(160),
  student_name VARCHAR(160),
  student_id VARCHAR(40) NOT NULL,
  phone_number VARCHAR(40),
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

Notes:
- Parent login flow uses `student_id + password (+device_id in API)`.

---

## 4) outing_requests

Purpose: Stores outing requests from students (both outing and home-going).

```sql
CREATE TABLE IF NOT EXISTS outing_requests (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL,
  room_number VARCHAR(40),
  destination VARCHAR(200),
  type VARCHAR(20) NOT NULL CHECK (type IN ('outing', 'home')),
  leaving_date DATE NOT NULL,
  leaving_time TIME NOT NULL,
  emergency BOOLEAN DEFAULT FALSE,
  vehicle_number VARCHAR(80),
  status VARCHAR(40) NOT NULL DEFAULT 'pending_parent' CHECK (
    status IN (
      'pending_parent',
      'pending_warden',
      'approved',
      'rejected_by_parent',
      'rejected_by_warden',
      'student_left',
      'student_returned'
    )
  ),
  left_time TIMESTAMP,
  arrival_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_outing_student_user FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);
```

Notes:
- `student_id` references `users.id` (internal ID), not the external student code.
- Daily dashboards filter by `leaving_date = CURRENT_DATE`.

---

## 5) outing_history

Purpose: Audit timeline for each request state change.

```sql
CREATE TABLE IF NOT EXISTS outing_history (
  id SERIAL PRIMARY KEY,
  outing_id INTEGER NOT NULL,
  action VARCHAR(60) NOT NULL,
  performed_by INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_history_outing FOREIGN KEY (outing_id) REFERENCES outing_requests(id) ON DELETE CASCADE
);
```

Typical actions:
- `created`
- `parent_approved`
- `parent_rejected`
- `warden_approved`
- `warden_rejected`
- `student_left`
- `student_returned`

---

## Index Suggestions

```sql
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_parents_student_id ON parents(student_id);
CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id);
CREATE INDEX IF NOT EXISTS idx_outing_status ON outing_requests(status);
CREATE INDEX IF NOT EXISTS idx_outing_leaving_date ON outing_requests(leaving_date);
CREATE INDEX IF NOT EXISTS idx_outing_student_id ON outing_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_history_outing_id ON outing_history(outing_id);
```

---

## Data Integrity Rules (Current App Behavior)

- Student registration writes to both `students` and `users` (`role='student'`).
- Removing a student from warden dashboard deletes linked:
  - `outing_history` (for that student’s outings)
  - `outing_requests`
  - `users` student row
  - `parents` linked by `student_id`
  - `students` row
- Password reset from warden search updates:
  - `students.password`
  - `users.password` (student role)
  - `parents.password` (if parent exists)
- Security password reset from warden Search Staff updates:
  - `users.password` where `role='security'`
- Removing security staff from warden Search Staff:
  - sets `outing_history.performed_by` to `NULL` for that security user
  - deletes the matching `users` row where `role='security'`

---

## Optional Seed Snippet

```sql
INSERT INTO users (name, email, password, role, student_id)
VALUES ('Warden User', 'warden@hostel.com', '$2b$10$examplehashed', 'warden', NULL);
```

Use API flows for student/parent creation to keep `students` and `users` synchronized.
