import { Provider } from '@angular/core';
import { IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';

/** NgOptimizedImage + CDN Unsplash: `ngSrc` — лише ідентифікатор фото, розмір підбирає CDN */
export const provideUnsplashLoader = (): Provider => ({
  provide: IMAGE_LOADER,
  useValue: (config: ImageLoaderConfig) => {
    // локальні файли з public/ віддаємо як є
    if (/\.(webp|png|jpe?g|svg|avif)$/.test(config.src)) return config.src;
    const width = config.width ?? 1200;
    return `https://images.unsplash.com/photo-${config.src}?auto=format&fit=crop&w=${width}&q=72`;
  },
});
