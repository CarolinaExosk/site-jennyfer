import { gsap } from '../core/gsap.js';

// O elemento é levemente "atraído" pelo cursor e volta ao lugar ao sair.
// Retorna uma função que desfaz o efeito.
export function magnetic(element, strength = 0.25) {
  const xTo = gsap.quickTo(element, 'x', { duration: 0.7, ease: 'power3' });
  const yTo = gsap.quickTo(element, 'y', { duration: 0.7, ease: 'power3' });

  const onMove = (event) => {
    const rect = element.getBoundingClientRect();
    xTo((event.clientX - (rect.left + rect.width / 2)) * strength);
    yTo((event.clientY - (rect.top + rect.height / 2)) * strength);
  };
  const onLeave = () => {
    xTo(0);
    yTo(0);
  };

  element.addEventListener('pointermove', onMove);
  element.addEventListener('pointerleave', onLeave);

  return () => {
    element.removeEventListener('pointermove', onMove);
    element.removeEventListener('pointerleave', onLeave);
    gsap.set(element, { clearProps: 'x,y' });
  };
}
