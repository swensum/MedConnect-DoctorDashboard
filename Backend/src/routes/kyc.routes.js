import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const router = Router();

const kycSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  specialization: z.string().trim().min(2).max(60),
  licenseNo: z.string().trim().min(2).max(40),
  experienceYears: z.number().int().min(0).max(70),
  fee: z.number().int().min(0).max(100000).optional(),
});

// POST /kyc  -> save the form and mark the doctor as PENDING review
router.post("/", async (req, res) => {
  const result = kycSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: "Invalid data",
      details: result.error.flatten().fieldErrors,
    });
  }

  // make sure the doctor row exists (same idea as GET /me)
  await prisma.doctor.upsert({
    where: { id: req.user.id },
    update: {},
    create: { id: req.user.id, phone: req.user.phone },
  });

  // Only NOT_SUBMITTED or REJECTED doctors may submit.
  // PENDING / APPROVED doctors match nothing, so count is 0 -> 409.
  const { count } = await prisma.doctor.updateMany({
    where: { id: req.user.id, kycStatus: { in: ["NOT_SUBMITTED", "REJECTED"] } },
    data: { ...result.data, kycStatus: "PENDING", rejectionReason: null },
  });

  if (count === 0) {
    return res.status(409).json({ error: "Your KYC is already submitted or approved" });
  }

  const doctor = await prisma.doctor.findUnique({ where: { id: req.user.id } });
  res.status(201).json(doctor);
});

export default router;