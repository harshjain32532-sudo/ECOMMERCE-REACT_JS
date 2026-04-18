# 🚀 Vercel Deployment Guide - E-Commerce React.js

This guide will help you deploy your full-stack e-commerce application to Vercel.

## ⚠️ Important Note
Vercel is primarily designed for frontends. For the best experience with your Express backend, we have two options:

### Option A: Vercel Frontend + Railway Backend (✅ RECOMMENDED)
- **Pros**: Easy setup, supports full Node.js/Express server, better performance
- **Cons**: Two platforms to manage

### Option B: Vercel Frontend + Vercel Serverless Backend Functions
- **Pros**: Single platform, serverless functions
- **Cons**: More complex setup, limited to 12-second execution time per request

**We recommend Option A for this project.** Follow the steps below.

---

## 📋 Prerequisites

1. **GitHub Account** ✅ Done - `harshjain32532-sudo/ECOMMERCE-REACT_JS`
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Railway Account** - Sign up at [railway.app](https://railway.app)
4. **MongoDB Atlas** - Already connected
5. **Environment Variables Ready** - We'll set these up

---

## 🔧 Step 1: Prepare Frontend for Vercel

### 1.1 Update Frontend Environment Configuration

Create `frontend/.env.production`:
```bash
VITE_API_URL=https://ecommerce-backend-production.up.railway.app
```

Update `frontend/src/api.js` to use environment variable:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
});
```

### 1.2 Update Vite Configuration

Ensure `frontend/vite.config.js` has proper configuration:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
```

---

## 🚀 Step 2: Deploy Backend to Railway

Railway provides free tier with generous limits and supports full Node.js servers.

### 2.1 Create Railway Account & Project

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose `harshjain32532-sudo/ECOMMERCE-REACT_JS`

### 2.2 Configure Backend Service

1. Click "Add Service"
2. Select "GitHub Repo" 
3. Configure the Root Directory as `backend`

### 2.3 Set Environment Variables on Railway

In Railway Dashboard → Environment → Raw Editor, add:

```
MONGO_URI=mongodb+srv://username:password@cluster.xxx.mongodb.net/ecommerce
ADMIN_EMAIL=admin@store.local
ADMIN_PASSWORD=Admin123!
JWT_SECRET=your_super_secret_jwt_key_change_this
NODE_ENV=production
PORT=5000
```

**Get your MongoDB URI:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Connect"
3. Choose "Connect your application"
4. Copy your connection string
5. Replace `<password>` and `<database>` with your actual values

### 2.4 Deploy

1. Click "Deploy"
2. Wait for deployment (2-3 minutes)
3. Copy the generated URL (e.g., `https://ecommerce-backend-production.up.railway.app`)

---

## 🌐 Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub account

### 3.2 Import Project

1. Click "New Project"
2. Select "Import Git Repository"
3. Search for `ECOMMERCE-REACT_JS`
4. Click "Import"

### 3.3 Configure Project Settings

**Framework**: React  
**Root Directory**: frontend

### 3.4 Set Environment Variables

1. **Project Settings** → **Environment Variables**
2. Add the following:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://ecommerce-backend-production.up.railway.app` |

### 3.5 Build Settings

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3.6 Deploy

1. Click "Deploy"
2. Wait for deployment (2-3 minutes)
3. Your frontend will be live at a Vercel URL!

---

## 🔐 Step 4: CORS Configuration

Update Backend `server.js` CORS whitelist with Vercel frontend URL:

```javascript
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://your-vercel-project.vercel.app", // Add this
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];
```

Then push to GitHub:
```bash
git add .
git commit -m "Update CORS for Vercel deployment"
git push origin main
```

Railway will auto-redeploy!

---

## 🧪 Step 5: Test Your Deployment

1. Open your Vercel frontend URL
2. Test features:
   - ✅ Search products
   - ✅ Add to cart
   - ✅ Register/Login
   - ✅ Checkout process
   - ✅ Admin functions (if admin)

---

## 📊 Your Deployment URLs

After deployment, you'll have:

| Service | URL | Status |
|---------|-----|--------|
| Frontend | `https://your-project.vercel.app` | Vercel |
| Backend | `https://ecommerce-backend-production.up.railway.app` | Railway |
| Database | MongoDB Atlas | Cloud |

---

## 🆘 Troubleshooting

### Frontend won't load?
- Check VITE_API_URL is correct
- Check browser console for errors
- Verify backend is running on Railway

### API calls failing?
- Check backend logs on Railway
- Verify CORS settings include Vercel URL
- Check environment variables are set

### Database connection error?
- Verify MongoDB URI is correct
- Check credentials are encoded properly
- Ensure IP whitelist includes Railway servers (0.0.0.0/0)

### Build errors?
- Check `npm run build` works locally
- Verify all dependencies are listed in package.json
- Check for hardcoded paths

---

## 🔄 CI/CD Pipeline

Both Vercel and Railway automatically redeploy when you push to GitHub!

Deployment Flow:
```
Push to main branch
    ↓
GitHub detects change
    ↓
Vercel & Railway receive webhook
    ↓
Auto-build and deploy
    ↓
Live updates! ✅
```

---

## 💡 Next Steps

1. **Monitor Performance**
   - Vercel Analytics: Dashboard → Analytics
   - Railway Logs: Project → Deployments

2. **Set Custom Domain**
   - Add domain in Vercel settings
   - Add domain in Railway settings (optional)

3. **Enable HTTPS**
   - Automatically enabled by both platforms

4. **Scale if Needed**
   - Upgrade Railway plan for more resources
   - Upgrade Vercel plan for more builds

---

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **MongoDB Atlas**: https://docs.mongodb.com/atlas

---

**Your deployment is complete! Your e-commerce site is now live on the internet! 🎉**
