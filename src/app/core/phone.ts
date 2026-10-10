/** Маска українського номера: +380 (XX) XXX-XX-XX */
export function formatPhone(raw: string): string {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('380')) d = d.slice(3);
  else if (d.startsWith('80')) d = d.slice(2);
  while (d.length > 9 && /^(380|80)/.test(d)) d = d.replace(/^3?80/, '');
  d = d.replace(/^0/, '').slice(0, 9);
  if (!d) return raw.startsWith('+380') ? '+380 (' : '';
  let out = '+380 (' + d.slice(0, 2);
  if (d.length >= 2) out += ') ';
  if (d.length > 2) out += d.slice(2, 5);
  if (d.length > 5) out += '-' + d.slice(5, 7);
  if (d.length > 7) out += '-' + d.slice(7, 9);
  return out;
}

export const isValidPhone = (v: string) => /^380\d{9}$/.test(v.replace(/\D/g, ''));
