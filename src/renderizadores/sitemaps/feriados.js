// src/renderizadores/sitemaps/feriados.js

import {
  criarSitemapAnos,
  criarSitemapCruzado,
  buscarAnosIndexaveis,
} from './_utils.js';

const queryAnos = {
  chave: 'anos',
  custom: buscarAnosIndexaveis,
};

export const sitemaps = [
  criarSitemapAnos({
    loc: '/sitemap/sitemap-feriados-anos.xml',
    urlBuilder: (ano) => `/${ano}/`,
    changefreq: 'yearly',
    priority: '1.0',
  }),

  criarSitemapCruzado({
    loc: '/sitemap/sitemap-feriados-meses.xml',
    changefreq: 'yearly',
    priority: '0.8',
    queries: [
      queryAnos,
      { chave: 'meses', tabela: 'feriados_nacional', select: 'ano', filtro: null },
    ],
    urlBuilder: (anos, _ignorado) => {
      const MESES = ['janeiro','fevereiro','marco','abril','maio','junho',
                     'julho','agosto','setembro','outubro','novembro','dezembro'];
      const urls = [];
      anos.forEach(a => {
        MESES.forEach(m => urls.push(`/${a.ano}/${m}/`));
      });
      return urls;
    },
  }),

  criarSitemapCruzado({
    loc: '/sitemap/sitemap-feriados-estados.xml',
    changefreq: 'weekly',
    priority: '0.7',
    queries: [
      queryAnos,
      { chave: 'estados', tabela: 'estados', select: 'uf', filtro: null },
    ],
    urlBuilder: (anos, estados) => {
      const urls = [];
      anos.forEach(a => {
        estados.forEach(e => urls.push(`/${a.ano}/${e.uf}/`));
      });
      return urls;
    },
  }),

  criarSitemapCruzado({
    loc: '/sitemap/sitemap-feriados-cidades.xml',
    changefreq: 'weekly',
    priority: '0.6',
    queries: [
      queryAnos,
      { chave: 'cidades', tabela: 'cidades', select: 'slug, uf', filtro: null },
    ],
    urlBuilder: (anos, cidades) => {
      const urls = [];
      anos.forEach(a => {
        cidades.forEach(c => urls.push(`/${a.ano}/${c.uf}/${c.slug}/`));
      });
      return urls;
    },
  }),
];