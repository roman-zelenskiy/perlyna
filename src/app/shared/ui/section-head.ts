import { Component, input } from '@angular/core';
import { Words } from '../directives/words';
import { InView } from '../directives/in-view';

/** Шапка секції: пілюля-тег, заголовок h2 по словах, лід */
@Component({
  selector: 'app-section-head',
  imports: [Words, InView],
  host: { class: 'block' },
  template: `
    <p class="pill" data-reveal appInView><span class="pill-dot" aria-hidden="true"></span>{{ eyebrow() }}</p>
    <h2 class="title-lg mt-6" [class.text-white]="dark()" [id]="headingId()" [appWords]="title()"></h2>
    @if (lead()) {
      <p class="mt-6 max-w-xl text-lg" [class.text-slate]="!dark()" [class.text-white/75]="dark()" data-reveal appInView="200">{{ lead() }}</p>
    }
  `,
})
export class SectionHead {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly lead = input<string>();
  readonly headingId = input<string>();
  readonly dark = input(false);
}
