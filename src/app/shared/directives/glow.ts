import { Directive, ElementRef, afterNextRender, inject } from '@angular/core';

/**
 * Світна межа картки, що йде за курсором.
 * Рухається лише transform світної плями під внутрішнім шаром картки.
 */
@Directive({
  selector: '[appGlow]',
  host: {
    class: 'glow-card',
    '(pointermove)': 'move($event)',
    '(pointerenter)': 'toggle(true)',
    '(pointerleave)': 'toggle(false)',
  },
})
export class Glow {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private dot?: HTMLSpanElement;

  constructor() {
    afterNextRender(() => {
      this.dot = document.createElement('span');
      this.dot.className = 'glow-dot';
      this.dot.setAttribute('aria-hidden', 'true');
      this.el.nativeElement.prepend(this.dot);
    });
  }

  protected move(e: PointerEvent): void {
    if (!this.dot || e.pointerType !== 'mouse') return;
    const r = this.el.nativeElement.getBoundingClientRect();
    this.dot.style.transform = `translate3d(${e.clientX - r.left}px, ${e.clientY - r.top}px, 0) translate(-50%, -50%)`;
  }

  protected toggle(on: boolean): void {
    this.dot?.classList.toggle('on', on);
  }
}
