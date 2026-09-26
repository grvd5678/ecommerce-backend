import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : process.env.NODE_ENV === "test"
      ? ".env.test"
      : ".env";

dotenv.config({ path: path.resolve(__dirname, `../${envFile}`) });

const envEmailUser = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : "";
const envEmailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.trim() : "";
const isSendGridUser = envEmailUser.toLowerCase() === "apikey";

const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || "development",
  emailFrom: process.env.EMAIL_FROM,
  emailHost: process.env.EMAIL_HOST,
  emailPort: process.env.EMAIL_PORT,
  emailUser: envEmailUser,
  emailPass: envEmailPass,
  resendApiKey: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.trim() : "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  rateLimitWindow: 15 * 60 * 1000,
  rateLimitMax: process.env.NODE_ENV === "production" ? 100 : 1000,
  dbConnectionTimeout: 5000,
  dbSocketTimeout: 45000,
};

const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET"];
if (process.env.NODE_ENV === "production") {
  const hasResend = Boolean(process.env.RESEND_API_KEY || (envEmailPass && envEmailPass.startsWith("re_")));
  if (!hasResend && (!process.env.EMAIL_PASS || !process.env.EMAIL_FROM)) {
    requiredEnvVars.push("EMAIL_FROM", "EMAIL_PASS");
  }
}

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`,
  );
}

export default config;
