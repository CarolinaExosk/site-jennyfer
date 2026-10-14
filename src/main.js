import { ScrollTrigger } from './core/gsap.js';
import { reducedMotion } from './core/motion.js';
import { initAnchorLinks, initSmoothScroll } from './core/smooth-scroll.js';
import { revealOnFocus } from './core/reveal.js';
import { initCursor } from './components/cursor.js';
import { initFloatingCta } from './components/floating-cta.js';
import { initHero } from './sections/hero.js';
import { initAbout } from './sections/about.js';
import { initProcess } from './sections/process.js';
import { initHelp } from './sections/help.js';
import { initTimeline } from './sections/timeline.js';
import { initPublication } from './sections/publication.js';
import { initFaq } from './sections/faq.js';
import { initContact } from './sections/contact.js';

// Avisa o script do <head> que o JS carregou (senão ele reexibe o conteúdo)
window.__siteReady = true;

// Só em desenvolvimento: facilita inspecionar as animações pelo console
if (import.meta.env.DEV) window.ScrollTrigger = ScrollTrigger;

const lenis = reducedMotion.matches ? null : initSmoothScroll();
initAnchorLinks(lenis);
initCursor();
revealOnFocus();

// O nome do hero só anima com a fonte certa carregada (evita troca de fonte no meio)
waitForDisplayFont().then(() => {
  initHero();
  initAbout();
  initProcess();
  initHelp();
  initTimeline();
  initPublication();
  initFaq();
  initContact();
  initFloatingCta();
  ScrollTrigger.refresh();
});

function waitForDisplayFont(timeout = 2500) {
  if (!document.fonts?.load) return Promise.resolve();
  const fonts = Promise.all([
    document.fonts.load('200 1em "Newsreader Variable"'),
    document.fonts.load('italic 200 1em "Newsreader Variable"'),
  ]);
  const timer = new Promise((resolve) => window.setTimeout(resolve, timeout));
  return Promise.race([fonts, timer]).catch(() => {});
}
