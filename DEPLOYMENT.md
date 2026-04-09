# 🚀 Deployment Guide

This guide will help you deploy your e-commerce application to production.

## 📋 Prerequisites

- GitHub account
- MongoDB Atlas account (free tier available)
- Deployment platform account (Railway/Render/Vercel)

## 🗄️ Step 1: Set up MongoDB Atlas Database

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for free account

2. **Create a Cluster**
   - Choose "FREE" tier
   - Select your preferred cloud provider and region
   - Create cluster (takes 5-10 minutes)

3. **Create Database User**
   - Go to "Database Access" → "Add New Database User"
   - Choose "Password" authentication
   - Set username and strong password
   - Give "Read and write" permissions

4. **Whitelist IP Addresses**
   - Go to "Network Access" → "Add IP Address"
   - Add `0.0.0.0/0` (allow from anywhere) for development
   - For production, restrict to your server IPs

5. **Get Connection String**
   - Go to "Clusters" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<database>` with your preferred database name

**Example Connection String:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ecommerce
```

## 🔧 Step 2: Backend Deployment (Railway)

### Option A: Railway (Recommended - Easiest)

1. **Create Railway Account**
   - Go to [Railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy from GitHub**
   - Click "New Project" → "Deploy from GitHub repo"
   - Connect your GitHub account
   - Select your `ECOMMERCE-REACT_JS` repository

3. **Configure Environment Variables**
   - Go to your project → "Variables"
   - Add these variables:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce
     JWT_SECRET=your_super_secret_jwt_key_generate_random_64_chars
     ADMIN_EMAIL=admin@yourstore.com
     ADMIN_PASSWORD=secure_admin_password_123
     NODE_ENV=production
     ```

4. **Deploy**
   - Railway will automatically detect it's a Node.js app
   - It will install dependencies and start the server
   - Your backend will be live at `https://your-project-name.up.railway.app`

### Option B: Render (Alternative)

1. **Create Render Account**
   - Go to [Render.com](https://render.com)
   - Sign up for free account

2. **Create Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Runtime**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`

3. **Add Environment Variables**
   - Same variables as Railway above

4. **Deploy**
   - Render will build and deploy your app
   - Get your backend URL

## 🎨 Step 3: Frontend Deployment (Vercel)

1. **Create Vercel Account**
   - Go to [Vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Deploy Frontend**
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

3. **Add Environment Variables**
   ```
   VITE_API_URL=https://your-backend-url.up.railway.app
   ```

4. **Deploy**
   - Vercel will build and deploy your React app
   - Your frontend will be live at `https://your-project.vercel.app`

## 🔄 Step 4: Update CORS (Backend)

Update your backend to allow requests from your frontend domain:

```javascript
// In server.js, update CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000', // development
    'https://your-project.vercel.app' // production
  ],
  credentials: true
};

app.use(cors(corsOptions));
```

## ✅ Step 5: Test Your Deployment

1. **Test Backend API**
   ```
   curl https://your-backend-url.up.railway.app/health
   ```

2. **Test Frontend**
   - Visit your Vercel URL
   - Try registering a new user
   - Test login functionality

3. **Test Full Flow**
   - Browse products
   - Add to cart
   - Place an order

## 🔧 Troubleshooting

### Backend Issues
- **Port Error**: Railway/Render automatically assigns ports
- **MongoDB Connection**: Check your connection string and IP whitelist
- **Environment Variables**: Ensure all required variables are set

### Frontend Issues
- **API Calls Failing**: Check `VITE_API_URL` environment variable
- **CORS Errors**: Update backend CORS configuration
- **Build Errors**: Ensure all dependencies are in `package.json`

### Common Fixes
```bash
# Check backend logs
# On Railway: Go to project → "Deployments" → View logs
# On Render: Go to service → "Logs" tab

# Check environment variables
# Make sure all required variables are set in your deployment platform
```

## 📊 Monitoring & Maintenance

### Railway/Render
- **Logs**: View real-time logs in dashboard
- **Metrics**: Monitor CPU, memory, and response times
- **Scaling**: Upgrade plans as needed

### Vercel
- **Analytics**: View page views and performance
- **Functions**: Monitor serverless function usage
- **Domains**: Add custom domain if needed

## 💰 Cost Estimation

- **MongoDB Atlas**: Free tier (512MB storage)
- **Railway**: Free tier (512MB RAM, 1GB disk)
- **Vercel**: Free tier (100GB bandwidth)
- **Render**: Free tier (750 hours/month)

## 🚀 Going Live

1. **Update Admin Credentials**
   - Change default admin email/password
   - Use strong, unique passwords

2. **Security Checklist**
   - ✅ Environment variables set
   - ✅ CORS configured for production
   - ✅ Strong JWT secret
   - ✅ MongoDB IP restrictions (if needed)

3. **Performance Optimization**
   - ✅ Enable compression
   - ✅ Add caching headers
   - ✅ Optimize images

4. **Backup Strategy**
   - ✅ MongoDB Atlas automatic backups
   - ✅ Regular code backups on GitHub

## 🎯 Next Steps

- Add custom domain
- Set up monitoring (Sentry, LogRocket)
- Add payment integration (Stripe, PayPal)
- Implement email notifications
- Add analytics (Google Analytics)

---

**Your e-commerce store is now live! 🛒🎉**