import { Directive, ElementRef, Service, afterNextRender, booleanAttribute, inject, input, DestroyRef } from '@angular/core';
import { prefersReducedMotion } from '../../core/browser';

/** Один IntersectionObserver на всю сторінку */
@Service()
export class InViewObserver {
  private io?: IntersectionObserver;
  private readonly callbacks = new WeakMap<Element, () => void>();

  observe(el: Element, cb: () => void): () => void {
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      cb();
      return () => {};
    }
    this.io ??= new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          this.callbacks.get(e.target)?.();
          this.io?.unobserve(e.target);
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    );
    this.callbacks.set(el, cb);
    this.io.observe(el);
    return () => this.io?.unobserve(el);
  }
}

/**
 * Додає клас `is-in`, коли елемент з’являється у вікні.
 * Разом із `data-reveal`, `.words`, `.scan` у стилях дає анімації появи.
 */
@Directive({
  selector: '[appInView]',
  host: { '[style.--d]': 'delay() + "ms"' },
})
export class InView {
  readonly delay = input(0, { alias: 'appInView', transform: (v: number | string | '') => Number(v) || 0 });
  /** Для першого екрана: проявити одразу після гідратації, не чекаючи скролу */
  readonly instant = input(false, { alias: 'inViewInstant', transform: booleanAttribute });
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    const destroy = inject(DestroyRef);
    const observer = inject(InViewObserver);
    afterNextRender(() => {
      if (this.instant()) {
        requestAnimationFrame(() => this.el.nativeElement.classList.add('is-in'));
        return;
      }
      const stop = observer.observe(this.el.nativeElement, () => this.el.nativeElement.classList.add('is-in'));
      destroy.onDestroy(stop);
    });
  }
}
