import { Component, DestroyRef, ElementRef, afterNextRender, computed, inject, signal } from '@angular/core';
import { I18n } from '../core/i18n';
import { NgOptimizedImage } from '@angular/common';
import { InViewObserver } from '../shared/directives/in-view';
import { SectionHead } from '../shared/ui/section-head';
import { Icon } from '../shared/ui/icon';

/**
 * Кейси «до/після»: перемикач запускає сканувальну лінію, що «перемальовує» фото.
 * Шар «після» проявляється зустрічним зсувом двох обгорток — лише transform.
 */
@Component({
  selector: 'app-cases',
  imports: [NgOptimizedImage, SectionHead, Icon],
  template: `
    <section id="cases" aria-labelledby="cases-title" class="relative overflow-hidden bg-mist py-24 md:py-36">
      <div class="wrap grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
        <div class="lg:col-span-5">
          <app-section-head
            [eyebrow]="ui.cases.eyebrow"
            headingId="cases-title"
            [title]="ui.cases.title"
            [lead]="ui.cases.lead"
          />

          <div class="mt-10 grid gap-3" role="radiogroup" [attr.aria-label]="ui.cases.pick">
            @for (c of items; track c.id; let i = $index) {
              <button
                type="button"
                role="radio"
                [attr.aria-checked]="i === active()"
                class="case-btn rounded-[1.5rem] border p-5 text-left transition-[background,border-color,box-shadow] duration-500"
                [class.on]="i === active()"
                (click)="pick(i)"
              >
                <span class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <span class="font-display text-lg font-semibold tracking-tight">{{ c.title }}</span>
                  <span class="text-sm text-slate">{{ c.meta }}</span>
                </span>
                @if (i === active()) { <span class="case-text mt-3 block text-[15px] text-slate">{{ c.text }}</span> }
              </button>
            }
          </div>
        </div>

        <div class="lg:col-span-7">
          <div class="visual relative mx-auto aspect-[4/5] w-full max-w-[560px] overflow-hidden rounded-[2.5rem] bg-frost shadow-[var(--shadow-soft)]" [class.after]="after()">
            <!-- «до»: те саме фото, тьмяніше й тепліше -->
            <img [ngSrc]="current().photo" [alt]="current().alt + ui.cases.beforeAlt" fill sizes="(min-width: 1024px) 40vw, 100vw" class="before-img object-cover" />
            <div class="after-outer absolute inset-0 overflow-hidden">
              <div class="after-inner absolute inset-0">
                <img [ngSrc]="current().photo" [alt]="current().alt + ui.cases.afterAlt" fill sizes="(min-width: 1024px) 40vw, 100vw" class="object-cover" />
              </div>
            </div>
            <div class="scan-edge absolute inset-0" aria-hidden="true"></div>

            <div class="glass absolute top-4 left-1/2 flex -translate-x-1/2 rounded-full p-1" role="group" [attr.aria-label]="ui.cases.state">
              <button type="button" class="seg" [class.on]="!after()" [attr.aria-pressed]="!after()" (click)="after.set(false)">{{ ui.cases.before }}</button>
              <button type="button" class="seg" [class.on]="after()" [attr.aria-pressed]="after()" (click)="after.set(true)">{{ ui.cases.after }}</button>
            </div>
            <p class="glass absolute right-4 bottom-4 left-4 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm" aria-live="polite">
              <app-icon name="scan" class="text-teal" />
              <span><strong>{{ after() ? ui.cases.after : ui.cases.before }}:</strong> {{ current().title }} · {{ current().meta }}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .case-btn { border-color: var(--color-frost); background: rgb(255 255 255 / 0.6); }
    .case-btn:hover { border-color: rgb(20 184 166 / 0.4); }
    .case-btn.on { background: #fff; border-color: rgb(20 184 166 / 0.5); box-shadow: var(--shadow-glow); }
    .case-text { animation: in .6s var(--ease-calm); }
    @keyframes in { from { opacity: 0; filter: blur(6px); transform: translateY(6px); } }

    .before-img { filter: sepia(0.55) saturate(0.6) brightness(0.9) contrast(0.92) hue-rotate(-6deg); }
    .after-outer { transform: translateY(-100%); transition: transform 1.5s var(--ease-soft); }
    .after-inner { transform: translateY(100%); transition: transform 1.5s var(--ease-soft); }
    .after .after-outer, .after .after-inner { transform: none; }
    .scan-edge {
      pointer-events: none;
      background:
        linear-gradient(to bottom, transparent calc(100% - 60px), rgb(127 245 230 / 0.35) calc(100% - 14px), #7ff5e6 calc(100% - 2px), transparent 100%),
        radial-gradient(circle at 1px 1px, rgb(127 245 230 / 0.6) 1px, transparent 1.5px) 0 0 / 12px 12px;
      mask-image: linear-gradient(to bottom, transparent calc(100% - 70px), black);
      transform: translateY(-100%);
      opacity: 0;
      transition: transform 1.5s var(--ease-soft), opacity .3s linear 1.4s;
    }
    .after .scan-edge { transform: none; opacity: 0; animation: edge 1.7s var(--ease-soft); }
    @keyframes edge { 0% { opacity: 1; } 85% { opacity: 1; } 100% { opacity: 0; } }
    .seg { min-width: 5.5rem; padding: .55rem 1.1rem; border-radius: 999px; font-weight: 600; font-size: .9rem; color: var(--color-slate); transition: background .4s, color .4s; }
    .seg.on { background: var(--color-ink); color: #fff; }
  `,
})
export class Cases {
  protected readonly ui = inject(I18n).t;
  protected readonly items = inject(I18n).c.cases;
  protected readonly active = signal(0);
  protected readonly after = signal(false);
  protected readonly current = computed(() => this.items[this.active()]);

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef);
    const observer = inject(InViewObserver);
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      // Перший показ: через мить сканер сам «перемальовує» фото
      let timer = 0;
      const stop = observer.observe(el.nativeElement.querySelector('.visual')!, () => {
        timer = window.setTimeout(() => this.after.set(true), 900);
      });
      destroy.onDestroy(() => {
        stop();
        clearTimeout(timer);
      });
    });
  }

  protected pick(i: number): void {
    if (i === this.active()) return;
    this.after.set(false);
    this.active.set(i);
    setTimeout(() => this.after.set(true), 700);
  }
}
