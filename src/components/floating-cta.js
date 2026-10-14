import { ScrollTrigger } from '../core/gsap.js';

// O botão flutuante aparece quando o botão principal do hero sai da tela
// e fica visível até o fim da página.
export function initFloatingCta() {
  const button = document.querySelector('[data-float-cta]');
  if (!button) return;

  const heroCta = document.querySelector('[data-hero-cta]');
  if (!heroCta) {
    button.classList.add('is-visible');
    return;
  }

  // progress > 0: visível depois do início, inclusive no fim exato da página
  // (onde o ScrollTrigger deixa de estar "ativo") e em saltos diretos (âncoras, recarga)
  const sync = (self) => button.classList.toggle('is-visible', self.progress > 0);
  ScrollTrigger.create({
    trigger: heroCta,
    start: 'bottom top+=40',
    end: 'max',
    onUpdate: sync,
    onToggle: sync,
    onRefresh: sync,
  });
}
