import { Component, inject, signal } from '@angular/core';
import { I18n } from '../core/i18n';
import { NgOptimizedImage } from '@angular/common';
import { SectionHead } from '../shared/ui/section-head';
import { Icon } from '../shared/ui/icon';

/** Інтерактивний блок технологій: вибір змінює візуал з ефектом «пересканування» */
@Component({
  selector: 'app-technologies',
  imports: [NgOptimizedImage, SectionHead, Icon],
  template: `
    <section id="tech" aria-labelledby="tech-title" class="relative isolate overflow-hidden bg-ink py-24 text-white md:py-36">
      <div class="lights" aria-hidden="true">
        <span class="-top-40 left-1/4 h-[36rem] w-[36rem] bg-aqua/25"></span>
        <span class="-right-40 bottom-0 h-[30rem] w-[30rem] bg-[#1d4ed8]/25"></span>
      </div>
      <div class="grid-lines pointer-events-none absolute inset-0 -z-10" aria-hidden="true"></div>

      <div class="wrap">
        <app-section-head
          [dark]="true"
          [eyebrow]="ui.tech.eyebrow"
          headingId="tech-title"
          [title]="ui.tech.title"
          [lead]="ui.tech.lead"
        />

        <div class="mt-14 grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div role="tablist" [attr.aria-label]="ui.tech.tabs" aria-orientation="vertical" class="grid gap-2 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1" (keydown)="onKey($event)">
            @for (t of items; track t.id; let i = $index) {
              <button
                type="button"
                role="tab"
                [id]="'tech-tab-' + t.id"
                [attr.aria-selected]="i === active()"
                [attr.aria-controls]="'tech-panel'"
                [tabIndex]="i === active() ? 0 : -1"
                class="tech-tab group relative flex items-center gap-4 overflow-hidden rounded-2xl border px-5 py-4 text-left transition-colors duration-500"
                [class.on]="i === active()"
                (click)="active.set(i)"
              >
                <span class="font-display text-sm text-white/70">0{{ i + 1 }}</span>
                <span class="flex-1 font-display text-lg font-semibold tracking-tight">{{ t.title }}</span>
                <app-icon name="scan" class="text-glow opacity-0 transition-opacity duration-500 group-[.on]:opacity-100" />
              </button>
            }
          </div>

          @for (t of items; track t.id; let i = $index) {
            @if (i === active()) {
              <div id="tech-panel" role="tabpanel" [attr.aria-labelledby]="'tech-tab-' + t.id" class="grid gap-6 md:grid-cols-[1.2fr_1fr] lg:col-span-8">
                <div class="rescan relative min-h-72 overflow-hidden rounded-[2rem] bg-ink-2 md:min-h-[26rem]">
                  <img [ngSrc]="t.photo" [alt]="t.alt" fill sizes="(min-width: 1024px) 36vw, 100vw" class="object-cover" />
                  <div class="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/10"></div>
                  <span class="scanline" aria-hidden="true"></span>
                  <span class="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full bg-ink/60 px-3 py-1.5 text-sm font-semibold backdrop-blur-md">
                    <span class="h-2 w-2 rounded-full bg-glow breathe" aria-hidden="true"></span>{{ t.name }}
                  </span>
                </div>
                <div class="swap flex flex-col justify-center">
                  <h3 class="title-md text-white">{{ t.name }}</h3>
                  <p class="mt-4 text-white/80">{{ t.text }}</p>
                  <ul class="mt-7 grid gap-3">
                    @for (sp of t.specs; track sp) {
                      <li class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[15px]">
                        <app-icon name="check" [size]="18" class="text-glow" />{{ sp }}
                      </li>
                    }
                  </ul>
                </div>
              </div>
            }
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    .grid-lines {
      background-image: linear-gradient(rgb(127 245 230 / 0.06) 1px, transparent 1px), linear-gradient(90deg, rgb(127 245 230 / 0.06) 1px, transparent 1px);
      background-size: 64px 64px;
      mask-image: radial-gradient(ellipse at 60% 50%, black, transparent 75%);
    }
    .tech-tab { border-color: rgb(255 255 255 / 0.1); background: rgb(255 255 255 / 0.03); }
    .tech-tab:hover { border-color: rgb(127 245 230 / 0.35); }
    .tech-tab.on { border-color: rgb(127 245 230 / 0.6); background: rgb(20 184 166 / 0.14); box-shadow: inset 0 0 30px -10px rgb(127 245 230 / 0.5); }
    /* пересканування: шар-завіса сходить донизу, лінія світиться на її краю */
    .rescan::before {
      content: ''; position: absolute; inset: 0; z-index: 2; pointer-events: none;
      background: radial-gradient(circle at 1px 1px, rgb(127 245 230 / 0.4) 1px, transparent 1.5px) 0 0 / 14px 14px, var(--color-ink-2);
      animation: cover 1.3s var(--ease-soft) forwards;
    }
    .scanline {
      position: absolute; inset: 0; z-index: 3; pointer-events: none;
      background: linear-gradient(to bottom, rgb(127 245 230 / 0) 0, rgb(127 245 230 / 0.25) calc(100% - 30px), #7ff5e6 calc(100% - 2px), transparent 100%);
      transform: translateY(-100%);
      animation: line 1.3s var(--ease-soft) forwards, fade .4s linear 1.3s forwards;
    }
    .swap { animation: swap .8s var(--ease-calm) .15s both; }
    @keyframes cover { to { transform: translateY(101%); } }
    @keyframes line { to { transform: translateY(0); } }
    @keyframes fade { to { opacity: 0; } }
    @keyframes swap { from { opacity: 0; filter: blur(10px); transform: translateY(12px); } }
  `,
})
export class Technologies {
  protected readonly ui = inject(I18n).t;
  protected readonly items = inject(I18n).c.technologies;
  protected readonly active = signal(0);

  protected onKey(e: KeyboardEvent): void {
    const n = this.items.length;
    const dir = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    this.active.update((i) => (i + dir + n) % n);
    (document.getElementById('tech-tab-' + this.items[this.active()].id) as HTMLElement | null)?.focus();
  }
}
