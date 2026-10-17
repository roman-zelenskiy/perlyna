import { Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';
import { I18n } from '../core/i18n';
import { Booking } from '../core/booking.service';
import { Icon } from '../shared/ui/icon';
import { Ripple } from '../shared/directives/ripple';

/** Липка кнопка «Записатися» на мобільних: з’являється після hero, ховається біля форми */
@Component({
  selector: 'app-mobile-cta',
  imports: [Icon, Ripple],
  template: `
    <aside [attr.aria-label]="ui.mcta.aria" class="bar glass fixed inset-x-3 bottom-3 z-40 flex items-center gap-2 rounded-full p-1.5 lg:hidden" [class.shown]="shown()" [attr.inert]="shown() ? null : ''">
      <button type="button" class="btn btn-primary glint flex-1" appRipple (click)="booking.show()">{{ ui.mcta.book }}</button>
      <a [href]="clinic.telegram" class="grid h-12 w-12 place-items-center rounded-full bg-white text-teal" [attr.aria-label]="ui.mcta.tg"><app-icon name="telegram" /></a>
      <a [href]="clinic.phoneHref" class="grid h-12 w-12 place-items-center rounded-full bg-ink text-white" [attr.aria-label]="ui.mcta.call(clinic.phone)"><app-icon name="phone" /></a>
    </aside>
  `,
  styles: `
    .bar { transform: translateY(140%); transition: transform .6s var(--ease-calm); }
    .bar.shown { transform: none; }
  `,
})
export class MobileCta {
  protected readonly clinic = inject(I18n).c.clinic;
  protected readonly ui = inject(I18n).t;
  protected readonly booking = inject(Booking);
  protected readonly shown = signal(false);

  constructor() {
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      let nearForm = false;
      const update = () => this.shown.set(scrollY > innerHeight * 0.75 && !nearForm);
      const form = document.getElementById('booking');
      const io = form ? new IntersectionObserver(([e]) => { nearForm = e.isIntersecting; update(); }) : null;
      if (form) io?.observe(form);
      addEventListener('scroll', update, { passive: true });
      destroy.onDestroy(() => { removeEventListener('scroll', update); io?.disconnect(); });
    });
  }
}
