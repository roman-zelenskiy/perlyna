import { Component, afterNextRender, inject, input, signal } from '@angular/core';
import { FormField, form, minLength, pattern, required, submit, validate } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { I18n } from '../../core/i18n';
import { Booking } from '../../core/booking.service';
import { formatPhone, isValidPhone } from '../../core/phone';
import { Ripple } from '../directives/ripple';
import { Icon } from './icon';
import { Select } from './select';

type Model = { name: string; phone: string; service: string; date: string; time: string };

let uid = 0;

/** Форма запису (Signal Forms). Використовується в секції та в модальному вікні. */
@Component({
  selector: 'app-booking-form',
  imports: [FormField, RouterLink, Ripple, Icon, Select],
  template: `
    @if (done()) {
      <div class="py-8 text-center" role="status" aria-live="polite">
        <div class="success-mark mx-auto grid h-20 w-20 place-items-center rounded-full bg-aqua/12 text-teal">
          <app-icon name="check" [size]="40" />
        </div>
        <p class="title-md mt-6">{{ ui.form.thanks(firstName()) }}</p>
        <p class="mx-auto mt-3 max-w-sm text-slate">
          {{ ui.form.callback(model().date ? formatDate(model().date) : ui.form.anyDay) }}
        </p>
        <button type="button" class="mt-6 text-sm font-semibold text-teal underline underline-offset-4" (click)="reset()">{{ ui.form.again }}</button>
      </div>
    } @else {
      <form novalidate (submit)="onSubmit($event)" class="grid gap-5" [attr.aria-busy]="sending()">
        <div class="field">
          <label [for]="id + '-name'">{{ ui.form.name }}</label>
          <input [id]="id + '-name'" [formField]="f.name" autocomplete="given-name" [placeholder]="ui.form.namePh"
            [attr.aria-invalid]="show('name')" [attr.aria-describedby]="show('name') ? id + '-name-err' : null" />
          @if (show('name')) { <p class="err" [id]="id + '-name-err'">{{ error('name') }}</p> }
        </div>

        <div class="field">
          <label [for]="id + '-phone'">{{ ui.form.phone }}</label>
          <input [id]="id + '-phone'" type="tel" inputmode="tel" autocomplete="tel" placeholder="+380 (__) ___-__-__"
            [value]="f.phone().value()" (input)="onPhone($event)" (focus)="onPhoneFocus()" (blur)="onPhoneBlur()"
            [attr.aria-invalid]="show('phone')" [attr.aria-describedby]="show('phone') ? id + '-phone-err' : null" />
          @if (show('phone')) { <p class="err" [id]="id + '-phone-err'">{{ error('phone') }}</p> }
        </div>

        <div class="field">
          <label [for]="id + '-service'">{{ ui.form.service }}</label>
          <app-select [inputId]="id + '-service'" [options]="services" [value]="model().service" (valueChange)="f.service().value.set($event)" />
        </div>

        <div class="grid gap-5 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div class="field">
            <label [for]="id + '-date'">{{ ui.form.date }}</label>
            <input [id]="id + '-date'" type="date" [formField]="f.date" [min]="minDate()"
              [attr.aria-invalid]="show('date')" [attr.aria-describedby]="show('date') ? id + '-date-err' : null" />
            @if (show('date')) { <p class="err" [id]="id + '-date-err'">{{ error('date') }}</p> }
          </div>
          <fieldset class="field">
            <legend>{{ ui.form.time }}</legend>
            <div class="grid grid-cols-2 gap-2">
              @for (t of slots; track t) {
                <label class="slot" [class.on]="model().time === t">
                  <input type="radio" class="sr-only" [name]="id + '-time'" [value]="t" [checked]="model().time === t" (change)="pickTime(t)" />{{ t }}
                </label>
              }
            </div>
            @if (show('time')) { <p class="err">{{ error('time') }}</p> }
          </fieldset>
        </div>

        @if (offline()) {
          <p class="err rounded-xl bg-red-50 px-4 py-3" role="alert">{{ ui.form.offline }}</p>
        }

        <button type="submit" class="btn btn-primary glint mt-1 w-full" appRipple [disabled]="sending()">
          @if (sending()) {
            <span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" aria-hidden="true"></span> {{ ui.form.sending }}
          } @else {
            {{ ui.form.submit }} <app-icon name="arrow" [size]="18" />
          }
        </button>
        <p class="text-center text-xs leading-relaxed text-slate">
          {{ ui.form.consent }} <a [routerLink]="i18n.link('/polityka-konfidentsiinosti')" class="underline underline-offset-2">{{ ui.form.policy }}</a>
        </p>
      </form>
    }
  `,
  styles: `
    .field { display: grid; gap: 0.45rem; min-width: 0; }
    .field label:not(.slot), .field legend { font-size: 0.875rem; font-weight: 600; color: var(--color-ink); margin-bottom: 0.45rem; }
    .field legend { margin-bottom: 0.9rem; }
    input:not([type='radio']) {
      width: 100%; min-height: 3.25rem; padding: 0 1.1rem; border-radius: 1rem; appearance: none;
      background: #fff; border: 1px solid var(--color-frost); color: var(--color-ink); font: inherit;
      transition: border-color .3s, box-shadow .3s;
    }
    input:focus { outline: none; border-color: var(--color-aqua); box-shadow: 0 0 0 4px rgb(20 184 166 / 0.15); }
    input[aria-invalid='true'] { border-color: #c2410c; }
    input::placeholder { color: rgb(71 90 112 / 0.6); }
    .err { font-size: 0.85rem; color: #b42318; }
    .slot {
      display: grid; place-items: center; min-height: 2.75rem; border-radius: 0.9rem; cursor: pointer;
      border: 1px solid var(--color-frost); background: #fff; font-size: 0.85rem; font-weight: 600; color: var(--color-slate);
      transition: background .3s, color .3s, border-color .3s;
    }
    .slot.on { background: var(--color-ink); border-color: var(--color-ink); color: #fff; }
    .slot:has(input:focus-visible) { outline: 2.5px solid var(--color-teal); outline-offset: 2px; }
    .success-mark { animation: pop .8s var(--ease-calm); box-shadow: 0 0 0 10px rgb(20 184 166 / 0.06); }
    @keyframes pop { from { transform: scale(.6); opacity: 0; filter: blur(8px); } }
  `,
})
export class BookingForm {
  readonly presetService = input<string | null>(null);

  protected readonly id = `bf${++uid}`;
  protected readonly i18n = inject(I18n);
  protected readonly ui = this.i18n.t;
  protected readonly services = this.i18n.c.bookingServices;
  protected readonly slots = this.i18n.c.timeSlots;
  private readonly booking = inject(Booking);

  protected readonly model = signal<Model>({ name: '', phone: '', service: this.services[0], date: '', time: '' });
  protected readonly f = form(this.model, (p) => {
    const e = this.ui.form.err;
    required(p.name, { message: e.name });
    minLength(p.name, 2, { message: e.min });
    pattern(p.name, /^[\p{L}\s'’-]+$/u, { message: e.letters });
    required(p.phone, { message: e.phone });
    validate(p.phone, ({ value }) => (value() && !isValidPhone(value()) ? { kind: 'phone', message: e.phoneShort } : undefined));
    required(p.date, { message: e.date });
    validate(p.date, ({ value }) => (value() && value() < this.minDate() ? { kind: 'past', message: e.past } : undefined));
    required(p.time, { message: e.time });
  });

  protected readonly attempted = signal(false);
  protected readonly sending = signal(false);
  protected readonly done = signal(false);
  protected readonly offline = signal(false);
  protected readonly minDate = signal('');

  constructor() {
    afterNextRender(() => {
      const d = new Date();
      this.minDate.set(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10));
      const preset = this.presetService();
      if (preset && this.services.includes(preset)) this.model.update((m) => ({ ...m, service: preset }));
    });
  }

  protected show(key: keyof Model): boolean {
    const field = this.f[key]();
    return (field.touched() || this.attempted()) && field.invalid();
  }

  protected error(key: keyof Model): string {
    return this.f[key]().errors()[0]?.message ?? '';
  }

  protected onPhone(e: Event): void {
    const el = e.target as HTMLInputElement;
    const formatted = formatPhone(el.value);
    el.value = formatted;
    this.f.phone().value.set(formatted);
  }

  protected onPhoneFocus(): void {
    if (!this.f.phone().value()) this.f.phone().value.set('+380 (');
  }

  protected onPhoneBlur(): void {
    if (this.f.phone().value() === '+380 (') this.f.phone().value.set('');
    this.f.phone().markAsTouched();
  }

  protected pickTime(t: string): void {
    this.f.time().value.set(t);
    this.f.time().markAsTouched();
  }

  protected async onSubmit(e: Event): Promise<void> {
    e.preventDefault();
    this.attempted.set(true);
    this.offline.set(false);
    const formEl = e.target as HTMLFormElement;
    await submit(this.f, async () => {
      if (!navigator.onLine) {
        this.offline.set(true);
        return undefined;
      }
      this.sending.set(true);
      await this.booking.submit({ ...this.model(), phone: this.model().phone.replace(/\D/g, '') });
      this.sending.set(false);
      this.done.set(true);
      return undefined;
    });
    // фокус — на перше невалідне поле (за станом форми, бо aria-* оновляться лише після рендеру)
    const first = (['name', 'phone', 'date', 'time'] as const).find((k) => this.f[k]().invalid());
    if (first) formEl.querySelector<HTMLElement>(first === 'time' ? 'input[type=radio]' : `#${this.id}-${first}`)?.focus();
  }

  protected firstName(): string {
    return this.model().name.trim().split(/\s+/)[0] ?? '';
  }

  protected formatDate(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(this.ui.locale, { day: 'numeric', month: 'long' });
  }

  protected reset(): void {
    this.model.set({ name: '', phone: '', service: this.services[0], date: '', time: '' });
    this.f().reset();
    this.attempted.set(false);
    this.done.set(false);
  }
}
