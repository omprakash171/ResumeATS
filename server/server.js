import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET", "GEMINI_API_KEY"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ ERROR: Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const app = express();

// CORS Configuration
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS || "http://localhost:5173"
).split(",");
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// Routes
app.use("/auth", authRoutes);
app.use("/resume", resumeRoutes);
app.use("/contact", contactRoutes);

app.get("/", (req, res) => res.send("✅ API Running"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
