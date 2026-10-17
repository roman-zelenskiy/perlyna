import { DOCUMENT, Service, inject, signal } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { CanMatchFn } from '@angular/router';
import * as uk from '../data/content.uk';
import * as en from '../data/content.en';
import { tEn, tUk, type Ui } from '../data/ui';

export type Lang = 'uk' | 'en';

/**
 * Мова сайту: /uk/… та /en/…. Сервіс живе в DI, тож під час SSR/пререндеру кожна сторінка
 * має власний екземпляр — без змішування мов між паралельними рендерами.
 */
@Service()
export class I18n {
  private readonly doc = inject(DOCUMENT);
  readonly lang = signal<Lang>('uk');
  /** Коренева сторінка вибору мови: без шапки й підвалу */
  readonly root = signal(false);

  constructor() {
    // Мова з адреси ще до навігації: шапка й підвал створюються раніше, ніж спрацює guard маршруту
    const m = /\/(uk|en)(\/|$)/.exec(inject(PlatformLocation).pathname);
    if (m) this.set(m[1] as Lang);
  }

  /** Контент поточною мовою */
  get c(): typeof uk {
    return (this.lang() === 'en' ? en : uk) as typeof uk;
  }
  /** Рядки інтерфейсу */
  get t(): Ui {
    return this.lang() === 'en' ? tEn : tUk;
  }
  get other(): Lang {
    return this.lang() === 'en' ? 'uk' : 'en';
  }

  set(l: Lang): void {
    this.lang.set(l);
    this.doc.documentElement.lang = l;
  }

  /** Посилання всередині поточної мови: link('/polityka-konfidentsiinosti') */
  link(path = '/'): string {
    return `/${this.lang()}${path === '/' ? '' : path}`;
  }

  /** Якір на головній для звичайних <a href>: відносно base href («uk/#services») */
  anchor(hash: string): string {
    return `${this.lang()}/${hash}`;
  }

  /** Та сама сторінка іншою мовою */
  switchUrl(url: string): string {
    const rest = url.replace(/^\/(uk|en)(?=\/|$|#|\?)/, '');
    return `/${this.other}${rest || '/'}`;
  }

  /** Ручний вибір має пріоритет над автовизначенням */
  remember(l: Lang): void {
    try {
      localStorage.setItem('lang', l);
    } catch {
      /* приватний режим — вибір діятиме до закриття вкладки */
    }
  }
}

/** Маршрут :lang збігається лише з uk/en і одразу виставляє мову (до створення компонентів) */
export const langMatch: CanMatchFn = (_route, segments) => {
  const l = segments[0]?.path;
  if (l !== 'uk' && l !== 'en') return false;
  inject(I18n).set(l);
  return true;
};

/** Скрипт кореня: Україна (за часовим поясом) → /uk/, решта світу → /en/; ручний вибір — з localStorage */
export const detectScript = `(function(){var l='uk';try{var s=localStorage.getItem('lang');if(s==='uk'||s==='en'){l=s}else{var tz=(Intl.DateTimeFormat().resolvedOptions().timeZone||'');l=/^Europe\\/(Kyiv|Kiev|Uzhgorod|Zaporozhye|Simferopol)$/.test(tz)?'uk':'en'}}catch(e){}location.replace(l+'/'+location.search+location.hash)})()`;
