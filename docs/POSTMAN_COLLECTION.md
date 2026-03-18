# HMS-NSBM Postman Testing Guide

This guide explains how to test HMS APIs with Postman quickly.

## 1) Create Environment Variables

In Postman, create an environment with:

- `baseUrl` = `http://localhost:5000/api`
- `studentToken` = (empty initially)
- `parentToken` = (empty initially)
- `wardenToken` = (empty initially)
- `securityToken` = (empty initially)
- `outingId` = (empty initially)
- `studentIdCode` = example `37380`

---

## 2) Authentication Requests

## 2.1 Warden Login

`POST {{baseUrl}}/auth/login`

```json
{
  "email": "warden@hostel.com",
  "password": "yourWardenPassword",
  "role": "warden"
}
```

Tests tab:
```javascript
const json = pm.response.json();
if (json.token) {
  pm.environment.set("wardenToken", json.token);
}
```

## 2.2 Student Login

`POST {{baseUrl}}/auth/login`

```json
{
  "email": "student@example.com",
  "password": "studentPassword",
  "role": "student"
}
```

Save token:
```javascript
const json = pm.response.json();
if (json.token) {
  pm.environment.set("studentToken", json.token);
}
```

## 2.3 Parent Login

`POST {{baseUrl}}/auth/parent-login`

```json
{
  "student_id": "{{studentIdCode}}",
  "parent_password": "parentPassword",
  "device_id": "manual-postman-device"
}
```

Save token:
```javascript
const json = pm.response.json();
if (json.token) {
  pm.environment.set("parentToken", json.token);
}
```

## 2.4 Security Login

`POST {{baseUrl}}/auth/login`

```json
{
  "email": "security@example.com",
  "password": "securityPassword",
  "role": "security"
}
```

Save token:
```javascript
const json = pm.response.json();
if (json.token) {
  pm.environment.set("securityToken", json.token);
}
```

---

## 3) Header Setup for Protected Routes

For protected requests, add:

- Key: `Authorization`
- Value: `Bearer {{wardenToken}}` (or student/parent/security token)

---

## 4) Common API Test Flows

## 4.1 Student creates outing

`POST {{baseUrl}}/outings/create`

Headers:
- `Authorization: Bearer {{studentToken}}`

Body:
```json
{
  "student_id": "{{studentIdCode}}",
  "room_number": "2505",
  "destination": "Colombo",
  "type": "outing",
  "leaving_date": "2026-03-18",
  "leaving_time": "14:00",
  "emergency": false
}
```

## 4.2 Parent list requests

`GET {{baseUrl}}/parent/requests`

Headers:
- `Authorization: Bearer {{parentToken}}`

## 4.3 Parent approve request

`PUT {{baseUrl}}/parent/approve/{{outingId}}`

Headers:
- `Authorization: Bearer {{parentToken}}`

## 4.4 Warden dashboard

`GET {{baseUrl}}/dashboard/warden`

Headers:
- `Authorization: Bearer {{wardenToken}}`

## 4.5 Warden search student/parent

`GET {{baseUrl}}/warden/search/{{studentIdCode}}`

Headers:
- `Authorization: Bearer {{wardenToken}}`

## 4.6 Warden reset student/parent passwords

`POST {{baseUrl}}/warden/reset-passwords/{{studentIdCode}}`

Headers:
- `Authorization: Bearer {{wardenToken}}`

Body:
```json
{
  "studentPassword": "newStudent@123",
  "parentPassword": "newParent@123"
}
```

## 4.7 Warden past summaries by date

`GET {{baseUrl}}/dashboard/warden/past-summaries?date=2026-03-10`

Headers:
- `Authorization: Bearer {{wardenToken}}`

## 4.8 Warden search staff by name

`GET {{baseUrl}}/warden/search-staff?name=chan`

Headers:
- `Authorization: Bearer {{wardenToken}}`

## 4.9 Warden update security password

`POST {{baseUrl}}/warden/reset-staff-password/{{securityUserId}}`

Headers:
- `Authorization: Bearer {{wardenToken}}`

Body:
```json
{
  "newPassword": "newSecurity@123"
}
```

## 4.10 Warden remove security

`DELETE {{baseUrl}}/warden/remove-staff/{{securityUserId}}`

Headers:
- `Authorization: Bearer {{wardenToken}}`

## 4.11 Security today list

`GET {{baseUrl}}/security/today`

Headers:
- `Authorization: Bearer {{securityToken}}`

## 4.12 Security mark exit/return

- `PUT {{baseUrl}}/security/exit/{{outingId}}`
- `PUT {{baseUrl}}/security/return/{{outingId}}`

Headers:
- `Authorization: Bearer {{securityToken}}`

---

## 5) Role Validation Checks

Use these negative tests:

- Try student token on warden route (`/warden/search/...`) → should return `403 Access denied`
- Login with wrong role in `/auth/login` (valid user, wrong role) → should return role mismatch message

---

## 6) Useful Postman Tests Snippet

```javascript
pm.test("Status is success", function () {
  pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});
```

```javascript
pm.test("Has message", function () {
  const json = pm.response.json();
  pm.expect(json).to.have.property("message");
});
```

---

## 7) Troubleshooting

- 401/403 token errors: refresh token by logging in again.
- New route not found: restart backend server.
- CORS/network issues: verify frontend/backend ports and `baseUrl`.

---

For complete endpoint details, refer to [API.md](API.md).
