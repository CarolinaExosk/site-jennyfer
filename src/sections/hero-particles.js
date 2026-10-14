// Fundo do hero: poeira de luz e névoa, bem lenta. Carregado sob demanda (import dinâmico).
import {
  BufferAttribute,
  BufferGeometry,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';

const CAMERA_Z = 6;
const FOV = 50;
const MAX_MEDIAN_FRAME_MS = 26; // abaixo de ~38 fps, desliga as partículas

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uAspect;
  uniform float uTanHalfFov;
  uniform float uScroll;
  uniform vec2 uPointer;
  attribute float aSeed;
  attribute float aSize;
  varying float vAlpha;
  varying float vSeed;
  varying float vBokeh;

  void main() {
    vec3 n = position; // espaço normalizado: x e z em [-1, 1], y em [-1.15, 1.15]
    float t = uTime;
    float near = n.z * 0.5 + 0.5; // 0 = longe, 1 = perto

    // Deriva lenta e orgânica
    n.x += sin(t * 0.05 * (0.5 + aSeed) + aSeed * 31.0) * 0.05;
    n.y += cos(t * 0.04 * (0.5 + aSeed) + aSeed * 17.0) * 0.04;

    // Sobe devagar e reaparece por baixo
    float rise = t * (0.004 + aSeed * 0.006) + uScroll * (0.12 + 0.3 * near);
    n.y = mod(n.y + rise + 1.15, 2.3) - 1.15;

    // Para o mundo 3D, preenchendo a tela em qualquer profundidade
    float z = n.z * 2.5;
    float halfH = (${CAMERA_Z.toFixed(1)} - z) * uTanHalfFov;
    vec3 p = vec3(n.x * halfH * uAspect * 1.05, n.y * halfH, z);

    // Paralaxe: as partículas mais próximas reagem mais ao mouse
    p.xy += uPointer * (0.03 + near * 0.16);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (${CAMERA_Z.toFixed(1)} / -mv.z);

    float edge = smoothstep(1.15, 0.85, abs(n.y));
    float breathe = 0.8 + 0.2 * sin(t * 0.25 * (0.3 + aSeed) + aSeed * 50.0);
    vAlpha = edge * mix(0.3, 1.0, near) * breathe;
    vSeed = aSeed;
    vBokeh = step(6.0, aSize);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uIvory;
  uniform vec3 uAccent;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vSeed;
  varying float vBokeh;

  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float a = 1.0 - smoothstep(0.0, 1.0, d);
    a *= a;
    vec3 color = mix(uIvory, uAccent, smoothstep(0.72, 0.86, vSeed));
    float alpha = a * vAlpha * uOpacity * mix(0.75, 0.16, vBokeh);
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

// Cores em sRGB passadas direto ao shader (sem conversão de espaço de cor)
const hexToVec3 = (hex) => {
  const v = parseInt(hex.slice(1), 16);
  return new Vector3(((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255);
};

export function createHeroParticles(container, hero) {
  let renderer;
  try {
    renderer = new WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
  } catch {
    return null;
  }

  const small = window.matchMedia('(max-width: 767px)').matches;
  const count = small ? 420 : 1000;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x000000, 0);

  const canvas = renderer.domElement;
  canvas.className = 'hero__canvas';
  canvas.setAttribute('aria-hidden', 'true');
  container.append(canvas);

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 50);
  camera.position.z = CAMERA_Z;

  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = Math.random() * 2 - 1;
    positions[i * 3 + 1] = Math.random() * 2.3 - 1.15;
    positions[i * 3 + 2] = Math.random() * 2 - 1;
    seeds[i] = Math.random();
    // Maioria: poeira fina. Poucas: bokeh grande e bem apagado (a "névoa")
    sizes[i] = Math.random() < 0.06 ? 9 + Math.random() * 11 : 1.2 + Math.random() * 2;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new BufferAttribute(seeds, 1));
  geometry.setAttribute('aSize', new BufferAttribute(sizes, 1));

  const uniforms = {
    uTime: { value: 0 },
    uPixelRatio: { value: pixelRatio },
    uAspect: { value: 1 },
    uTanHalfFov: { value: Math.tan(((FOV / 2) * Math.PI) / 180) },
    uScroll: { value: 0 },
    uPointer: { value: new Vector2() },
    uOpacity: { value: 1 },
    uIvory: { value: hexToVec3('#f3ede4') },
    uAccent: { value: hexToVec3('#d27d5c') },
  };

  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });

  const points = new Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  // Tamanho
  let heroHeight = hero.offsetHeight;
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = container;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    uniforms.uAspect.value = w / h;
    heroHeight = hero.offsetHeight;
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  // Mouse (só ponteiro fino; no toque as partículas apenas flutuam)
  const pointer = new Vector2();
  const pointerTarget = new Vector2();
  const onPointerMove = (event) => {
    if (event.pointerType !== 'mouse') return;
    pointerTarget.set((event.clientX / window.innerWidth) * 2 - 1, -((event.clientY / window.innerHeight) * 2 - 1));
  };
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  // Loop: só roda com o hero visível. Nos primeiros quadros, mede o desempenho.
  let rafId = 0;
  let running = false;
  let last = 0;
  let elapsed = 0;
  const frameTimes = [];
  let measured = false;

  const frame = (now) => {
    rafId = requestAnimationFrame(frame);
    const delta = Math.min(now - last, 100);
    last = now;
    elapsed += delta / 1000;

    if (!measured) {
      frameTimes.push(delta);
      if (frameTimes.length === 100) {
        measured = true;
        const sorted = frameTimes.slice(20).sort((a, b) => a - b);
        if (sorted[Math.floor(sorted.length / 2)] > MAX_MEDIAN_FRAME_MS) {
          destroy();
          return;
        }
      }
    }

    pointer.lerp(pointerTarget, 0.035);
    uniforms.uTime.value = elapsed;
    uniforms.uPointer.value.copy(pointer);
    uniforms.uScroll.value = Math.min(window.scrollY / heroHeight, 1);
    renderer.render(scene, camera);
  };

  const start = () => {
    if (running) return;
    running = true;
    last = performance.now();
    rafId = requestAnimationFrame(frame);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(rafId);
  };

  const visibilityObserver = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
  visibilityObserver.observe(hero);

  // Primeiro quadro desenhado: o canvas aparece com fade (CSS)
  renderer.render(scene, camera);
  requestAnimationFrame(() => canvas.classList.add('is-visible'));

  let destroyed = false;
  function destroy() {
    if (destroyed) return;
    destroyed = true;
    stop();
    visibilityObserver.disconnect();
    resizeObserver.disconnect();
    window.removeEventListener('pointermove', onPointerMove);
    canvas.classList.remove('is-visible');
    // Espera o fade-out antes de liberar a GPU
    window.setTimeout(() => {
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    }, 2500);
  }

  return { destroy };
}
