# OTP System - Quick Integration Guide

## 🚀 Quick Start (5 Steps)

### Step 1: Update Your .env File
Add the following to your backend `.env` file:

```env
# Email Configuration (Required for OTP)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# JWT Configuration
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRY=7d

# Optional: SMS Configuration
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

**📧 Gmail Setup**:
1. Enable 2-Factor Authentication on your Google Account
2. Generate an App Password at: https://myaccount.google.com/apppasswords
3. Use the generated password in `EMAIL_PASSWORD`

### Step 2: Update Frontend App.jsx or Routes File
Add these imports and routes:

```jsx
import RegisterOTP from "./pages/RegisterOTP";
import OTPVerification from "./pages/OTPVerification";
import OTPPasswordSetup from "./pages/OTPPasswordSetup";

// Inside your Routes component:
<Route path="/register-otp" element={<RegisterOTP />} />
<Route path="/otp-verify" element={<OTPVerification />} />
<Route path="/otp-password" element={<OTPPasswordSetup />} />
```

### Step 3: Replace Your Registration Link
Update any registration links to point to the new OTP registration:

```jsx
// Old: Navigate to old register page
// New: Navigate to new OTP register
navigate("/register-otp");
// or
<Link to="/register-otp">Create Account</Link>
```

### Step 4: Update Your Login (Optional 2FA)
To enable 2FA on login, pass `otpRequired: true`:

```jsx
// In your login component
const response = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email,
    password,
    otpRequired: true // Add this to enable 2FA
  })
});
```

### Step 5: Test the Flow
1. Start backend: `npm start` (in backend folder)
2. Start frontend: `npm run dev` (in frontend folder)
3. Navigate to `/register-otp`
4. Fill in registration form
5. Check your email for OTP
6. Enter OTP and set password
7. Login with your credentials

## ✅ Verification Checklist

- [ ] `.env` file updated with email credentials
- [ ] Routes added to App.jsx
- [ ] Backend server started
- [ ] Frontend running
- [ ] Can access `/register-otp` page
- [ ] Can send OTP (check email)
- [ ] Can verify OTP
- [ ] Can create account and login

## 🔧 Customization Options

### Change OTP Length
Edit `backend/services/otpService.js`:
```javascript
generateOTP(8) // Change from 6 to 8 digits
```

### Change OTP Expiry Time
Edit `backend/models/otp.js`:
```javascript
this.expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes instead of 10
```

### Change Max Attempts
Edit `backend/models/otp.js`:
```javascript
attempts: { type: Number, default: 0, max: 10 } // Allow 10 attempts
```

### Customize Email Template
Edit `backend/services/otpService.js`, search for `htmlContent = `

### Change Password Requirements
Edit `frontend/src/pages/OTPPasswordSetup.jsx`, search for `validatePassword()`

## 📊 API Reference Quick Guide

### For Frontend Developers

**Send OTP:**
```
POST /api/otp/send
{ email, phone, purpose, type }
```

**Verify OTP:**
```
POST /api/otp/verify
{ email, phone, otp, purpose }
```

**Register & Create Account:**
```
POST /api/auth/verify-otp-signup
{ email, name, phone, password, otp }
```

**Login:**
```
POST /api/auth/login
{ email, password, otpRequired }
```

**Verify Login OTP (2FA):**
```
POST /api/auth/verify-otp-login
{ email, otp }
```

## 🐛 Common Issues & Solutions

### Issue: "Failed to send OTP"
**Solution**: Check email configuration
- Gmail: Use App Password, not regular password
- Check .env file is loaded
- Verify EMAIL_USER and EMAIL_PASSWORD

### Issue: "Cannot GET /register-otp"
**Solution**: Add route to App.jsx
- Import the component
- Add `<Route path="/register-otp" element={<RegisterOTP />} />`

### Issue: "OTP expired"
**Solution**: User took too long
- Default expiry is 10 minutes
- Increase if needed in otp.js model
- Resend OTP button is available

### Issue: "Too many attempts"
**Solution**: User exceeded max attempts
- Wait for 10 minutes (OTP auto-deletes)
- Or implement cooldown
- Max attempts is 5 by default

## 📱 Mobile Responsive
All components are fully responsive:
- OTP input adapts to screen size
- Touch-friendly buttons (min 44px)
- Readable text on all devices

## 🔐 Security Features Implemented
✅ Bcrypt password hashing
✅ JWT authentication
✅ OTP expiration (10 min)
✅ Attempt limiting (5 max)
✅ Metadata tracking (IP, User Agent)
✅ CORS protection
✅ Rate limiting ready (add express-rate-limit)

## 📞 Need Help?

1. Check `OTP_SYSTEM_GUIDE.md` for detailed documentation
2. Review error messages in browser console
3. Check backend logs for API errors
4. Verify MongoDB connection
5. Test with Postman for API endpoints

## 🎉 You're Done!
Your OTP system is now integrated. Users can:
- Register with OTP verification
- Set strong passwords
- Login with 2FA (optional)
- Reset passwords via OTP
- Enjoy secure authentication

---

**ProTip**: Start with basic registration first, then add 2FA and password reset features later as needed.
