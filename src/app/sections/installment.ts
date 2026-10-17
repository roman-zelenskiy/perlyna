import { Component, DestroyRef, PLATFORM_ID, computed, effect, inject, signal, untracked } from '@angular/core';
import { I18n } from '../core/i18n';
import { isPlatformBrowser } from '@angular/common';
import { Booking } from '../core/booking.service';
import { prefersReducedMotion } from '../core/browser';
import { SectionHead } from '../shared/ui/section-head';
import { Icon } from '../shared/ui/icon';
import { Ripple } from '../shared/directives/ripple';
import { InView } from '../shared/directives/in-view';

const fmtIn = (locale: string) => (n: number) => Math.round(n).toLocaleString(locale).replace(/\s/g, '\u00a0');

/** Калькулятор розстрочки: сума + термін → щомісячний платіж з плавним перерахунком */
@Component({
  selector: 'app-installment',
  imports: [SectionHead, Icon, Ripple, InView],
  template: `
    <section id="installment" aria-labelledby="installment-title" class="relative py-24 md:py-36">
      <div class="wrap grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
        <div class="lg:col-span-5">
          <app-section-head
            [eyebrow]="ui.inst.eyebrow"
            headingId="installment-title"
            [title]="ui.inst.title"
            [lead]="ui.inst.lead"
          />
          <div class="mt-10 rounded-[2rem] border border-frost bg-mist p-7" data-reveal appInView="200">
            <div class="flex items-center gap-3">
              <span class="grid h-11 w-11 place-items-center rounded-full bg-white text-teal"><app-icon name="shield" /></span>
              <h3 class="font-display text-lg font-semibold tracking-tight">{{ ui.inst.insurance }}</h3>
            </div>
            <p class="mt-4 text-slate">{{ ui.inst.insuranceText }}</p>
          </div>
        </div>

        <div class="lg:col-span-7" data-reveal appInView="100">
          <div class="calc relative overflow-hidden rounded-[2.5rem] border border-frost bg-white p-7 shadow-[var(--shadow-soft)] md:p-10">
            <div class="flex flex-wrap items-end justify-between gap-4">
              <label for="amount" class="font-semibold">{{ ui.inst.cost }}</label>
              <p class="font-display text-3xl font-semibold tracking-tight md:text-4xl">{{ fmtAmount() }} <span class="text-lg text-slate">{{ ui.cur }}</span></p>
            </div>
            <input
              id="amount"
              type="range"
              class="range mt-5"
              [min]="cfg.min"
              [max]="cfg.max"
              [step]="cfg.step"
              [value]="amount()"
              (input)="setAmount($event)"
              [style.--fill]="fill()"
              [attr.aria-valuetext]="fmtAmount() + ' ' + ui.inst.hryvnias"
            />
            <div class="mt-2 flex justify-between text-sm text-slate" aria-hidden="true"><span>{{ ui.inst.min }}</span><span>{{ ui.inst.max }}</span></div>

            <fieldset class="mt-9">
              <legend class="font-semibold">{{ ui.inst.term }}</legend>
              <div class="mt-4 grid grid-cols-5 gap-2">
                @for (t of cfg.terms; track t) {
                  <label class="term" [class.on]="term() === t">
                    <input type="radio" name="term" class="sr-only" [value]="t" [checked]="term() === t" (change)="term.set(t)" />
                    <span class="font-display text-lg font-semibold">{{ t }}</span>
                    <span class="text-xs">{{ ui.inst.mo }}</span>
                  </label>
                }
              </div>
            </fieldset>

            <div class="result mt-9 grid gap-6 rounded-[1.75rem] bg-ink p-7 text-white sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <p class="text-sm text-white/75">{{ ui.inst.monthly }}</p>
                <p class="mt-2 font-display text-[2.6rem] leading-none font-semibold tracking-tight md:text-5xl" aria-live="polite">
                  <span class="monthly">{{ shown() }}</span> <span class="ml-1.5 text-xl text-glow">{{ ui.inst.perMo }}</span>
                </p>
                <p class="mt-3 text-sm text-white/75">
                  @if (overpay() === 0) { {{ ui.inst.noFee }} } @else { {{ ui.inst.overpay(fmtOverpay()) }} }
                </p>
              </div>
              <button type="button" class="btn btn-primary glint" appRipple (click)="booking.show(consult)">{{ ui.inst.cta }}</button>
            </div>
            <p class="mt-4 text-xs text-slate">{{ ui.inst.note }}</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .range { -webkit-appearance: none; appearance: none; width: 100%; height: 30px; background: transparent; cursor: pointer; }
    .range::-webkit-slider-runnable-track { height: 6px; border-radius: 6px; background: linear-gradient(to right, var(--color-aqua) var(--fill), var(--color-frost) var(--fill)); }
    .range::-moz-range-track { height: 6px; border-radius: 6px; background: var(--color-frost); }
    .range::-moz-range-progress { height: 6px; border-radius: 6px; background: var(--color-aqua); }
    .range::-webkit-slider-thumb { -webkit-appearance: none; margin-top: -11px; width: 28px; height: 28px; border-radius: 999px; background: #fff; border: 2px solid var(--color-teal); box-shadow: 0 0 0 6px rgb(20 184 166 / 0.15); }
    .range::-moz-range-thumb { width: 24px; height: 24px; border-radius: 999px; background: #fff; border: 2px solid var(--color-teal); }
    .range:focus-visible { outline: none; }
    .range:focus-visible::-webkit-slider-thumb { outline: 2.5px solid var(--color-teal); outline-offset: 3px; }
    .term { display: grid; place-items: center; gap: 0; padding: .7rem 0; border-radius: 1rem; border: 1px solid var(--color-frost); color: var(--color-slate); cursor: pointer; transition: background .3s, color .3s, border-color .3s; }
    .term:hover { border-color: rgb(20 184 166 / 0.5); }
    .term.on { background: var(--color-ink); border-color: var(--color-ink); color: #fff; }
    .term:has(input:focus-visible) { outline: 2.5px solid var(--color-teal); outline-offset: 2px; }
    .result { box-shadow: inset 0 0 60px -20px rgb(127 245 230 / 0.35); }
  `,
})
export class Installment {
  protected readonly i18n = inject(I18n);
  protected readonly ui = this.i18n.t;
  protected readonly cfg = this.i18n.c.installment;
  protected readonly consult = this.i18n.c.bookingServices[0];
  private readonly fmt = fmtIn(this.ui.locale);
  protected readonly booking = inject(Booking);
  protected readonly amount = signal(60000);
  protected readonly term = signal(10);

  protected readonly fill = computed(() => `${((this.amount() - this.cfg.min) / (this.cfg.max - this.cfg.min)) * 100}%`);
  protected readonly fmtAmount = computed(() => this.fmt(this.amount()));
  protected readonly monthly = computed(() => {
    const t = this.term();
    const base = this.amount() / t;
    return t <= this.cfg.freeUpTo ? base : base + this.amount() * this.cfg.monthlyFee;
  });
  protected readonly overpay = computed(() => Math.round(this.monthly() * this.term() - this.amount()));
  protected readonly fmtOverpay = computed(() => this.fmt(this.overpay()));

  /** Відображуване значення плавно «доїжджає» до нового платежу */
  private readonly display = signal(0);
  protected readonly shown = computed(() => this.fmt(this.display() || this.monthly()));

  constructor() {
    const browser = isPlatformBrowser(inject(PLATFORM_ID));
    const destroy = inject(DestroyRef);
    let raf = 0;
    effect(() => {
      const target = this.monthly();
      if (!browser || prefersReducedMotion()) {
        this.display.set(target);
        return;
      }
      cancelAnimationFrame(raf);
      const from = untracked(() => this.display()) || target;
      const start = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - start) / 600);
        const e = 1 - Math.pow(1 - k, 3);
        this.display.set(from + (target - from) * e);
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    });
    // на сервері rAF не існує — прибираємо лише в браузері
    if (browser) destroy.onDestroy(() => cancelAnimationFrame(raf));
  }

  protected setAmount(e: Event): void {
    this.amount.set(Number((e.target as HTMLInputElement).value));
  }
}
