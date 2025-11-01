# Synapse Feature Verification Guide

This guide provides step-by-step instructions to test the backend features of the Synapse application (Weeks 1-4) using `curl` (specifically, `Invoke-WebRequest` in Windows PowerShell).

**Prerequisites:**
*   The backend server is running (`npm run dev` in the `backend` directory).
*   You have a tool to view the server logs, as some actions (like email verification) will output links to the console.
*   Replace placeholder values like `your-email@thapar.edu`, `your-password`, `<access-token>`, and `<group-id>` with actual data.

---

## Part 1: Authentication

### 1. Register a New User
Create a new user. Note that the email **must** end in `@thapar.edu`.

```powershell
Invoke-WebRequest -Uri "http://localhost:4000/api/auth/register" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email": "your-email@thapar.edu", "password": "your-password", "name": "Test User"}'
```
**Expected Response:** A success message indicating that a verification email has been "sent."

### 2. Verify Your Email
Check the backend server console. You will find a log with a clickable link to verify the email. Copy the entire URL and paste it into your browser or use `Invoke-WebRequest`.

```powershell
# Example URL from logs: http://localhost:4000/api/auth/verify-email?token=...
Invoke-WebRequest -Uri "PASTE_THE_VERIFICATION_URL_HERE"
```
**Expected Response:** A success message confirming your email has been verified.

### 3. Log In to Your Account
Log in with your verified credentials to get an access token and a refresh token.

```powershell
$loginResponse = Invoke-WebRequest -Uri "http://localhost:4000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email": "your-email@thapar.edu", "password": "your-password"}'
$loginBody = $loginResponse.Content | ConvertFrom-Json
$accessToken = $loginBody.accessToken
$refreshToken = $loginBody.refreshToken

Write-Host "Access Token: $accessToken"
Write-Host "Refresh Token: $refreshToken"
```
**Expected Response:** The command will store and print your `accessToken` and `refreshToken`. You will need the access token for authenticated requests.

### 4. Refresh Access Token
Use your refresh token to get a new access token.

```powershell
Invoke-WebRequest -Uri "http://localhost:4000/api/auth/refresh-token" -Method POST -Headers @{"Content-Type"="application/json"} -Body ('{"refreshToken": "' + $refreshToken + '"}')
```
**Expected Response:** A JSON object containing a new `accessToken`.

### 5. Forgot Password
This endpoint simulates sending a password reset link.

```powershell
Invoke-WebRequest -Uri "http://localhost:4000/api/auth/forgot-password" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email": "your-email@thapar.edu"}'
```
**Expected Response:** Check the server logs for a password reset link.

### 6. Reset Password
Use the token from the reset link to set a new password.

```powershell
# First, get the token from the URL in the server logs
$resetToken = "PASTE_TOKEN_FROM_URL_HERE"
Invoke-WebRequest -Uri "http://localhost:4000/api/auth/reset-password/$resetToken" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"password": "your-new-password"}'
```
**Expected Response:** A success message.

### 7. Log Out
Log out of the current session. This will invalidate the refresh token.

```powershell
Invoke-WebRequest -Uri "http://localhost:4000/api/auth/logout" -Method POST -Headers @{"Content-Type"="application/json"} -Body ('{"refreshToken": "' + $refreshToken + '"}')
```
**Expected Response:** A success message.

---

## Part 2: Profile Management

### 1. Get User Profile
Fetch the profile of the currently logged-in user. This requires a valid access token.

```powershell
Invoke-WebRequest -Uri "http://localhost:4000/api/profile" -Method GET -Headers @{"Authorization"="Bearer $accessToken"}
```
**Expected Response:** A JSON object with your user details (email, name, etc.), excluding the password.

---

## Part 3: Subscription Groups

### 1. Create a Subscription Group
Create a new subscription group. This requires authentication.

```powershell
$groupBody = @{
  name = "Netflix Premium"
  description = "Sharing a Netflix Premium plan"
  category = "Entertainment"
  totalPrice = 19.99
  maxMembers = 4
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:4000/api/subscription-groups" -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $accessToken"} -Body $groupBody
```
**Expected Response:** A JSON object containing the details of the newly created group.

### 2. Get All Subscription Groups
Fetch a list of all available subscription groups.

```powershell
$groupsResponse = Invoke-WebRequest -Uri "http://localhost:4000/api/subscription-groups" -Method GET
$groups = $groupsResponse.Content | ConvertFrom-Json
$groupId = $groups[0].id # Store the ID of the first group for the next step

Write-Host "First group ID: $groupId"
$groups
```
**Expected Response:** An array of subscription group objects. The ID of the first group is stored for the next command.

### 3. Get a Specific Subscription Group
Fetch details for a single subscription group using its ID.

```powershell
Invoke-WebRequest -Uri "http://localhost:4000/api/subscription-groups/$groupId" -Method GET
```
**Expected Response:** A JSON object with the details of the specified group.
