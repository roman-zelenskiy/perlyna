import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18n } from '../core/i18n';
import { Seo } from '../core/seo.service';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <section class="wrap grid min-h-[80svh] place-content-center py-32 text-center">
      <p class="pill mx-auto">{{ ui.nf.pill }}</p>
      <h1 class="title-lg mt-6">{{ ui.nf.titleA }} <span class="hl">{{ ui.nf.titleB }}</span></h1>
      <p class="mx-auto mt-5 max-w-md text-slate">{{ ui.nf.text }}</p>
      <a [routerLink]="i18n.link()" class="btn btn-primary mx-auto mt-8">{{ ui.nf.home }}</a>
    </section>
  `,
})
export default class NotFound {
  protected readonly i18n = inject(I18n);
  protected readonly ui = this.i18n.t;

  constructor() {
    inject(Seo).set({ ...this.ui.nf.seo, path: '/404', noindex: true });
  }
}
