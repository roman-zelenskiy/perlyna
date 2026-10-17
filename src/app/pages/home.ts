import { Component, inject } from '@angular/core';
import { Seo } from '../core/seo.service';
import { I18n } from '../core/i18n';
import { Hero } from '../sections/hero/hero';
import { Fears } from '../sections/fears';
import { Services } from '../sections/services';
import { Pricing } from '../sections/pricing';
import { Technologies } from '../sections/technologies';
import { Doctors } from '../sections/doctors';
import { Cases } from '../sections/cases';
import { Installment } from '../sections/installment';
import { Reviews } from '../sections/reviews';
import { Faq } from '../sections/faq';
import { BookingSection } from '../sections/booking-section';

/**
 * Головна. Секції нижче першого екрана гідруються інкрементально (hydrate on viewport):
 * HTML уже є з сервера, а JS «оживляє» їх лише при наближенні.
 */
@Component({
  selector: 'app-home',
  imports: [Hero, Fears, Services, Pricing, Technologies, Doctors, Cases, Installment, Reviews, Faq, BookingSection],
  template: `
    <app-hero />
    @defer (hydrate on viewport) { <app-fears /> }
    @defer (hydrate on viewport) { <app-services /> }
    @defer (hydrate on viewport) { <app-pricing /> }
    @defer (hydrate on viewport) { <app-technologies /> }
    @defer (hydrate on viewport) { <app-doctors /> }
    @defer (hydrate on viewport) { <app-cases /> }
    @defer (hydrate on viewport) { <app-installment /> }
    @defer (hydrate on viewport) { <app-reviews /> }
    @defer (hydrate on viewport) { <app-faq /> }
    @defer (hydrate on viewport) { <app-booking-section /> }
  `,
})
export default class Home {
  constructor() {
    const seo = inject(Seo);
    seo.set({ ...inject(I18n).t.homeSeo, path: '/' });
    seo.setHomeSchema();
  }
}
