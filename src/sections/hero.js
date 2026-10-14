import { gsap, SplitText } from '../core/gsap.js';
import { MOTION_CONDITIONS, canRunParticles, whenIdle } from '../core/motion.js';

export function initHero() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const header = document.querySelector('.site-header');
  const title = hero.querySelector('.hero__title');
  const inner = hero.querySelector('.hero__inner');
  const bg = hero.querySelector('.hero__bg');
  const subtitle = hero.querySelector('.hero__subtitle');
  const rule = hero.querySelector('.hero__rule');
  const lede = hero.querySelector('.hero__lede');
  const actions = hero.querySelector('.hero__actions');
  const meta = hero.querySelector('.hero__meta');

  const mm = gsap.matchMedia();

  mm.add(MOTION_CONDITIONS, (context) => {
    if (context.conditions.reduced) {
      // Versão simplificada: um fade curto, sem letra a letra nem paralaxe
      gsap.fromTo(
        [header, title, subtitle, lede, actions, meta],
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.6, stagger: 0.04, ease: 'power1.out' },
      );
      return;
    }

    // Nome entrando letra por letra: cada letra sobe e sai da névoa (desfoque)
    const split = SplitText.create(title, { type: 'words,chars', charsClass: 'hero__char' });
    const blur = window.innerWidth < 768 ? 8 : 14;

    // O bloco de texto entra enquanto o nome ainda termina de aparecer: o botão de
    // contato fica disponível cedo (e a frase, maior texto da tela, aparece logo)
    const intro = gsap.timeline({ delay: 0.15 });
    intro
      .set(title, { autoAlpha: 1 })
      .from(split.chars, {
        autoAlpha: 0,
        yPercent: 38,
        filter: `blur(${blur}px)`,
        duration: 1.8,
        stagger: 0.055,
        clearProps: 'filter',
      })
      .from(subtitle, { autoAlpha: 0, y: 14, duration: 1.1 }, 0.7)
      .from(rule, { scaleX: 0, duration: 1.4, ease: 'expo.inOut' }, '<')
      .from(lede, { autoAlpha: 0, y: 18, duration: 1.2 }, '<0.12')
      .from(actions, { autoAlpha: 0, y: 18, duration: 1.2 }, '<0.12')
      .from([header, meta], { autoAlpha: 0, duration: 1.6, ease: 'power2.out' }, '<0.1')
      // As partículas só começam a carregar depois que o nome já apareceu
      .call(() => whenIdle(() => loadParticles(hero, bg)), null, 1.6);

    // Ao rolar: o conteúdo fica um pouco para trás e esmaece; o fundo se afasta
    gsap
      .timeline({
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
      })
      .to(inner, { yPercent: 18, opacity: 0, ease: 'none' }, 0)
      .to(bg, { scale: 1.08, autoAlpha: 0.2, ease: 'none' }, 0);

    return () => split.revert();
  });
}

let particlesRequested = false;

async function loadParticles(hero, container) {
  if (particlesRequested || !canRunParticles()) return;
  particlesRequested = true;
  try {
    const { createHeroParticles } = await import('./hero-particles.js');
    createHeroParticles(container, hero);
  } catch (error) {
    // Sem partículas, a névoa em CSS continua: nada quebra
    console.warn('Partículas desativadas:', error);
  }
}
