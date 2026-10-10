import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Seo } from '../core/seo.service';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <section class="wrap grid min-h-[80svh] place-content-center py-32 text-center">
      <p class="pill mx-auto">Помилка 404</p>
      <h1 class="title-lg mt-6">Такої сторінки <span class="hl">немає</span></h1>
      <p class="mx-auto mt-5 max-w-md text-slate">Можливо, посилання застаріло. Поверніться на головну — там ціни, лікарі та онлайн-запис.</p>
      <a routerLink="/" class="btn btn-primary mx-auto mt-8">На головну</a>
    </section>
  `,
})
export default class NotFound {
  constructor() {
    inject(Seo).set({ title: 'Сторінку не знайдено — «Перлина»', description: 'Сторінку не знайдено.', path: '/404', noindex: true });
  }
}
