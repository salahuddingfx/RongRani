# 24/7 Server Deployment Guide for RongRani

## Overview
This guide helps you deploy RongRani backend to run 24 hours a day, 7 days a week on free hosting platforms.

## Option 1: Deploy to Render (Recommended)

### Step 1: Sign Up
1. Go to [Render.com](https://render.com)
2. Sign up with your GitHub account

### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Select your GitHub repository (salahuddingfx/RongRani)
3. Configure the service:
   - **Name**: `rongrani-backend`
   - **Region**: Singapore (or closest to Bangladesh)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Step 3: Environment Variables
Add these environment variables in Render dashboard:
```
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=https://your-frontend-url.vercel.app
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### Step 4: Deploy
Click "Create Web Service" and Render will automatically deploy your backend!

### Step 5: Keep-Alive (Prevent Free Tier Sleep)
Render free tier apps sleep after 15 minutes of inactivity. To prevent this:

**Option A: Use UptimeRobot (Easiest)**
1. Go to [UptimeRobot.com](https://uptimerobot.com)
2. Sign up for free account
3. Add New Monitor:
   - Monitor Type: HTTP(s)
   - Friendly Name: RongRani Backend
   - URL: https://your-backend.onrender.com/api/health
   - Monitoring Interval: 5 minutes
4. Click "Create Monitor"

**Option B: Use Cron-Job.org**
1. Go to [Cron-Job.org](https://cron-job.org)
2. Create account and add a new cron job:
   - URL: https://your-backend.onrender.com/api/health
   - Interval: Every 14 minutes
   - Enable the job

**Option C: Use Render Cron Job (Already configured)**
The `render.yaml` file already includes a cron job configuration that pings your backend every 14 minutes.

## Option 2: Deploy to Railway

### Step 1: Sign Up
1. Go to [Railway.app](https://railway.app)
2. Sign in with GitHub

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your RongRani repository

### Step 3: Configure Service
1. Select `backend` folder as root directory
2. Railway will auto-detect Node.js
3. Add environment variables (same as Render list above)

### Step 4: Deploy
Railway will automatically deploy and keep your service running 24/7 even on free tier!

## Option 3: Deploy to Cyclic

### Steps:
1. Go to [Cyclic.sh](https://cyclic.sh)
2. Connect GitHub account
3. Select RongRani repository
4. Configure backend folder
5. Add environment variables
6. Deploy!

## Update Frontend API URL

After deployment, update your Vercel frontend config:

1. Edit `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-backend-url.onrender.com/api/$1"
    }
  ]
}
```

2. Add environment variable in Vercel:
   - `VITE_API_BASE_URL`: `https://your-backend-url.onrender.com`

## Testing Your Deployment

Test your backend is running:
```bash
curl https://your-backend-url.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "uptime": 123.45,
  "timestamp": "2024-03-05T...",
  "db": {
    "state": "connected"
  }
}
```

## Common Issues & Solutions

### Issue: Backend sleeps after 15 minutes
**Solution**: Set up UptimeRobot or Cron-Job.org ping service

### Issue: CORS errors
**Solution**: Add your frontend URL to `allowedOrigins` in `backend/app.js`

### Issue: Database connection failed
**Solution**: Check MongoDB Atlas IP whitelist - add `0.0.0.0/0` for any IP

### Issue: 500 errors on API calls
**Solution**: Check Render logs - click on your service → "Logs" tab

## Performance Tips

1. **Use MongoDB Atlas M0 (Free Tier)** with your Render backend
2. **Enable caching** in your MongoDB connection
3. **Use Cloudinary** for image hosting (not local storage)
4. **Monitor response times** using Render metrics
5. **Set up error tracking** with Sentry (optional)

## Cost Breakdown

- **Render Free Tier**: 750 hours/month (enough for 1 backend service 24/7)
- **MongoDB Atlas M0**: Free forever (512MB storage)
- **Cloudinary Free**: 25GB storage, 25GB bandwidth
- **UptimeRobot**: Free (50 monitors)
- **Vercel**: Free (100GB bandwidth)

**Total Monthly Cost: $0** 🎉

## Need Help?

- Check Render logs for errors
- Join RongRani Discord/Telegram community
- Open GitHub issue at: https://github.com/salahuddingfx/RongRani/issues

---

**Protip**: Use Railway instead of Render if you need faster cold starts. Railway free tier doesn't have sleep issues!
