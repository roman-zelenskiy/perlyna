import { Component, inject } from '@angular/core';
import { I18n } from '../core/i18n';
import { BookingForm } from '../shared/ui/booking-form';
import { GlowNumber } from '../shared/ui/glow-number';
import { Icon } from '../shared/ui/icon';
import { Words } from '../shared/directives/words';
import { InView } from '../shared/directives/in-view';

/** Секція запису: split-screen — що буде на консультації + форма */
@Component({
  selector: 'app-booking-section',
  imports: [BookingForm, GlowNumber, Icon, Words, InView],
  template: `
    <section id="booking" aria-labelledby="booking-section-title" class="relative py-16 md:py-24">
      <div class="wrap">
        <div class="grid overflow-hidden rounded-[2.75rem] shadow-[var(--shadow-soft)] lg:grid-cols-2">
          <div class="relative isolate overflow-hidden bg-ink p-8 text-white md:p-14">
            <div class="lights" aria-hidden="true">
              <span class="-top-32 -left-32 h-96 w-96 bg-aqua/35"></span>
              <span class="right-0 -bottom-40 h-80 w-80 bg-glow/20"></span>
            </div>
            <p class="pill !border-white/20 !bg-white/10 !text-glow"><span class="pill-dot breathe" aria-hidden="true"></span>{{ ui.bookSec.pill }}</p>
            <h2 id="booking-section-title" class="title-lg mt-6 text-white" [appWords]="ui.bookSec.title"></h2>
            <ol class="mt-10 grid gap-6">
              @for (s of steps; track s.title; let i = $index) {
                <li class="flex gap-5" data-reveal [appInView]="i * 120">
                  <app-glow-number class="text-3xl text-glow" [value]="i + 1" [appInView]="i * 120" />
                  <div>
                    <h3 class="font-display font-semibold tracking-tight">{{ s.title }}</h3>
                    <p class="mt-1 text-white/75">{{ s.text }}</p>
                  </div>
                </li>
              }
            </ol>
            <div class="mt-12 grid gap-3 border-t border-white/10 pt-8 text-white/85 sm:grid-cols-2">
              <a [href]="clinic.phoneHref" class="flex items-center gap-3 font-semibold text-white hover:text-glow"><app-icon name="phone" class="text-glow" />{{ clinic.phone }}</a>
              <p class="flex items-center gap-3"><app-icon name="pin" class="text-glow" />{{ clinic.street }}</p>
            </div>
          </div>
          <div class="bg-white p-6 sm:p-8 md:p-14">
            <app-booking-form />
          </div>
        </div>
      </div>
    </section>
  `,
})
export class BookingSection {
  protected readonly clinic = inject(I18n).c.clinic;
  protected readonly ui = inject(I18n).t;
  protected readonly steps = this.ui.bookSec.steps;
}
