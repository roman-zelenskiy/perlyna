import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18n } from '../core/i18n';
import { Logo } from '../shared/ui/logo';
import { Icon } from '../shared/ui/icon';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, Logo, Icon],
  template: `
    <footer class="relative overflow-hidden border-t border-frost bg-mist pt-20 pb-28 lg:pb-12">
      <div class="wrap grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
        <div class="lg:col-span-4">
          <app-logo />
          <p class="mt-5 max-w-xs text-slate">{{ t.foot.about }}</p>
          <div class="mt-7 flex gap-2">
            <a [href]="clinic.telegram" class="social" [attr.aria-label]="t.foot.tg"><app-icon name="telegram" /></a>
            <a [href]="clinic.viber" class="social" [attr.aria-label]="t.foot.viber"><app-icon name="viber" /></a>
            <a [href]="clinic.socials.instagram" class="social" aria-label="Instagram"><app-icon name="instagram" /></a>
            <a [href]="clinic.socials.facebook" class="social" aria-label="Facebook"><app-icon name="facebook" /></a>
            <a [href]="clinic.socials.tiktok" class="social" aria-label="TikTok"><app-icon name="tiktok" /></a>
          </div>
        </div>

        <div class="grid gap-10 sm:grid-cols-2 lg:col-span-4">
          <address class="not-italic">
            <h2 class="text-sm font-semibold text-ink">{{ t.foot.contacts }}</h2>
            <ul class="mt-4 space-y-2.5 text-slate">
              <li><a [href]="clinic.phoneHref" class="font-display text-lg font-semibold whitespace-nowrap text-ink hover:text-teal">{{ clinic.phone }}</a></li>
              <li><a [href]="'mailto:' + clinic.email" class="hover:text-teal">{{ clinic.email }}</a></li>
              <li>{{ clinic.street }},<br />{{ clinic.city }}, {{ clinic.postalCode }}</li>
              <li class="text-sm">{{ clinic.metro }}</li>
            </ul>
          </address>
          <div>
            <h2 class="text-sm font-semibold text-ink">{{ t.foot.hours }}</h2>
            <dl class="mt-4 space-y-2.5 text-slate">
              @for (h of clinic.hours; track h.days) {
                <div class="flex gap-3"><dt class="w-14 shrink-0 font-semibold text-ink">{{ h.days }}</dt><dd>{{ h.time }}</dd></div>
              }
            </dl>
            <nav [attr.aria-label]="t.foot.nav" class="mt-8">
              <ul class="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate">
                @for (n of nav; track n.href) { <li><a [href]="i18n.anchor(n.href)" class="hover:text-teal">{{ n.label }}</a></li> }
              </ul>
            </nav>
          </div>
        </div>

        <a [href]="clinic.mapsUrl" target="_blank" rel="noopener noreferrer" class="map group relative block overflow-hidden rounded-[2rem] border border-frost bg-white lg:col-span-4">
          <svg viewBox="0 0 400 260" class="block h-auto w-full" role="img" [attr.aria-label]="t.foot.mapAria">
            <rect width="400" height="260" fill="#f7fbfa" />
            <g fill="#e9f1f1">
              @for (b of blocks; track $index) { <rect [attr.x]="b[0]" [attr.y]="b[1]" [attr.width]="b[2]" [attr.height]="b[3]" rx="8" /> }
            </g>
            <g stroke="#ffffff" stroke-width="12" stroke-linecap="round" fill="none">
              <path d="M-10 92 L410 70" />
              <path d="M-10 190 L410 176" />
              <path d="M150 -10 L170 270" />
              <path d="M300 -10 L292 270" />
            </g>
            <g class="font-sans" font-size="9" font-weight="600" fill="#475a70" letter-spacing=".04em">
              <text x="16" y="84" transform="rotate(-3 16 84)">{{ t.foot.st1 }}</text>
              <text x="16" y="182" transform="rotate(-2 16 182)">{{ t.foot.st2 }}</text>
            </g>
            <path class="route" d="M232 186 C 236 150, 214 118, 214 84" fill="none" stroke="#14b8a6" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 8" />
            <g transform="translate(232 190)">
              <circle r="11" fill="#0b1f3a" />
              <text y="4" text-anchor="middle" font-size="11" font-weight="700" fill="#fff" class="font-sans">{{ t.foot.metro }}</text>
            </g>
            <text x="248" y="214" font-size="10" fill="#475a70" class="font-sans">{{ t.foot.walk }}</text>
            <g transform="translate(214 80)">
              <circle r="12" fill="#14b8a6" class="pin-pulse" />
              <circle r="8" fill="#0b7a70" stroke="#fff" stroke-width="3" />
              <rect x="-50" y="-44" width="100" height="26" rx="13" fill="#0b1f3a" />
              <text y="-27" text-anchor="middle" font-size="11" font-weight="600" fill="#fff" class="font-sans">{{ t.foot.pin }}</text>
            </g>
          </svg>
          <span class="glass absolute right-3 bottom-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
            {{ t.foot.route }} <app-icon name="arrow" [size]="16" />
          </span>
        </a>
      </div>

      <div class="wrap mt-16 flex flex-col gap-4 border-t border-frost pt-8 text-sm text-slate md:flex-row md:items-center md:justify-between">
        <p>© 2014–2026 {{ clinic.legalName }}. {{ t.foot.license }}</p>
        <a [routerLink]="i18n.link('/polityka-konfidentsiinosti')" class="hover:text-teal">{{ t.privacy }}</a>
      </div>
    </footer>
  `,
  styles: `
    .social { display: grid; place-items: center; width: 3rem; height: 3rem; border-radius: 999px; background: #fff; border: 1px solid var(--color-frost); color: var(--color-ink); transition: color .3s, border-color .3s; }
    .social:hover { color: var(--color-teal); border-color: var(--color-aqua); }
    :host-context(.motion) .pin-pulse { transform-box: fill-box; transform-origin: center; animation: pulse-ring 2.4s var(--ease-soft) infinite; }
    :host-context(.motion) .route { animation: route 1.6s linear infinite; }
    @keyframes route { to { stroke-dashoffset: -20; } }
  `,
})
export class Footer {
  protected readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;
  protected readonly clinic = this.i18n.c.clinic;
  protected readonly nav = this.i18n.c.nav;
  protected readonly blocks = [
    [10, 10, 120, 62], [180, 6, 100, 48], [312, 4, 80, 50], [10, 112, 124, 60], [186, 100, 92, 62],
    [306, 92, 90, 66], [10, 212, 128, 46], [190, 204, 30, 50], [306, 196, 88, 60],
  ];
}
