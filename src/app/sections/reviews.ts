import { Component, DestroyRef, afterNextRender, computed, inject, signal } from '@angular/core';
import { I18n } from '../core/i18n';
import { NgOptimizedImage } from '@angular/common';
import { prefersReducedMotion } from '../core/browser';
import { SectionHead } from '../shared/ui/section-head';
import { Icon } from '../shared/ui/icon';
import { InView } from '../shared/directives/in-view';

/** 3D-карусель відгуків: картки по колу в перспективі, обертання — лише transform */
@Component({
  selector: 'app-reviews',
  imports: [NgOptimizedImage, SectionHead, Icon, InView],
  template: `
    <section id="reviews" aria-labelledby="reviews-title" class="relative overflow-hidden bg-mist py-24 md:py-36">
      <div class="wrap grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
        <app-section-head class="lg:col-span-7" [eyebrow]="ui.reviews.eyebrow" headingId="reviews-title" [title]="ui.reviews.title" />
        <div class="lg:col-span-5 lg:justify-self-end" data-reveal appInView="150">
          <div class="glass inline-flex items-center gap-5 rounded-[1.75rem] px-6 py-5">
            <p class="font-display text-5xl font-semibold tracking-tight">{{ rating }}</p>
            <div>
              <div class="flex text-[#f5a524]" role="img" [attr.aria-label]="ui.reviews.rating(rating)">
                @for (s of stars; track $index) { <app-icon name="star" [size]="18" /> }
              </div>
              <p class="mt-1 text-sm text-slate">{{ ui.reviews.count(count) }}</p>
            </div>
          </div>
        </div>
      </div>

      <div
        class="stage relative mt-12 md:mt-16"
        role="region"
        [attr.aria-roledescription]="ui.reviews.carousel"
        [attr.aria-label]="ui.reviews.aria"
        tabindex="0"
        (keydown)="onKey($event)"
        (mouseenter)="paused.set(true)"
        (mouseleave)="paused.set(false)"
        (focusin)="paused.set(true)"
        (focusout)="paused.set(false)"
        (pointerdown)="dragStart($event)"
        (pointerup)="dragEnd($event)"
      >
        <div class="orbit">
          @for (r of items; track r.name; let i = $index) {
            <div
              class="card"
              role="group"
              [attr.aria-roledescription]="ui.reviews.slide"
              [attr.aria-label]="ui.reviews.of(i + 1, items.length)"
              [attr.aria-hidden]="i !== current()"
              [style.transform]="cardTransform(i)"
              [class.front]="i === current()"
              [class.far]="distance(i) > 1"
              [style.--dist]="distance(i)"
            ><figure>
              <div class="flex gap-0.5 text-[#f5a524]" aria-hidden="true">
                @for (s of stars; track $index) { <app-icon name="star" [size]="15" /> }
              </div>
              <blockquote class="mt-4 text-[1.02rem] leading-relaxed text-ink">{{ ui.q(r.text) }}</blockquote>
              <figcaption class="mt-6 flex items-center gap-3 border-t border-frost pt-5">
                <img [ngSrc]="r.photo" [alt]="''" width="48" height="48" class="h-12 w-12 rounded-full object-cover" />
                <div>
                  <p class="font-semibold">{{ r.name }}</p>
                  <p class="text-sm text-teal">{{ r.service }}</p>
                </div>
              </figcaption>
            </figure></div>
          }
        </div>
      </div>

      <div class="wrap mt-10 flex items-center justify-center gap-4">
        <button type="button" class="nav-btn" [attr.aria-label]="ui.reviews.prev" (click)="go(-1)"><app-icon name="chevronLeft" /></button>
        <p class="min-w-16 text-center font-display font-semibold" aria-live="polite">{{ current() + 1 }} / {{ items.length }}</p>
        <button type="button" class="nav-btn" [attr.aria-label]="ui.reviews.next" (click)="go(1)"><app-icon name="chevronRight" /></button>
      </div>
    </section>
  `,
  styles: `
    .stage { --r: 360px; height: 25rem; touch-action: pan-y; cursor: grab; }
    .stage:active { cursor: grabbing; }
    @media (min-width: 768px) { .stage { --r: 520px; height: 26rem; } }
    .orbit { position: absolute; inset: 0; }
    .card {
      position: absolute; top: 0; left: calc(50% - 150px); width: 300px; padding: 1.75rem; border-radius: 1.75rem;
      background: #fff; border: 1px solid var(--color-frost); box-shadow: var(--shadow-soft);
      backface-visibility: hidden;
      /* бічні картки — глибина через розмиття, а не прозорість (контраст тексту лишається AA) */
      filter: blur(calc(var(--dist) * 1.4px));
      transition: transform 1.1s var(--ease-calm), opacity .8s var(--ease-calm), filter .8s var(--ease-calm), box-shadow .8s;
    }
    @media (min-width: 768px) { .card { left: calc(50% - 180px); width: 360px; } }
    .card.front { box-shadow: var(--shadow-glow), var(--shadow-soft); }
    .card.far { opacity: 0; }
    .nav-btn { display: grid; place-items: center; width: 3.25rem; height: 3.25rem; border-radius: 999px; background: #fff; border: 1px solid var(--color-frost); transition: border-color .3s, color .3s; }
    .nav-btn:hover { border-color: var(--color-aqua); color: var(--color-teal); }
  `,
})
export class Reviews {
  private readonly i18n = inject(I18n);
  protected readonly ui = this.i18n.t;
  protected readonly items = this.i18n.c.reviews;
  protected readonly rating = this.i18n.c.clinic.rating.toLocaleString(this.ui.locale);
  protected readonly count = this.i18n.c.clinic.reviewsCount;
  protected readonly stars = [1, 2, 3, 4, 5];
  protected readonly angle = 360 / this.items.length;

  /** Позиція може виходити за межі масиву — так кільце обертається безперервно */
  private readonly pos = signal(0);
  protected readonly current = computed(() => ((this.pos() % this.items.length) + this.items.length) % this.items.length);
  /** Кожна картка має власну 3D-трансформацію (без preserve-3d — без артефактів композитингу в Chrome) */
  protected cardTransform(i: number): string {
    return `perspective(1600px) translateZ(calc(var(--r) * -1)) rotateY(${(i - this.pos()) * this.angle}deg) translateZ(var(--r))`;
  }
  protected readonly paused = signal(false);
  private dragX = 0;

  protected distance(i: number): number {
    const n = this.items.length;
    const d = Math.abs(i - this.current());
    return Math.min(d, n - d);
  }

  constructor() {
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      if (prefersReducedMotion()) return;
      const id = setInterval(() => {
        if (!this.paused() && !document.hidden) this.go(1);
      }, 6000);
      destroy.onDestroy(() => clearInterval(id));
    });
  }

  protected go(dir: number): void {
    this.pos.update((p) => p + dir);
  }

  protected onKey(e: KeyboardEvent): void {
    if (e.key === 'ArrowRight') this.go(1);
    else if (e.key === 'ArrowLeft') this.go(-1);
    else return;
    e.preventDefault();
  }

  protected dragStart(e: PointerEvent): void {
    this.dragX = e.clientX;
  }

  protected dragEnd(e: PointerEvent): void {
    const dx = e.clientX - this.dragX;
    if (Math.abs(dx) > 40) this.go(dx < 0 ? 1 : -1);
  }
}
