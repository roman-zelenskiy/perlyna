import { Component, ElementRef, afterRenderEffect, computed, inject, signal, viewChildren } from '@angular/core';
import { I18n } from '../core/i18n';
import { Booking } from '../core/booking.service';
import { SectionHead } from '../shared/ui/section-head';
import { Icon } from '../shared/ui/icon';
import { Ripple } from '../shared/directives/ripple';
import { InView } from '../shared/directives/in-view';
import { Glow } from '../shared/directives/glow';

/** Прайс із вкладками: ARIA tablist, ковзний індикатор (transform), зміна вмісту з розмиттям */
@Component({
  selector: 'app-pricing',
  imports: [SectionHead, Icon, Ripple, InView, Glow],
  template: `
    <section id="prices" aria-labelledby="prices-title" class="relative py-24 md:py-36">
      <div class="wrap">
        <div class="grid gap-8 lg:grid-cols-12 lg:items-end">
          <app-section-head
            class="lg:col-span-7"
            [eyebrow]="ui.pricing.eyebrow"
            headingId="prices-title"
            [title]="ui.pricing.title"
            [lead]="ui.pricing.lead"
          />
          <div class="lg:col-span-5 lg:justify-self-end" data-reveal appInView="200">
            <div class="flex items-center gap-4 rounded-[1.75rem] border border-frost bg-mist p-5">
              <span class="breathe grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-teal shadow-[var(--shadow-glow)]"><app-icon name="wallet" /></span>
              <p class="text-[15px] text-slate"><strong class="text-ink">{{ ui.pricing.instA }}</strong> {{ ui.pricing.instB }}</p>
            </div>
          </div>
        </div>

        <div class="mt-14" data-reveal appInView>
          <div class="relative -mx-5 overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:px-0">
            <div role="tablist" [attr.aria-label]="ui.pricing.cats" class="relative inline-flex min-w-max gap-1 rounded-full border border-frost bg-mist p-1.5" (keydown)="onKey($event)">
              <span class="indicator" aria-hidden="true" [style.transform]="indicator()"></span>
              @for (t of tabs; track t.id; let i = $index) {
                <button
                  #tab
                  type="button"
                  role="tab"
                  [id]="'tab-' + t.id"
                  [attr.aria-selected]="i === active()"
                  [attr.aria-controls]="'panel-' + t.id"
                  [tabIndex]="i === active() ? 0 : -1"
                  class="relative z-10 rounded-full px-5 py-2.5 text-[15px] font-semibold transition-colors duration-300"
                  [class.text-white]="i === active()"
                  [class.text-slate]="i !== active()"
                  (click)="select(i)"
                >{{ t.label }}</button>
              }
            </div>
          </div>

          @for (t of tabs; track t.id; let i = $index) {
            <div
              role="tabpanel"
              [id]="'panel-' + t.id"
              [attr.aria-labelledby]="'tab-' + t.id"
              [hidden]="i !== active()"
              tabindex="0"
              class="panel mt-8 rounded-[2rem] shadow-[var(--shadow-soft)]"
              appGlow
            >
              <table class="w-full text-left">
                <caption class="sr-only">{{ ui.pricing.caption(t.label) }}</caption>
                <thead class="sr-only"><tr><th scope="col">{{ ui.pricing.service }}</th><th scope="col">{{ ui.pricing.price }}</th></tr></thead>
                <tbody>
                  @for (r of t.rows; track r.name) {
                    <tr class="row border-b border-frost last:border-0">
                      <th scope="row" class="py-4 pr-2 pl-4 text-[15px] font-medium sm:px-6 sm:py-5 sm:text-base md:px-8">
                        {{ r.name }}
                        @if (r.note) { <span class="ml-2 inline-block rounded-full bg-aqua/10 px-2.5 py-0.5 text-xs font-semibold text-teal">{{ r.note }}</span> }
                      </th>
                      <td class="py-4 pr-4 pl-2 text-right font-display text-[0.9rem] font-semibold whitespace-nowrap sm:px-6 sm:py-5 sm:text-base md:px-8">{{ r.price }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          <div class="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm text-slate">{{ ui.pricing.valid }}</p>
            <button type="button" class="btn btn-primary glint" appRipple (click)="booking.show(consult)">{{ ui.pricing.cta }} <app-icon name="arrow" [size]="18" /></button>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .indicator {
      position: absolute; top: 6px; left: 0; height: calc(100% - 12px); width: 100px;
      border-radius: 999px; background: var(--color-ink); transform-origin: left center;
      transition: transform .55s var(--ease-calm);
    }
    .panel:not([hidden]) { animation: panel-in .6s var(--ease-calm); }
    .panel:not([hidden]) .row { animation: panel-in .6s var(--ease-calm) both; }
    .row:nth-child(2) { animation-delay: 50ms !important; }
    .row:nth-child(3) { animation-delay: 100ms !important; }
    .row:nth-child(4) { animation-delay: 150ms !important; }
    .row:nth-child(5) { animation-delay: 200ms !important; }
    @keyframes panel-in { from { opacity: 0; filter: blur(8px); transform: translateY(8px); } }
    .row:hover th { color: var(--color-teal); }
  `,
})
export class Pricing {
  protected readonly i18n = inject(I18n);
  protected readonly ui = this.i18n.t;
  protected readonly tabs = this.i18n.c.priceTabs;
  protected readonly consult = this.i18n.c.bookingServices[0];
  protected readonly booking = inject(Booking);
  protected readonly active = signal(0);
  private readonly tabEls = viewChildren<ElementRef<HTMLButtonElement>>('tab');
  private readonly box = signal({ x: 6, w: 100 });
  protected readonly indicator = computed(() => `translateX(${this.box().x}px) scaleX(${this.box().w / 100})`);

  constructor() {
    // Вимірюємо активну вкладку після рендеру й рухаємо індикатор лише transform-ом
    afterRenderEffect(() => {
      const el = this.tabEls()[this.active()]?.nativeElement;
      if (el) this.box.set({ x: el.offsetLeft, w: el.offsetWidth });
    });
  }

  protected select(i: number, focus = false): void {
    this.active.set(i);
    const el = this.tabEls()[i]?.nativeElement;
    if (focus) el?.focus();
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  protected onKey(e: KeyboardEvent): void {
    const n = this.tabs.length;
    const map: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };
    if (e.key in map) this.select((this.active() + map[e.key] + n) % n, true);
    else if (e.key === 'Home') this.select(0, true);
    else if (e.key === 'End') this.select(n - 1, true);
    else return;
    e.preventDefault();
  }
}
