import { gsap } from '../core/gsap.js';
import { MOTION_CONDITIONS, finePointer } from '../core/motion.js';
import { revealFade, revealLines, revealUp } from '../core/reveal.js';
import { magnetic } from '../components/magnetic.js';

export function initContact() {
  const section = document.querySelector('.contact');
  if (!section) return;

  const glow = section.querySelector('.contact__glow');
  const label = section.querySelector('.section-label');
  const rules = label.querySelectorAll('.section-label__rule');
  const title = section.querySelector('.contact__title');
  const text = section.querySelector('.contact__text');
  const actions = section.querySelector('.contact__actions');
  const phone = section.querySelector('.contact__phone');
  const cta = section.querySelector('[data-magnetic]');

  const mm = gsap.matchMedia();

  mm.add(MOTION_CONDITIONS, (context) => {
    if (context.conditions.reduced) {
      revealFade([label, title, text, actions, phone], { trigger: section, start: 'top 75%' });
      return;
    }

    // O brilho cresce enquanto a seção chega ao centro da tela
    gsap.fromTo(
      glow,
      { scale: 0.45, autoAlpha: 0 },
      {
        scale: 1,
        autoAlpha: 1,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'center center', scrub: true },
      },
    );

    const start = 'top 65%';
    revealUp(label, { trigger: section, start });
    gsap.from(rules, {
      scaleX: 0,
      duration: 1.4,
      ease: 'expo.inOut',
      scrollTrigger: { trigger: section, start, once: true },
    });
    revealLines(title, { trigger: section, start, delay: 0.15, stagger: 0.12 });
    revealUp([text, actions, phone], { trigger: section, start, delay: 0.6, stagger: 0.12 });

    // Botão principal levemente atraído pelo cursor (só com mouse)
    if (finePointer.matches && cta) return magnetic(cta);
  });

  // Rodapé: ano atual no copyright
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
}
