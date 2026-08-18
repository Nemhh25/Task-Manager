import jwt from "jsonwebtoken";
export function authMiddleware(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: "Não autenticado" });
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = payload.userId;
        next();
    }
    catch (err) {
        return res.status(401).json({ error: "Sessão inválido ou expirado" });
    }
}
//# sourceMappingURL=auth.js.map