import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Endereço final do site, sem barra no fim. Ex.: SITE_URL=https://www.emporioburguer.com.br
 * Com ele, a prévia do link no WhatsApp/Instagram mostra a foto (og:image precisa de endereço completo)
 * e o build gera sitemap.xml. Sem ele, o site funciona igual, só sem essas duas coisas.
 */
const siteUrl = (process.env.SITE_URL ?? '').trim().replace(/\/+$/, '');

function siteMeta(): Plugin {
  const ogImage = siteUrl ? `${siteUrl}/images/brand/og-image.jpg` : './images/brand/og-image.jpg';
  return {
    name: 'emporio-site-meta',
    transformIndexHtml(html) {
      const extra = siteUrl
        ? `<link rel="canonical" href="${siteUrl}/" />\n    <meta property="og:url" content="${siteUrl}/" />`
        : '';
      return html.replace('__OG_IMAGE__', ogImage).replace('<!--SITE_META-->', extra);
    },
    generateBundle() {
      const robots = ['User-agent: *', 'Allow: /'];
      if (siteUrl) {
        robots.push(`Sitemap: ${siteUrl}/sitemap.xml`);
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}/</loc></url>\n</urlset>\n`,
        });
      }
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots.join('\n') + '\n' });
    },
  };
}

// base './' deixa o build funcionando em qualquer pasta ou domínio (hospedagem estática).
export default defineConfig({
  base: './',
  plugins: [react(), siteMeta()],
  build: {
    target: 'es2019',
    cssCodeSplit: false,
    assetsInlineLimit: 0,
  },
});
