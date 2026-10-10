import { Component, computed, input } from '@angular/core';
import { InView } from './in-view';

type Word = { t: string; hl: boolean };

/**
 * Заголовок, що проявляється по словах (розмиття → різкість).
 * Текст присутній у DOM рівно один раз — важливо для SEO та скрінрідерів.
 * `*слово*` — акцентний колір.
 */
@Component({
  selector: 'h1[appWords], h2[appWords], h3[appWords], p[appWords]',
  hostDirectives: [{ directive: InView, inputs: ['appInView', 'inViewInstant'] }],
  host: { class: 'words' },
  template: `@for (w of words(); track $index) {<span class="w" [class.hl]="w.hl" [style.--i]="$index">{{ w.t }}</span>{{ ' ' }}}`,
})
export class Words {
  readonly text = input.required<string>({ alias: 'appWords' });

  protected readonly words = computed<Word[]>(() => {
    let hl = false;
    return this.text()
      .split(/\s+/)
      .filter(Boolean)
      .map((raw) => {
        const open = raw.startsWith('*');
        const close = raw.endsWith('*') && (raw.length > 1 || !open);
        if (open) hl = true;
        const w = { t: raw.replace(/\*/g, ''), hl };
        if (close) hl = false;
        return w;
      });
  });
}
