const RESEND_API_KEY = process.env["RESEND_API_KEY"];
const NOTIFY_EMAIL = process.env["NOTIFY_EMAIL"] ?? "rahulpraskt@gmail.com";
// Resend requires a verified sender domain for the "from" address.
// Until a custom domain is verified, use the Resend onboarding address.
const FROM_EMAIL = process.env["FROM_EMAIL"] ?? "onboarding@resend.dev";

async function sendEmail(subject: string, html: string): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn("[mailer] RESEND_API_KEY not set — skipping email");
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Gig Connect India <${FROM_EMAIL}>`,
      to: [NOTIFY_EMAIL],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }
}

export async function sendOtpEmail(otp: string): Promise<void> {
  await sendEmail(
    `Your Admin Login OTP — Gig Connect India`,
    `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto">
      <div style="background:#1a2e4a;padding:28px 32px;border-radius:10px 10px 0 0;text-align:center">
        <h2 style="color:#fff;margin:0;font-size:20px;letter-spacing:0.5px">Gig Connect India</h2>
        <p style="color:#f47c20;margin:6px 0 0;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase">Admin Portal — Login OTP</p>
      </div>
      <div style="background:#f9f9f9;padding:32px;border-radius:0 0 10px 10px;border:1px solid #e5e5e5;border-top:none;text-align:center">
        <p style="color:#444;font-size:15px;margin:0 0 24px">Use the code below to complete your login. It expires in <strong>5 minutes</strong>.</p>
        <div style="display:inline-block;background:#fff;border:2px solid #1a2e4a;border-radius:12px;padding:18px 40px;margin-bottom:24px">
          <span style="font-size:38px;font-weight:700;letter-spacing:12px;color:#1a2e4a;font-family:monospace">${otp}</span>
        </div>
        <p style="color:#888;font-size:13px;margin:0">If you did not attempt to log in, ignore this email.<br/>Someone entered your password — consider changing it.</p>
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e5e5;font-size:12px;color:#bbb">
          Gig Connect India · Admin Security
        </div>
      </div>
    </div>`
  );
}

export async function sendWorkerRegistrationEmail(worker: {
  name: string;
  phone: string;
  email?: string | null;
  city: string;
  state: string;
  workType: string;
  platform?: string | null;
  message?: string | null;
}) {
  const workTypeLabel = worker.workType.replace(/_/g, " ");
  await sendEmail(
    `New Worker Registration — ${worker.name}`,
    `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#1a2e4a;padding:24px;border-radius:8px 8px 0 0">
        <h2 style="color:#fff;margin:0;font-size:20px">New Worker Registration</h2>
        <p style="color:#f47c20;margin:4px 0 0;font-size:13px">Gig Connect India</p>
      </div>
      <div style="background:#f9f9f9;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e5e5e5;border-top:none">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#555;width:130px;font-size:14px"><b>Name</b></td><td style="padding:8px 0;font-size:14px">${worker.name}</td></tr>
          <tr><td style="padding:8px 0;color:#555;font-size:14px"><b>Phone</b></td><td style="padding:8px 0;font-size:14px">${worker.phone}</td></tr>
          <tr><td style="padding:8px 0;color:#555;font-size:14px"><b>Email</b></td><td style="padding:8px 0;font-size:14px">${worker.email ?? "—"}</td></tr>
          <tr><td style="padding:8px 0;color:#555;font-size:14px"><b>Location</b></td><td style="padding:8px 0;font-size:14px">${worker.city}, ${worker.state}</td></tr>
          <tr><td style="padding:8px 0;color:#555;font-size:14px"><b>Work Type</b></td><td style="padding:8px 0;font-size:14px;text-transform:capitalize">${workTypeLabel}</td></tr>
          <tr><td style="padding:8px 0;color:#555;font-size:14px"><b>Platform</b></td><td style="padding:8px 0;font-size:14px">${worker.platform ?? "—"}</td></tr>
          ${worker.message ? `<tr><td style="padding:8px 0;color:#555;font-size:14px;vertical-align:top"><b>Message</b></td><td style="padding:8px 0;font-size:14px">${worker.message}</td></tr>` : ""}
        </table>
        <div style="margin-top:20px;padding-top:16px;border-top:1px solid #e5e5e5;font-size:12px;color:#999">
          Gig Connect India — Admin notification
        </div>
      </div>
    </div>`
  );
}

export async function sendContactMessageEmail(msg: {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
}) {
  await sendEmail(
    `New Contact Message — ${msg.subject}`,
    `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#f47c20;padding:24px;border-radius:8px 8px 0 0">
        <h2 style="color:#fff;margin:0;font-size:20px">New Contact Message</h2>
        <p style="color:#fff9;margin:4px 0 0;font-size:13px">Gig Connect India</p>
      </div>
      <div style="background:#f9f9f9;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e5e5e5;border-top:none">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#555;width:130px;font-size:14px"><b>Name</b></td><td style="padding:8px 0;font-size:14px">${msg.name}</td></tr>
          <tr><td style="padding:8px 0;color:#555;font-size:14px"><b>Email</b></td><td style="padding:8px 0;font-size:14px">${msg.email}</td></tr>
          <tr><td style="padding:8px 0;color:#555;font-size:14px"><b>Phone</b></td><td style="padding:8px 0;font-size:14px">${msg.phone ?? "—"}</td></tr>
          <tr><td style="padding:8px 0;color:#555;font-size:14px"><b>Subject</b></td><td style="padding:8px 0;font-size:14px">${msg.subject}</td></tr>
        </table>
        <div style="margin-top:16px">
          <p style="color:#555;font-size:14px;margin:0 0 8px"><b>Message:</b></p>
          <div style="background:#fff;border:1px solid #e5e5e5;border-radius:6px;padding:14px;font-size:14px;color:#333;white-space:pre-wrap">${msg.message}</div>
        </div>
        <div style="margin-top:20px;padding-top:16px;border-top:1px solid #e5e5e5;font-size:12px;color:#999">
          Gig Connect India — Admin notification
        </div>
      </div>
    </div>`
  );
}
