# OTP System Implementation Guide

## Overview
A comprehensive One-Time Password (OTP) system has been implemented in your ecommerce project, providing secure user authentication, verification, and 2FA capabilities.

## ✅ What's Been Implemented

### Backend Features
1. **OTP Model** (`backend/models/otp.js`)
   - Database schema for storing OTP records
   - Auto-expiration after 10 minutes
   - Attempt tracking (max 5 attempts)
   - Multiple OTP types and purposes

2. **OTP Service** (`backend/services/otpService.js`)
   - Generate random OTPs
   - Send OTP via Email
   - Verify OTP with attempt limiting
   - Resend OTP functionality
   - Auto-cleanup of expired OTPs
   - Support for SMS (requires Twilio setup)

3. **OTP Routes** (`backend/routes/emailOTP.js`)
   - `POST /api/otp/send` - Send OTP
   - `POST /api/otp/verify` - Verify OTP
   - `POST /api/otp/resend` - Resend OTP

4. **Authentication Routes** (`backend/routes/auth.js`)
   - `POST /api/auth/register` - Register with OTP
   - `POST /api/auth/verify-otp-signup` - Verify signup OTP
   - `POST /api/auth/login` - Login (with optional 2FA)
   - `POST /api/auth/verify-otp-login` - Verify login OTP for 2FA
   - `POST /api/auth/forgot-password` - Request password reset OTP
   - `POST /api/auth/reset-password` - Reset password using OTP
   - `GET /api/auth/profile` - Get user profile

### Frontend Components
1. **OTPInput Component** (`frontend/src/components/OTPInput.jsx`)
   - 6-digit OTP input with auto-focus
   - Timer display (10 minutes)
   - Paste support
   - Keyboard navigation (arrow keys, backspace)

2. **OTPVerification Page** (`frontend/src/pages/OTPVerification.jsx`)
   - OTP input interface
   - Auto-navigation based on purpose
   - Resend OTP functionality
   - Error handling

3. **RegisterOTP Page** (`frontend/src/pages/RegisterOTP.jsx`)
   - User registration form
   - Step indicator (3 steps)
   - Integration with OTP system
   - Terms and conditions acceptance

4. **OTPPasswordSetup Page** (`frontend/src/pages/OTPPasswordSetup.jsx`)
   - Password creation after OTP verification
   - Password strength indicator
   - Password requirements validation
   - Confirm password matching

### Styling
- `frontend/src/styles/OTPInput.css` - Input component styles
- `frontend/src/styles/OTPVerification.css` - Verification page styles
- `frontend/src/styles/RegisterOTP.css` - Registration page styles
- `frontend/src/styles/OTPPasswordSetup.css` - Password setup page styles

## 🚀 Setup Instructions

### 1. Environment Variables
Add the following to your `.env` file:

```env
# Email Configuration (required for OTP)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRY=7d
MONGO_URI=your-mongodb-uri

# Optional: SMS Configuration (for Twilio)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-phone
```

### 2. Frontend Route Setup
Update your `App.jsx` or routing configuration to include:

```jsx
import RegisterOTP from "./pages/RegisterOTP";
import OTPVerification from "./pages/OTPVerification";
import OTPPasswordSetup from "./pages/OTPPasswordSetup";

// Add routes
<Route path="/register-otp" element={<RegisterOTP />} />
<Route path="/otp-verify" element={<OTPVerification />} />
<Route path="/otp-password" element={<OTPPasswordSetup />} />
```

### 3. Backend Integration
The server.js already includes:
- Import of auth routes
- Mount of routes at `/api/auth` and `/api/otp`

## 📋 OTP Types & Purposes

### OTP Types
- **email** - Send via email
- **sms** - Send via SMS (requires Twilio)

### OTP Purposes
- **signup** - User registration
- **login** or **2fa** - Two-factor authentication
- **password-reset** - Password reset verification
- **email-verification** - Email verification
- **phone-verification** - Phone verification

## 🔄 Registration Flow

```
1. User enters name, email, phone
   ↓
2. System sends OTP to email
   ↓
3. User verifies OTP (6 digits)
   ↓
4. User sets strong password
   ↓
5. Account created & logged in
```

## 🔐 Login with 2FA Flow

```
1. User enters email & password
   ↓
2. Password verified
   ↓
3. If 2FA enabled: Send OTP
   ↓
4. User verifies OTP
   ↓
5. Login successful
```

## 🔑 Password Reset Flow

```
1. User requests password reset
   ↓
2. OTP sent to email
   ↓
3. User verifies OTP
   ↓
4. User enters new password
   ↓
5. Password updated
```

## 🛠️ API Endpoints

### Send OTP
```
POST /api/otp/send
Body: {
  email: "user@example.com",
  phone: "+1234567890",
  purpose: "signup",
  type: "email"
}
Response: {
  success: true,
  message: "OTP sent successfully",
  expiresIn: 600
}
```

### Verify OTP
```
POST /api/otp/verify
Body: {
  email: "user@example.com",
  otp: "123456",
  purpose: "signup"
}
Response: {
  success: true,
  message: "OTP verified successfully",
  otpRecord: { ... }
}
```

### Register with OTP
```
POST /api/auth/register
Body: {
  name: "John Doe",
  email: "john@example.com",
  phone: "+1234567890"
}
Response: {
  success: true,
  message: "OTP sent to your email"
}
```

### Verify OTP & Create Account
```
POST /api/auth/verify-otp-signup
Body: {
  email: "john@example.com",
  name: "John Doe",
  phone: "+1234567890",
  password: "SecurePass123!",
  otp: "123456"
}
Response: {
  success: true,
  token: "jwt-token",
  user: { ... }
}
```

### Login
```
POST /api/auth/login
Body: {
  email: "john@example.com",
  password: "SecurePass123!"
}
Response: {
  success: true,
  token: "jwt-token",
  user: { ... }
  // OR if 2FA enabled:
  requires2FA: true,
  message: "OTP sent for 2FA verification"
}
```

### Verify Login OTP (2FA)
```
POST /api/auth/verify-otp-login
Body: {
  email: "john@example.com",
  otp: "123456"
}
Response: {
  success: true,
  token: "jwt-token",
  user: { ... }
}
```

## 🔒 Security Features

1. **OTP Expiration**: 10 minutes
2. **Attempt Limiting**: Max 5 attempts before blocking
3. **Secure Password**: Minimum 8 characters with uppercase, lowercase, numbers, and special characters
4. **JWT Tokens**: Secure token-based authentication
5. **HTTPS Recommended**: Always use HTTPS in production
6. **Metadata Tracking**: IP address and User Agent stored for security audit
7. **Rate Limiting**: Should be implemented on frontend/backend

## 📱 Email Template Features

- Professional HTML email design
- Gradient header with branding
- Large, readable OTP display
- Expiration time clearly shown
- Security reminder
- Mobile-responsive

## 🧪 Testing the OTP System

### Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "test@example.com",
    "phone": "+1234567890"
  }'
```

### Test OTP Verification
```bash
curl -X POST http://localhost:5000/api/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456",
    "purpose": "signup"
  }'
```

## ⚙️ Configuration Options

### OTP Expiry Time
Located in `backend/models/otp.js`:
```javascript
const expiryTime = 10 * 60 * 1000; // 10 minutes
```

### OTP Length
Default: 6 digits (can be changed in `otpService.js`):
```javascript
generateOTP(length = 6)
```

### Max Attempts
Default: 5 attempts (can be changed in OTP model):
```javascript
attempts: { type: Number, default: 0, max: 5 }
```

## 🐛 Troubleshooting

### OTP Not Sending
1. Check email configuration in `.env`
2. Verify Gmail app password (if using Gmail)
3. Check MongoDB connection
4. Check server logs for errors

### OTP Verification Fails
1. Ensure OTP matches exactly (case-sensitive)
2. Check if OTP has expired
3. Verify email/phone matches
4. Check attempt count

### Password Not Accepted
1. Ensure password meets all requirements
2. Check for typos
3. Verify confirm password matches

## 📚 Additional Features to Implement

1. **SMS OTP** - Set up Twilio integration
2. **Authenticator App** - TOTP support
3. **Rate Limiting** - Implement express-rate-limit
4. **Email Resend Delay** - Add cooldown between resends
5. **OTP History** - Track all OTP requests
6. **Backup Codes** - For 2FA recovery
7. **IP Whitelist** - For known devices

## 📞 Support

For issues or questions, refer to:
- Backend logs: `backend/server.js`
- OTP service: `backend/services/otpService.js`
- Frontend console for client-side errors

## ✨ Next Steps

1. Test the complete flow from registration to login
2. Set up email credentials in `.env`
3. Update routing in your App.jsx
4. Customize email templates if needed
5. Implement SMS (optional)
6. Add rate limiting
7. Set up monitoring and alerts

---

**Version**: 1.0.0
**Last Updated**: 2024
