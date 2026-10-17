import { Component, DestroyRef, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { I18n } from '../../core/i18n';
import { NgOptimizedImage } from '@angular/common';
import { prefersReducedMotion } from '../../core/browser';
import { Booking } from '../../core/booking.service';
import { Words } from '../../shared/directives/words';
import { Ripple } from '../../shared/directives/ripple';
import { GlowNumber } from '../../shared/ui/glow-number';
import { Icon } from '../../shared/ui/icon';
import { ToothScene } from './tooth-scene';

@Component({
  selector: 'app-hero',
  imports: [NgOptimizedImage, Words, Ripple, GlowNumber, Icon, ToothScene],
  template: `
    <section id="top" aria-labelledby="hero-title" class="relative isolate overflow-hidden pt-28 pb-16 md:pt-32 lg:min-h-[100svh] lg:pb-24">
      <div class="lights" aria-hidden="true">
        <span class="-top-48 -right-40 h-[44rem] w-[44rem] bg-aqua/35"></span>
        <span class="top-1/3 -left-56 h-[36rem] w-[36rem] bg-glow/45"></span>
        <span class="-bottom-40 left-1/3 h-[30rem] w-[30rem] bg-frost"></span>
      </div>
      <div class="dots pointer-events-none absolute inset-0 -z-10" aria-hidden="true"></div>

      <div class="wrap grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
        <div class="relative z-10 lg:col-span-6">
          <p class="pill"><span class="pill-dot breathe" aria-hidden="true"></span>{{ ui.hero.pill }}</p>

          <h1 id="hero-title" class="title-xl words-lcp mt-7" [appWords]="ui.hero.title"></h1>

          <p class="mt-7 max-w-[34rem] text-lg leading-relaxed text-slate md:text-[1.2rem]">
            {{ ui.hero.leadA }} <strong class="font-semibold text-ink">{{ ui.hero.leadFree }}</strong>.
          </p>

          <div class="mt-9 flex flex-wrap items-center gap-3">
            <button type="button" class="btn btn-primary glint glint-auto" appRipple (click)="booking.show(consult)">
              {{ ui.hero.cta }} <app-icon name="arrow" [size]="18" />
            </button>
            <a [href]="i18n.anchor('#prices')" class="btn btn-ghost" appRipple>{{ ui.hero.prices }}</a>
          </div>

          <dl class="mt-12 grid max-w-xl grid-cols-3 gap-4 border-t border-frost pt-7">
            @for (s of stats; track s.label; let i = $index) {
              <div>
                <dt class="sr-only">{{ s.label }}</dt>
                <dd><app-glow-number class="text-[1.3rem] sm:text-4xl" [value]="s.value" [suffix]="s.suffix" [appInView]="300 + i * 150" inViewInstant /></dd>
                <dd aria-hidden="true" class="mt-1 text-sm text-slate">{{ s.label }}</dd>
              </div>
            }
          </dl>
        </div>

        <!-- Сцена: фото клініки, «лінза» з 3D-зубом і скляні підказки -->
        <div class="relative mx-auto aspect-square w-full max-w-[640px] lg:col-span-6">
          <div class="absolute top-0 right-0 aspect-[4/5] w-[60%] overflow-hidden rounded-[2.5rem] shadow-[var(--shadow-soft)]">
            <img
              ngSrc="1629909613654-28e377c37b09"
              [alt]="ui.hero.alt"
              fill
              sizes="(min-width: 1024px) 26vw, 60vw"
              class="object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-tr from-white/50 via-transparent to-transparent"></div>
          </div>

          <div #lens class="lens absolute bottom-0 left-0 aspect-square w-[78%] rounded-full">
            <div class="lens-ring breathe absolute inset-0 rounded-full" aria-hidden="true"></div>
            <div class="absolute inset-[6%] overflow-hidden rounded-full bg-gradient-to-b from-white/85 to-mist/80 backdrop-blur-md">
              <!-- Постер — кадр з тієї ж 3D-сцени: показується одразу, а при reduced-motion замість 3D -->
              <img ngSrc="tooth.webp" width="760" height="760" alt="" aria-hidden="true"
                class="placeholder absolute inset-[9%] h-[82%] w-[82%] object-contain transition-opacity duration-700" [class.opacity-0]="sceneReady()" />
              @defer (when loadScene()) {
                <app-tooth-scene (ready)="sceneReady.set(true)" />
              }
            </div>
          </div>

          <div class="glass chip absolute top-[10%] left-[2%] rounded-2xl px-4 py-3">
            <p class="flex items-center gap-2 text-sm font-semibold"><app-icon name="sparkle" [size]="16" class="text-teal" />{{ ui.hero.c1 }}</p>
            <p class="text-xs text-slate">{{ ui.hero.c1s }}</p>
          </div>
          <div class="glass chip absolute right-[0%] bottom-[30%] rounded-2xl px-4 py-3 [animation-delay:-2s]">
            <p class="flex items-center gap-2 text-sm font-semibold"><app-icon name="wallet" [size]="16" class="text-teal" />{{ ui.hero.c2 }}</p>
            <p class="text-xs text-slate">{{ ui.hero.c2s }}</p>
          </div>
          <div class="glass chip absolute right-[8%] bottom-[4%] rounded-2xl px-4 py-3 [animation-delay:-4s]">
            <p class="flex items-center gap-2 text-sm font-semibold"><app-icon name="shield" [size]="16" class="text-teal" />{{ ui.hero.c3 }}</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .dots {
      background-image: radial-gradient(circle at 1px 1px, rgb(11 31 58 / 0.07) 1px, transparent 1.5px);
      background-size: 26px 26px;
      mask-image: radial-gradient(ellipse at 70% 40%, black, transparent 70%);
    }
    .lens-ring {
      background: conic-gradient(from 200deg, rgb(20 184 166 / 0), rgb(20 184 166 / 0.5), rgb(127 245 230 / 0.9), rgb(20 184 166 / 0));
      mask: radial-gradient(circle, transparent 63%, black 64%, black 66%, transparent 67%);
      filter: blur(0.5px);
    }
    .lens::after {
      content: '';
      position: absolute;
      inset: 6%;
      border-radius: 999px;
      box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.9), 0 40px 80px -30px rgb(20 184 166 / 0.45);
      pointer-events: none;
    }
    :host-context(.motion) .chip { animation: float 9s var(--ease-soft) infinite; }
    @keyframes float { 50% { transform: translateY(-10px); } }
  `,
})
export class Hero {
  protected readonly booking = inject(Booking);
  protected readonly i18n = inject(I18n);
  protected readonly ui = this.i18n.t;
  protected readonly stats = this.i18n.c.heroStats;
  protected readonly consult = this.i18n.c.bookingServices[0];
  protected readonly sceneReady = signal(false);
  /** 3D вантажимо не одразу: десктоп — у простої після load, мобільні — коли сцена з’явиться на екрані */
  protected readonly loadScene = signal(false);
  private readonly lens = viewChild.required<ElementRef<HTMLElement>>('lens');

  constructor() {
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      if (prefersReducedMotion()) return; // 3D статичне — лишається постер
      const desktop = matchMedia('(min-width: 1024px) and (pointer: fine)').matches;
      if (desktop) {
        const go = () => {
          const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1200));
          idle(() => this.loadScene.set(true), { timeout: 3000 });
        };
        if (document.readyState === 'complete') go();
        else addEventListener('load', go, { once: true });
        return;
      }
      const io = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return;
          this.loadScene.set(true);
          io.disconnect();
        },
        { threshold: 0.3 },
      );
      io.observe(this.lens().nativeElement);
      destroy.onDestroy(() => io.disconnect());
    });
  }
}
