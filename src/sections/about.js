import { gsap } from '../core/gsap.js';
import { MOTION_CONDITIONS } from '../core/motion.js';
import { revealFade, revealLines, revealUp } from '../core/reveal.js';

export function initAbout() {
  const section = document.querySelector('.about');
  if (!section) return;

  const photo = section.querySelector('.about__photo');
  const image = photo.querySelector('img');
  const content = section.querySelector('.about__content');
  const label = content.querySelector('.section-label');
  const rule = content.querySelector('.section-label__rule');
  const title = content.querySelector('.about__title');
  const paragraphs = content.querySelectorAll('.about__text p');
  const closing = content.querySelector('.about__closing');
  const facts = content.querySelector('.about__facts');

  const mm = gsap.matchMedia();

  mm.add(MOTION_CONDITIONS, (context) => {
    if (context.conditions.reduced) {
      revealFade(photo, { trigger: section, start: 'top 75%' });
      revealFade([label, title, ...paragraphs, closing, facts], { trigger: content, start: 'top 80%' });
      return;
    }

    // Foto: surge do escuro, a máscara se abre e a imagem assenta, sem pressa
    gsap
      .timeline({ scrollTrigger: { trigger: photo, start: 'top 80%', once: true } })
      .from(photo, { opacity: 0, duration: 1.4, ease: 'power1.out' }, 0)
      .fromTo(photo, { '--r': 0.35 }, { '--r': 1, duration: 2.4, ease: 'power2.out' }, 0)
      .from(image, { scale: 1.12, duration: 2.8, ease: 'power2.out' }, 0);

    // Paralaxe leve enquanto a seção atravessa a tela
    gsap.fromTo(
      photo,
      { yPercent: -6 },
      {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );

    // Texto: rótulo, título linha a linha, parágrafos e fecho em destaque
    revealUp(label, { trigger: content, start: 'top 80%' });
    gsap.from(rule, {
      scaleX: 0,
      duration: 1.4,
      ease: 'expo.inOut',
      scrollTrigger: { trigger: content, start: 'top 80%', once: true },
    });
    revealLines(title, { trigger: content, start: 'top 80%', delay: 0.15 });
    revealUp(paragraphs, { trigger: paragraphs[0], start: 'top 88%', stagger: 0.12 });

    revealLines(closing, { start: 'top 88%', delay: 0.2 });
    gsap.fromTo(
      closing,
      { '--line': 0 },
      {
        '--line': 1,
        duration: 1.6,
        ease: 'expo.inOut',
        scrollTrigger: { trigger: closing, start: 'top 88%', once: true },
      },
    );

    revealUp(facts.children, { trigger: facts, start: 'top 92%', y: 16, stagger: 0.1 });
  });
}
