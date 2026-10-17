# «Перлина» — лендинг стоматологічної клініки (Київ)

Angular 22 (standalone, signals, Signal Forms, `@defer` + incremental hydration) · SSR + prerender · Tailwind CSS 4 · GSAP + ScrollTrigger · Lenis · Three.js

Портфоліо-проєкт. Увесь контент — українською. Результати аудиту — у [AUDIT.md](AUDIT.md).

## Запуск

```bash
npm install
npm start                      # dev-сервер: http://localhost:4200
npm run build                  # production-збірка + пререндер / та /polityka-konfidentsiinosti
npm run serve:ssr:perlyna      # SSR-сервер з dist: http://localhost:4000
```

## Деплой на GitHub Pages

Workflow — `.github/workflows/deploy-pages.yml` (пуш у `main`). Один раз: **Settings → Pages → Source: GitHub Actions**
(на безкоштовному плані репозиторій має бути публічним). Збірка йде з `--base-href /<repo>/`, тому всі посилання та шрифти — відносні.

## Мови

Сайт має дві версії: `/uk/…` і `/en/…`, обидві пререндеряться. Корінь `/` визначає мову до першої відмальовки: часовий пояс України → українська, інакше англійська. Ручний вибір у шапці (UA / EN) зберігається в `localStorage` і має пріоритет. Без JS корінь показує посилання на обидві версії.

- Контент: `src/app/data/content.uk.ts` і `content.en.ts` (однакова форма), рядки інтерфейсу — `src/app/data/ui.ts`.
- Сервіс `I18n` (`src/app/core/i18n.ts`) бере мову з адреси, тож шапка й підвал рендеряться правильною мовою ще до навігації.
- SEO: `hreflang` для обох версій, `og:locale`, `<html lang>` на кожній сторінці, sitemap з обома мовами.

## Структура

```
src/app/
  core/        seo.service (title, meta, canonical, OG, JSON-LD), smooth-scroll.service (Lenis+GSAP),
               booking.service (модалка й фейкова відправка в localStorage), gsap (ледаче завантаження),
               image-loader (Unsplash CDN для NgOptimizedImage), phone (маска +380)
  data/        content.ts — усі тексти, ціни, лікарі, кейси, відгуки, FAQ
  shared/
    directives in-view (один IntersectionObserver), words (заголовки по словах), ripple, glow (світна межа)
    ui/        icon, logo, section-head, glow-number, booking-form (Signal Forms)
  sections/    header, hero (+ tooth-scene на Three.js), fears, services, pricing, technologies,
               doctors, cases, installment, reviews, faq, booking-section, footer, mobile-cta, booking-dialog
  pages/       home, privacy, not-found
public/        шрифти (субсет woff2), tooth.webp (постер 3D-сцени), OG-картинка, іконки, robots.txt, sitemap.xml
```

## Ключові рішення

- **SSR-безпека:** усе, що чіпає `window`/GSAP/Three.js/Lenis — в `afterNextRender`, обробниках подій або під `isPlatformBrowser`.
- **3D без шкоди для LCP:** на першому екрані — постер-кадр тієї ж сцени; Three.js вантажиться в простої (десктоп) або коли сцена видима (мобільні), при `prefers-reduced-motion` — не вантажиться взагалі.
- **Incremental hydration:** секції нижче hero — `@defer (hydrate on viewport)`; HTML з сервера повний, JS «оживляє» секцію при наближенні.
- **Шрифти:** Unbounded (600) + Onest (400–600), субсет під символи сайту — 37 КБ; `font-display: optional` + метрично підігнані fallback-и → CLS 0.
- **Форма:** фейкова — імітує відправку й зберігає заявку в `localStorage` (`perlyna:leads`).
