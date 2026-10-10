import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { clinic } from '../data/content';
import { Seo } from '../core/seo.service';

@Component({
  selector: 'app-privacy',
  imports: [RouterLink],
  template: `
    <article class="wrap max-w-3xl pt-36 pb-24">
      <p class="pill">Редакція від 1 вересня 2026</p>
      <h1 class="title-lg mt-6">Політика конфіденційності</h1>
      <p class="mt-6 text-lg text-slate">
        {{ clinic.legalName }} поважає вашу приватність і обробляє персональні дані відповідно до Закону України
        «Про захист персональних даних». Залишаючи заявку на сайті, ви погоджуєтеся з умовами цієї політики.
      </p>
      @for (s of sections; track s.h) {
        <section class="mt-10">
          <h2 class="title-md">{{ s.h }}</h2>
          <p class="mt-3 text-slate">{{ s.p }}</p>
        </section>
      }
      <p class="mt-12 border-t border-frost pt-8 text-slate">
        Питання щодо даних: <a [href]="'mailto:' + clinic.email" class="font-semibold text-teal underline underline-offset-4">{{ clinic.email }}</a>
      </p>
      <a routerLink="/" class="btn btn-ghost mt-8">← На головну</a>
    </article>
  `,
})
export default class Privacy {
  protected readonly clinic = clinic;
  protected readonly sections = [
    { h: '1. Які дані ми збираємо', p: 'Ім’я, номер телефону, обрану послугу, бажані дату й час візиту. Під час лікування — медичну інформацію, необхідну для надання допомоги, яка зберігається в медичній карті відповідно до вимог МОЗ.' },
    { h: '2. Для чого ми їх використовуємо', p: 'Щоб підтвердити запис, нагадати про візит і скласти план лікування. Ми не передаємо дані третім особам, крім випадків, передбачених законом, і не використовуємо їх для масових розсилок.' },
    { h: '3. Як ми їх зберігаємо', p: 'Дані зберігаються в захищеній медичній інформаційній системі з обмеженим доступом персоналу. Заявки без подальшого візиту видаляємо через 12 місяців.' },
    { h: '4. Ваші права', p: 'Ви можете запросити доступ до своїх даних, їх виправлення або видалення, написавши нам на електронну пошту. Відповідаємо протягом 10 робочих днів.' },
    { h: '5. Cookies', p: 'Сайт використовує лише технічні cookies, необхідні для роботи, та знеособлену аналітику. Ви можете вимкнути cookies у налаштуваннях браузера.' },
  ];

  constructor() {
    inject(Seo).set({
      title: 'Політика конфіденційності — стоматологія «Перлина»',
      description: 'Як стоматологічна клініка «Перлина» збирає, зберігає та захищає персональні дані пацієнтів.',
      path: '/polityka-konfidentsiinosti',
    });
  }
}
