import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// Nepal is UTC+5:45 all year (no daylight saving). "Today" must mean Nepal's today,
// not the server's, or the numbers shift when you deploy to a server in another country.
const NP_OFFSET = (5 * 60 + 45) * 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const startOfDay = (d) => new Date(Math.floor((d.getTime() + NP_OFFSET) / DAY) * DAY - NP_OFFSET);

router.get("/", async (req, res) => {
  const doctorId = req.user.id; // from the token, so a doctor only ever sees their own numbers

  const todayStart = startOfDay(new Date());
  const tomorrowStart = new Date(todayStart.getTime() + DAY);
  const weekStart = new Date(todayStart.getTime() - 6 * DAY);

  // The database does the counting. Promise.all runs all 8 queries at the same time.
  const [today, pending, upcoming, patients, byType, byStatus, weekRows, recent] = await Promise.all([
    prisma.appointment.count({
      where: { doctorId, startsAt: { gte: todayStart, lt: tomorrowStart }, status: { not: "declined" } },
    }),
    prisma.appointment.count({ where: { doctorId, status: "pending" } }),
    prisma.appointment.count({ where: { doctorId, status: "upcoming" } }),
    prisma.appointment.findMany({ where: { doctorId }, distinct: ["patientName"], select: { patientName: true } }),
    prisma.appointment.groupBy({ by: ["type"], where: { doctorId }, _count: { _all: true } }),
    prisma.appointment.groupBy({ by: ["status"], where: { doctorId }, _count: { _all: true } }),
    prisma.appointment.findMany({
      where: { doctorId, status: { not: "declined" }, startsAt: { gte: weekStart, lt: tomorrowStart } },
      select: { startsAt: true },
    }),
    prisma.appointment.findMany({
      where: { doctorId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, patientName: true, status: true, createdAt: true },
    }),
  ]);

  // last 7 days (oldest first, today last), counted per Nepal day
  const week = Array.from({ length: 7 }, (_, i) => {
    const start = new Date(weekStart.getTime() + i * DAY);
    const end = new Date(start.getTime() + DAY);
    const label = DAY_NAMES[new Date(start.getTime() + NP_OFFSET).getUTCDay()];
    return [label, weekRows.filter((r) => r.startsAt >= start && r.startsAt < end).length];
  });

  const toMap = (rows, key) => Object.fromEntries(rows.map((r) => [r[key], r._count._all]));

  res.json({
    stats: { today, pending, upcoming, patients: patients.length }, // patients = distinct names for now
    week,
    types: toMap(byType, "type"),
    statuses: toMap(byStatus, "status"),
    recent,
  });
});

export default router;