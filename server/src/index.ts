import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";


const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);


app.get("/", (req, res) => {
  res.json({ status: "API rodando" });
});

app.listen(3000, () => {
  console.log("Servidor rodando");
});
