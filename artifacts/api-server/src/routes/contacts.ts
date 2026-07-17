import { Router, type IRouter } from "express";
import { db, contactMessagesTable } from "@workspace/db";
import { SubmitContactBody, SubmitContactResponse, ListContactMessagesResponse } from "@workspace/api-zod";
import { requireAdmin } from "./admin";
import { sendContactMessageEmail } from "../lib/mailer";

const router: IRouter = Router();

// POST /contact
router.post("/contact", async (req, res): Promise<void> => {
  const parsed = SubmitContactBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, email, phone, subject, message } = parsed.data;

  const [msg] = await db
    .insert(contactMessagesTable)
    .values({ name, email, phone, subject, message })
    .returning();

  const response = SubmitContactResponse.parse({
    id: msg.id,
    name: msg.name,
    email: msg.email,
    phone: msg.phone,
    subject: msg.subject,
    message: msg.message,
    submittedAt: msg.submittedAt.toISOString(),
  });

  req.log.info({ messageId: msg.id }, "Contact message submitted");

  // Fire-and-forget email notification
  sendContactMessageEmail({
    name: msg.name,
    email: msg.email,
    phone: msg.phone,
    subject: msg.subject,
    message: msg.message,
  }).catch((err) => req.log.error({ err }, "Failed to send contact message email"));

  res.status(201).json(response);
});

// GET /contact/messages — admin only
router.get("/contact/messages", requireAdmin, async (req, res): Promise<void> => {
  const messages = await db
    .select()
    .from(contactMessagesTable)
    .orderBy(contactMessagesTable.submittedAt);

  const response = ListContactMessagesResponse.parse({
    messages: messages.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      phone: m.phone,
      subject: m.subject,
      message: m.message,
      submittedAt: m.submittedAt.toISOString(),
    })),
    total: messages.length,
  });

  res.json(response);
});

export default router;
