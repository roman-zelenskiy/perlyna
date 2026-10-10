import { Component, computed, input } from '@angular/core';

const PATHS = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  phone: '<path d="M5 4h3.5l1.6 4.2-2.2 1.4a11 11 0 0 0 6.5 6.5l1.4-2.2L20 15.5V19a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z"/>',
  check: '<path d="m5 12.5 4.2 4.2L19 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  menu: '<path d="M4 9h16M4 15h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  chevronLeft: '<path d="m15 6-6 6 6 6"/>',
  chevronRight: '<path d="m9 6 6 6-6 6"/>',
  star: '<path fill="currentColor" stroke="none" d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8L12 3.5Z"/>',
  pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
  shield: '<path d="M12 3 5 6v5.5c0 4.4 3 8 7 9.5 4-1.5 7-5.1 7-9.5V6l-7-3Z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
  wallet: '<rect x="3.5" y="6" width="17" height="13" rx="3"/><path d="M16 12.5h4.5M3.5 9.5h17"/>',
  sparkle: '<path d="M12 3.5 13.8 10.2 20.5 12l-6.7 1.8L12 20.5l-1.8-6.7L3.5 12l6.7-1.8L12 3.5Z"/>',
  scan: '<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M4 12h16"/>',
  telegram: '<path fill="currentColor" stroke="none" d="M21.4 4.3 18.3 19c-.2 1-.9 1.3-1.7.8l-4.8-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2L6.1 12.8l-4.7-1.5c-1-.3-1-1 .2-1.5l18.4-7.1c.9-.3 1.6.2 1.4 1.6Z"/>',
  viber: '<path d="M12 2.8c5 0 8.6 2.2 8.6 8.1 0 5.6-3.4 7.9-8.3 7.9-.8 0-1.6 0-2.4-.2L6.6 21v-3.4C4.2 16.4 3.4 14 3.4 10.9 3.4 5 7 2.8 12 2.8Z"/><path d="M13 6.2a4.2 4.2 0 0 1 4 4M13 8.4a2 2 0 0 1 1.9 1.9"/>',
  instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".9" fill="currentColor" stroke="none"/>',
  facebook: '<path d="M14.5 8H17V4.5h-2.5c-2.5 0-4 1.6-4 4V11H8v3.5h2.5V21H14v-6.5h2.6L17 11h-3V9c0-.6.4-1 1-1Z"/>',
  tiktok: '<path d="M14 3.5v11.2a3.7 3.7 0 1 1-3.2-3.7M14 3.5c.4 2.6 2.2 4.4 5 4.6"/>',
} as const;

export type IconName = keyof typeof PATHS;

type Shape = { tag: string; a: Record<string, string> };

/** Розбираємо SVG-рядки один раз: так іконки рендеряться і на сервері (без innerHTML) */
const SHAPES = Object.fromEntries(
  Object.entries(PATHS).map(([name, markup]) => [
    name,
    [...markup.matchAll(/<(\w+)([^>]*)\/>/g)].map(([, tag, attrs]) => ({
      tag,
      a: Object.fromEntries([...attrs.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, k, v]) => [k, v])),
    })),
  ]),
) as Record<IconName, Shape[]>;

/** Інлайн SVG-іконки. Декоративні за замовчуванням (aria-hidden). */
@Component({
  selector: 'app-icon',
  host: { class: 'inline-flex shrink-0', 'aria-hidden': 'true' },
  template: `<svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    @for (s of shapes(); track $index) {
      @switch (s.tag) {
        @case ('path') { <svg:path [attr.d]="s.a['d']" [attr.fill]="s.a['fill']" [attr.stroke]="s.a['stroke']" /> }
        @case ('circle') { <svg:circle [attr.cx]="s.a['cx']" [attr.cy]="s.a['cy']" [attr.r]="s.a['r']" [attr.fill]="s.a['fill']" [attr.stroke]="s.a['stroke']" /> }
        @case ('rect') { <svg:rect [attr.x]="s.a['x']" [attr.y]="s.a['y']" [attr.width]="s.a['width']" [attr.height]="s.a['height']" [attr.rx]="s.a['rx']" /> }
      }
    }
  </svg>`,
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(20);
  protected readonly shapes = computed(() => SHAPES[this.name()]);
}
