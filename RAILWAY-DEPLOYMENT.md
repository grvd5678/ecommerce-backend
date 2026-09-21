# 🚀 ShopHub Cloud & Container Deployment Guide

Complete deployment instructions for **Render** (Production Cloud) and **Docker** (Containerized Environments).

---

## 1. Live Render Deployment

Both services are live on **Render (Free Tier)**:
- **Frontend SPA:** `https://ecommerce-frontend-l3zz.onrender.com`
- **Backend API:** `https://ecommerce-api-tio6.onrender.com`

---

### Backend Service on Render (Web Service)

1. **Repository:** `grvd5678/ecommerce-backend`
2. **Branch:** `main`
3. **Runtime:** Node
4. **Build Command:**
   ```bash
   npm install
   ```
5. **Start Command:**
   ```bash
   node server.js
   ```
6. **Environment Variables on Render:**
   - `PORT` = `10000` (or leave default, Render sets `PORT` automatically)
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = `mongodb+srv://grvd123:ShopHub12345@cluster0.spxsqdl.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0`
   - `JWT_SECRET` = `<your-jwt-secret>`
   - `EMAIL_FROM` = `gouravdas350@gmail.com`
   - `EMAIL_USER` = `apikey`
   - `EMAIL_PASS` = `<your-sendgrid-api-key>`
   - `EMAIL_PORT` = `465`
   - `EMAIL_HOST` = `smtp.sendgrid.net`
   - `GEMINI_API_KEY` = `<your-gemini-api-key>`
   - `STRIPE_SECRET_KEY` = `<your-stripe-secret>`
   - `STRIPE_PUBLISHABLE_KEY` = `<your-stripe-publishable-key>`
   - `RAZORPAY_KEY_ID` = `<your-razorpay-key>`
   - `RAZORPAY_KEY_SECRET` = `<your-razorpay-secret>`
   - `ALLOWED_ORIGINS` = `https://ecommerce-frontend-l3zz.onrender.com,http://localhost:5173`

---

### Frontend Service on Render (Static Site)

1. **Repository:** `grvd5678/ecommerce-frontend`
2. **Branch:** `main`
3. **Build Command:**
   ```bash
   npm install; npm run build
   ```
4. **Publish Directory:**
   ```
   dist
   ```
5. **Environment Variables:**
   - `VITE_API_URL` = `https://ecommerce-api-tio6.onrender.com/api`
6. **SPA Rewrites:**
   - In Render Static Site settings &rarr; **Redirects/Rewrites**:
     - Source: `/*`
     - Destination: `/index.html`
     - Action: `Rewrite`

---

## 2. Docker & Docker Compose Deployment

### 1-Command Spin Up (MongoDB + API + Frontend):
From the project root:
```bash
docker compose up --build
```

### Individual Containers:
```bash
# Backend
cd ecommerce-backend
docker build -t shophub-backend .
docker run -d -p 5000:5000 --env-file .env shophub-backend

# Frontend
cd ecommerce-frontend
docker build -t shophub-frontend .
docker run -d -p 80:80 shophub-frontend
```

---

## 3. Render Free Tier Cold-Start Note

> [!NOTE]
> On Render's free tier, the backend web service spins down after 15 minutes of inactivity. When a request arrives, it takes ~45–60 seconds for the container to wake up. The frontend displays graceful skeleton loaders and handles reconnects automatically.
