import { gsap } from '../core/gsap.js';
import { MOTION_CONDITIONS } from '../core/motion.js';
import { revealFade, revealLines, revealUp } from '../core/reveal.js';
import { cssVar } from '../core/css-var.js';

const SCROLL_PER_STEP = 0.8; // telas de rolagem por passo enquanto a seção está fixa

export function initProcess() {
  const section = document.querySelector('.process');
  if (!section) return;

  const panel = section.querySelector('.process__panel');
  const label = section.querySelector('.section-label');
  const title = section.querySelector('.process__title');
  const dial = section.querySelector('.process__dial');
  const content = section.querySelector('.process__content');
  const steps = gsap.utils.toArray('.process__step', section);
  const strip = section.querySelector('.process__numbers-strip');
  const progress = section.querySelector('.process__ring--progress');
  const ticks = gsap.utils.toArray('.process__tick', section); // topo, direita, base, esquerda

  const accent = cssVar('--c-accent-light');
  const mm = gsap.matchMedia();

  mm.add(MOTION_CONDITIONS, (context) => {
    if (context.conditions.reduced) {
      // Sem seção fixa: os passos ficam em lista e só aparecem com um fade curto
      revealFade([label, title, ...steps], { trigger: section, start: 'top 80%' });
      return;
    }

    section.classList.add('is-pinned');

    // Entrada, enquanto a seção chega na tela
    revealUp(label, { trigger: section, start: 'top 75%' });
    revealLines(title, { trigger: section, start: 'top 75%', delay: 0.1 });
    gsap.from(dial, {
      autoAlpha: 0,
      scale: 0.88,
      duration: 1.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: section, start: 'top 65%', once: true },
    });
    revealUp(content, { trigger: section, start: 'top 65%', delay: 0.25 });

    // Só o primeiro passo começa visível (opacidade apenas: leitores de tela leem todos)
    gsap.set(steps.slice(1), { opacity: 0, y: 24 });

    // Seção fixa: a rolagem conduz a linha do tempo
    const timeline = gsap.timeline({
      defaults: { duration: 0.6, ease: 'power2.inOut' },
      scrollTrigger: {
        trigger: section,
        pin: panel,
        start: 'top top',
        end: () => `+=${window.innerHeight * SCROLL_PER_STEP * steps.length}`,
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });

    // O anel enche de forma contínua: cada passo ocupa um quarto dele
    timeline.fromTo(progress, { '--p': 0 }, { '--p': 1, duration: steps.length, ease: 'none' }, 0);

    // Troca de passo em torno de cada quarto, com trechos parados entre as trocas.
    // O texto que sai some antes de o próximo entrar: nunca há dois textos sobrepostos.
    steps.forEach((step, i) => {
      if (i === 0) return;
      const at = i - 0.3;
      timeline
        .to(steps[i - 1], { opacity: 0, y: -24, duration: 0.3, ease: 'power2.in' }, at)
        .fromTo(step, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, at + 0.3)
        .to(strip, { yPercent: (-100 / steps.length) * i, ease: 'power3.inOut' }, at)
        .to(ticks[i], { backgroundColor: accent, borderColor: accent, duration: 0.15 }, i - 0.05);
    });

    return () => section.classList.remove('is-pinned');
  });
}
