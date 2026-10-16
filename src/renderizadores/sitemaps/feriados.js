// src/renderizadores/sitemaps/feriados.js

import { criarSitemapTabela, criarSitemapCruzado } from './_utils.js';

export const sitemaps = [
  // Anos: /2024/, /2025/, /2026/
  criarSitemapTabela({
    loc: '/sitemap/sitemap-feriados-anos.xml',
    tabela: 'paginas_ano',
    colunaSlug: 'ano',
    filtro: { coluna: 'excluido', valor: 0 },
    urlBuilder: (slug) => `/feriados/${slug}/`,
    changefreq: 'yearly',
    priority: '1.0'
  }),

  // Meses: /2024/janeiro/, /2024/fevereiro/, ...
  criarSitemapCruzado({
    loc: '/sitemap/sitemap-feriados-meses.xml',
    changefreq: 'yearly',
    priority: '0.8',
    queries: [
      { chave: 'anos', tabela: 'paginas_ano', select: 'ano', filtro: { coluna: 'excluido', valor: 0 } },
      { chave: 'meses', tabela: 'paginas_mes', select: 'slug', filtro: { coluna: 'excluido', valor: 0 } }
    ],
    urlBuilder: (anos, meses) => {
      const urls = [];
      anos.forEach(a => {
        meses.forEach(m => {
          urls.push(`/feriados/${a.ano}/${m.slug}/`);
        });
      });
      return urls;
    }
  }),

  // Estados: /2024/sp/, /2024/rj/, ...
  criarSitemapCruzado({
    loc: '/sitemap/sitemap-feriados-estados.xml',
    changefreq: 'weekly',
    priority: '0.7',
    queries: [
      { chave: 'anos', tabela: 'paginas_ano', select: 'ano', filtro: { coluna: 'excluido', valor: 0 } },
      { chave: 'estados', tabela: 'paginas_estado', select: 'uf', filtro: { coluna: 'excluido', valor: 0 } }
    ],
    urlBuilder: (anos, estados) => {
      const urls = [];
      anos.forEach(a => {
        estados.forEach(e => {
          urls.push(`/feriados/${a.ano}/${e.uf}/`);
        });
      });
      return urls;
    }
  }),

  // Cidades: /2024/sp/saopaulo/, ...
  criarSitemapCruzado({
    loc: '/sitemap/sitemap-feriados-cidades.xml',
    changefreq: 'weekly',
    priority: '0.6',
    queries: [
      { chave: 'anos', tabela: 'paginas_ano', select: 'ano', filtro: { coluna: 'excluido', valor: 0 } },
      { chave: 'cidades', tabela: 'paginas_cidade', select: 'slug, uf', filtro: { coluna: 'excluido', valor: 0 } }
    ],
    urlBuilder: (anos, cidades) => {
      const urls = [];
      anos.forEach(a => {
        cidades.forEach(c => {
          urls.push(`/feriados/${a.ano}/${c.uf}/${c.slug}/`);
        });
      });
      return urls;
    }
  })
];