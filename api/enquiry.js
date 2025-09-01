const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  try {
    // Support JSON and urlencoded/multipart
    let body = req.body || {};
    if (!body || Object.keys(body).length === 0 && req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
      // In some runtimes req.body may not be parsed for certain types
      // Vercel generally parses JSON automatically; this is a fallback no-op
      body = req.body || {};
    }

    const name = (body.name || '').toString().trim();
    const email = (body.email || '').toString().trim();
    const mobile = (body.mobile || '').toString().trim();
    const project = (body.project || 'Emaar India Business Centre').toString();

    if (!name || !mobile) {
      return res.status(400).send('Error: Missing required fields');
    }

    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASS,
      MAIL_FROM,
      MAIL_TO
    } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !MAIL_FROM || !MAIL_TO) {
      console.error('Missing SMTP environment variables');
      return res.status(500).send('Error: Email not configured');
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465, // true for 465, false otherwise
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });

    const subject = `New Enquiry: ${project}`;
    const text = `Project: ${project}\nName: ${name}\nEmail: ${email || 'N/A'}\nMobile: ${mobile}`;
    const html = `
      <h2>New Enquiry: ${escapeHtml(project)}</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${email ? escapeHtml(email) : 'N/A'}</p>
      <p><strong>Mobile:</strong> ${escapeHtml(mobile)}</p>
    `;

    await transporter.sendMail({
      from: MAIL_FROM,
      to: MAIL_TO,
      subject,
      text,
      html
    });

    return res.status(200).send('Thank You');
  } catch (err) {
    console.error('API error /api/enquiry:', err);
    return res.status(500).send('Error: Server error');
  }
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
