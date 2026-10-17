import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18n } from '../core/i18n';
import { Seo } from '../core/seo.service';

@Component({
  selector: 'app-privacy',
  imports: [RouterLink],
  template: `
    <article class="wrap max-w-3xl pt-36 pb-24">
      <p class="pill">{{ p.pill }}</p>
      <h1 class="title-lg mt-6 break-words hyphens-auto">{{ p.title }}</h1>
      <p class="mt-6 text-lg text-slate">{{ p.lead(clinic.legalName) }}</p>
      @for (s of p.sections; track s.h) {
        <section class="mt-10">
          <h2 class="title-md">{{ s.h }}</h2>
          <p class="mt-3 text-slate">{{ s.p }}</p>
        </section>
      }
      <p class="mt-12 border-t border-frost pt-8 text-slate">
        {{ p.contact }} <a [href]="'mailto:' + clinic.email" class="font-semibold text-teal underline underline-offset-4">{{ clinic.email }}</a>
      </p>
      <a [routerLink]="i18n.link()" class="btn btn-ghost mt-8">← {{ ui.nf.home }}</a>
    </article>
  `,
})
export default class Privacy {
  protected readonly i18n = inject(I18n);
  protected readonly ui = this.i18n.t;
  protected readonly p = this.ui.privacyPage;
  protected readonly clinic = this.i18n.c.clinic;

  constructor() {
    inject(Seo).set({ ...this.p.seo, path: '/polityka-konfidentsiinosti' });
  }
}
