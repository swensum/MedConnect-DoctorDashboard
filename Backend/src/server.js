import express from "express";
import { PrismaClient } from "@prisma/client"; 
const app = express();//creating server

app.use(express.json());

const appointments = []; // NEW: our fake database (lives in memory)

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// NEW: return all appointments
app.get("/appointments", (req, res) => {//The browser sends: GET /appointments Express receives it. Then: res.json(appointments); sends the response back.
  res.json(appointments);
});

// CHANGED: now it saves the data
app.post("/appointments", (req, res) => {
  const { patientName, reason } = req.body;

  const appointment = {
    id: appointments.length + 1,
    patientName,
    reason,
    status: "pending",
  };

  appointments.push(appointment);
  res.status(201).json(appointment);
});

app.listen(4000, () => console.log("Server running on http://localhost:4000")); //