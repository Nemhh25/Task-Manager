import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Não autenticado" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Sessão inválido ou expirado" });
  }
}