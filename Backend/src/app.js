import express from "express";
import cors from "cors";
import appointmentsRoutes from "./routes/appointments.routes.js";
import { requireAuth } from "./middleware/auth.js";
import meRoutes from "./routes/me.routes.js";
import kycRoutes from "./routes/kyc.routes.js";

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/appointments", requireAuth,appointmentsRoutes);
app.use("/me", requireAuth, meRoutes);

app.use("/kyc", requireAuth, kycRoutes);
export default app;