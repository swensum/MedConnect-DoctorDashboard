import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const router = Router();

const appointmentSchema = z.object({
  patientName: z.string().trim().min(2).max(80),
  reason: z.string().trim().max(200).optional(),
});

const statusSchema = z.object({
  status: z.enum(["pending", "upcoming", "declined"]),
});

router.get("/", async (req, res) => {
  const appointments = await prisma.appointment.findMany({
    where: { doctorId: req.user.id },
  });
  res.json(appointments);
});

router.post("/", async (req, res) => {
  const result = appointmentSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: "Invalid data",
      details: result.error.flatten().fieldErrors,
    });
  }

  const appointment = await prisma.appointment.create({ data: { ...result.data, doctorId: req.user.id },});
  res.status(201).json(appointment);
});

router.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  const result = statusSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: "Invalid data",
      details: result.error.flatten().fieldErrors,
    });
  }

  try {
    const appointment = await prisma.appointment.update({
  where: { id, doctorId: req.user.id },
  data: { status: result.data.status },
});
    res.json(appointment);
  } catch (e) {
    if (e.code === "P2025") {
      return res.status(404).json({ error: "Appointment not found" });
    }
    throw e;
  }
});

export default router;