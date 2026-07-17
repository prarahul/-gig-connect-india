import { Router, type IRouter } from "express";
import { db, workersTable, contactMessagesTable } from "@workspace/db";
import { RegisterWorkerBody, RegisterWorkerResponse, ListWorkersResponse } from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import ExcelJS from "exceljs";
import { requireAdmin } from "./admin";
import { sendWorkerRegistrationEmail } from "../lib/mailer";

const router: IRouter = Router();

// POST /workers/register
router.post("/workers/register", async (req, res): Promise<void> => {
  const parsed = RegisterWorkerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, phone, email, city, state, workType, platform, message } = parsed.data;

  // Check for duplicate phone
  const existing = await db
    .select()
    .from(workersTable)
    .where(eq(workersTable.phone, phone));

  if (existing.length > 0) {
    res.status(409).json({ error: "A worker with this phone number is already registered." });
    return;
  }

  const [worker] = await db
    .insert(workersTable)
    .values({ name, phone, email, city, state, workType, platform, message })
    .returning();

  const response = RegisterWorkerResponse.parse({
    id: worker.id,
    name: worker.name,
    phone: worker.phone,
    email: worker.email,
    city: worker.city,
    state: worker.state,
    workType: worker.workType,
    platform: worker.platform,
    message: worker.message,
    joinedAt: worker.joinedAt.toISOString(),
  });

  req.log.info({ workerId: worker.id }, "Worker registered");

  // Fire-and-forget email notification
  sendWorkerRegistrationEmail({
    name: worker.name,
    phone: worker.phone,
    email: worker.email,
    city: worker.city,
    state: worker.state,
    workType: worker.workType,
    platform: worker.platform,
    message: worker.message,
  }).catch((err) => req.log.error({ err }, "Failed to send worker registration email"));

  res.status(201).json(response);
});

// GET /workers  — admin only
router.get("/workers", requireAdmin, async (req, res): Promise<void> => {
  const workers = await db.select().from(workersTable).orderBy(workersTable.joinedAt);

  const response = ListWorkersResponse.parse({
    workers: workers.map((w) => ({
      id: w.id,
      name: w.name,
      phone: w.phone,
      ...(w.email != null && { email: w.email }),
      city: w.city,
      state: w.state,
      workType: w.workType,
      ...(w.platform != null && { platform: w.platform }),
      ...(w.message != null && { message: w.message }),
      joinedAt: w.joinedAt.toISOString(),
    })),
    total: workers.length,
  });

  res.json(response);
});

// GET /workers/export — admin only
router.get("/workers/export", requireAdmin, async (req, res): Promise<void> => {
  const [workers, messages] = await Promise.all([
    db.select().from(workersTable).orderBy(workersTable.joinedAt),
    db.select().from(contactMessagesTable).orderBy(contactMessagesTable.submittedAt),
  ]);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Gig Connect India";
  workbook.created = new Date();

  // ── Sheet 1: Registered Workers ──────────────────────────────────────────
  const workerSheet = workbook.addWorksheet("Registered Workers");
  workerSheet.columns = [
    { header: "Name",      key: "name",     width: 25 },
    { header: "Phone",     key: "phone",    width: 18 },
    { header: "Email",     key: "email",    width: 30 },
    { header: "City",      key: "city",     width: 18 },
    { header: "State",     key: "state",    width: 18 },
    { header: "Work Type", key: "workType", width: 20 },
    { header: "Platform",  key: "platform", width: 20 },
    { header: "Message",   key: "message",  width: 40 },
    { header: "Joined At", key: "joinedAt", width: 24 },
  ];

  styleHeaderRow(workerSheet, "FF1a2e4a");

  for (const w of workers) {
    workerSheet.addRow({
      name:     w.name,
      phone:    w.phone,
      email:    w.email ?? "",
      city:     w.city,
      state:    w.state,
      workType: w.workType.replace("_", " "),
      platform: w.platform ?? "",
      message:  w.message ?? "",
      joinedAt: w.joinedAt.toLocaleString("en-IN"),
    });
  }

  // Zebra striping for workers sheet
  workerSheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1 && rowNumber % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F7FA" } };
      });
    }
  });

  // ── Sheet 2: Contact Messages ─────────────────────────────────────────────
  const msgSheet = workbook.addWorksheet("Contact Messages");
  msgSheet.columns = [
    { header: "Name",         key: "name",        width: 25 },
    { header: "Email",        key: "email",        width: 30 },
    { header: "Phone",        key: "phone",        width: 18 },
    { header: "Subject",      key: "subject",      width: 35 },
    { header: "Message",      key: "message",      width: 50 },
    { header: "Submitted At", key: "submittedAt",  width: 24 },
  ];

  styleHeaderRow(msgSheet, "FFf47c20");

  for (const m of messages) {
    msgSheet.addRow({
      name:        m.name,
      email:       m.email,
      phone:       m.phone ?? "",
      subject:     m.subject,
      message:     m.message,
      submittedAt: m.submittedAt.toLocaleString("en-IN"),
    });
  }

  msgSheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1 && rowNumber % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF8F0" } };
      });
    }
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="gig-connect-data-${Date.now()}.xlsx"`
  );

  await workbook.xlsx.write(res);
  res.end();
  req.log.info({ workers: workers.length, messages: messages.length }, "Full Excel exported");
});

function styleHeaderRow(sheet: ExcelJS.Worksheet, argbColor: string) {
  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: argbColor } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });
  headerRow.height = 22;
}

export default router;
