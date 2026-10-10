import { DOCUMENT, Service, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { clinic, faq, reviews, services, siteUrl } from '../data/content';

export type PageSeo = {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
};

/** Мета-теги, canonical та JSON-LD. Працює і на сервері, тож усе потрапляє в SSR-HTML. */
@Service()
export class Seo {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  set(page: PageSeo): void {
    const url = siteUrl + page.path;
    const image = `${siteUrl}/og-image.png`;
    this.title.setTitle(page.title);

    const tags: { key: string; attr: 'name' | 'property'; content: string }[] = [
      { attr: 'name', key: 'description', content: page.description },
      { attr: 'name', key: 'robots', content: page.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large' },
      { attr: 'property', key: 'og:type', content: 'website' },
      { attr: 'property', key: 'og:locale', content: 'uk_UA' },
      { attr: 'property', key: 'og:site_name', content: `Стоматологія «${clinic.name}»` },
      { attr: 'property', key: 'og:title', content: page.title },
      { attr: 'property', key: 'og:description', content: page.description },
      { attr: 'property', key: 'og:url', content: url },
      { attr: 'property', key: 'og:image', content: image },
      { attr: 'property', key: 'og:image:width', content: '1200' },
      { attr: 'property', key: 'og:image:height', content: '630' },
      { attr: 'property', key: 'og:image:alt', content: 'Стоматологія «Перлина» — лікування без болю в Києві' },
      { attr: 'name', key: 'twitter:card', content: 'summary_large_image' },
      { attr: 'name', key: 'twitter:title', content: page.title },
      { attr: 'name', key: 'twitter:description', content: page.description },
      { attr: 'name', key: 'twitter:image', content: image },
      { attr: 'name', key: 'geo.region', content: 'UA-30' },
      { attr: 'name', key: 'geo.placename', content: clinic.city },
      { attr: 'name', key: 'geo.position', content: `${clinic.geo.lat};${clinic.geo.lng}` },
    ];
    for (const t of tags) this.meta.updateTag({ [t.attr]: t.key, content: t.content }, `${t.attr}="${t.key}"`);

    this.link('canonical', url);
  }

  /** JSON-LD для головної: клініка, послуги з цінами, рейтинг, відгуки, FAQ */
  setHomeSchema(): void {
    const id = `${siteUrl}/#clinic`;
    const schema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${siteUrl}/#website`,
          url: `${siteUrl}/`,
          name: `Стоматологія «${clinic.name}»`,
          inLanguage: 'uk-UA',
          publisher: { '@id': id },
        },
        {
          '@type': ['Dentist', 'MedicalClinic'],
          '@id': id,
          name: clinic.legalName,
          url: `${siteUrl}/`,
          logo: `${siteUrl}/favicon.svg`,
          image: `${siteUrl}/og-image.png`,
          telephone: clinic.phone,
          email: clinic.email,
          priceRange: 'від 900 грн',
          currenciesAccepted: 'UAH',
          medicalSpecialty: 'Dentistry',
          address: {
            '@type': 'PostalAddress',
            streetAddress: clinic.street,
            addressLocality: clinic.city,
            postalCode: clinic.postalCode,
            addressCountry: 'UA',
          },
          geo: { '@type': 'GeoCoordinates', latitude: clinic.geo.lat, longitude: clinic.geo.lng },
          hasMap: clinic.mapsUrl,
          openingHoursSpecification: [
            { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '08:00', closes: '21:00' },
            { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:00', closes: '18:00' },
          ],
          sameAs: Object.values(clinic.socials),
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: clinic.rating,
            reviewCount: clinic.reviewsCount,
            bestRating: 5,
          },
          review: reviews.map((r) => ({
            '@type': 'Review',
            author: { '@type': 'Person', name: r.name },
            reviewBody: r.text,
            reviewRating: { '@type': 'Rating', ratingValue: 5, bestRating: 5 },
          })),
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Стоматологічні послуги',
            itemListElement: services.map((s) => ({
              '@type': 'Offer',
              itemOffered: { '@type': 'MedicalProcedure', name: s.title, description: s.lead },
              priceSpecification: { '@type': 'PriceSpecification', minPrice: s.price, priceCurrency: 'UAH' },
            })),
          },
        },
        {
          '@type': 'FAQPage',
          '@id': `${siteUrl}/#faq`,
          mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        },
      ],
    };
    this.jsonLd('schema-home', schema);
  }

  private link(rel: string, href: string): void {
    let el = this.doc.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (!el) {
      el = this.doc.createElement('link');
      el.setAttribute('rel', rel);
      this.doc.head.appendChild(el);
    }
    el.setAttribute('href', href);
  }

  private jsonLd(id: string, data: object): void {
    let el = this.doc.getElementById(id);
    if (!el) {
      el = this.doc.createElement('script');
      el.setAttribute('type', 'application/ld+json');
      el.id = id;
      this.doc.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
  }
}
