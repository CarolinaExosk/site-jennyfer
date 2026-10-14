import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap.js';

// Rolagem suave no desktop. No toque, o Lenis mantém a rolagem nativa do celular.
export function initSmoothScroll() {
  const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

// Links internos (#secao): rolagem suave + foco no destino, para teclado e leitores de tela
export function initAnchorLinks(lenis) {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    const id = decodeURIComponent(link.getAttribute('href').slice(1));
    const target = id ? document.getElementById(id) : document.body;
    if (!target) return;

    event.preventDefault();
    if (lenis) lenis.scrollTo(target, { duration: 1.6 });
    else target.scrollIntoView();

    if (target !== document.body) {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
    history.replaceState(null, '', id ? `#${id}` : location.pathname);
  });
}
