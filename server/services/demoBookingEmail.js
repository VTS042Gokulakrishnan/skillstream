const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

function demoBookingEmail(data, receivedAt = new Date().toISOString()) {
  const e = escapeHtml;
  const replyUrl = `mailto:${encodeURIComponent(data.email)}?subject=${encodeURIComponent("Your Skill Stream demo request")}`;
  const row = (label, value) => `<tr><td style="padding:10px 0;border-bottom:1px solid #e8edf3;"><div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#64748b;margin-bottom:5px;">${e(label)}</div><div style="font-size:15px;line-height:23px;color:#172b46;overflow-wrap:anywhere;word-break:break-word;">${e(value)}</div></td></tr>`;
  const note = `Confirm the appointment year${data.timezone_label ? "" : " and timezone"} with the requester before sending a calendar invitation.`;
  return {
    text: `New demo request (requested time, not a confirmed appointment)\n\n${Object.entries(data).map(([key, value]) => `${key}: ${value}`).join("\n")}\nreceivedAt: ${receivedAt}\n\n${note}`,
    html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>New demo request</title></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,Helvetica,sans-serif;color:#172b46;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${e(data.name)} requested a demo for ${e(data.month)} ${e(data.day)} at ${e(data.time)}.</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0f4f8;"><tr><td align="center" style="padding:32px 12px;">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #dfe7ef;border-radius:16px;overflow:hidden;">
<tr><td style="padding:28px 28px 30px;background:#102943;border-top:5px solid #28c6b0;">
<div style="font-size:19px;font-weight:bold;letter-spacing:1px;color:#ffffff;">SKILL STREAM <span style="color:#5ee0ca;">AI</span></div>
<div style="margin-top:30px;font-size:11px;font-weight:bold;letter-spacing:2px;color:#5ee0ca;">NEW DEMO REQUEST</div>
<h1 style="margin:10px 0 10px;font-size:30px;line-height:38px;color:#ffffff;">Your next conversation<br>starts here.</h1>
<p style="margin:0;font-size:15px;line-height:24px;color:#c6d6e6;">${e(data.name)} would like to see Skill Stream in action.</p>
</td></tr>
<tr><td style="padding:28px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#edf9f6;border:1px solid #c8eae2;border-radius:12px;"><tr><td style="padding:22px;">
<div style="font-size:11px;font-weight:bold;letter-spacing:1.5px;color:#237568;">REQUESTED DEMO TIME</div>
<div style="margin-top:10px;font-size:28px;line-height:36px;font-weight:bold;color:#123f39;">${e(data.month)} ${e(data.day)} <span style="color:#8ab7ac;font-weight:normal;">/</span> ${e(data.time)}</div>
<div style="margin-top:6px;font-size:13px;line-height:21px;color:#367469;">${e(data.timezone_label || "Timezone to be confirmed")}</div>
<div style="margin-top:14px;font-size:12px;color:#526c65;">Pending confirmation</div>
</td></tr></table>
<h2 style="margin:28px 0 6px;font-size:18px;color:#172b46;">Meet your prospective customer</h2>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0">${row("Name", data.name)}${row("Email address", data.email)}${data.phone ? row("Phone", data.phone) : ""}${row("Source", data.source || data.page)}</table>
<table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:26px;"><tr><td bgcolor="#126b5f" style="border-radius:8px;text-align:center;"><a href="${e(replyUrl)}" style="display:inline-block;padding:15px 24px;border:1px solid #126b5f;border-radius:8px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;">Reply to ${e(data.name)} &rarr;</a></td></tr></table>
<p style="margin:16px 0 0;font-size:13px;line-height:21px;color:#64748b;">${e(note)}</p>
</td></tr>
<tr><td style="padding:22px 28px;background:#f8fafc;border-top:1px solid #e8edf3;">
<div style="font-size:11px;letter-spacing:1px;font-weight:bold;color:#64748b;">REQUEST DETAILS</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0">${data.ref ? row("Reference", data.ref) : ""}${row("Submitted at (UTC)", data.submittedAt)}${row("Received at (UTC)", receivedAt)}${data.page_url ? row("Submitted from", data.page_url) : ""}</table>
<p style="margin:16px 0 0;font-size:11px;line-height:18px;color:#7b8798;">Skill Stream &middot; Demo booking notification<br>This is a demo request. A calendar appointment has not been created.</p>
</td></tr></table></td></tr></table></body></html>`,
  };
}

module.exports = { demoBookingEmail };
