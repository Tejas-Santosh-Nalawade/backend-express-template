# 🚀 Complete Postman Testing Flow - Backend Template

## 📋 Table of Contents
1. [Environment Setup](#environment-setup)
2. [Complete Authentication Flow](#complete-authentication-flow)
3. [Password Reset Flow](#password-reset-flow)
4. [Protected Routes](#protected-routes)
5. [Error Testing Scenarios](#error-testing-scenarios)
6. [Troubleshooting](#troubleshooting)

---

## 🔧 Environment Setup

### Step 1: Create Postman Environment

Click on **Environments** → **Create Environment** → Name it "Backend Template"

Add these variables:

| Variable | Initial Value | Current Value |
|----------|--------------|---------------|
| `baseUrl` | `http://localhost:8000` | `http://localhost:8000` |
| `accessToken` | (leave empty) | (auto-filled after login) |
| `refreshToken` | (leave empty) | (auto-filled after login) |

### Step 2: Server Requirements
- MongoDB must be running
- Server running on port 8000
- Mailtrap account configured in `.env`

---

## 🔐 Complete Authentication Flow

### 1️⃣ REGISTER NEW USER

**Endpoint:** `POST {{baseUrl}}/api/v1/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "john.doe@example.com",
  "username": "johndoe",
  "password": "password123"
}
```

**Expected Response: 201 Created**
```json
{
  "statusCode": 201,
  "data": {
    "user": {
      "_id": "67195f3c9d5e8a001234abcd",
      "email": "john.doe@example.com",
      "username": "johndoe",
      "isEmailVerified": false,
      "createdAt": "2025-10-24T10:30:00.000Z"
    }
  },
  "message": "User registered successfully. Please verify your email to activate your account.",
  "success": true
}
```

**✅ What Happens:**
- User created with `isEmailVerified: false`
- Verification email sent to Mailtrap
- Password hashed using bcrypt
- Cannot login until email is verified

---

### 2️⃣ VERIFY EMAIL

**Step A: Get Token from Mailtrap**
1. Open Mailtrap inbox
2. Find the verification email
3. Copy the token from URL: `http://localhost:8000/api/v1/auth/verify-email/XXXXXXXXXX`
4. Copy only the `XXXXXXXXXX` part

**Endpoint:** `GET {{baseUrl}}/api/v1/auth/verify-email/PASTE_TOKEN_HERE`

**Headers:** None needed

**Expected Response: 200 OK**
```json
{
  "statusCode": 200,
  "data": {
    "isEmailVerified": true
  },
  "message": "Email verified successfully",
  "success": true
}
```

**✅ What Happens:**
- `isEmailVerified` set to `true`
- Verification token cleared from database
- User can now login

---

### 3️⃣ LOGIN

**Endpoint:** `POST {{baseUrl}}/api/v1/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Expected Response: 200 OK**
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "67195f3c9d5e8a001234abcd",
      "email": "john.doe@example.com",
      "username": "johndoe",
      "isEmailVerified": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzE5NWYzYzlkNWU4YTAwMTIzNGFiY2QiLCJlbWFpbCI6ImpvaG4uZG9lQGV4YW1wbGUuY29tIiwidXNlcm5hbWUiOiJqb2huZG9lIiwiaWF0IjoxNzI5NzY0NjAwLCJleHAiOjE3Mjk3NjU1MDB9.ABC123...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzE5NWYzYzlkNWU4YTAwMTIzNGFiY2QiLCJpYXQiOjE3Mjk3NjQ2MDAsImV4cCI6MTczMDM2OTQwMH0.XYZ789..."
  },
  "message": "User logged in successfully",
  "success": true
}
```

**🔴 IMPORTANT: Add this to Tests tab (to auto-save tokens):**
```javascript
var jsonData = pm.response.json();
if (jsonData.data && jsonData.data.accessToken) {
    pm.environment.set("accessToken", jsonData.data.accessToken);
    pm.environment.set("refreshToken", jsonData.data.refreshToken);
    console.log("✅ Tokens saved to environment");
}
```

**✅ What Happens:**
- JWT access token generated (expires in 1 day)
- JWT refresh token generated (expires in 10 days)
- Tokens stored in HttpOnly cookies
- Tokens returned in response body

---

### 4️⃣ GET CURRENT USER (Protected)

**Endpoint:** `GET {{baseUrl}}/api/v1/auth/current-user`

**Headers:**
```
Authorization: Bearer {{accessToken}}
```

**Expected Response: 200 OK**
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "67195f3c9d5e8a001234abcd",
      "email": "john.doe@example.com",
      "username": "johndoe",
      "isEmailVerified": true,
      "createdAt": "2025-10-24T10:30:00.000Z",
      "updatedAt": "2025-10-24T10:35:00.000Z"
    }
  },
  "message": "User fetched successfully",
  "success": true
}
```

**✅ What Happens:**
- Middleware verifies JWT token
- Returns authenticated user data
- No sensitive data (password, tokens) included

---

### 5️⃣ REFRESH ACCESS TOKEN

**⚠️ CRITICAL: Only send refreshToken - DO NOT send email or password!**

**When to use:** When access token expires (after 1 day)

**Endpoint:** `POST {{baseUrl}}/api/v1/auth/refresh-token`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "refreshToken": "PASTE_ACTUAL_TOKEN_HERE"
}
```

**❌ WRONG - Don't do this:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123",
  "refreshToken": "token_here"
}
```

**✅ CORRECT - Only send this:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzE5NWYzYzlkNWU4YTAwMTIzNGFiY2QiLCJpYXQiOjE3Mjk3NjQ2MDAsImV4cCI6MTczMDM2OTQwMH0.XYZ789..."
}
```

**How to get the refresh token:**
1. After login, check the response body
2. Copy the ENTIRE `refreshToken` value
3. Paste it in the body (no email, no password, ONLY refreshToken)

**Expected Response: 200 OK**
```json
{
  "statusCode": 200,
  "data": {
    "accessToken": "NEW_ACCESS_TOKEN_HERE",
    "refreshToken": "NEW_REFRESH_TOKEN_HERE"
  },
  "message": "Access token refreshed successfully",
  "success": true
}
```

**🔴 Add this to Tests tab:**
```javascript
var jsonData = pm.response.json();
if (jsonData.data && jsonData.data.accessToken) {
    pm.environment.set("accessToken", jsonData.data.accessToken);
    pm.environment.set("refreshToken", jsonData.data.refreshToken);
    console.log("✅ New tokens saved");
}
```

**✅ What Happens:**
- Verifies old refresh token
- Generates NEW access + refresh token pair
- OLD refresh token becomes INVALID
- Updates database with new refresh token

**❌ Common Mistakes:**
1. Using the refresh token twice (only works once per token)
2. Logging in again (invalidates previous refresh token)
3. Copy/paste error with extra spaces

---

### 6️⃣ CHANGE PASSWORD (Protected)

**Endpoint:** `POST {{baseUrl}}/api/v1/auth/change-password`

**Headers:**
```
Authorization: Bearer {{accessToken}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "oldPassword": "password123",
  "newPassword": "newpassword456"
}
```

**Expected Response: 200 OK**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Password changed successfully",
  "success": true
}
```

**✅ What Happens:**
- Verifies old password matches
- Hashes and saves new password
- User remains logged in (tokens still valid)

---

### 7️⃣ LOGOUT (Protected)

**Endpoint:** `POST {{baseUrl}}/api/v1/auth/logout`

**Headers:**
```
Authorization: Bearer {{accessToken}}
```

**Expected Response: 200 OK**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "User logged out successfully",
  "success": true
}
```

**✅ What Happens:**
- Refresh token cleared from database
- Cookies cleared
- Access token still valid until expiry (but can't refresh)
- Must login again to get new tokens

---

## 🔄 Password Reset Flow

### 8️⃣ FORGOT PASSWORD REQUEST

**Endpoint:** `POST {{baseUrl}}/api/v1/auth/forgot-password`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "john.doe@example.com"
}
```

**Expected Response: 200 OK**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Password reset link sent successfully",
  "success": true
}
```

**✅ What Happens:**
- Generates password reset token
- Sends reset email to Mailtrap
- Token valid for 10 minutes

---

### 9️⃣ RESET PASSWORD

**Step A: Get Token from Mailtrap**
1. Open password reset email in Mailtrap
2. Copy the reset token from URL: `http://localhost:3000/reset-password/XXXXXXXXXX`
3. Copy only the `XXXXXXXXXX` part

**Endpoint:** `POST {{baseUrl}}/api/v1/auth/reset-password/PASTE_TOKEN_HERE`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "newPassword": "brandnewpassword789"
}
```

**⚠️ IMPORTANT: Do NOT include "newpassword" field - only "newPassword"**

**Expected Response: 200 OK**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Password reset successfully",
  "success": true
}
```

**✅ What Happens:**
- Validates reset token
- Hashes and saves new password
- Clears reset token from database
- User can now login with new password

**❌ If you get 422 Validation Error:**
- Make sure field is named `newPassword` (camelCase)
- Check for extra spaces or typos
- Password must be at least 6 characters

---

### 🔟 RESEND EMAIL VERIFICATION (Protected)

**Endpoint:** `POST {{baseUrl}}/api/v1/auth/resend-email-verification`

**Headers:**
```
Authorization: Bearer {{accessToken}}
```

**Expected Response: 200 OK**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Email verification link sent successfully",
  "success": true
}
```

**✅ What Happens:**
- Generates new verification token
- Sends new verification email
- Only works if email not already verified

---

## 🧪 Error Testing Scenarios

### Scenario 1: Login Without Email Verification

**Request:**
```json
POST {{baseUrl}}/api/v1/auth/login
{
  "email": "unverified@example.com",
  "password": "password123"
}
```

**Expected Response: 403 Forbidden**
```json
{
  "statusCode": 403,
  "message": "Please verify your email before logging in",
  "success": false,
  "errors": []
}
```

---

### Scenario 2: Access Protected Route Without Token

**Request:**
```
GET {{baseUrl}}/api/v1/auth/current-user
(No Authorization header)
```

**Expected Response: 401 Unauthorized**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "success": false
}
```

---

### Scenario 3: Use Expired/Invalid Refresh Token

**Request:**
```json
POST {{baseUrl}}/api/v1/auth/refresh-token
{
  "refreshToken": "old_or_invalid_token"
}
```

**Expected Response: 401 Unauthorized**
```json
{
  "statusCode": 401,
  "message": "Refresh token is expired or used",
  "success": false
}
```

---

### Scenario 4: Register with Existing Email

**Request:**
```json
POST {{baseUrl}}/api/v1/auth/register
{
  "email": "john.doe@example.com",
  "username": "anothername",
  "password": "password123"
}
```

**Expected Response: 409 Conflict**
```json
{
  "statusCode": 409,
  "message": "User with this email or username already exists",
  "success": false
}
```

---

### Scenario 5: Invalid Credentials

**Request:**
```json
POST {{baseUrl}}/api/v1/auth/login
{
  "email": "john.doe@example.com",
  "password": "wrongpassword"
}
```

**Expected Response: 401 Unauthorized**
```json
{
  "statusCode": 401,
  "message": "Invalid Credentials",
  "success": false
}
```

---

## 🔍 Troubleshooting

### Issue: "Refresh token is expired or used"

**Causes:**
1. ✅ You logged in twice (each login creates a new refresh token)
2. ✅ You used the refresh token twice (it's single-use)
3. ✅ Copy/paste error (extra spaces in token)

**Solution:**
1. Do a fresh login
2. Copy the EXACT refreshToken from response
3. Use it IMMEDIATELY in refresh-token endpoint
4. Don't use the same token again

---

### Issue: 422 Validation Error on Reset Password

**Causes:**
1. ❌ Wrong field name (use `newPassword` not `password`)
2. ❌ Password too short (minimum 6 characters)
3. ❌ Extra whitespace in password field

**Solution:**
```json
{
  "newPassword": "at_least_6_chars"
}
```

---

### Issue: Tokens not saving to environment

**Solution:**
1. Click on the request
2. Go to "Tests" tab
3. Add the script provided in Login/Refresh Token sections
4. Send the request again
5. Check Console (View → Show Postman Console)

---

### Issue: "Please verify your email before logging in"

**Solution:**
1. Check Mailtrap inbox for verification email
2. Copy the verification token
3. Use verify-email endpoint with that token
4. Then try login again

---

## 📊 Complete Testing Flow Summary

```
✅ Step 1: Register → 201
✅ Step 2: Verify Email → 200
✅ Step 3: Login → 200 (tokens saved)
✅ Step 4: Get Current User → 200 (using access token)
✅ Step 5: Change Password → 200 (using access token)
✅ Step 6: Refresh Token → 200 (new tokens saved)
✅ Step 7: Logout → 200 (tokens cleared)
✅ Step 8: Forgot Password → 200 (reset email sent)
✅ Step 9: Reset Password → 200 (password changed)
✅ Step 10: Login with new password → 200 ✅
```

---

## 🎯 Postman Collection Structure

```
📁 BACKEND_TEMPLATE
  📁 auth
    ✉️ 1. POST Register
    ✉️ 2. GET Verify Email
    ✉️ 3. POST Login
    ✉️ 4. GET Current User (Auth)
    ✉️ 5. POST Change Password (Auth)
    ✉️ 6. POST Refresh Token
    ✉️ 7. POST Logout (Auth)
    ✉️ 8. POST Forgot Password
    ✉️ 9. POST Reset Password
    ✉️ 10. POST Resend Verification (Auth)
  📁 healthcheck
    ✉️ GET Health Check
```

---

## 🚦 Status Code Reference

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful operation |
| 201 | Created | User registered |
| 400 | Bad Request | Missing required fields |
| 401 | Unauthorized | Invalid token/credentials |
| 403 | Forbidden | Email not verified |
| 409 | Conflict | User already exists |
| 422 | Unprocessable Entity | Validation failed |
| 489 | Custom | Token expired |
| 500 | Server Error | Database/server issue |

---

## 📝 Notes

1. **Access Token:** Expires in 1 day - use for API calls
2. **Refresh Token:** Expires in 10 days - use to get new access token
3. **Verification Token:** Expires in 10 minutes
4. **Reset Token:** Expires in 10 minutes
5. **All passwords:** Minimum 6 characters
6. **Username:** Minimum 3 characters, lowercase only
7. **Email:** Must be valid email format
8. **Refresh Token Endpoint:** ONLY send `refreshToken` in body (no email, no password)

---

**🎉 All authentication routes are now tested and working!**
