import { Resend } from "resend";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { to } = req.body || {};
    if (!to) return res.status(400).json({ error: "Missing 'to'" });

    const resend = new Resend(process.env.RESEND_API_KEY);

    const result = await resend.emails.send({
      from: "Ticket Management <noreply@ticketmanagement.online>",
      to,
      subject: "Test email ✅",
      html: "<p>If you got this, your endpoint works.</p>",
    });

    return res.status(200).json({ ok: true, result });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message ?? String(e) });
  }
}
