// Preferências de movimento e capacidade do aparelho

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
export const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

// Condições para o gsap.matchMedia(): cada seção define a versão completa e a simplificada
export const MOTION_CONDITIONS = {
  full: '(prefers-reduced-motion: no-preference)',
  reduced: '(prefers-reduced-motion: reduce)',
};

// As partículas (Three.js) só carregam em aparelhos com folga de desempenho
export function canRunParticles() {
  if (reducedMotion.matches) return false;

  const connection = navigator.connection;
  if (connection && (connection.saveData || /2g|3g/.test(connection.effectiveType || ''))) return false;

  // Safari e Firefox não informam memória: nesse caso, decide o teste de FPS
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;
  if (cores < 4 || memory < 4) return false;

  return hasWebGL();
}

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return Boolean(gl);
  } catch {
    return false;
  }
}

export function whenIdle(callback, timeout = 1500) {
  if ('requestIdleCallback' in window) window.requestIdleCallback(callback, { timeout });
  else window.setTimeout(callback, 300);
}
