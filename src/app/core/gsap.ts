import type { gsap as Gsap } from 'gsap';
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger';

export type GsapKit = { gsap: typeof Gsap; ScrollTrigger: typeof ScrollTriggerType };

let kit: Promise<GsapKit> | undefined;

/** GSAP завантажується ліниво й лише в браузері — не потрапляє в початковий бандл */
export function loadGsap(): Promise<GsapKit> {
  kit ??= Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([g, st]) => {
    g.gsap.registerPlugin(st.ScrollTrigger);
    return { gsap: g.gsap, ScrollTrigger: st.ScrollTrigger };
  });
  return kit;
}
