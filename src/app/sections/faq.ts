import { Component, inject, signal } from '@angular/core';
import { I18n } from '../core/i18n';
import { SectionHead } from '../shared/ui/section-head';
import { Icon } from '../shared/ui/icon';
import { InView } from '../shared/directives/in-view';
import { Glow } from '../shared/directives/glow';

/** FAQ: акордеон з плавним розкриттям; відповіді є в SSR-HTML (лише візуально згорнуті) */
@Component({
  selector: 'app-faq',
  imports: [SectionHead, Icon, InView, Glow],
  template: `
    <section id="faq" aria-labelledby="faq-title" class="relative py-24 md:py-36">
      <div class="wrap max-w-4xl">
        <app-section-head class="block text-center [&_.pill]:mx-auto [&_p]:mx-auto" [eyebrow]="ui.faq.eyebrow" headingId="faq-title" [title]="ui.faq.title" />

        <ul class="mt-14 grid gap-3">
          @for (item of items; track item.q; let i = $index) {
            <li appGlow class="item rounded-[1.75rem] transition-[box-shadow] duration-500" [class.open]="open() === i" data-reveal [appInView]="i * 50">
              <h3>
                <button
                  type="button"
                  class="flex w-full items-center gap-5 px-6 py-6 text-left md:px-8"
                  [id]="'faq-q-' + i"
                  [attr.aria-expanded]="open() === i"
                  [attr.aria-controls]="'faq-a-' + i"
                  (click)="toggle(i)"
                >
                  <span class="bar" aria-hidden="true"></span>
                  <span class="flex-1 font-display text-[1.05rem] leading-snug font-semibold tracking-tight md:text-xl">{{ item.q }}</span>
                  <span class="icon grid h-10 w-10 shrink-0 place-items-center rounded-full border border-frost" aria-hidden="true"><app-icon name="plus" [size]="18" /></span>
                </button>
              </h3>
              <div class="answer" [id]="'faq-a-' + i" role="region" [attr.aria-labelledby]="'faq-q-' + i">
                <div><p class="px-6 pb-7 text-slate md:px-8 md:pl-[3.4rem]">{{ item.a }}</p></div>
              </div>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
  styles: `
    .item.open { box-shadow: var(--shadow-glow); }
    .bar { width: 4px; height: 1.6rem; border-radius: 4px; background: var(--color-aqua); transform: scaleY(0.3); opacity: .35; transition: transform .5s var(--ease-calm), opacity .5s; }
    .open .bar { transform: scaleY(1); opacity: 1; }
    .icon { transition: transform .5s var(--ease-calm), background .4s, color .4s; }
    .open .icon { transform: rotate(45deg); background: var(--color-ink); color: #fff; border-color: var(--color-ink); }
    .answer { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .55s var(--ease-calm); }
    .answer > div { overflow: hidden; min-height: 0; }
    .answer p { opacity: 0; filter: blur(6px); transform: translateY(-6px); transition: opacity .5s, filter .5s, transform .5s var(--ease-calm); }
    .open .answer { grid-template-rows: 1fr; }
    .open .answer p { opacity: 1; filter: none; transform: none; }
  `,
})
export class Faq {
  protected readonly ui = inject(I18n).t;
  protected readonly items = inject(I18n).c.faq;
  protected readonly open = signal<number | null>(0);

  protected toggle(i: number): void {
    this.open.update((v) => (v === i ? null : i));
  }
}
