// Animações de entrada reutilizadas pelas seções (todas disparam uma vez, ao entrar na tela).
// Usam só opacidade (nunca visibility): o conteúdo ainda não revelado continua acessível
// a leitores de tela e alcançável pelo teclado.
import { gsap, SplitText } from './gsap.js';

// Texto de destaque revelado linha a linha: cada linha sobe por trás de uma máscara.
// autoSplit refaz a divisão das linhas se a largura mudar (rotação, redimensionamento).
export function revealLines(element, { trigger = element, start = 'top 85%', delay = 0, stagger = 0.1 } = {}) {
  return SplitText.create(element, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'split-line',
    autoSplit: true,
    aria: 'none', // as palavras continuam inteiras: leitores de tela leem normalmente
    onSplit: (self) =>
      gsap.from(self.lines, {
        yPercent: 110,
        duration: 1.3,
        stagger,
        delay,
        ease: 'expo.out',
        scrollTrigger: { trigger, start, once: true },
      }),
  });
}

// Elementos que sobem um pouco e aparecem em sequência
export function revealUp(targets, { trigger, start = 'top 85%', y = 24, stagger = 0.08, delay = 0, duration = 1.2 } = {}) {
  const elements = gsap.utils.toArray(targets);
  return gsap.from(elements, {
    opacity: 0,
    y,
    duration,
    stagger,
    delay,
    ease: 'power3.out',
    scrollTrigger: { trigger: trigger || elements[0], start, once: true },
  });
}

// Versão para "reduzir movimento": só opacidade, curta
export function revealFade(targets, { trigger, start = 'top 85%' } = {}) {
  const elements = gsap.utils.toArray(targets);
  return gsap.from(elements, {
    opacity: 0,
    duration: 0.6,
    stagger: 0.05,
    ease: 'power1.out',
    scrollTrigger: { trigger: trigger || elements[0], start, once: true },
  });
}

// Teclado: se o foco cair num elemento cuja entrada ainda não aconteceu
// (ex.: Tab até um link abaixo da dobra), conclui a animação na hora.
export function revealOnFocus() {
  document.addEventListener('focusin', (event) => {
    for (let el = event.target; el && el !== document.body; el = el.parentElement) {
      gsap.getTweensOf(el).forEach((tween) => {
        if (tween.scrollTrigger && tween.progress() < 1) tween.progress(1);
      });
    }
  });
}
