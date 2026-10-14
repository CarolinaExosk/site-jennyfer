import { gsap } from '../core/gsap.js';
import { MOTION_CONDITIONS, finePointer } from '../core/motion.js';
import { revealFade, revealLines, revealUp } from '../core/reveal.js';
import { animateBrain } from '../components/brain.js';

export function initPublication() {
  const section = document.querySelector('.pub');
  if (!section) return;

  const card = section.querySelector('.pub__card');
  const brain = card.querySelector('.pub__brain');
  const label = card.querySelector('.section-label');
  const meta = card.querySelector('.pub__meta');
  const quote = card.querySelector('.pub__quote');
  const title = card.querySelector('.pub__title');
  const subtitle = card.querySelector('.pub__subtitle');
  const rule = card.querySelector('.pub__rule');
  const footer = card.querySelector('.pub__footer');
  const link = card.querySelector('.pub__link');

  // Cartão inteiro clicável com mouse (sem atrapalhar quem está selecionando texto)
  if (finePointer.matches) {
    card.addEventListener('click', (event) => {
      if (event.target.closest('a') || window.getSelection()?.toString()) return;
      link.click();
    });
  }

  const mm = gsap.matchMedia();

  mm.add(MOTION_CONDITIONS, (context) => {
    if (context.conditions.reduced) {
      // O cérebro fica estático (já desenhado); o resto só com um fade curto
      revealFade([label, meta, quote, title, subtitle, rule, footer], { trigger: card, start: 'top 80%' });
      return;
    }

    const start = 'top 75%';
    revealUp(label, { trigger: card, start });
    revealUp(meta, { trigger: card, start, delay: 0.1 });
    gsap.from(quote, {
      autoAlpha: 0,
      scale: 0.7,
      transformOrigin: '30% 30%',
      duration: 1.6,
      delay: 0.2,
      ease: 'power3.out',
      scrollTrigger: { trigger: card, start, once: true },
    });
    revealLines(title, { trigger: card, start, delay: 0.25, stagger: 0.12 });
    revealUp(subtitle, { trigger: card, start, delay: 0.6 });
    gsap.from(rule, {
      scaleX: 0,
      duration: 1.8,
      delay: 0.5,
      ease: 'expo.inOut',
      scrollTrigger: { trigger: card, start, once: true },
    });
    revealUp(footer, { trigger: card, start, delay: 0.8 });

    // Cérebro: desenho do traço e impulsos na rede
    return animateBrain(brain, { trigger: card });
  });
}
