import { Resend } from "resend";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  try {
    const { to } = req.body || {};
    if (!to) return res.status(400).json({ ok: false, error: "Missing 'to'" });

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return res.status(500).json({ ok: false, error: "Missing RESEND_API_KEY" });

    const resend = new Resend(apiKey);

    const result = await resend.emails.send({
      from: "Ticket Management <noreply@ticketmanagement.online>",
      to,
      subject: "Test email ✅",
      html: "<p>Test</p>",
    });

    // IMPORTANT: show what Resend returned (usually includes id)
    return res.status(200).json({ ok: true, to, result });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message ?? String(e) });
  }
}

