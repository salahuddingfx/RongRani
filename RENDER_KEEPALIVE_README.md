# Render Free Tier Keep-Alive Solutions

## Problem
Render free tier shuts down after ~15 minutes of inactivity and takes 1-2 minutes to restart.

## Solutions

### Option 1: External Ping Service (FREE)
Use free monitoring services to ping your server every 10-15 minutes:

#### UptimeRobot (Free Tier)
1. Go to https://uptimerobot.com/
2. Sign up for free account
3. Add new monitor:
   - Monitor Type: `HTTP(s)`
   - URL: `https://your-render-app.onrender.com/api/keepalive/ping`
   - Monitoring Interval: `10 minutes`
   - Monitor Timeout: `30 seconds`

#### Cron-Job.org (Free)
1. Go to https://cron-job.org/
2. Create free account
3. Add new cron job:
   - URL: `https://your-render-app.onrender.com/api/keepalive/ping`
   - Schedule: `Every 10 minutes`

#### Other Free Services
- **Healthchecks.io**: https://healthchecks.io/
- **Dead Man's Snitch**: https://deadmanssnitch.com/
- **Pingdom Free**: https://www.pingdom.com/free/

### Option 2: Local Keep-Alive Script
Run this script on your local machine:

```bash
# Set your Render URL
export SERVER_URL=https://your-render-app.onrender.com

# Run the keep-alive script
npm run keepalive
```

Or run directly:
```bash
node keepalive.js
```

### Option 3: Upgrade to Paid Plan
For guaranteed 24/7 uptime, upgrade to Render paid plans ($7/month+).

## Email Service Status
Your email service is perfectly configured with:
- ✅ Brevo (Sendinblue) API support
- ✅ Gmail SMTP fallback
- ✅ No upgrades needed

## API Endpoints Added
- `GET /api/keepalive/ping` - Simple ping response
- `GET /api/keepalive/health` - Detailed health check

## Testing
Test your keep-alive endpoints:
```bash
curl https://your-render-app.onrender.com/api/keepalive/ping
curl https://your-render-app.onrender.com/api/keepalive/health
```