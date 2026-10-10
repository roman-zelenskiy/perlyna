import { Directive, ElementRef, inject } from '@angular/core';
import { prefersReducedMotion } from '../../core/browser';

/** М’яка хвиля від точки натискання (лише transform/opacity) */
@Directive({
  selector: '[appRipple]',
  host: { '(pointerdown)': 'spawn($event)' },
})
export class Ripple {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  protected spawn(e: PointerEvent): void {
    if (prefersReducedMotion()) return;
    const host = this.el.nativeElement;
    const r = host.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 2.2;
    const ink = document.createElement('span');
    ink.className = 'ripple-ink';
    ink.style.width = ink.style.height = `${size}px`;
    ink.style.left = `${e.clientX - r.left - size / 2}px`;
    ink.style.top = `${e.clientY - r.top - size / 2}px`;
    host.appendChild(ink);
    ink.addEventListener('animationend', () => ink.remove(), { once: true });
  }
}
