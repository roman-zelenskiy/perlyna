import { RenderMode, ServerRoute } from '@angular/ssr';

const langs = async () => [{ lang: 'uk' }, { lang: 'en' }];

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: ':lang', renderMode: RenderMode.Prerender, getPrerenderParams: langs },
  { path: ':lang/polityka-konfidentsiinosti', renderMode: RenderMode.Prerender, getPrerenderParams: langs },
  { path: '**', renderMode: RenderMode.Server, status: 404 },
];
