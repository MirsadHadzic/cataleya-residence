// lib/email.ts
import { Resend } from 'resend'

const SITE_NAME = 'Cataleya Residence'
const WHATSAPP = 'https://wa.me/387603088762'
const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || 'Cataleya Residence <onboarding@resend.dev>'

export interface EmailDeliveryResult {
  sent: boolean
  error?: string
}

export interface BookingEmailData {
  apartmentName: string
  checkIn: Date
  checkOut: Date
  guests: number
  name: string
  email: string
  phone: string
  message?: string | null
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getNights(checkIn: Date, checkOut: Date): number {
  return Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]!)
}

// Admin notification email

function buildAdminHtml(d: BookingEmailData): string {
  const nights = getNights(d.checkIn, d.checkOut)
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#FAF8F4;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF8F4;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #E8D0A9;max-width:600px;width:100%;">
  <tr><td style="background:#1C1C1C;padding:32px 40px;">
    <p style="margin:0;color:#C9A227;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">Cataleya</p>
    <p style="margin:4px 0 0;color:#fff;font-size:22px;font-family:Georgia,serif;">Residence</p>
  </td></tr>
  <tr><td style="padding:28px 40px 8px;border-bottom:1px solid #F2E3C6;">
    <p style="margin:0 0 6px;color:#C9A227;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">New Booking Request</p>
    <h1 style="margin:0;color:#1C1C1C;font-size:26px;font-weight:400;font-family:Georgia,serif;">${escapeHtml(d.apartmentName)}</h1>
  </td></tr>
  <tr><td style="padding:28px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="50%" style="padding-bottom:20px;vertical-align:top;">
          <p style="margin:0 0 4px;color:#8B7355;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Check In</p>
          <p style="margin:0;color:#1C1C1C;font-size:15px;font-family:Georgia,serif;">${formatDate(d.checkIn)}</p>
        </td>
        <td width="50%" style="padding-bottom:20px;vertical-align:top;">
          <p style="margin:0 0 4px;color:#8B7355;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Check Out</p>
          <p style="margin:0;color:#1C1C1C;font-size:15px;font-family:Georgia,serif;">${formatDate(d.checkOut)}</p>
        </td>
      </tr>
      <tr>
        <td width="50%" style="padding-bottom:20px;vertical-align:top;">
          <p style="margin:0 0 4px;color:#8B7355;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Duration</p>
          <p style="margin:0;color:#1C1C1C;font-size:15px;font-family:Georgia,serif;">${nights} ${nights !== 1 ? 'nights' : 'night'}</p>
        </td>
        <td width="50%" style="padding-bottom:20px;vertical-align:top;">
          <p style="margin:0 0 4px;color:#8B7355;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Guests</p>
          <p style="margin:0;color:#1C1C1C;font-size:15px;font-family:Georgia,serif;">${d.guests}</p>
        </td>
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="border-top:1px solid #F2E3C6;padding-bottom:24px;"></td></tr></table>
    <p style="margin:0 0 16px;color:#C9A227;font-size:10px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">Guest Details</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding-bottom:12px;">
        <p style="margin:0 0 2px;color:#8B7355;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Name</p>
        <p style="margin:0;color:#1C1C1C;font-size:15px;font-family:Georgia,serif;">${escapeHtml(d.name)}</p>
      </td></tr>
      <tr><td style="padding-bottom:12px;">
        <p style="margin:0 0 2px;color:#8B7355;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Email</p>
        <p style="margin:0;font-size:15px;font-family:Arial,sans-serif;"><a href="mailto:${escapeHtml(d.email)}" style="color:#C9A227;text-decoration:none;">${escapeHtml(d.email)}</a></p>
      </td></tr>
      <tr><td style="padding-bottom:12px;">
        <p style="margin:0 0 2px;color:#8B7355;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Phone</p>
        <p style="margin:0;font-size:15px;font-family:Arial,sans-serif;"><a href="tel:${escapeHtml(d.phone)}" style="color:#C9A227;text-decoration:none;">${escapeHtml(d.phone)}</a></p>
      </td></tr>
      ${d.message ? `<tr><td style="padding-bottom:12px;">
        <p style="margin:0 0 2px;color:#8B7355;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Message</p>
        <p style="margin:0;color:#4A4A4A;font-size:14px;font-family:Georgia,serif;line-height:1.6;">${escapeHtml(d.message)}</p>
      </td></tr>` : ''}
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;border-top:1px solid #F2E3C6;padding-top:24px;">
      <tr><td>
        <p style="margin:0 0 16px;color:#4A4A4A;font-size:13px;font-family:Arial,sans-serif;">Reply to the guest or use the quick links below.</p>
        <a href="mailto:${escapeHtml(d.email)}" style="display:inline-block;background:#C9A227;color:#fff;text-decoration:none;padding:12px 24px;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;margin-right:8px;">Reply by Email</a>
        <a href="https://wa.me/${d.phone.replace(/[^0-9]/g, '')}" style="display:inline-block;background:#1C1C1C;color:#fff;text-decoration:none;padding:12px 24px;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">WhatsApp</a>
      </td></tr>
    </table>
  </td></tr>
  <tr><td style="background:#F5F0E8;padding:18px 40px;border-top:1px solid #E8D0A9;">
    <p style="margin:0;color:#8B7355;font-size:11px;font-family:Arial,sans-serif;text-align:center;">${SITE_NAME} - Sarajevo, Bosnia &amp; Herzegovina</p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`
}

function buildAdminText(d: BookingEmailData): string {
  const nights = getNights(d.checkIn, d.checkOut)
  return [
    `NEW BOOKING REQUEST - ${SITE_NAME}`,
    '',
    `Apartment: ${d.apartmentName}`,
    `Check In:  ${formatDate(d.checkIn)}`,
    `Check Out: ${formatDate(d.checkOut)}`,
    `Duration:  ${nights} ${nights !== 1 ? 'nights' : 'night'}`,
    `Guests:    ${d.guests}`,
    '',
    'GUEST DETAILS',
    `Name:  ${d.name}`,
    `Email: ${d.email}`,
    `Phone: ${d.phone}`,
    d.message ? `Message: ${d.message}` : '',
  ].filter(l => l !== undefined).join('\n').trim()
}

// Guest confirmation email

function buildGuestHtml(d: BookingEmailData): string {
  const nights = getNights(d.checkIn, d.checkOut)
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#FAF8F4;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF8F4;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #E8D0A9;max-width:600px;width:100%;">
  <tr><td style="background:#1C1C1C;padding:32px 40px;">
    <p style="margin:0;color:#C9A227;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">Cataleya</p>
    <p style="margin:4px 0 0;color:#fff;font-size:22px;font-family:Georgia,serif;">Residence</p>
  </td></tr>
  <tr><td style="padding:36px 40px 0;">
    <h1 style="margin:0 0 16px;color:#1C1C1C;font-size:24px;font-weight:400;font-family:Georgia,serif;">Thank you, ${escapeHtml(d.name)}.</h1>
    <p style="margin:0;color:#4A4A4A;font-size:15px;font-family:Arial,sans-serif;line-height:1.7;font-weight:300;">
      We have received your booking request for <strong style="color:#1C1C1C;">${escapeHtml(d.apartmentName)}</strong> and we are looking forward to welcoming you to Sarajevo.
    </p>
    <p style="margin:16px 0 0;color:#4A4A4A;font-size:15px;font-family:Arial,sans-serif;line-height:1.7;font-weight:300;">
      We will get back to you personally within 24 hours to confirm availability and share the details for your stay.
    </p>
  </td></tr>
  <tr><td style="padding:28px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF5EC;border:1px solid #E8D0A9;">
      <tr><td style="padding:24px 28px;">
        <p style="margin:0 0 18px;color:#C9A227;font-size:10px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">Your Request Summary</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="50%" style="padding-bottom:14px;vertical-align:top;">
              <p style="margin:0 0 3px;color:#8B7355;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Apartment</p>
              <p style="margin:0;color:#1C1C1C;font-size:14px;font-family:Georgia,serif;">${escapeHtml(d.apartmentName)}</p>
            </td>
            <td width="50%" style="padding-bottom:14px;vertical-align:top;">
              <p style="margin:0 0 3px;color:#8B7355;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Guests</p>
              <p style="margin:0;color:#1C1C1C;font-size:14px;font-family:Georgia,serif;">${d.guests} ${d.guests === 1 ? 'guest' : 'guests'}</p>
            </td>
          </tr>
          <tr>
            <td width="50%" style="padding-bottom:14px;vertical-align:top;">
              <p style="margin:0 0 3px;color:#8B7355;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Check In</p>
              <p style="margin:0;color:#1C1C1C;font-size:14px;font-family:Georgia,serif;">${formatDate(d.checkIn)}</p>
            </td>
            <td width="50%" style="padding-bottom:14px;vertical-align:top;">
              <p style="margin:0 0 3px;color:#8B7355;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Check Out</p>
              <p style="margin:0;color:#1C1C1C;font-size:14px;font-family:Georgia,serif;">${formatDate(d.checkOut)}</p>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <p style="margin:0 0 3px;color:#8B7355;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Duration</p>
              <p style="margin:0;color:#1C1C1C;font-size:14px;font-family:Georgia,serif;">${nights} ${nights === 1 ? 'night' : 'nights'}</p>
            </td>
          </tr>
          ${d.message ? `<tr><td colspan="2" style="padding-top:14px;border-top:1px solid #E8D0A9;">
            <p style="margin:0 0 3px;color:#8B7355;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Your Message</p>
            <p style="margin:0;color:#4A4A4A;font-size:13px;font-family:Arial,sans-serif;line-height:1.6;">${escapeHtml(d.message)}</p>
          </td></tr>` : ''}
        </table>
      </td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:0 40px 36px;">
    <p style="margin:0 0 16px;color:#4A4A4A;font-size:14px;font-family:Arial,sans-serif;line-height:1.7;font-weight:300;">
      If you need anything in the meantime or want to confirm immediately, feel free to reach out directly.
    </p>
    <a href="${WHATSAPP}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:12px 28px;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Message us on WhatsApp</a>
  </td></tr>
  <tr><td style="padding:24px 40px;border-top:1px solid #F2E3C6;">
    <p style="margin:0;color:#4A4A4A;font-size:14px;font-family:Georgia,serif;font-style:italic;line-height:1.7;">We look forward to hosting you in Sarajevo.</p>
    <p style="margin:8px 0 0;color:#8B7355;font-size:13px;font-family:Arial,sans-serif;font-weight:300;">The Cataleya Residence team</p>
  </td></tr>
  <tr><td style="background:#F5F0E8;padding:18px 40px;border-top:1px solid #E8D0A9;">
    <p style="margin:0;color:#8B7355;font-size:11px;font-family:Arial,sans-serif;text-align:center;">Cataleya Residence - Sarajevo, Bosnia &amp; Herzegovina</p>
    <p style="margin:4px 0 0;color:#B0A090;font-size:10px;font-family:Arial,sans-serif;text-align:center;">This is a confirmation of your request, not a final booking confirmation.</p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`
}

function buildGuestText(d: BookingEmailData): string {
  const nights = getNights(d.checkIn, d.checkOut)
  return [
    `Thank you, ${d.name}.`,
    '',
    `We have received your booking request for ${d.apartmentName} and we look forward to welcoming you to Sarajevo.`,
    '',
    'We will get back to you within 24 hours to confirm availability.',
    '',
    'YOUR REQUEST SUMMARY',
    `Apartment: ${d.apartmentName}`,
    `Check In:  ${formatDate(d.checkIn)}`,
    `Check Out: ${formatDate(d.checkOut)}`,
    `Duration:  ${nights} ${nights === 1 ? 'night' : 'nights'}`,
    `Guests:    ${d.guests}`,
    d.message ? `Message:   ${d.message}` : '',
    '',
    `Need to reach us? Message us on WhatsApp: ${WHATSAPP}`,
    '',
    'We look forward to hosting you.',
    'The Cataleya Residence team',
    '',
    '---',
    'This is a confirmation of your request, not a final booking confirmation.',
  ].filter(l => l !== undefined).join('\n').trim()
}

async function sendEmail(
  options: Parameters<Resend['emails']['send']>[0],
  recipientLabel: string
): Promise<EmailDeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    const error = 'RESEND_API_KEY nije konfigurisan.'
    console.error(`${recipientLabel} nije poslan: ${error}`)
    return { sent: false, error }
  }
  try {
    const { error } = await new Resend(apiKey).emails.send(options)
    if (error) {
      console.error(`${recipientLabel} nije poslan:`, error)
      return { sent: false, error: 'E-mail nije isporučen. Provjerite Resend konfiguraciju.' }
    }
    return { sent: true }
  } catch (err) {
    console.error(`${recipientLabel} nije poslan:`, err)
    return { sent: false, error: 'E-mail nije isporučen. Provjerite Resend konfiguraciju.' }
  }
}

export async function sendBookingNotification(
  data: BookingEmailData,
  recipient?: string
): Promise<EmailDeliveryResult> {
  if (!recipient) {
    const error = 'Adresa za obavijesti o rezervacijama nije podešena.'
    console.error(error)
    return { sent: false, error }
  }
  return sendEmail({
    from: FROM_ADDRESS,
    to: recipient,
    replyTo: data.email,
    subject: `New Booking Request - ${data.apartmentName} - ${data.name}`,
    html: buildAdminHtml(data),
    text: buildAdminText(data),
  }, 'Obavijest administratoru')
}

export async function sendBookingRequestReceived(
  data: BookingEmailData,
  replyTo?: string
): Promise<EmailDeliveryResult> {
  return sendEmail({
    from: FROM_ADDRESS,
    to: data.email,
    ...(replyTo ? { replyTo } : {}),
    subject: 'Your booking request - Cataleya Residence',
    html: buildGuestHtml(data),
    text: buildGuestText(data),
  }, 'Potvrda prijema zahtjeva gostu')
}

export async function sendBookingConfirmation(
  data: BookingEmailData,
  replyTo?: string
): Promise<EmailDeliveryResult> {
  const safeName = escapeHtml(data.name)
  const safeApartment = escapeHtml(data.apartmentName)
  const nights = getNights(data.checkIn, data.checkOut)
  const details = `Apartman: ${data.apartmentName}\nDolazak: ${formatDate(data.checkIn)}\nOdlazak: ${formatDate(data.checkOut)}\nBroj noćenja: ${nights}\nBroj gostiju: ${data.guests}`
  const html = `<!DOCTYPE html><html lang="bs"><head><meta charset="UTF-8"/></head><body style="margin:0;padding:40px 20px;background:#FAF8F4;font-family:Arial,sans-serif;"><table width="600" style="max-width:600px;width:100%;margin:auto;background:#fff;border:1px solid #E8D0A9;"><tr><td style="background:#1C1C1C;padding:28px 36px;color:#fff;"><span style="color:#C9A227;text-transform:uppercase;letter-spacing:3px;">Cataleya Residence</span></td></tr><tr><td style="padding:32px 36px;color:#4A4A4A;line-height:1.7;"><h1 style="color:#1C1C1C;font-size:24px;font-weight:400;">Rezervacija je potvrđena</h1><p>Poštovani/a ${safeName},</p><p>Potvrđujemo Vašu rezervaciju apartmana <strong>${safeApartment}</strong>.</p><p><strong>Dolazak:</strong> ${formatDate(data.checkIn)}<br/><strong>Odlazak:</strong> ${formatDate(data.checkOut)}<br/><strong>Noćenja:</strong> ${nights}<br/><strong>Broj gostiju:</strong> ${data.guests}</p><p>Radujemo se Vašem dolasku u Sarajevo.</p></td></tr><tr><td style="background:#F5F0E8;padding:18px;text-align:center;color:#8B7355;">Cataleya Residence — Sarajevo, Bosna i Hercegovina</td></tr></table></body></html>`
  return sendEmail({
    from: FROM_ADDRESS,
    to: data.email,
    ...(replyTo ? { replyTo } : {}),
    subject: 'Vaša rezervacija je potvrđena - Cataleya Residence',
    html,
    text: `Poštovani/a ${data.name},\n\nVaša rezervacija je potvrđena.\n\n${details}\n\nRadujemo se Vašem dolasku u Sarajevo.\nCataleya Residence`,
  }, 'Potvrda rezervacije gostu')
}