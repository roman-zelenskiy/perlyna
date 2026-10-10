import { Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';
import { clinic, nav } from '../data/content';
import { Booking } from '../core/booking.service';
import { SmoothScroll } from '../core/smooth-scroll.service';
import { Logo } from '../shared/ui/logo';
import { Icon } from '../shared/ui/icon';
import { Ripple } from '../shared/directives/ripple';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [Logo, Icon, Ripple, RouterLink],
  host: { class: 'contents' },
  template: `
    <header class="fixed inset-x-0 top-0 z-50 transition-[transform] duration-500" [class.-translate-y-full]="hidden() && !menu()">
      <div
        class="absolute inset-0 -z-10 border-b border-frost/70 bg-white/70 backdrop-blur-xl backdrop-saturate-150 transition-opacity duration-500"
        [class.opacity-0]="!scrolled() && !menu()"
        aria-hidden="true"
      ></div>
      <div class="wrap flex h-[72px] items-center justify-between gap-6">
        <a routerLink="/" aria-label="Стоматологія «Перлина» — на головну"><app-logo /></a>

        <nav aria-label="Основна навігація" class="hidden lg:block">
          <ul class="flex items-center gap-1">
            @for (item of nav; track item.href) {
              <li>
                <a [href]="item.href" class="rounded-full px-4 py-2 text-[15px] font-medium text-ink/80 transition-colors hover:bg-mist hover:text-teal">{{ item.label }}</a>
              </li>
            }
          </ul>
        </nav>

        <div class="flex items-center gap-2">
          <a [href]="clinic.phoneHref" class="hidden items-center gap-2 px-3 text-[15px] font-semibold text-ink xl:inline-flex">
            <app-icon name="phone" [size]="18" class="text-teal" />{{ clinic.phone }}
          </a>
          <button type="button" class="btn btn-primary glint hidden sm:inline-flex" appRipple (click)="booking.show()">Записатися</button>
          <button
            type="button"
            class="grid h-12 w-12 place-items-center rounded-full border border-frost bg-white lg:hidden"
            [attr.aria-expanded]="menu()"
            aria-controls="mobile-nav"
            [attr.aria-label]="menu() ? 'Закрити меню' : 'Відкрити меню'"
            (click)="toggleMenu()"
          >
            <app-icon [name]="menu() ? 'close' : 'menu'" />
          </button>
        </div>
      </div>

      @if (menu()) {
        <div id="mobile-nav" class="menu-panel wrap pb-8 lg:hidden">
          <nav aria-label="Мобільна навігація">
            <ul class="grid gap-1 border-t border-frost pt-4">
              @for (item of nav; track item.href; let i = $index) {
                <li class="menu-item" [style.--i]="i">
                  <a [href]="item.href" (click)="closeMenu()" class="flex items-center justify-between rounded-2xl px-4 py-3.5 font-display text-xl font-semibold tracking-tight hover:bg-mist">
                    {{ item.label }}<app-icon name="arrow" class="text-teal" />
                  </a>
                </li>
              }
            </ul>
          </nav>
          <div class="mt-6 grid gap-3">
            <button type="button" class="btn btn-primary w-full" appRipple (click)="closeMenu(); booking.show()">Записатися на консультацію</button>
            <a [href]="clinic.phoneHref" class="btn btn-ghost w-full"><app-icon name="phone" [size]="18" />{{ clinic.phone }}</a>
          </div>
        </div>
      }
    </header>
  `,
  styles: `
    .menu-panel { animation: menu-in .45s var(--ease-calm); }
    .menu-item { animation: menu-in .5s var(--ease-calm) both; animation-delay: calc(var(--i) * 40ms); }
    @keyframes menu-in { from { opacity: 0; transform: translateY(-8px); filter: blur(6px); } }
  `,
})
export class Header {
  protected readonly nav = nav;
  protected readonly clinic = clinic;
  protected readonly booking = inject(Booking);
  protected readonly scrolled = signal(false);
  protected readonly hidden = signal(false);
  protected readonly menu = signal(false);
  private readonly scroll = inject(SmoothScroll);

  constructor() {
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      let last = window.scrollY;
      const onScroll = () => {
        const y = window.scrollY;
        this.scrolled.set(y > 12);
        if (Math.abs(y - last) > 6) this.hidden.set(y > 700 && y > last);
        last = y;
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      destroy.onDestroy(() => window.removeEventListener('scroll', onScroll));
    });
  }

  protected closeMenu(): void {
    this.menu.set(false);
    this.scroll.start();
  }

  protected toggleMenu(): void {
    this.menu.update((v) => !v);
    if (this.menu()) this.scroll.stop();
    else this.scroll.start();
  }
}
