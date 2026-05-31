# Deployment Guide - Render.com

This guide will walk you through deploying both the backend and frontend of your AI Resume ATS Analyzer to Render.com.

## Prerequisites

- GitHub account with your repository pushed
- Render.com account (free tier available)
- MongoDB Atlas account (for production database)

---

## Part 1: Backend Deployment

### Step 1: Prepare Your Backend for Production

1. **Update `server/package.json`** - Add start script (if not already there):

   ```json
   "scripts": {
     "start": "node server.js",
     "dev": "nodemon server.js"
   }
   ```

2. **Update `server/server.js`** - Add health check endpoint:

   ```javascript
   app.get("/", (req, res) => res.send("API Running"));
   ```

3. **Commit changes:**
   ```bash
   git add .
   git commit -m "chore: prepare backend for deployment"
   git push
   ```

### Step 2: Create a Web Service on Render

1. Go to [Render.com](https://render.com) and sign in
2. Click **"New"** → Select **"Web Service"**
3. Select **"Deploy an existing repository"**
4. Authorize GitHub and select your repository
5. Fill in the details:
   - **Name:** `resume-ats-backend` (or your preferred name)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free` (for testing) or `Starter` (recommended)

### Step 3: Configure Environment Variables

1. Scroll down to **"Environment Variables"**
2. Add all your secrets (from `server/.env`):

   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ATS_ANALYZER
   JWT_SECRET=your-super-secret-key-here
   GEMINI_API_KEY=your-google-gemini-api-key
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-gmail-app-password
   PORT=5000
   NODE_ENV=production
   ```

3. Click **"Create Web Service"**

### Step 4: Wait for Deployment

- Render will automatically pull your code and deploy
- You'll see logs in the dashboard
- Once deployed, you'll get a URL like: `https://resume-ats-backend.onrender.com`

### Step 5: Test Your Backend

Open in browser:

```
https://resume-ats-backend.onrender.com/
```

You should see: `API Running`

---

## Part 2: Frontend Deployment

### Step 1: Update Frontend Environment Variables

1. **Create `client/.env.production`:**

   ```
   VITE_API_URL=https://resume-ats-backend.onrender.com
   ```

2. **Update frontend API calls** - Replace hardcoded localhost with environment variable

   Edit files that have `http://localhost:5000` and update to use the backend URL:

   **In `client/src/components/YourResumes/index.jsx`, `Login/index.jsx`, etc:**

   ```javascript
   // Instead of:
   const uploadResponse = await fetch("http://localhost:5000/resume/upload", {

   // Use:
   const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
   const uploadResponse = await fetch(`${API_URL}/resume/upload`, {
   ```

3. **Create a helper file** `client/src/config.js`:

   ```javascript
   export const API_BASE_URL =
     import.meta.env.VITE_API_URL || "http://localhost:5000";
   ```

   Then import and use it in your components:

   ```javascript
   import { API_BASE_URL } from "../config";

   const response = await fetch(`${API_BASE_URL}/resume/upload`, { ... })
   ```

4. **Commit changes:**
   ```bash
   git add .
   git commit -m "chore: update frontend for production deployment"
   git push
   ```

### Step 2: Create a Static Site on Render

1. Go to [Render.com](https://render.com)
2. Click **"New"** → Select **"Static Site"**
3. Select **"Deploy an existing repository"**
4. Fill in the details:
   - **Name:** `resume-ats-frontend` (or your preferred name)
   - **Repository:** Select your GitHub repo
   - **Root Directory:** `client`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

### Step 3: Configure Build Environment Variables

1. Scroll down to **"Environment"**
2. Add environment variables:

   ```
   VITE_API_URL=https://resume-ats-backend.onrender.com
   ```

3. Click **"Create Static Site"**

### Step 4: Wait for Build & Deployment

- Render will build your Vite app
- Once complete, you'll get a URL like: `https://resume-ats-frontend.onrender.com`

---

## Step-by-Step Testing

### Test Backend Endpoints

1. **Login endpoint:**

   ```bash
   curl -X POST https://resume-ats-backend.onrender.com/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}'
   ```

2. **Contact endpoint:**
   ```bash
   curl -X POST https://resume-ats-backend.onrender.com/contact/send \
     -H "Content-Type: application/json" \
     -d '{"name":"John","email":"john@example.com","message":"Hello"}'
   ```

### Test Frontend

1. Open: `https://resume-ats-frontend.onrender.com`
2. Register a new account
3. Log in
4. Try uploading a resume
5. Check your email for contact form submissions

---

## Common Issues & Troubleshooting

### Issue: Backend returns 500 error

**Solution:** Check logs in Render dashboard:

1. Go to your Web Service
2. Click "Logs" tab
3. Look for error messages
4. Ensure all environment variables are set

### Issue: Frontend shows "Cannot reach API"

**Solution:**

1. Check if `VITE_API_URL` is set correctly in frontend environment
2. Verify backend URL is correct and live
3. Check browser console (F12) for CORS errors

### Issue: "CORS error" in frontend

**Solution:** Add CORS to backend `server/server.js`:

```javascript
import cors from "cors";

app.use(
  cors({
    origin: [
      "https://resume-ats-frontend.onrender.com",
      "http://localhost:5173",
    ],
    credentials: true,
  }),
);
```

Then commit and redeploy:

```bash
git add .
git commit -m "fix: add CORS for frontend domain"
git push
```

### Issue: Database connection fails

**Solution:**

1. Verify MongoDB Atlas connection string is correct
2. Whitelist Render's IP in MongoDB Atlas:
   - Go to MongoDB Atlas → Network Access
   - Add IP: `0.0.0.0/0` (allows all IPs) or Render's IP
3. Test connection: `npm test` locally first

### Issue: Email not sending from production

**Solution:**

1. Verify Gmail app password is correct (not your regular password)
2. Check that 2FA is enabled on Google Account
3. Try logging in to Gmail to see if there are security alerts
4. Use the exact app password (no spaces)

---

## Production Checklist

- ✅ Backend deployed on Render
- ✅ Frontend deployed on Render
- ✅ Environment variables configured
- ✅ MongoDB Atlas connection working
- ✅ API endpoints responding
- ✅ Frontend connects to backend API
- ✅ User registration working
- ✅ Login and token storage working
- ✅ Resume upload and analysis working
- ✅ Email notifications working
- ✅ Contact form submissions working

---

## Environment Variables Reference

### Backend (`server/.env`)

```
MONGODB_URI=<your-mongodb-atlas-connection-string>
JWT_SECRET=<your-secret-key>
GEMINI_API_KEY=<your-gemini-key>
EMAIL_USER=<your-email>
EMAIL_PASSWORD=<your-gmail-app-password>
PORT=5000
NODE_ENV=production
```

### Frontend (`client/.env.production`)

```
VITE_API_URL=https://resume-ats-backend.onrender.com
```

---

## Alternative Deployment Options

- **Backend:** Railway, Heroku, Fly.io, AWS
- **Frontend:** Vercel, Netlify, GitHub Pages, Cloudflare Pages
- **Database:** MongoDB Atlas (recommended), AWS RDS, Supabase

---

## Monitoring & Logs

### View Backend Logs

1. Go to Web Service on Render
2. Click "Logs" tab
3. Real-time logs of your server

### View Frontend Build Logs

1. Go to Static Site on Render
2. Click "Build Logs" tab
3. See build output and errors

---

## Cost Considerations

**Render Free Tier:**

- 1 Web Service (backend)
- 1 Static Site (frontend)
- ⚠️ Free tier has limited uptime (15-30 min inactivity = spin down)

**Recommended for Production:**

- Upgrade to Starter Plan ($7/month per service)
- Always-on uptime

---

## Next Steps

1. Deploy backend first
2. Test backend endpoints with Postman or curl
3. Deploy frontend with backend URL configured
4. Test full application flow
5. Monitor logs for any issues
6. Set up custom domain (optional)

---

**Happy deploying! 🚀**
