# ShopHub — E-Commerce Backend API

Full-featured REST API for the ShopHub e-commerce platform, built with Node.js, Express, and MongoDB Atlas. Deployed live on Railway.

🔗 **Live API:** `https://ecommerce-backend-production-bb31.up.railway.app/api`

---

## Tech Stack

- **Runtime:** Node.js 20
- **Framework:** Express.js (ES Modules)
- **Database:** MongoDB Atlas + Mongoose
- **Authentication:** JWT + bcrypt + OTP email verification
- **Email:** SendGrid (`@sendgrid/mail`)
- **Payments:** Razorpay + Stripe
- **AI Chat:** Google Gemini API
- **Security:** helmet, cors, express-rate-limit, CSRF protection
- **Deployment:** Railway + nixpacks

---

## Project Structure

```
ecommerce-backend/
├── config/
│   ├── db.js               # MongoDB connection
│   └── config.js           # Env var validation & config object
├── controllers/
│   ├── authController.js
│   ├── productController.js
│   ├── orderController.js
│   ├── cartController.js
│   ├── reviewController.js
│   ├── paymentController.js
│   ├── couponController.js
│   ├── chatController.js
│   ├── engagementController.js
│   └── productFilterController.js
├── middleware/
│   ├── auth.js             # JWT protect + admin guard
│   ├── validate.js         # Joi schema validation
│   └── csrfProtection.js
├── models/
│   ├── User.js
│   ├── AdvancedProduct.js
│   ├── Order.js
│   ├── Cart.js
│   ├── Review.js
│   ├── Category.js
│   ├── Coupon.js
│   └── StockNotification.js
├── routes/
│   ├── auth.js
│   ├── products.js
│   ├── orders.js
│   ├── cart.js
│   ├── reviews.js
│   ├── admin.js
│   ├── payment.js
│   ├── coupons.js
│   ├── chat.js
│   ├── engagement.js
│   └── filterRoutes.js
├── utils/
│   └── email.js            # SendGrid email helpers
├── tests/
│   └── orderFlow.test.js
├── server.js               # Entry point
├── seed.js                 # DB seeder (11 products)
├── nixpacks.toml           # Railway build config (Node 20)
├── railway.json
└── package.json
```

---

## API Endpoints (40 total)

### Auth `/api/auth`
```
POST   /register           Register + send OTP email
POST   /verify-otp         Verify OTP to activate account
POST   /resend-otp         Resend OTP
POST   /login              Login, returns JWT
POST   /forgot-password    Send password reset OTP
POST   /reset-password     Reset password with OTP
PUT    /change-password    Change password (protected)
GET    /me                 Get current user (protected)
```

### Products `/api/products`
```
GET    /                   List all products (filter, sort, paginate)
GET    /categories         Get all categories
GET    /categories/counts  Get product count per category
GET    /:id                Get single product
GET    /:id/similar        Get similar products
POST   /                   Create product (admin)
PUT    /:id                Update product (admin)
DELETE /:id                Delete product (admin)
```

### Orders `/api/orders`
```
POST   /                   Create order (protected)
GET    /                   Get my orders (protected)
GET    /admin/all          Get all orders (admin)
GET    /:id                Get single order (protected)
PUT    /:id/cancel         Cancel order (protected)
PUT    /:id/status         Update order status (admin)
```

### Cart `/api/cart`
```
GET    /                   Get cart (protected)
POST   /                   Add item (protected)
PUT    /                   Update quantity (protected)
DELETE /:productId         Remove item (protected)
DELETE /                   Clear cart (protected)
```

### Reviews `/api/reviews`
```
GET    /:productId         Get product reviews
POST   /:productId         Add review (protected)
PUT    /:id                Update review (protected)
PUT    /:id/helpful        Toggle helpful (protected)
DELETE /:id                Delete review (protected)
```

### Admin `/api/admin`
```
GET    /users              List all users (admin)
PUT    /users/:id/role     Update user role (admin)
DELETE /users/:id          Delete user (admin)
```

### Payment `/api/payment`
```
POST   /create-order       Create Razorpay order (protected)
POST   /verify             Verify payment signature (protected)
```

### Other
```
POST   /api/coupons/validate       Validate coupon code (protected)
POST   /api/chat                   AI chat via Gemini (CSRF protected)
POST   /api/engagement/notify/:id  Subscribe to stock notification
GET    /api/engagement/recommendations/:id  Get recommendations
GET    /api/filter/filter          Advanced product filtering
```

---

## MongoDB Collections (8)

| Collection | Purpose |
|---|---|
| users | Auth, roles, OTP |
| advancedproducts | Product catalog |
| orders | Order management |
| carts | Per-user cart |
| reviews | Product reviews |
| categories | Product categories |
| coupons | Discount codes |
| stocknotifications | Back-in-stock alerts |

---

## Environment Variables

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=<mongodb_atlas_uri>
JWT_SECRET=<jwt_secret>

# SendGrid
EMAIL_FROM=<verified_sender_email>
EMAIL_USER=apikey
EMAIL_PASS=<sendgrid_api_key>

# Payments
RAZORPAY_KEY_ID=<razorpay_key_id>
RAZORPAY_KEY_SECRET=<razorpay_key_secret>
STRIPE_SECRET_KEY=<stripe_secret_key>
STRIPE_PUBLISHABLE_KEY=<stripe_publishable_key>

# AI
GEMINI_API_KEY=<gemini_api_key>

# CORS
FRONTEND_URL=https://ecommerce-frontend-production-8d98.up.railway.app
ALLOWED_ORIGINS=https://ecommerce-frontend-production-8d98.up.railway.app
```

---

## Local Setup

```bash
npm install
cp .env.example .env   # fill in your values
node seed.js           # seed 11 sample products
npm run dev            # starts on http://localhost:5000
```

---

## Security Features

- JWT stateless authentication
- bcrypt password hashing
- OTP email verification on register & password reset
- Rate limiting (100 req / 15 min in production)
- Helmet HTTP headers
- CSRF protection on mutating routes
- Joi input validation on all auth & product routes
- CORS restricted to frontend origin

---

## Testing

```bash
npm test   # runs orderFlow.test.js
```

1 test file covering the full order flow (register → login → add to cart → checkout → order status).

---

## Deployment

Deployed on **Railway** with Node 20 forced via `nixpacks.toml`.

```toml
[phases.setup]
nixPkgs = ["nodejs_20"]
```

---

## License

ISC
