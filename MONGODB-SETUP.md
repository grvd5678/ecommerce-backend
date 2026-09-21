# 🍃 MongoDB Atlas Setup & Troubleshooting Guide

This guide details how to configure, connect, and troubleshoot MongoDB Atlas for the ShopHub platform.

---

## 1. Quick Connection Setup

### Format:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.<unique-id>.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0
```

### Steps in MongoDB Atlas:
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. Go to **Security** &rarr; **Database Access**:
   - Create or edit user (e.g. `grvd123`).
   - Set Built-in Role to **Read and write to any database**.
   - Set Authentication Method to **Password (SCRAM)**.
3. Go to **Security** &rarr; **Network Access**:
   - Click **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`).
   - Click **Confirm**.

---

## 2. Common Errors & Fixes

### Error 1: `querySrv ECONNREFUSED _mongodb._tcp...`
* **Root Cause:** Some local Internet Service Providers (ISPs) or corporate routers block or misroute SRV DNS queries (`_mongodb._tcp`).
* **Fix Applied in Code (`config/db.js`):**
  We explicitly configure Node.js to use Google and Cloudflare DNS resolvers:
  ```javascript
  import dns from 'node:dns';
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  ```
  This ensures seamless SRV resolution on all networks.

---

### Error 2: `bad auth : authentication failed` (Code 8000)
* **Root Cause:** MongoDB Atlas rejected the credentials. This happens if the password was changed or special characters are unencoded.
* **Fix:**
  1. In MongoDB Atlas, go to **Database Access**.
  2. Click **Edit** next to your database user &rarr; **Edit Password**.
  3. Enter your password (e.g. `ShopHub12345`).
  4. Click the green **Update User** button at the bottom.
  5. Ensure your `.env` matches the exact password.

---

### Error 3: Cluster Paused (Free M0 Tier)
* **Root Cause:** MongoDB Atlas automatically pauses inactive free tier clusters after a few days of inactivity.
* **Fix:**
  1. Go to **Deployment** &rarr; **Database**.
  2. If the cluster says **Paused**, click the **Resume** button.
  3. Wait ~60 seconds for the cluster to spin back up to green.

---

## 3. Database Seeding

To populate your database with initial high-resolution products and categories:

```bash
cd ecommerce-backend
node seed.js
```

### Output:
```
✅ MongoDB Connected: cluster0-shard-00-01.spxsqdl.mongodb.net
Database cleared
Categories seeded
Products seeded
Database seeding completed successfully!
```
