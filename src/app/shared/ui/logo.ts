import { Component } from '@angular/core';

/** Логотип: перлина з бліком + назва */
@Component({
  selector: 'app-logo',
  host: { class: 'inline-flex items-center gap-2.5' },
  template: `
    <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
      <defs>
        <radialGradient id="pearl" cx="35%" cy="30%" r="75%">
          <stop offset="0" stop-color="#ffffff" />
          <stop offset=".55" stop-color="#d7f5f1" />
          <stop offset="1" stop-color="#14b8a6" />
        </radialGradient>
      </defs>
      <circle cx="17" cy="17" r="15" fill="url(#pearl)" />
      <circle cx="17" cy="17" r="15" fill="none" stroke="#0b7a70" stroke-opacity=".35" />
      <ellipse cx="12.5" cy="11.5" rx="4" ry="2.6" fill="#fff" opacity=".9" transform="rotate(-30 12.5 11.5)" />
    </svg>
    <span class="font-display text-[1.2rem] font-semibold tracking-[-0.03em]">Перлина</span>
  `,
})
export class Logo {}
