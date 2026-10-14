import { gsap, ScrollTrigger } from '../core/gsap.js';
import { cssVar } from '../core/css-var.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const MAX_PULSES = 3;

// Cérebro em traço fino: desenha-se ao entrar na tela e, depois, pequenos impulsos
// cor de vinho percorrem a rede de conexões, devagar, acendendo de leve o ponto de chegada.
// Só roda com o cérebro visível. Retorna uma função que desfaz tudo.
export function animateBrain(svg, { trigger = svg } = {}) {
  const strokes = svg.querySelectorAll('.brain__outline, .brain__fold');
  const links = gsap.utils.toArray('.brain__net', svg);
  const nodes = gsap.utils.toArray('.brain__node', svg);
  const pulseLayer = svg.querySelector('.brain__pulses');
  const art = svg.querySelector('.brain__art');

  const glow = cssVar('--c-accent-glow');

  // Cor original de cada ponto (para voltar a ela depois do brilho)
  const baseFill = new Map(nodes.map((node) => [node, getComputedStyle(node).fill]));

  // Cada conexão sabe em que ponto termina (para acender o ponto de chegada)
  const routes = links.map((path) => {
    const length = path.getTotalLength();
    const end = path.getPointAtLength(length);
    const target = nodes.reduce(
      (best, node) => {
        const d = Math.hypot(node.cx.baseVal.value - end.x, node.cy.baseVal.value - end.y);
        return d < best.d ? { node, d } : best;
      },
      { node: null, d: Infinity },
    ).node;
    return { path, length, target };
  });

  let drawn = false;
  let running = false;
  let active = 0;
  let nextCall = null;

  const breathe = gsap.to(art, { y: -3, duration: 4.5, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true });

  function sendPulse() {
    if (!running) return;
    if (active < MAX_PULSES) travel(gsap.utils.random(routes));
    nextCall = gsap.delayedCall(gsap.utils.random(0.8, 1.4), sendPulse);
  }

  function travel({ path, length, target }) {
    const halo = document.createElementNS(SVG_NS, 'circle');
    const dot = document.createElementNS(SVG_NS, 'circle');
    halo.setAttribute('class', 'brain__halo');
    halo.setAttribute('r', '5');
    dot.setAttribute('class', 'brain__pulse');
    dot.setAttribute('r', '1.8');
    pulseLayer.append(halo, dot);
    active += 1;

    const state = { t: 0 };
    const place = () => {
      const point = path.getPointAtLength(state.t * length);
      for (const el of [halo, dot]) {
        el.setAttribute('cx', point.x.toFixed(2));
        el.setAttribute('cy', point.y.toFixed(2));
      }
    };
    place();

    const duration = gsap.utils.random(2.6, 3.8);
    gsap
      .timeline({
        onComplete: () => {
          halo.remove();
          dot.remove();
          active -= 1;
        },
      })
      .fromTo([halo, dot], { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0)
      .to(state, { t: 1, duration, ease: 'sine.inOut', onUpdate: place }, 0)
      .to([halo, dot], { opacity: 0, duration: 0.6 }, duration - 0.4)
      // O ponto de chegada acende e volta devagar à cor original (nada piscando)
      .fromTo(
        target,
        { fill: glow },
        { fill: baseFill.get(target), duration: 1.6, ease: 'power2.out', overwrite: 'auto', clearProps: 'fill' },
        duration - 0.2,
      );
  }

  function start() {
    if (running) return;
    running = true;
    breathe.play();
    sendPulse();
  }

  function stop() {
    running = false;
    breathe.pause();
    nextCall?.kill();
  }

  // Liga só com o cérebro na tela (e depois do desenho); desliga fora dela
  const visibility = ScrollTrigger.create({
    trigger: svg,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => (self.isActive && drawn ? start() : stop()),
  });

  // O traço se desenha: contorno e dobras, depois a rede e os pontos
  const draw = gsap.timeline({ scrollTrigger: { trigger, start: 'top 75%', once: true } });
  draw
    .fromTo(strokes, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.6, stagger: 0.07, ease: 'power2.inOut' })
    .fromTo(links, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, stagger: 0.06, ease: 'power2.inOut' }, '-=1.4')
    .from(nodes, { opacity: 0, duration: 0.8, stagger: 0.05, ease: 'power1.out' }, '-=1')
    .call(() => {
      drawn = true;
      if (visibility.isActive) start();
    });

  return () => {
    stop();
    visibility.kill();
    draw.kill();
    breathe.kill();
    gsap.set([...strokes, ...links], { clearProps: 'strokeDashoffset' });
    gsap.set(nodes, { clearProps: 'opacity,fill' });
    pulseLayer.replaceChildren();
  };
}
