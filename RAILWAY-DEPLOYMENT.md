# Railway Deployment Guide

Use this file to deploy the backend to Railway after canceling the stuck Render deployment.

## 1. Prepare the repository

- Your branch: `fix/smtp-email`
- Ensure the latest changes are pushed:
  ```bash
  git push origin fix/smtp-email
  ```

## 2. Railway project setup

1. Open https://railway.app and sign in.
2. Create a new project.
3. Choose `Deploy from GitHub`.
4. Select the `ecommerce-backend` repo.
5. Choose branch `fix/smtp-email`.

## 3. Railway environment variables

Add these variables in Railway's Environment section:

- `PORT` = `5000`
- `MONGODB_URI` = `<your MongoDB connection string>`
- `JWT_SECRET` = `<your jwt secret>`
- `EMAIL_FROM` = `<sender email>`
- `EMAIL_USER` = `apikey` (if using SendGrid) or SMTP user
- `EMAIL_PASS` = `<SendGrid API key or SMTP password>`
- `EMAIL_PORT` = `587`
- `EMAIL_HOST` = `smtp.sendgrid.net` (if using SendGrid) or your SMTP host
- `FRONTEND_URL` = `https://<frontend-host>` or `http://localhost:5173`
- `STRIPE_SECRET_KEY` = `<stripe secret key>`
- `STRIPE_PUBLISHABLE_KEY` = `<stripe publishable key>`

## 4. Start command

Use:

```bash
npm start
```

## 5. Check deployment

Once Railway finishes deploying, verify the app:

```bash
curl -i https://<your-railway-app>.up.railway.app/version
curl -i https://<your-railway-app>.up.railway.app/ready
```

## 6. Test forgot-password

Send a POST request to:

```bash
curl -i -X POST https://<your-railway-app>.up.railway.app/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"<your-test-email>"}'
```

## 7. Notes

- Do not push `.env` to GitHub.
- If using SendGrid, `EMAIL_USER=apikey` and `EMAIL_PASS=<SendGrid API key>`.
- If the app still returns 404 on `/version` or `/ready`, the wrong branch or old build may be deployed.
