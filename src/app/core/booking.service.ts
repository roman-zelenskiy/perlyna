import { Service, signal } from '@angular/core';

export type Lead = { name: string; phone: string; service: string; date: string; time: string; createdAt: string };

const KEY = 'perlyna:leads';

/**
 * Стан запису: модальне вікно та «відправка» заявки.
 * Це демо: заявка нікуди не йде, а зберігається в localStorage браузера.
 */
@Service()
export class Booking {
  readonly open = signal(false);
  readonly preset = signal<string | null>(null);

  show(service?: string): void {
    this.preset.set(service ?? null);
    this.open.set(true);
  }

  close(): void {
    this.open.set(false);
  }

  async submit(lead: Omit<Lead, 'createdAt'>): Promise<void> {
    await new Promise((r) => setTimeout(r, 1200));
    try {
      const all = JSON.parse(localStorage.getItem(KEY) ?? '[]') as Lead[];
      all.push({ ...lead, createdAt: new Date().toISOString() });
      localStorage.setItem(KEY, JSON.stringify(all.slice(-20)));
    } catch {
      // приватний режим або заборонене сховище — для демо це не помилка
    }
  }
}
