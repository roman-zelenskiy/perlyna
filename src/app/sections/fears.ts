import { Component, DestroyRef, ElementRef, afterNextRender, inject, signal, viewChild, viewChildren } from '@angular/core';
import { fears } from '../data/content';
import { prefersReducedMotion } from '../core/browser';
import { SectionHead } from '../shared/ui/section-head';
import { Icon } from '../shared/ui/icon';
import { InView } from '../shared/directives/in-view';
import { Glow } from '../shared/directives/glow';

/**
 * Split-screen «страх → рішення». Ліва панель закріплена: пульс заспокоюється
 * (амплітуда й колір через transform/opacity), текст страху розмивається.
 */
@Component({
  selector: 'app-fears',
  imports: [SectionHead, Icon, InView, Glow],
  template: `
    <section id="fears" aria-labelledby="fears-title" class="relative py-24 md:py-36">
      <div class="wrap">
        <app-section-head
          eyebrow="Чого бояться пацієнти"
          headingId="fears-title"
          title="Три страхи, які ми *прибрали* зі стоматології"
          lead="Ми чесно запитали пацієнтів, чому вони роками відкладають візит до стоматолога. І збудували клініку так, щоб жодна з цих причин не мала сенсу."
        />

        <div #track class="mt-16 grid gap-10 md:mt-24 lg:grid-cols-2 lg:gap-16">
          <!-- Ліва частина: страх (закріплена на десктопі) -->
          <div class="hidden lg:block">
            <div class="sticky top-28">
              <div class="fear-panel relative overflow-hidden rounded-[2.5rem] bg-ink p-10 text-white" aria-live="polite">
                <div class="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#e86a5c]/25 blur-3xl transition-opacity duration-700" [style.opacity]="1 - calm()"></div>
                <div class="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-aqua/30 blur-3xl transition-opacity duration-700" [style.opacity]="calm()"></div>

                <p class="text-sm font-semibold text-white/70">Страх {{ active() + 1 }} з {{ items.length }}</p>
                @for (f of items; track f.id; let i = $index) {
                  @if (i === active()) {
                    <div class="fear-swap">
                      <p class="title-md mt-4 text-white">«{{ f.fear }}»</p>
                      <p #fearText class="mt-4 max-w-md text-white/80">{{ f.fearText }}</p>
                    </div>
                  }
                }

                <!-- Пульс -->
                <div class="relative mt-10 h-28 overflow-hidden" aria-hidden="true">
                  <div #pulse class="pulse absolute inset-0 origin-center">
                    <svg viewBox="0 0 600 100" preserveAspectRatio="none" class="ecg absolute top-0 left-0 h-full w-[200%]">
                      <path class="transition-opacity duration-700" [style.opacity]="1 - calm()" [attr.d]="ecg" fill="none" stroke="#f08a7e" stroke-width="2.5" vector-effect="non-scaling-stroke" />
                      <path class="transition-opacity duration-700" [style.opacity]="calm()" [attr.d]="ecg" fill="none" stroke="#7ff5e6" stroke-width="2.5" vector-effect="non-scaling-stroke" />
                    </svg>
                  </div>
                </div>

                <div class="mt-6">
                  <div class="flex justify-between text-sm text-white/75"><span>Рівень тривоги</span><span>{{ anxietyLabel() }}</span></div>
                  <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div #meter class="h-full w-full origin-left rounded-full bg-gradient-to-r from-aqua to-glow"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Права частина: рішення -->
          <ol class="grid gap-6 lg:gap-0">
            @for (f of items; track f.id; let i = $index) {
              <li #solution class="solution flex flex-col justify-center lg:min-h-[72vh]" [attr.data-index]="i">
                <div class="rounded-[2rem] border border-frost bg-mist/60 p-6 lg:hidden">
                  <p class="text-sm font-semibold text-slate">Страх {{ i + 1 }}</p>
                  <p class="title-md mt-2">«{{ f.fear }}»</p>
                  <p class="mt-2 text-slate">{{ f.fearText }}</p>
                </div>
                <div class="mt-4 lg:mt-0" data-reveal appInView>
                  <p class="pill"><app-icon name="check" [size]="16" />Рішення</p>
                  <h3 class="title-md mt-5">{{ f.solutionTitle }}</h3>
                  <p class="mt-4 max-w-xl text-lg text-slate">{{ f.solution }}</p>
                  <ul class="mt-7 grid gap-3">
                    @for (p of f.points; track p) {
                      <li appGlow class="flex items-center gap-3 rounded-2xl px-4 py-3 font-medium shadow-[var(--shadow-soft)]">
                        <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-aqua/12 text-teal"><app-icon name="check" [size]="16" /></span>{{ p }}
                      </li>
                    }
                  </ul>
                </div>
              </li>
            }
          </ol>
        </div>
      </div>
    </section>
  `,
  styles: `
    .fear-swap { animation: swap .7s var(--ease-calm); }
    @keyframes swap { from { opacity: 0; filter: blur(10px); transform: translateY(10px); } }
    :host-context(.motion) .ecg { animation: ecg 2.6s linear infinite; }
    @keyframes ecg { to { transform: translateX(-50%); } }
    .pulse { transition: transform .25s linear; }
  `,
})
export class Fears {
  protected readonly items = fears;
  protected readonly active = signal(0);
  protected readonly calm = signal(0);
  protected readonly ecg = this.buildEcg();

  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  private readonly pulse = viewChild.required<ElementRef<HTMLElement>>('pulse');
  private readonly meter = viewChild.required<ElementRef<HTMLElement>>('meter');
  private readonly fearText = viewChildren<ElementRef<HTMLElement>>('fearText');
  private readonly solutions = viewChildren<ElementRef<HTMLElement>>('solution');

  protected anxietyLabel(): string {
    const c = this.calm();
    return c < 0.35 ? 'висока' : c < 0.7 ? 'знижується' : 'спокій';
  }

  constructor() {
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      if (!matchMedia('(min-width: 1024px)').matches) return;
      const reduce = prefersReducedMotion();
      let raf = 0;
      const update = () => {
        raf = 0;
        const r = this.track().nativeElement.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, (innerHeight * 0.5 - r.top) / (r.height - innerHeight * 0.4)));
        const calm = reduce ? 1 : progress;
        this.calm.set(Math.round(calm * 100) / 100);
        // амплітуда пульсу затухає, але не до нуля — серце б’ється спокійно
        this.pulse().nativeElement.style.transform = `scaleY(${1 - calm * 0.78})`;
        this.meter().nativeElement.style.transform = `scaleX(${0.85 - calm * 0.75})`;
        const text = this.fearText()[0]?.nativeElement;
        // текст поточного страху поступово «розфокусовується», поки читаєте рішення
        if (text && !reduce) text.style.filter = `blur(${((progress * this.items.length) % 1) * 3}px)`;
        // активний страх — той, чиє рішення ближче до центру екрана
        let best = 0;
        let bestDist = Infinity;
        this.solutions().forEach((s, i) => {
          const b = s.nativeElement.getBoundingClientRect();
          const d = Math.abs(b.top + b.height / 2 - innerHeight / 2);
          if (d < bestDist) {
            bestDist = d;
            best = i;
          }
        });
        this.active.set(best);
      };
      const onScroll = () => (raf ||= requestAnimationFrame(update));
      update();
      addEventListener('scroll', onScroll, { passive: true });
      destroy.onDestroy(() => {
        removeEventListener('scroll', onScroll);
        cancelAnimationFrame(raf);
      });
    });
  }

  /** Кардіограма: два однакові періоди, щоб безшовно прокручувати */
  private buildEcg(): string {
    const beat = (x: number) =>
      `L${x + 60} 50 L${x + 72} 46 L${x + 84} 50 L${x + 100} 50 L${x + 108} 14 L${x + 118} 88 L${x + 126} 30 L${x + 134} 50 L${x + 160} 50 L${x + 176} 40 L${x + 192} 50 L${x + 300} 50`;
    return `M0 50 ${beat(0)} ${beat(300)}`;
  }
}
