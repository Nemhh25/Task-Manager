import { Router } from "express";
import prisma from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
const router = Router();
router.use(authMiddleware);
router.post("/", async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title || typeof title !== "string" || title.trim() === "") {
            return res.status(400).json({ error: "Título é obrigatório" });
        }
        const task = await prisma.task.create({
            data: { title, description, userId: req.userId },
        });
        res.status(201).json(task);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
router.get("/", async (req, res) => {
    const tasks = await prisma.task.findMany({
        where: { userId: req.userId },
    });
    res.json(tasks);
});
router.get("/:id", async (req, res) => {
    const task = await prisma.task.findUnique({
        where: { id: Number(req.params.id) },
    });
    if (!task || task.userId !== req.userId) {
        return res.status(404).json({ error: "Tarefa não encontrada" });
    }
    res.json(task);
});
router.patch("/:id", async (req, res) => {
    try {
        const task = await prisma.task.findUnique({
            where: { id: Number(req.params.id) },
        });
        if (!task || task.userId !== req.userId) {
            return res.status(404).json({ error: "Tarefa não encontrada" });
        }
        const updated = await prisma.task.update({
            where: { id: task.id },
            data: {
                title: req.body.title ?? task.title,
                description: req.body.description ?? task.description,
                completed: req.body.completed ?? task.completed,
            },
        });
        res.json(updated);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const task = await prisma.task.findUnique({
            where: { id: Number(req.params.id) },
        });
        if (!task || task.userId !== req.userId) {
            return res.status(404).json({ error: "Tarefa não encontrada" });
        }
        await prisma.task.delete({ where: { id: task.id } });
        res.status(204).send();
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
export default router;
//# sourceMappingURL=tasks.js.map