import { Component, DestroyRef, afterNextRender, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { Booking } from '../core/booking.service';
import { SmoothScroll } from '../core/smooth-scroll.service';
import { Logo } from '../shared/ui/logo';
import { Icon } from '../shared/ui/icon';
import { Ripple } from '../shared/directives/ripple';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { I18n } from '../core/i18n';

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
        <a [routerLink]="i18n.link()" [attr.aria-label]="t.header.home"><app-logo /></a>

        <nav [attr.aria-label]="t.header.nav" class="hidden lg:block">
          <ul class="flex items-center gap-1">
            @for (item of nav; track item.href) {
              <li>
                <a [href]="i18n.anchor(item.href)" class="rounded-full px-4 py-2 text-[15px] font-medium text-ink/80 transition-colors hover:bg-mist hover:text-teal">{{ item.label }}</a>
              </li>
            }
          </ul>
        </nav>

        <div class="flex items-center gap-2">
          <a [href]="clinic.phoneHref" class="hidden items-center gap-2 px-3 text-[15px] font-semibold text-ink xl:inline-flex">
            <app-icon name="phone" [size]="18" class="text-teal" />{{ clinic.phone }}
          </a>
          <a
            [href]="switchHref()"
            [attr.hreflang]="i18n.other"
            [attr.lang]="i18n.other"
            [attr.aria-label]="t.header.switchLabel"
            class="langsw"
            (click)="i18n.remember(i18n.other)"
            >{{ i18n.other === 'en' ? 'EN' : 'UA' }}</a
          >
          <button type="button" class="btn btn-primary glint hidden sm:inline-flex" appRipple (click)="booking.show()">{{ t.header.book }}</button>
          <button
            type="button"
            class="grid h-12 w-12 place-items-center rounded-full border border-frost bg-white lg:hidden"
            [attr.aria-expanded]="menu()"
            aria-controls="mobile-nav"
            [attr.aria-label]="menu() ? t.header.closeMenu : t.header.openMenu"
            (click)="toggleMenu()"
          >
            <app-icon [name]="menu() ? 'close' : 'menu'" />
          </button>
        </div>
      </div>

      @if (menu()) {
        <div id="mobile-nav" class="menu-panel wrap pb-8 lg:hidden">
          <nav [attr.aria-label]="t.header.mobileNav">
            <ul class="grid gap-1 border-t border-frost pt-4">
              @for (item of nav; track item.href; let i = $index) {
                <li class="menu-item" [style.--i]="i">
                  <a [href]="i18n.anchor(item.href)" (click)="closeMenu()" class="flex items-center justify-between rounded-2xl px-4 py-3.5 font-display text-xl font-semibold tracking-tight hover:bg-mist">
                    {{ item.label }}<app-icon name="arrow" class="text-teal" />
                  </a>
                </li>
              }
            </ul>
          </nav>
          <div class="mt-6 grid gap-3">
            <button type="button" class="btn btn-primary w-full" appRipple (click)="closeMenu(); booking.show()">{{ t.header.bookConsult }}</button>
            <a [href]="clinic.phoneHref" class="btn btn-ghost w-full"><app-icon name="phone" [size]="18" />{{ clinic.phone }}</a>
          </div>
        </div>
      }
    </header>
  `,
  styles: `
    .langsw { display: grid; place-items: center; height: 3rem; min-width: 3rem; padding: 0 .9rem; border-radius: 999px; border: 1px solid var(--color-frost); background: #fff; font-weight: 600; font-size: .9rem; letter-spacing: .04em; color: var(--color-ink); transition: color .3s, border-color .3s; }
    .langsw:hover { color: var(--color-teal); border-color: var(--color-aqua); }
    .menu-panel { animation: menu-in .45s var(--ease-calm); }
    .menu-item { animation: menu-in .5s var(--ease-calm) both; animation-delay: calc(var(--i) * 40ms); }
    @keyframes menu-in { from { opacity: 0; transform: translateY(-8px); filter: blur(6px); } }
  `,
})
export class Header {
  protected readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;
  protected readonly nav = this.i18n.c.nav;
  protected readonly clinic = this.i18n.c.clinic;
  private readonly router = inject(Router);
  /** Та сама сторінка іншою мовою, відносно base href */
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  protected readonly switchHref = computed(() => this.i18n.switchUrl(this.url().split('#')[0]).slice(1));
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
