import { gsap, ScrollTrigger } from '../core/gsap.js';
import { MOTION_CONDITIONS, finePointer } from '../core/motion.js';
import { revealFade, revealLines, revealUp } from '../core/reveal.js';

export function initHelp() {
  const section = document.querySelector('.help');
  if (!section) return;

  const label = section.querySelector('.section-label');
  const title = section.querySelector('.help__title');
  const intro = section.querySelector('.help__intro');
  const grid = section.querySelector('.help__grid');
  const cards = gsap.utils.toArray('.help__card', section);
  const cta = section.querySelector('.help__cta');

  // Luz do hover: acompanha o mouse dentro do card (só com mouse)
  if (finePointer.matches) {
    grid.addEventListener('pointermove', (event) => {
      const card = event.target.closest('.help__card');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      card.style.setProperty('--my', `${event.clientY - rect.top}px`);
    });
  }

  const mm = gsap.matchMedia();

  mm.add(MOTION_CONDITIONS, (context) => {
    if (context.conditions.reduced) {
      revealFade([label, title, intro], { trigger: section, start: 'top 80%' });
      revealFade(cards, { trigger: grid, start: 'top 85%' });
      revealFade(cta, { start: 'top 92%' });
      return;
    }

    revealUp(label, { trigger: section, start: 'top 80%' });
    revealLines(title, { trigger: section, start: 'top 80%', delay: 0.1 });
    revealUp(intro, { trigger: section, start: 'top 80%', delay: 0.3 });

    // Cards entram em cascata, em grupos, conforme chegam na tela
    // (só opacidade: o texto continua acessível a leitores de tela antes de aparecer)
    gsap.set(cards, { opacity: 0, y: 48 });
    ScrollTrigger.batch(cards, {
      start: 'top 90%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, { opacity: 1, y: 0, duration: 1.2, stagger: 0.1, ease: 'power3.out' }),
    });

    revealUp(cta, { start: 'top 92%' });
  });
}
