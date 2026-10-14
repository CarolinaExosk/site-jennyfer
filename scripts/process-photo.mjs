// Trata a foto de assets/foto.png para o site:
// corta a borda inferior/direita, converte para P&B e gera WebP em public/img/.
// Uso: npm run photo
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const INPUT = 'assets/foto.png';
const OUT_DIR = 'public/img';
const NAME = 'jennyfer';

// Corte das bordas (fração da largura/altura). Remove o canto inferior direito,
// longe do rosto.
const CROP_RIGHT = 0.04;
const CROP_BOTTOM = 0.06;

// Mistura de canais com mais vermelho (efeito de filtro vermelho do filme P&B):
// pele e cabelo mais luminosos, céu da janela mais escuro.
const CHANNEL_MIX = [0.62, 0.32, 0.06];
const CONTRAST = [1.1, -8]; // a * pixel + b

// Proporção final 4:5 (a mesma exibida no site). O corte vertical fica perto do topo,
// preservando rosto e cabelo (FOCUS_Y = 0 corta só embaixo, 1 só em cima).
const ASPECT = 4 / 5;
const FOCUS_Y = 0.18;

const WIDTHS = [480, 800, 1200];

const { width: srcW, height: srcH } = await sharp(INPUT).metadata();
const crop = {
  left: 0,
  top: 0,
  width: srcW - Math.round(srcW * CROP_RIGHT),
  height: srcH - Math.round(srcH * CROP_BOTTOM),
};

// Vinheta centrada no rosto: escurece as bordas para a foto se fundir ao fundo.
const vignette = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${crop.width}" height="${crop.height}">
  <defs><radialGradient id="v" cx="0.55" cy="0.36" r="0.75">
    <stop offset="0.25" stop-color="#fff"/><stop offset="1" stop-color="#4a4a4a"/>
  </radialGradient></defs><rect width="100%" height="100%" fill="url(#v)"/></svg>`);

const toned = await sharp(INPUT)
  .removeAlpha()
  .extract(crop)
  .recomb([CHANNEL_MIX, CHANNEL_MIX, CHANNEL_MIX])
  .linear(...CONTRAST)
  .png()
  .toBuffer();

const framedHeight = Math.min(crop.height, Math.round(crop.width / ASPECT));
const master = await sharp(
  await sharp(toned).composite([{ input: vignette, blend: 'multiply' }]).png().toBuffer(),
)
  .extract({
    left: 0,
    top: Math.round((crop.height - framedHeight) * FOCUS_Y),
    width: crop.width,
    height: framedHeight,
  })
  .toColourspace('b-w')
  .png()
  .toBuffer();

// Nunca amplia: usa as larguras da lista que cabem na foto + a largura máxima.
const widths = [...new Set([...WIDTHS.filter((w) => w < crop.width), Math.min(crop.width, WIDTHS.at(-1))])];

await mkdir(OUT_DIR, { recursive: true });
const srcset = [];
for (const w of widths) {
  const file = `${OUT_DIR}/${NAME}-${w}.webp`;
  const info = await sharp(master).resize({ width: w }).webp({ quality: 82, effort: 6 }).toFile(file);
  srcset.push(`/img/${NAME}-${w}.webp ${w}w`);
  console.log(`${file}  ${info.width}×${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
}
console.log(`\nsrcset="${srcset.join(', ')}"`);
