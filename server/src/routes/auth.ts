import { Router } from "express";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import { Prisma } from "../generated/prisma/client.js";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();
const isProd = process.env.NODE_ENV === "production";

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
      },
    });

    const { hashedPassword: _, ...userWithoutPassword } = user;

    res.status(201).json(userWithoutPassword);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return res.status(409).json({ error: "Email já cadastrado" });
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const isValid = await bcrypt.compare(password, user.hashedPassword);

    if (!isValid) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Login realizado" });
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.get("/me", authMiddleware, (req, res) => {
  res.json({ userId: req.userId });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "strict",
  });
  res.json({ message: "Logout realizado" });
});

export default router;
