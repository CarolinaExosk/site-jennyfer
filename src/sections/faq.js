import { gsap, ScrollTrigger } from '../core/gsap.js';
import { MOTION_CONDITIONS, reducedMotion } from '../core/motion.js';
import { revealFade, revealLines, revealUp } from '../core/reveal.js';

// Acordeão: o <details> nativo funciona sem JS; aqui só animamos a altura
// e mantemos uma resposta aberta por vez.
export function initFaq() {
  const section = document.querySelector('.faq');
  if (!section) return;

  const label = section.querySelector('.section-label');
  const title = section.querySelector('.faq__title');
  const intro = section.querySelector('.faq__intro');
  const list = section.querySelector('.faq__list');
  const items = gsap.utils.toArray('.faq__item', section);

  items.forEach((item) => {
    item.classList.toggle('is-open', item.open);
    item.querySelector('.faq__question').addEventListener('click', (event) => {
      event.preventDefault();
      if (item.classList.contains('is-open')) {
        closeItem(item);
      } else {
        items.forEach((other) => other !== item && other.classList.contains('is-open') && closeItem(other));
        openItem(item);
      }
    });
  });

  const mm = gsap.matchMedia();

  mm.add(MOTION_CONDITIONS, (context) => {
    if (context.conditions.reduced) {
      revealFade([label, title, intro], { trigger: section, start: 'top 80%' });
      revealFade(items, { trigger: list, start: 'top 85%' });
      return;
    }

    revealUp(label, { trigger: section, start: 'top 80%' });
    revealLines(title, { trigger: section, start: 'top 80%', delay: 0.1 });
    revealUp(intro, { trigger: section, start: 'top 80%', delay: 0.3 });
    revealUp(items, { trigger: list, start: 'top 85%', stagger: 0.06, y: 20 });
  });
}

function openItem(item) {
  const answer = item.querySelector('.faq__answer');
  item.classList.add('is-open');
  item.open = true;

  if (reducedMotion.matches) return refreshLayout();
  gsap.fromTo(
    answer,
    { height: 0, opacity: 0 },
    {
      height: 'auto',
      opacity: 1,
      duration: 0.6,
      ease: 'power3.out',
      overwrite: true,
      clearProps: 'height,opacity',
      onComplete: refreshLayout,
    },
  );
}

function closeItem(item) {
  const answer = item.querySelector('.faq__answer');
  item.classList.remove('is-open');

  if (reducedMotion.matches) {
    item.open = false;
    return refreshLayout();
  }
  gsap.to(answer, {
    height: 0,
    opacity: 0,
    duration: 0.45,
    ease: 'power3.inOut',
    overwrite: true,
    onComplete: () => {
      item.open = false;
      gsap.set(answer, { clearProps: 'height,opacity' });
      refreshLayout();
    },
  });
}

// A altura da página mudou: as animações das seções abaixo precisam recalcular posições
let refreshTimer;
function refreshLayout() {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 120);
}
