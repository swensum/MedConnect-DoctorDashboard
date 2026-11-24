import express from "express";
import appointmentsRoutes from "./routes/appointments.routes.js";
import { requireAuth } from "./middleware/auth.js";


const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/appointments", requireAuth,appointmentsRoutes);

export default app;