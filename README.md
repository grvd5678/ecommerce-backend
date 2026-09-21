# ShopHub — E-Commerce Backend API

Full-featured, production-ready REST API for the ShopHub e-commerce platform, built with Node.js, Express, and MongoDB Atlas. Deployed live on Render.

[![Backend CI](https://github.com/grvd5678/ecommerce-backend/actions/workflows/ci.yml/badge.svg)](https://github.com/grvd5678/ecommerce-backend/actions)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)

🔗 **Live API Base:** `https://ecommerce-api-tio6.onrender.com/api`  
🩺 **Health Check:** `https://ecommerce-api-tio6.onrender.com/health`

---

## Tech Stack

- **Runtime:** Node.js 20+ (ES Modules)
- **Framework:** Express.js
- **Database:** MongoDB Atlas + Mongoose 8 (SCRAM & SRV)
- **Authentication:** JWT + bcrypt + SendGrid OTP email verification
- **Email:** SendGrid (`@sendgrid/mail`)
- **Payments:** Razorpay + Stripe
- **Generative AI:** Google Gemini API (`@google/generative-ai`, `gemini-3.6-flash`)
- **Security:** Helmet, CORS, Express-Rate-Limit, CSRF protection, Joi validation
- **DevOps & CI/CD:** GitHub Actions, Docker (Node 20 Alpine), Render

---

## Project Structure

```
ecommerce-backend/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions automated test workflow
├── config/
│   ├── db.js                   # MongoDB Atlas connection + DNS resilience
│   └── config.js               # Env var validation & config object
├── controllers/
│   ├── authController.js       # Auth, OTP, password recovery
│   ├── productController.js    # Catalog, filters, categories
│   ├── orderController.js      # Orders & status management
│   ├── cartController.js       # Cart sync & item calculations
│   ├── reviewController.js     # Ratings, helpful votes, reviews
│   ├── paymentController.js    # Stripe & Razorpay workflows
│   ├── couponController.js     # Discount codes logic
│   ├── chatController.js       # Gemini AI customer support
│   └── engagementController.js # Stock alerts & recommendations
├── middleware/
│   ├── auth.js                 # JWT verification & admin guard
│   ├── validate.js             # Joi request schema validation
│   └── csrfProtection.js       # Anti-CSRF token verification
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
│   ├── admin.js                # Recharts analytics & user management
│   ├── auth.js                 # Registration, login, OTP
│   ├── products.js             # Catalog CRUD & Gemini AI copy generator
│   ├── orders.js               # Order processing
│   ├── cart.js                 # Cart operations
│   ├── reviews.js              # Review submissions
│   ├── payment.js              # Payment gateway integration
│   ├── coupons.js              # Coupon validation
│   ├── chat.js                 # AI chat assistant
│   └── engagement.js           # Subscriptions & alerts
├── tests/
│   ├── setup.js                # In-memory MongoDB test harness
│   └── orderFlow.test.js       # Jest & Supertest integration tests
├── .dockerignore
├── .env.example
├── .env.test                   # Test environment configuration
├── Dockerfile                  # Production Node 20 Alpine container
├── seed.js                     # High-res catalog seeder
├── server.js                   # Express application entry point
└── package.json
```

---

## API Endpoints (43 total)

### System
```
GET    /health                      Health check status
GET    /                            Root API status
```

### Auth `/api/auth`
```
POST   /register                    Register user + send OTP email
POST   /verify-otp                  Verify OTP to activate account
POST   /resend-otp                  Resend activation OTP
POST   /login                       Login, returns JWT
POST   /forgot-password             Send password reset OTP
POST   /reset-password              Reset password with OTP
PUT    /change-password             Change password (protected)
GET    /me                          Get current authenticated user (protected)
```

### Products `/api/products`
```
GET    /                            List products (filter, sort, search, paginate)
GET    /categories                  Get all product categories
GET    /categories/counts           Get product counts per category
GET    /:id                         Get single product by ID
GET    /:id/similar                 Get similar products
POST   /                            Create new product (admin)
PUT    /:id                         Update product (admin)
DELETE /:id                         Delete product (admin)
POST   /generate-description        Generate AI product copy with Gemini (admin)
```

### Orders `/api/orders`
```
POST   /                            Create new order (protected)
GET    /                            Get customer order history (protected)
GET    /admin/all                   Get all system orders (admin)
GET    /:id                         Get single order details (protected)
PUT    /:id/cancel                  Cancel order (protected)
PUT    /:id/status                  Update fulfillment status (admin)
```

### Cart `/api/cart`
```
GET    /                            Get user cart (protected)
POST   /                            Add item to cart (protected)
PUT    /                            Update item quantity (protected)
DELETE /:productId                  Remove specific item (protected)
DELETE /                            Clear entire cart (protected)
```

### Reviews `/api/reviews`
```
GET    /:productId                  Get all reviews for product
POST   /:productId                  Submit review (protected)
PUT    /:id                         Update review (protected)
PUT    /:id/helpful                 Toggle helpful vote (protected)
DELETE /:id                         Delete review (protected)
```

### Admin `/api/admin`
```
GET    /analytics                   Recharts business intelligence metrics (admin)
GET    /users                       List all registered users (admin)
PUT    /users/:id/role              Update user role [user/admin] (admin)
DELETE /users/:id                   Delete user (admin)
```

### Payments `/api/payment`
```
POST   /create-order                Create Razorpay order (protected)
POST   /verify                      Verify payment signature (protected)
POST   /stripe/create-intent        Create Stripe Payment Intent (protected)
```

### AI & Engagement
```
POST   /api/chat                    AI customer assistant via Gemini (CSRF protected)
POST   /api/coupons/validate        Validate discount promo code (protected)
POST   /api/engagement/notify/:id   Subscribe to back-in-stock notification
GET    /api/engagement/recommendations/:id Get personalized recommendations
```

---

## MongoDB Collections (8)

| Collection | Purpose | Indexes / Keys |
|---|---|---|
| `users` | User accounts, credentials, roles, OTP | `email` (unique) |
| `advancedproducts` | E-commerce catalog, specifications, stock | `category`, `price`, `ratings` |
| `orders` | Customer purchases & fulfillment status | `user`, `createdAt` |
| `carts` | Persistent shopping carts per user | `user` |
| `reviews` | Product ratings & customer feedback | `product`, `user` |
| `categories` | Hierarchical department catalog | `name` (unique) |
| `coupons` | Discount vouchers & validity periods | `code` (unique) |
| `stocknotifications` | Back-in-stock email alerts | `product`, `email` |

---

## Environment Configuration

Create a `.env` file in the root of `ecommerce-backend`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.spxsqdl.mongodb.net/ecommerce?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_64_characters_hex

# SendGrid SMTP
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=465
EMAIL_FROM=verified_sender@domain.com
EMAIL_USER=apikey
EMAIL_PASS=SG.your_sendgrid_api_key

# Payment Gateways
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_razorpay_secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Google Gemini AI
GEMINI_API_KEY=AIzaSy...

# CORS Allowed Origins
ALLOWED_ORIGINS=https://ecommerce-frontend-l3zz.onrender.com,http://localhost:5173
```

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Seed database with catalog items
node seed.js

# 3. Start development server with auto-reload
npm run dev
```

---

## Automated Testing

Run the full integration test suite powered by Jest and Supertest:

```bash
npm test
```

> **Note:** Tests run with Node.js ES Modules enabled via `NODE_OPTIONS=--experimental-vm-modules` and isolate test operations with `mongodb-memory-server`.

---

## Docker Deployment

Build and run the backend in an isolated production container:

```bash
# Build Docker image
docker build -t shophub-backend .

# Run container
docker run -d -p 5000:5000 --env-file .env --name shophub-backend shophub-backend
```

---

## License

ISC
