import { Component, DestroyRef, ElementRef, afterNextRender, inject, viewChildren } from '@angular/core';
import { I18n } from '../core/i18n';
import { NgOptimizedImage } from '@angular/common';
import { Booking } from '../core/booking.service';
import { loadGsap } from '../core/gsap';
import { prefersReducedMotion } from '../core/browser';
import { SectionHead } from '../shared/ui/section-head';
import { Icon } from '../shared/ui/icon';
import { InView } from '../shared/directives/in-view';
import { Ripple } from '../shared/directives/ripple';

/** Послуга у формі запису — індекс у bookingServices поточної мови */
const bookingIndex: Record<string, number> = { therapy: 1, implants: 2, ortho: 3, aesthetic: 4, hygiene: 6, kids: 7 };

/** «Липкі» картки послуг, що наїжджають стопкою */
@Component({
  selector: 'app-services',
  imports: [NgOptimizedImage, SectionHead, Icon, InView, Ripple],
  template: `
    <section id="services" aria-labelledby="services-title" class="relative bg-mist py-24 md:py-36">
      <div class="wrap grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div class="lg:col-span-4">
          <div class="lg:sticky lg:top-32">
            <app-section-head
              [eyebrow]="ui.services.eyebrow"
              headingId="services-title"
              [title]="ui.services.title"
              [lead]="ui.services.lead"
            />
          </div>
        </div>

        <ol class="relative grid gap-6 lg:col-span-8">
          @for (s of items; track s.id; let i = $index) {
            <li #card class="card sticky origin-top" [style.top.px]="96 + i * 18" [style.z-index]="i + 1">
              <article class="grid overflow-hidden rounded-[2.25rem] border border-frost bg-white shadow-[var(--shadow-soft)] md:grid-cols-[1.05fr_0.95fr]">
                <div class="flex flex-col p-7 md:p-10">
                  <div class="flex items-center justify-between gap-4">
                    <span class="text-sm font-semibold text-slate">0{{ i + 1 }} / 0{{ items.length }}</span>
                    <span class="pill">{{ ui.from(price(s.price)) }}</span>
                  </div>
                  <h3 class="title-md mt-6">{{ s.title }}</h3>
                  <p class="mt-3 text-slate">{{ s.lead }}</p>
                  <ul class="mt-6 grid gap-2.5">
                    @for (it of s.items; track it) {
                      <li class="flex items-center gap-3 text-[15px]"><app-icon name="check" [size]="18" class="text-teal" />{{ it }}</li>
                    }
                  </ul>
                  <button type="button" class="btn btn-ghost glint mt-8 self-start" appRipple (click)="booking.show(serviceName(s.id))">
                    {{ ui.services.book }} <app-icon name="arrow" [size]="18" />
                  </button>
                </div>
                <div class="scan relative min-h-60 md:min-h-full" [appInView]="150" style="--scan-bg: #f1f7f6">
                  <img [ngSrc]="s.photo" [alt]="s.alt" fill sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw" class="object-cover" />
                </div>
              </article>
            </li>
          }
        </ol>
      </div>
    </section>
  `,
})
export class Services {
  protected readonly i18n = inject(I18n);
  protected readonly ui = this.i18n.t;
  protected readonly items = this.i18n.c.services;
  protected readonly booking = inject(Booking);
  private readonly cards = viewChildren<ElementRef<HTMLElement>>('card');

  protected price(v: number): string {
    return v.toLocaleString(this.ui.locale).replace(/\s/g, '\u00a0');
  }

  protected serviceName(id: string): string {
    return this.i18n.c.bookingServices[bookingIndex[id] ?? 0];
  }

  constructor() {
    const destroy = inject(DestroyRef);
    afterNextRender(async () => {
      if (prefersReducedMotion()) return;
      const { gsap, ScrollTrigger } = await loadGsap();
      const els = this.cards().map((c) => c.nativeElement);
      const ctx = gsap.context(() => {
        els.forEach((card, i) => {
          const next = els[i + 1];
          if (!next) return;
          gsap.fromTo(card, { scale: 1, filter: 'brightness(1)' }, {
            scale: 0.92 + i * 0.01,
            filter: 'brightness(0.97)',
            ease: 'none',
            scrollTrigger: { trigger: next, start: 'top bottom', end: `top ${96 + (i + 1) * 18}px`, scrub: true },
          });
        });
      });
      ScrollTrigger.refresh();
      destroy.onDestroy(() => ctx.revert());
    });
  }
}
