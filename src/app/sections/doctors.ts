import { Component, inject, signal } from '@angular/core';
import { I18n } from '../core/i18n';
import { NgOptimizedImage } from '@angular/common';
import { SectionHead } from '../shared/ui/section-head';
import { Icon } from '../shared/ui/icon';
import { InView } from '../shared/directives/in-view';
import { Ripple } from '../shared/directives/ripple';
import { GlowNumber } from '../shared/ui/glow-number';
import { Booking } from '../core/booking.service';

/** Асиметрична сітка лікарів; деталі виїжджають склом при наведенні/фокусі/натисканні */
@Component({
  selector: 'app-doctors',
  imports: [NgOptimizedImage, SectionHead, Icon, InView, Ripple, GlowNumber],
  template: `
    <section id="doctors" aria-labelledby="doctors-title" class="relative py-24 md:py-36">
      <div class="wrap">
        <div class="grid gap-8 lg:grid-cols-12 lg:items-end">
          <app-section-head
            class="lg:col-span-7"
            [eyebrow]="ui.doctors.eyebrow"
            headingId="doctors-title"
            [title]="ui.doctors.title"
          />
          <p class="text-lg text-slate lg:col-span-5" data-reveal appInView="150">
            {{ ui.doctors.lead }}
          </p>
        </div>

        <ul class="team mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-20 lg:grid-cols-12 lg:gap-6">
          @for (d of items; track d.name; let i = $index) {
            <li class="doc" [class]="'doc-' + i">
              <article
                class="group relative h-full overflow-hidden rounded-[2rem] bg-mist"
                [class.open]="open() === i"
                (mouseenter)="open.set(i)"
                (mouseleave)="open.set(null)"
              >
                <div class="scan absolute inset-0" [appInView]="i * 120" style="--scan-bg: #f1f7f6">
                  <img [ngSrc]="d.photo" [alt]="d.name + ', ' + d.role" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" class="object-cover object-top transition-transform duration-[1.4s] ease-[var(--ease-calm)] group-hover:scale-[1.04]" />
                </div>
                <div class="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/0 to-transparent"></div>

                <div class="info absolute inset-x-3 bottom-3 rounded-[1.5rem] p-5 text-white">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <h3 class="font-display text-lg font-semibold tracking-tight">{{ d.name }}</h3>
                      <p class="mt-1 text-sm text-white/85">{{ d.role }}</p>
                    </div>
                    <button
                      type="button"
                      class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur-md transition-transform duration-500"
                      [class.rotate-45]="open() === i"
                      [attr.aria-expanded]="open() === i"
                      [attr.aria-controls]="'doc-details-' + i"
                      [attr.aria-label]="ui.doctors.more(d.name)"
                      (click)="toggle(i)"
                    >
                      <app-icon name="plus" [size]="18" />
                    </button>
                  </div>
                  <div class="details" [id]="'doc-details-' + i" [attr.aria-hidden]="open() !== i">
                    <div>
                    <p class="mt-4 inline-flex rounded-full bg-glow px-3 py-1 text-xs font-semibold text-ink">{{ ui.doctors.exp(d.years) }}</p>
                    <ul class="mt-3 grid gap-1.5 text-sm text-white/90">
                      @for (x of d.details; track x) { <li class="flex gap-2"><app-icon name="check" [size]="16" class="mt-0.5 text-glow" />{{ x }}</li> }
                    </ul>
                    </div>
                  </div>
                </div>
              </article>
            </li>
          }
          <li class="doc doc-note">
            <div class="flex h-full flex-col justify-between gap-6 rounded-[2rem] bg-mist p-7 md:p-9">
              <p class="text-slate">{{ ui.doctors.avg }}</p>
              <p><app-glow-number class="text-6xl" [value]="11" [appInView]="0" /> <span class="ml-2 font-display text-2xl font-semibold">{{ ui.doctors.years }}</span></p>
              <button type="button" class="btn btn-primary glint max-w-full self-start text-center whitespace-normal" appRipple (click)="booking.show(consult)">{{ ui.doctors.cta }}</button>
            </div>
          </li>
        </ul>
      </div>
    </section>
  `,
  styles: `
    .doc { min-height: 26rem; }
    .doc-note { min-height: 0; }
    @media (min-width: 640px) and (max-width: 1023px) { .doc-note { grid-column: 1 / -1; } }
    @media (min-width: 1024px) {
      .team { grid-auto-rows: 15rem; }
      .doc-0 { grid-column: 1 / span 5; grid-row: 1 / span 3; }
      .doc-1 { grid-column: 6 / span 4; grid-row: 1 / span 2; }
      .doc-2 { grid-column: 10 / span 3; grid-row: 2 / span 2; }
      .doc-3 { grid-column: 6 / span 3; grid-row: 3 / span 2; }
      .doc-4 { grid-column: 9 / span 4; grid-row: 4 / span 2; }
      .doc-note { grid-column: 1 / span 5; grid-row: 4 / span 2; }
      .doc { min-height: 0; }
    }
    .info {
      background: rgb(11 31 58 / 0.35);
      backdrop-filter: blur(14px) saturate(140%);
      -webkit-backdrop-filter: blur(14px) saturate(140%);
      border: 1px solid rgb(255 255 255 / 0.18);
    }
    .details {
      display: grid; grid-template-rows: 0fr; opacity: 0; filter: blur(6px);
      transition: grid-template-rows .6s var(--ease-calm), opacity .5s var(--ease-calm), filter .5s var(--ease-calm);
    }
    .details > * { min-height: 0; }
    .details { overflow: hidden; }
    .open .details { grid-template-rows: 1fr; opacity: 1; filter: none; }
  `,
})
export class Doctors {
  protected readonly ui = inject(I18n).t;
  protected readonly items = inject(I18n).c.doctors;
  protected readonly consult = inject(I18n).c.bookingServices[0];
  protected readonly open = signal<number | null>(null);
  protected readonly booking = inject(Booking);

  protected toggle(i: number): void {
    this.open.update((v) => (v === i ? null : i));
  }
}
