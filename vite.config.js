import { defineConfig, loadEnv } from 'vite';

// Gera robots.txt e sitemap.xml no build, a partir do VITE_SITE_URL do .env
function seoFiles(siteUrl) {
  return {
    name: 'seo-files',
    apply: 'build',
    generateBundle() {
      const today = new Date().toISOString().slice(0, 10);
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
      });
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source:
          '<?xml version="1.0" encoding="UTF-8"?>\n' +
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
          `  <url><loc>${siteUrl}/</loc><lastmod>${today}</lastmod></url>\n` +
          '</urlset>\n',
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const siteUrl = (env.VITE_SITE_URL || '').replace(/\/$/, '');

  return {
    plugins: [seoFiles(siteUrl)],
    build: {
      target: 'es2020',
      // O maior arquivo é o Three.js (partículas do hero): carregado sob demanda,
      // só em aparelhos capazes e depois da intro. Não pesa no carregamento inicial.
      chunkSizeWarningLimit: 600,
    },
  };
});
