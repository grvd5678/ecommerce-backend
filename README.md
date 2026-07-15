# 🚀 E-Commerce Backend API

Full-featured REST API for e-commerce application built with Node.js, Express, and MongoDB.

## 🛠 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT + bcrypt
- **Security:** helmet, cors, express-rate-limit

## 📦 Installation

```bash
npm install
```

## ⚙️ Environment Variables

Create `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=<your_jwt_secret>
NODE_ENV=development
```

## 🗄️ Database Setup

1. Install MongoDB locally or use MongoDB Atlas
2. Update `MONGODB_URI` in `.env`
3. Seed database with sample products:

```bash
node seed.js
```

## 🚀 Run Server

Development mode (with nodemon):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server runs on: `http://localhost:5000`

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
GET    /api/auth/me          - Get current user (protected)
```

### Products
```
GET    /api/products         - Get all products
GET    /api/products/:id     - Get single product
POST   /api/products         - Create product (admin only)
PUT    /api/products/:id     - Update product (admin only)
DELETE /api/products/:id     - Delete product (admin only)
```

### Orders
```
POST   /api/orders           - Create order (protected)
GET    /api/orders           - Get user's orders (protected)
GET    /api/orders/:id       - Get single order (protected)
```

### Cart
```
GET    /api/cart             - Get user's cart (protected)
POST   /api/cart             - Add item to cart (protected)
PUT    /api/cart             - Update cart item quantity (protected)
DELETE /api/cart/:productId  - Remove item from cart (protected)
DELETE /api/cart             - Clear cart (protected)
```

### Reviews
```
GET    /api/reviews/:productId - Get product reviews
POST   /api/reviews/:productId - Add review (protected)
PUT    /api/reviews/:id        - Update review (protected)
DELETE /api/reviews/:id        - Delete review (protected)
```

### Payment
```
POST   /api/payment/create-intent - Create payment intent (protected)
POST   /api/payment/confirm       - Confirm payment (protected)
```

### Admin Orders
```
GET    /api/orders/admin/all      - Get all orders (admin only)
PUT    /api/orders/:id/status     - Update order status (admin only)
```

## 🔐 Authentication

Include JWT token in headers:
```
Authorization: Bearer <your_token>
```

## 📝 Example Requests

### Register User
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "<user_email>",
  "password": "<user_password>"
}
```

### Login
```json
POST /api/auth/login
{
  "email": "<user_email>",
  "password": "<user_password>"
}
```

### Create Order
```json
POST /api/orders
Headers: Authorization: Bearer <token>
{
  "items": [
    {
      "product": "product_id",
      "name": "Product Name",
      "price": 99.99,
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "address": "123 Main St"
  },
  "paymentInfo": {
    "cardNumber": "<card_number>"
  },
  "subtotal": 199.98,
  "tax": 9.99,
  "shipping": 40,
  "total": 249.97
}
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT authentication
- Rate limiting (100 requests per 15 minutes)
- Helmet for HTTP headers security
- CORS enabled
- Input validation with Mongoose

## 📁 Project Structure

```
ecommerce-backend/
├── config/
│   └── db.js              # Database connection
├── controllers/
│   ├── authController.js  # Auth logic
│   ├── productController.js
│   └── orderController.js
├── middleware/
│   └── auth.js            # JWT verification
├── models/
│   ├── User.js
│   ├── Product.js
│   └── Order.js
├── routes/
│   ├── auth.js
│   ├── products.js
│   └── orders.js
├── .env
├── .gitignore
├── server.js              # Entry point
├── seed.js                # Database seeder
└── package.json
```

## 🧪 Testing with Postman

1. Import endpoints into Postman
2. Register a user
3. Login to get JWT token
4. Add token to Authorization header
5. Test protected routes

## 🎯 Interview Talking Points

**Performance:**
> "I used Mongoose for schema validation and middleware hooks for password hashing, ensuring data integrity at the model level."

**Security:**
> "Implemented JWT for stateless authentication, bcrypt for password hashing, and rate limiting to prevent brute force attacks."

**Architecture:**
> "Followed MVC pattern with separate controllers, models, and routes for maintainability and scalability."

**Production-Ready:**
> "Added error handling, input validation, and security middleware like helmet and CORS for production deployment."

## 🚀 Next Steps

- [ ] Connect frontend to backend
- [ ] Add payment integration (Stripe)
- [ ] Add image upload (Cloudinary)
- [ ] Add email notifications
- [ ] Deploy to Heroku/Railway

## 📄 License

ISC
