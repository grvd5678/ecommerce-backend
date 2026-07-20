import dotenvSafe from "dotenv-safe";
dotenvSafe.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import logger from "./utils/logger.js";
import { setupSwagger } from "./utils/swagger.js";
import globalErrorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import cartRoutes from "./routes/cart.js";
import reviewRoutes from "./routes/reviews.js";
import paymentRoutes from "./routes/payment.js";
import adminRoutes from "./routes/admin.js";
import couponRoutes from "./routes/coupons.js";
import engagementRoutes from "./routes/engagement.js";
import chatRoutes from "./routes/chat.js";
import { verifyEmailTransporter } from "./utils/email.js";

export const app = express();

// Trust the proxy (Render uses a proxy)
app.set("trust proxy", 1);

connectDB();

setupSwagger(app);

app.use(helmet());
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "https://ecommerce-frontend-l3zz.onrender.com",
    ],
    credentials: true,
  }),
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use("/api/", limiter);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/engagement", engagementRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
  res.json({ message: "🚀 E-Commerce API is running!" });
});

app.get("/ready", async (req, res) => {
  try {
    await verifyEmailTransporter();
    res.json({ status: "ok", email: "ok" });
  } catch (error) {
    res.status(503).json({ status: "error", email: error.message });
  }
});

app.use(globalErrorHandler);

console.log("--- SERVER IS RUNNING AND LOGGING ---");

if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}
