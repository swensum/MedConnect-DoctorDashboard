import { Router } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { supabase } from "../lib/supabase.js";

const router = Router();

const BUCKET = "kyc-documents"; // private bucket you create in Supabase
const MAX_SIZE = 10 * 1024 * 1024;
const EXT = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png" };
const kindSchema = z.enum(["LICENSE", "DEGREE", "CLINIC_PROOF"]);

const bad = (res, result) =>
  res.status(400).json({ error: "Invalid data", details: result.error.flatten().fieldErrors });

// Documents can only change while the doctor is NOT_SUBMITTED or REJECTED.
// An approved doctor must not be able to swap a verified document.
async function requireEditable(req, res, next) {
  const doctor = await prisma.doctor.upsert({
    where: { id: req.user.id },
    update: {},
    create: { id: req.user.id, phone: req.user.phone },
  });
  if (!["NOT_SUBMITTED", "REJECTED"].includes(doctor.kycStatus)) {
    return res.status(409).json({ error: "Your KYC is already submitted or approved" });
  }
  next();
}

/* ---------- 1. ask for a one-time upload link ---------- */
const uploadSchema = z.object({
  kind: kindSchema,
  fileName: z.string().trim().min(1).max(200),
  contentType: z.enum(Object.keys(EXT)),
  size: z.number().int().min(1).max(MAX_SIZE),
});

router.post("/upload-url", requireEditable, async (req, res) => {
  const result = uploadSchema.safeParse(req.body);
  if (!result.success) return bad(res, result);

  const { kind, contentType } = result.data;
  // WE choose the path. The user's file name never touches it.
  const path = `kyc/${req.user.id}/${kind.toLowerCase()}-${randomUUID()}.${EXT[contentType]}`;

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Could not create upload link" });
  }
  res.json({ path: data.path, token: data.token });
});

/* ---------- 2. record the file after it was uploaded ---------- */
const docSchema = z.object({
  kind: kindSchema,
  path: z.string().min(1).max(300),
  fileName: z.string().trim().min(1).max(200),
});

router.post("/documents", requireEditable, async (req, res) => {
  const result = docSchema.safeParse(req.body);
  if (!result.success) return bad(res, result);

  const { kind, path, fileName } = result.data;
  // A doctor may only register files inside their OWN folder.
  if (!path.startsWith(`kyc/${req.user.id}/`) || path.includes("..")) {
    return res.status(400).json({ error: "Invalid file path" });
  }

  const key = { doctorId_kind: { doctorId: req.user.id, kind } };
  const old = await prisma.kycDocument.findUnique({ where: key });

  const doc = await prisma.kycDocument.upsert({
    where: key,
    update: { filePath: path, fileName },
    create: { doctorId: req.user.id, kind, filePath: path, fileName },
  });

  // replaced a file? delete the old one so no orphan stays in the bucket
  if (old && old.filePath !== path) {
    await supabase.storage.from(BUCKET).remove([old.filePath]);
  }
  res.status(201).json(doc);
});

/* ---------- 3. remove a file ---------- */
router.delete("/documents/:kind", requireEditable, async (req, res) => {
  const kind = kindSchema.safeParse(req.params.kind);
  if (!kind.success) return res.status(400).json({ error: "Invalid document type" });

  const doc = await prisma.kycDocument.findUnique({
    where: { doctorId_kind: { doctorId: req.user.id, kind: kind.data } },
  });
  if (doc) {
    await supabase.storage.from(BUCKET).remove([doc.filePath]);
    await prisma.kycDocument.delete({ where: { id: doc.id } });
  }
  res.json({ ok: true });
});

/* ---------- 4. submit the form ---------- */
const kycSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  specialization: z.string().trim().min(2).max(60),
  licenseNo: z.string().trim().min(2).max(40),
  experienceYears: z.number().int().min(0).max(70),
  fee: z.number().int().min(0).max(100000).optional(),
});

router.post("/", async (req, res) => {
  const result = kycSchema.safeParse(req.body);
  if (!result.success) return bad(res, result);

  await prisma.doctor.upsert({
    where: { id: req.user.id },
    update: {},
    create: { id: req.user.id, phone: req.user.phone },
  });

  // The SERVER checks the required files exist. React's check is not enough.
  const docs = await prisma.kycDocument.findMany({
    where: { doctorId: req.user.id },
    select: { kind: true },
  });
  const kinds = docs.map((d) => d.kind);
  if (!kinds.includes("LICENSE") || !kinds.includes("DEGREE")) {
    return res.status(400).json({ error: "Upload your medical license and degree certificate first" });
  }

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