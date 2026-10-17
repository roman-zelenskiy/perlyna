/** English site content. Same shape as content.uk.ts; photo IDs are shared. */
import * as uk from './content.uk';

export const clinic = {
  ...uk.clinic,
  name: 'Perlyna',
  legalName: 'Perlyna Dental Clinic',
  street: '24 Yaroslaviv Val St',
  city: 'Kyiv',
  metro: 'Zoloti Vorota metro, 5 min walk',
  hours: [
    { days: 'Mon–Fri', time: '8:00–21:00' },
    { days: 'Sat', time: '9:00–18:00' },
    { days: 'Sun', time: 'by appointment' },
  ],
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Kyiv, Yaroslaviv Val St, 24')}`,
};

export const siteUrl = uk.siteUrl;

export const nav = [
  { href: '#services', label: 'Services' },
  { href: '#prices', label: 'Prices' },
  { href: '#tech', label: 'Technology' },
  { href: '#doctors', label: 'Doctors' },
  { href: '#cases', label: 'Cases' },
  { href: '#faq', label: 'FAQ' },
];

export const heroStats = [
  { value: 12, suffix: '', label: 'years of experience' },
  { value: 15000, suffix: '+', label: 'patients' },
  { value: 4200, suffix: '+', label: 'implants placed' },
];

export const fears = [
  {
    id: 'pain',
    fear: 'I’m scared of pain',
    fearText: 'Childhood memories of the drill, fear of the needle and of “feeling everything”.',
    solutionTitle: 'Pain-free treatment — even the injection',
    solution:
      'We apply a numbing gel first, and the injection itself is given by The Wand computer-controlled system: the anaesthetic flows so slowly you don’t feel it. If you’re especially anxious, we offer nitrous oxide sedation.',
    points: ['Computer-controlled anaesthesia', 'Sedation on request', 'Raise your hand — and the dentist stops'],
  },
  {
    id: 'cost',
    fear: 'I’m afraid of surprise costs',
    fearText: 'You come in for one filling — and the bill ends up three times what you were told.',
    solutionTitle: 'A fixed quote before treatment starts',
    solution:
      'At the consultation we take a 3D scan, put together a treatment plan with every item and price, and fix the total in writing. If anything extra is needed along the way — only with your consent.',
    points: ['The price in your plan doesn’t change', '0% instalments for up to 10 months', 'Guarantee of up to 10 years'],
  },
  {
    id: 'queue',
    fear: 'No time to wait around',
    fearText: 'You’re booked “for the afternoon” and then sit in the corridor for an hour after taking time off work.',
    solutionTitle: 'Seen on time, to the minute',
    solution:
      'We schedule visits with a buffer so the dentist never runs late. We remind you on Telegram and can combine treatment into 1–2 longer visits so you don’t have to come in every week.',
    points: ['Open from 8:00 to 21:00', 'Telegram reminders', 'Book online in 30 seconds'],
  },
];

const svc: Record<uk.ServiceId, { title: string; lead: string; items: string[]; alt: string }> = {
  therapy: {
    title: 'Fillings & cavity treatment',
    lead: 'We treat teeth under a microscope, preserving as much of your own tooth as possible. Fillings you can’t tell apart from enamel.',
    items: ['Cavity treatment', 'Root canal treatment under a microscope', 'Aesthetic restorations'],
    alt: 'Dentist in a mask holding a mirror and probe',
  },
  implants: {
    title: 'Dental implants',
    lead: 'Dental implants in Kyiv with digital planning: first a 3D model and surgical guide, then precise placement in 40 minutes.',
    items: ['Straumann, Nobel and Osstem implants', 'All-on-4/6 full-arch implants', 'Sinus lift and bone grafting'],
    alt: 'Dental implant model with a crown next to tooth models',
  },
  ortho: {
    title: 'Orthodontics: aligners & braces',
    lead: 'We straighten teeth with clear aligners or braces and show you the result on a 3D model before we start.',
    items: ['Clear aligners', 'Ceramic and sapphire braces', 'Retainers after treatment'],
    alt: 'Patient holding a clear aligner next to her smile',
  },
  aesthetic: {
    title: 'Aesthetics: veneers & whitening',
    lead: 'Veneers in Kyiv with digital smile design: you see your future result before any tooth preparation.',
    items: ['E.max ceramic veneers', 'Philips Zoom whitening', 'Digital smile design'],
    alt: 'Smiling woman with straight white teeth',
  },
  hygiene: {
    title: 'Professional cleaning',
    lead: 'Gentle Air Flow and ultrasonic cleaning with no unpleasant sensations. We recommend it every 6 months.',
    items: ['Ultrasonic scaling and Air Flow', 'Polishing and fluoride', 'Home-care recommendations'],
    alt: 'Bamboo toothbrushes in a glass on a light background',
  },
  kids: {
    title: 'Children’s dentistry',
    lead: 'The first visit is a get-to-know-you visit with no treatment. A paediatric dentist, cartoons on the ceiling and treatment under sedation if needed.',
    items: ['Adaptation visit', 'Fissure sealing', 'Baby tooth treatment'],
    alt: 'Smiling boy flexing his “strong” arms',
  },
};
export const services: typeof uk.services = uk.services.map((s) => ({ ...s, ...svc[s.id] }));

const uah = (s: string) =>
  s
    .replace(/^від (.+) грн$/, 'from $1 UAH')
    .replace(/^(.+) грн$/, '$1 UAH')
    .replace(/(\d) (\d{3})/g, '$1,$2');

const rows: Record<uk.ServiceId, { label: string; rows: { name: string; note?: string }[] }> = {
  therapy: {
    label: 'Fillings',
    rows: [
      { name: 'Consultation and treatment plan', note: 'free' },
      { name: 'Cavity treatment (filling)' },
      { name: 'Root canal treatment under a microscope (1 canal)' },
      { name: 'Aesthetic restoration of a front tooth' },
      { name: 'Computer-controlled anaesthesia' },
    ],
  },
  implants: {
    label: 'Implants',
    rows: [
      { name: 'Osstem implant (Korea), all-inclusive', note: 'with crown' },
      { name: 'Straumann implant (Switzerland)' },
      { name: 'Surgical guide' },
      { name: 'Closed sinus lift' },
      { name: 'All-on-4 protocol', note: 'per arch' },
    ],
  },
  ortho: {
    label: 'Orthodontics',
    rows: [
      { name: 'Diagnostics and 3D plan' },
      { name: 'Aligners (simple case)' },
      { name: 'Aligners (complex case)' },
      { name: 'Ceramic braces (one arch)' },
      { name: 'Retainer' },
    ],
  },
  aesthetic: {
    label: 'Aesthetics',
    rows: [
      { name: 'Digital smile design', note: 'credited towards treatment' },
      { name: 'E.max veneer' },
      { name: 'Composite veneer' },
      { name: 'Philips Zoom whitening' },
      { name: 'At-home whitening (trays + gel)' },
    ],
  },
  hygiene: {
    label: 'Cleaning',
    rows: [
      { name: 'Professional cleaning (ultrasonic + Air Flow)' },
      { name: 'Cleaning for patients with braces' },
      { name: 'Fluoride treatment' },
    ],
  },
  kids: {
    label: 'Kids',
    rows: [
      { name: 'Adaptation visit' },
      { name: 'Fissure sealing (1 tooth)' },
      { name: 'Baby tooth treatment' },
      { name: 'Treatment under sedation' },
    ],
  },
};
export const priceTabs: typeof uk.priceTabs = uk.priceTabs.map((t) => ({
  id: t.id,
  label: rows[t.id].label,
  rows: t.rows.map((r, i) => ({ name: rows[t.id].rows[i].name, price: uah(r.price), note: rows[t.id].rows[i].note })),
}));

const tech = {
  scanner: {
    title: '3D scanner',
    name: 'Intraoral scanner',
    text: 'Instead of messy impressions — a 2-minute scan. We get an accurate 3D model of your teeth and show it to you on screen right away.',
    specs: ['20 µm accuracy', 'No impression material', 'Model ready in 2 minutes'],
    alt: 'Dentist showing a 3D jaw model on a tablet',
  },
  ct: {
    title: 'CT',
    name: 'Cone beam CT',
    text: 'A 3D image of the jaw in 15 seconds with a minimal radiation dose. We see bone, canals and nerves to the millimetre — no guesswork.',
    specs: ['15-second scan', 'Lower dose than a flight', 'Included with implants'],
    alt: 'Dentist examining dental X-rays',
  },
  microscope: {
    title: 'Microscope',
    name: 'Dental microscope',
    text: 'Up to 25× magnification lets us find every canal and save teeth that other clinics would suggest pulling.',
    specs: ['25× magnification', '97% root canal success rate', 'Video recording of treatment'],
    alt: 'Dentist treating a patient next to a monitor',
  },
  sedation: {
    title: 'Sedation',
    name: 'Sedation & computer-controlled anaesthesia',
    text: 'Nitrous oxide eases anxiety in 3 minutes: you’re awake but calm. The effect wears off right after the procedure — you can drive home.',
    specs: ['Works in 3 minutes', 'No general anaesthesia', 'Safe for children'],
    alt: 'Bright dental surgery with a turquoise chair',
  },
} as const;
export const technologies: typeof uk.technologies = uk.technologies.map((t) => ({ ...t, ...tech[t.id as keyof typeof tech] })) as unknown as typeof uk.technologies;

const docs = [
  { name: 'Olena Hrebeniuk', role: 'Chief dentist, endodontist', details: ['Root canal treatment under a microscope', 'Member of the Ukrainian Endodontic Association', '3,000+ teeth saved'] },
  { name: 'Andrii Kovalchuk', role: 'Implant surgeon', details: ['4,200+ implants placed', 'Straumann and Nobel certified', 'All-on-4/6 protocols'] },
  { name: 'Maksym Yarosh', role: 'Orthodontist', details: ['Aligners and braces', '600+ completed cases', 'Treatment for adult patients'] },
  { name: 'Iryna Savchenko', role: 'Cosmetic dentist', details: ['E.max veneers and digital smile design', 'Lecturer in aesthetic restoration', 'Trained in Milan'] },
  { name: 'Denys Lytvyn', role: 'Paediatric dentist', details: ['Treats children from age 2', 'Sedation and treatment while asleep', 'Fear-free adaptation visits'] },
];
export const doctors: typeof uk.doctors = uk.doctors.map((d, i) => ({ ...d, ...docs[i] }));

const cs = [
  { title: 'E.max veneers', meta: '8 veneers · 2 visits · 3 weeks', text: 'The patient was embarrassed by dark fillings and uneven edges. Digital smile design — and 8 ceramic veneers without grinding the teeth down to stumps.', alt: 'Smiling woman with straight, light teeth' },
  { title: 'Zoom whitening', meta: '1 visit · 1.5 hours · 6 shades lighter', text: '10 years of coffee and cigarettes. After a professional cleaning — one Philips Zoom session with no extra sensitivity.', alt: 'Smiling man with white teeth' },
  { title: 'Aligners', meta: '22 trays · 11 months', text: 'Crowded lower teeth the patient used to hide in photos. Aligners instead of braces — none of his colleagues noticed the treatment.', alt: 'Smiling man with straight teeth' },
];
export const cases: typeof uk.cases = uk.cases.map((c, i) => ({ ...c, ...cs[i] }));

export const installment = uk.installment;

const rv = [
  { name: 'Kateryna Lytvynenko', service: 'Root canal treatment', text: 'I was terrified of dentists and put off treatment for two years. Here they gave me an injection I genuinely didn’t feel. Dr Olena explained everything on screen — for the first time it wasn’t scary.' },
  { name: 'Oleh Martyniuk', service: 'Implants', text: 'I got a plan with the exact total at the consultation — and it didn’t change by a single hryvnia. The implant was placed in 40 minutes, and the next day I was back at work.' },
  { name: 'Svitlana Kravchuk', service: 'Veneers', text: 'First I saw my new smile on the computer, and only then did we start. The result is exactly what they showed me. Now I smile in every photo.' },
  { name: 'Dmytro Hnatiuk', service: 'Aligners', text: 'I wore aligners for 11 months and not a single colleague noticed. A short check-up every 6 weeks, everything right on schedule.' },
  { name: 'Anna Shevchuk', service: 'Children’s dentistry', text: 'After the first visit my son asked to go again! The dentist just played with him at first, and the treatment was done at the second appointment.' },
  { name: 'Viktor Bondar', service: 'Professional cleaning', text: 'I’ve been coming for a cleaning twice a year for four years now. Never waited in the corridor more than two minutes, and reminders come on Telegram.' },
  { name: 'Mariia Tkach', service: 'Whitening', text: 'I was worried about sensitivity after whitening — there was none at all. The result looks natural, not that unnatural “bathroom-tile” white.' },
];
export const reviews: typeof uk.reviews = uk.reviews.map((r, i) => ({ ...r, ...rv[i] }));

export const faq = [
  { q: 'Will the treatment really be painless?', a: 'Yes. We apply a numbing gel before the injection and use computer-controlled anaesthesia, which delivers the anaesthetic so slowly you don’t feel the needle. If you’re anxious, we add nitrous oxide sedation. You can always raise your hand — and the dentist will stop.' },
  { q: 'How much does a consultation cost?', a: 'Your first consultation is free. It takes 40 minutes: an examination, a 3D scan, a CT scan if needed (when planning implants) and a treatment plan with a fixed quote that you take home.' },
  { q: 'Can the price change during treatment?', a: 'No. The total in your treatment plan is fixed in writing. It can only change with your consent — for example, if you decide to add a procedure. If a complication arises through our fault, we fix it free of charge.' },
  { q: 'What guarantee do you give?', a: 'Fillings and restorations — 2 years, crowns and veneers — 5 years, implants — up to 10 years (plus the manufacturer’s lifetime warranty on the implant itself). The condition is a professional cleaning every 6 months.' },
  { q: 'How do instalments work?', a: 'You can pay for treatment in interest-free instalments for up to 10 months through partner banks; longer terms carry a small fee. It takes 5 minutes right at the clinic — all you need is your passport and tax ID.' },
  { q: 'Do you work with insurance companies?', a: 'Yes, we work with most insurers that offer dental cover. The front desk will check your policy before your visit and agree the treatment with your insurer.' },
  { q: 'From what age can I bring my child?', a: 'We recommend the first visit at 2–3 years old. It’s an adaptation appointment with no treatment: your child meets the dentist and the chair through play. For young patients we also offer sedation and treatment while asleep.' },
  { q: 'How soon can I get an appointment?', a: 'There are usually free slots within the next 1–2 days. Leave a request — the front desk will call you back within 15 minutes during opening hours and find a convenient time.' },
];

export const bookingServices = [
  'Free consultation',
  'Fillings & treatment',
  'Implants',
  'Aligners / braces',
  'Veneers',
  'Whitening',
  'Professional cleaning',
  'Children’s dentistry',
];

export const timeSlots = uk.timeSlots;
