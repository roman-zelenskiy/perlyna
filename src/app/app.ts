import { Component, DestroyRef, afterNextRender, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Header } from './sections/header';
import { Footer } from './sections/footer';
import { BookingDialog } from './sections/booking-dialog';
import { MobileCta } from './sections/mobile-cta';
import { SmoothScroll } from './core/smooth-scroll.service';
import { I18n } from './core/i18n';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, BookingDialog, MobileCta],
  template: `
    @if (i18n.root()) {
      <router-outlet />
    } @else {
      <a [href]="i18n.anchor('#main')" class="sr-only z-[100] rounded-full bg-ink px-5 py-3 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        {{ i18n.t.skip }}
      </a>
      <app-header />
      <main id="main" tabindex="-1" class="outline-none">
        <router-outlet />
      </main>
      @defer (hydrate on viewport) { <app-footer /> }
      <app-mobile-cta />
      <app-booking-dialog />
    }
  `,
})
export class App {
  protected readonly i18n = inject(I18n);

  constructor() {
    const scroll = inject(SmoothScroll);
    const router = inject(Router);
    const destroy = inject(DestroyRef);

    afterNextRender(() => {
      // Плавний скрол потрібен лише тому, хто скролить: вантажимо Lenis + GSAP при першій взаємодії
      const kick = () => {
        ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((t) => removeEventListener(t, kick));
        void scroll.init();
      };
      ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((t) => addEventListener(t, kick, { passive: true, once: true }));
      // Якірні посилання виду "/#services" — плавно, без перезавантаження маршруту
      const onClick = (e: MouseEvent) => {
        const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href*="#"]');
        if (!a || a.origin !== location.origin) return;
        const hash = a.hash;
        if (!hash || hash === '#') return;
        const onHome = /^\/(uk|en)\/?$/.test(router.url.split('#')[0].split('?')[0]);
        const target = document.querySelector<HTMLElement>(hash);
        if (!onHome || !target) return;
        e.preventDefault();
        scroll.scrollTo(target);
        history.replaceState(null, '', hash);
        if (hash === '#main') target.focus({ preventScroll: true });
      };
      document.addEventListener('click', onClick);
      destroy.onDestroy(() => document.removeEventListener('click', onClick));
    });
  }
}
