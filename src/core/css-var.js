// Lê uma variável definida em src/styles/tokens.css (fonte única da paleta),
// para o JS usar as mesmas cores do CSS.
export const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
