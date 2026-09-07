// Set only to the owner's verified, public appointment-booking URL.
export const bookingUrl = '';
export function verifiedBookingUrl(value) {
  try {const url=new URL(value);return url.protocol==='https:' && ['calendar.google.com','calendar.app.google','calendly.com'].includes(url.hostname) ? url.href : ''; } catch {return '';}
}
