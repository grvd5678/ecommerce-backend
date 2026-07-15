# 🔧 Quick Fix: MongoDB Not Running

## Error: `MongoDB Connection Error: connect ECONNREFUSED`

This means MongoDB is not installed or not running.

## ✅ Solution Options:

### Option 1: Use MongoDB Atlas (Cloud - Easiest)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create free cluster
4. Get connection string
5. Update `.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce
```

### Option 2: Install MongoDB Locally (Windows)
1. Download: https://www.mongodb.com/try/download/community
2. Install MongoDB Community Server
3. Start MongoDB:
```bash
# Windows - Run as Administrator
net start MongoDB
```
4. Keep `.env` as:
```
MONGODB_URI=mongodb://localhost:27017/ecommerce
```

### Option 3: Use Docker (If you have Docker)
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

## 🚀 After MongoDB is Running:

```bash
# Seed database
node seed.js

# Start server
npm run dev
```

## ✅ You'll see:
```
✅ MongoDB Connected
🚀 Server running on port 5000
```

## 🎯 Recommended: MongoDB Atlas (Cloud)
- Free forever
- No installation needed
- Works immediately
- Production-ready

**Choose MongoDB Atlas for fastest setup!** ⚡
