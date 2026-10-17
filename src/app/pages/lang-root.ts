import { Component, DOCUMENT, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { I18n, detectScript } from '../core/i18n';

/** Корінь сайту: вибір мови до першої відмальовки, без JS — посилання на обидві версії */
@Component({
  selector: 'app-lang-root',
  template: `
    <section class="wrap grid min-h-[80svh] place-content-center gap-4 py-32 text-center">
      <p class="title-md">Perlyna · «Перлина»</p>
      <p class="flex justify-center gap-4">
        <a href="uk/" class="btn btn-primary">Українською</a>
        <a href="en/" class="btn btn-ghost">English</a>
      </p>
    </section>
  `,
})
export default class LangRoot {
  constructor() {
    inject(I18n).root.set(true);
    inject(Title).setTitle('Perlyna dental clinic · Стоматологія «Перлина»');
    inject(Meta).updateTag({ name: 'robots', content: 'noindex, follow' });
    if (isPlatformServer(inject(PLATFORM_ID))) {
      const doc = inject(DOCUMENT);
      const s = doc.createElement('script');
      s.textContent = detectScript;
      doc.head.appendChild(s);
    }
  }
}
