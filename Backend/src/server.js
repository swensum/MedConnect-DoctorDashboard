import express from "express";
import { PrismaClient } from "@prisma/client"; 
import { z } from "zod";

const app = express();
const prisma = new PrismaClient(); 

app.use(express.json());

const appointmentSchema = z.object({
  patientName: z.string().trim().min(2).max(80),
  reason: z.string().trim().max(200).optional(),
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// NEW: return all appointments
app.get("/appointments", async (req, res) => {//The browser sends: GET /appointments Express receives it. Then: res.json(appointments); sends the response back.
  const appointments = await prisma.appointment.findMany(); 
  res.json(appointments);
});

// CHANGED: now it saves the data
app.post("/appointments", async (req, res) => {
  const result = appointmentSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: "Invalid data",
      details: result.error.flatten().fieldErrors,
    });
  }

  const appointment = await prisma.appointment.create({
    data: result.data,
  });

   res.status(201).json(appointment);
});

app.listen(4000, () => console.log("Server running on http://localhost:4000"));