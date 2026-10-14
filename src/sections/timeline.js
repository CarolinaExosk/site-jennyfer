import { gsap, ScrollTrigger } from '../core/gsap.js';
import { MOTION_CONDITIONS } from '../core/motion.js';
import { revealFade, revealLines, revealUp } from '../core/reveal.js';

// Altura da tela em que a ponta da linha cor de vinho fica enquanto se desenha
const LINE_TIP = '70%';

export function initTimeline() {
  const section = document.querySelector('.timeline');
  if (!section) return;

  const label = section.querySelector('.section-label');
  const title = section.querySelector('.timeline__title');
  const intro = section.querySelector('.timeline__intro');
  const body = section.querySelector('.timeline__body');
  const track = section.querySelector('.timeline__track');
  const progress = section.querySelector('.timeline__progress');
  const items = gsap.utils.toArray('.timeline__item', section);
  const note = section.querySelector('.timeline__note');

  // O trilho liga o centro do primeiro marco ao marco do fecho (formação).
  // Recalculado a cada refresh do ScrollTrigger (redimensionamento, fontes).
  const layoutTrack = () => {
    const bodyTop = body.getBoundingClientRect().top;
    const firstNode = items[0].querySelector('.timeline__node').getBoundingClientRect();
    const start = firstNode.top + firstNode.height / 2 - bodyTop;
    const end = note.getBoundingClientRect().top + parseFloat(getComputedStyle(note).lineHeight) / 2 - bodyTop;
    track.style.top = `${start}px`;
    track.style.bottom = 'auto';
    track.style.height = `${end - start}px`;
  };
  layoutTrack();
  ScrollTrigger.addEventListener('refreshInit', layoutTrack);

  const mm = gsap.matchMedia();

  mm.add(MOTION_CONDITIONS, (context) => {
    const markers = [...items, note];

    if (context.conditions.reduced) {
      // Linha completa e marcos acesos desde o início; só um fade curto
      markers.forEach((el) => el.classList.add('is-active'));
      revealFade([label, title, intro], { trigger: section, start: 'top 80%' });
      revealFade(markers, { trigger: body, start: 'top 85%' });
      return () => markers.forEach((el) => el.classList.remove('is-active'));
    }

    revealUp(label, { trigger: section, start: 'top 80%' });
    revealLines(title, { trigger: section, start: 'top 80%', delay: 0.1 });
    revealUp(intro, { trigger: section, start: 'top 80%', delay: 0.3 });

    // A linha cor de vinho se desenha acompanhando a rolagem
    gsap.fromTo(
      progress,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: track, start: `top ${LINE_TIP}`, end: `bottom ${LINE_TIP}`, scrub: 0.3 },
      },
    );

    // Cada marco acende quando a linha chega nele (e apaga se a rolagem voltar);
    // o texto do marco aparece um pouco antes, uma vez só
    items.forEach((item) => {
      const node = item.querySelector('.timeline__node');
      ScrollTrigger.create({
        trigger: node,
        start: `center ${LINE_TIP}`,
        end: 'max',
        toggleClass: { targets: item, className: 'is-active' },
      });
      revealUp(item.querySelectorAll(':scope > :not(.timeline__node)'), {
        trigger: node,
        start: 'center 80%',
        y: 18,
        stagger: 0.07,
        duration: 1,
      });
    });

    ScrollTrigger.create({
      trigger: note,
      start: `top ${LINE_TIP}`,
      end: 'max',
      toggleClass: { targets: note, className: 'is-active' },
    });
    revealUp(note, { trigger: note, start: 'top 85%', y: 12 });
  });
}
