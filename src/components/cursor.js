import { gsap } from '../core/gsap.js';
import { finePointer, reducedMotion } from '../core/motion.js';

const INTERACTIVE = 'a, button, [data-cursor]';

// Anel discreto que segue o mouse com atraso e cresce sobre links e botões.
// Só em aparelhos com mouse e sem "reduzir movimento".
export function initCursor() {
  if (!finePointer.matches || reducedMotion.matches) return;

  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = '<div class="cursor__ring"></div>';
  document.body.append(cursor);

  const xTo = gsap.quickTo(cursor, 'x', { duration: 0.5, ease: 'power3' });
  const yTo = gsap.quickTo(cursor, 'y', { duration: 0.5, ease: 'power3' });

  window.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType !== 'mouse') return;
      xTo(event.clientX);
      yTo(event.clientY);
      cursor.classList.add('is-active');
    },
    { passive: true },
  );

  document.addEventListener('pointerover', (event) => {
    cursor.classList.toggle('is-hover', Boolean(event.target.closest?.(INTERACTIVE)));
  });

  document.documentElement.addEventListener('pointerleave', () => cursor.classList.remove('is-active'));
}
