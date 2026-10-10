import { Service } from '@angular/core';
import type Lenis from 'lenis';
import { loadGsap } from './gsap';
import { prefersReducedMotion } from './browser';

const HEADER_OFFSET = -88;

/** Плавний скрол (Lenis), синхронізований з GSAP ScrollTrigger. Викликається тільки в браузері. */
@Service()
export class SmoothScroll {
  private lenis: Lenis | null = null;
  private starting?: Promise<void>;

  /** Ідемпотентно: повторні виклики повертають ту саму ініціалізацію */
  init(): Promise<void> {
    if (prefersReducedMotion()) return Promise.resolve();
    return (this.starting ??= this.start_());
  }

  private async start_(): Promise<void> {
    const [{ default: LenisCtor }, { gsap, ScrollTrigger }] = await Promise.all([import('lenis'), loadGsap()]);
    const lenis = new LenisCtor({ lerp: 0.1, wheelMultiplier: 0.9 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    this.lenis = lenis;
  }

  scrollTo(target: string | HTMLElement): void {
    const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
    if (!el) return;
    // Lenis ще вантажиться (клік сам його запустив) — чекаємо, інакше він перерве нативний скрол
    if (this.starting && !this.lenis) {
      void this.starting.then(() => this.scrollTo(el));
      return;
    }
    // Lenis сам враховує scroll-padding-top з CSS (висота шапки), тож додатковий зсув не потрібен
    if (this.lenis) this.lenis.scrollTo(el, { duration: 1.4 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + HEADER_OFFSET, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }

  stop(): void {
    this.lenis?.stop();
  }

  start(): void {
    this.lenis?.start();
  }
}
