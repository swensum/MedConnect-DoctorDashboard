import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  const doctor = await prisma.doctor.upsert({
    where: { id: req.user.id },
    update: {},
    create: { id: req.user.id, phone: req.user.phone },
  });
  res.json(doctor);
});

export default router;