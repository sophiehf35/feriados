// src/renderizadores/sitemaps/base.js

import { getArtigoUrl } from '@sophiehf35/plataforma-base';
import { gerarHeadersCache } from '../../js/utils.js';
import {
  getXmlHeader,
  gerarXMLUrls,
  gerarSitemapDeTabela,
  existeRegistroAtivo
} from './_utils.js';

async function gerarSitemapGeral(supabase, config) {
  const baseUrl = config.dominio;

  const { data: paginasDb, error: errPag } = await supabase
    .from('paginas')
    .select('slug, data_hora_atualizacao')
    .eq('status', 'ativo')
    .order('slug');

  if (errPag) {
    console.error('Erro ao buscar páginas para sitemap:', errPag);
    return new Response('Erro interno', { status: 500 });
  }

  const paginas = (paginasDb || []).map(p => ({
    loc: p.slug === 'home' ? '/' : `/${p.slug}/`,
    lastmod: p.data_hora_atualizacao || new Date().toISOString(),
    changefreq: p.slug === 'home' ? 'daily' : 'monthly',
    priority: p.slug === 'home' ? '1.0' : '0.7'
  }));

  if (config.possui_blog && config.diretorio_blog && config.diretorio_blog !== 'home') {
    paginas.push({
      loc: `/${config.diretorio_blog}/`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: '0.9'
    });
  }

  const xml = `${getXmlHeader()}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paginas.map(u => `
  <url>
    <loc>${baseUrl}${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('')}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: gerarHeadersCache(config, 'application/xml; charset=utf-8')
  });
}

async function buscarArtigosParaSitemap(supabase) {
  const pageSize = 1000;
  let todos = [];
  let from = 0;
  let to = pageSize - 1;

  while (true) {
    const { data, error } = await supabase
      .from('artigos')
      .select(`
        slug,
        data_hora_atualizacao,
        categoria:categorias(slug),
        subcategoria:subcategorias(slug)
      `)
      .eq('status', 'publicado')
      .order('slug')
      .range(from, to);

    if (error) throw error;
    if (!data || data.length === 0) break;
    todos = todos.concat(data);
    from += pageSize;
    to += pageSize;
  }
  return todos;
}

async function gerarSitemapArtigos(supabase, config) {
  const baseUrl = config.dominio;
  let data;
  try {
    data = await buscarArtigosParaSitemap(supabase);
  } catch (error) {
    console.error('Erro ao buscar artigos para sitemap:', error);
    return new Response('Erro interno', { status: 500 });
  }

  const urls = (data || []).map(artigo => ({
    loc: getArtigoUrl(artigo, config),
    lastmod: artigo.data_hora_atualizacao || new Date().toISOString(),
    changefreq: 'monthly',
    priority: '0.6'
  }));

  const xml = gerarXMLUrls(baseUrl, urls);
  return new Response(xml, {
    status: 200,
    headers: gerarHeadersCache(config, 'application/xml; charset=utf-8')
  });
}

async function gerarSitemapCategoriasArtigos(supabase, config) {
  const baseUrl = config.dominio;
  const diretorioBlog = config.diretorio_blog && config.diretorio_blog !== 'home'
    ? `${config.diretorio_blog}/`
    : '';
  const urls = [];

  const { data: categorias, error: errCat } = await supabase
    .from('categorias')
    .select(`
      id,
      slug,
      data_hora_atualizacao,
      artigos!inner(status)
    `)
    .eq('artigos.status', 'publicado')
    .eq('status', 'ativo');

  if (errCat) {
    console.error('Erro ao buscar categorias para sitemap:', errCat);
    return new Response('Erro interno', { status: 500 });
  }

  if (!categorias || categorias.length === 0) {
    return new Response(
      `${getXmlHeader()}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { status: 200, headers: gerarHeadersCache(config, 'application/xml; charset=utf-8') }
    );
  }

  const categoriaIds = categorias.map(c => c.id);
  const lastmodMap = {};
  if (categoriaIds.length > 0) {
    const { data: artigosData, error: errArt } = await supabase
      .from('artigos')
      .select('categoria, data_hora_atualizacao')
      .in('categoria', categoriaIds)
      .eq('status', 'publicado')
      .order('data_hora_atualizacao', { ascending: false });

    if (!errArt && artigosData) {
      artigosData.forEach(a => {
        if (!lastmodMap[a.categoria] || a.data_hora_atualizacao > lastmodMap[a.categoria]) {
          lastmodMap[a.categoria] = a.data_hora_atualizacao;
        }
      });
    }
  }

  categorias.forEach(cat => {
    const lastmod = lastmodMap[cat.id] || cat.data_hora_atualizacao || new Date().toISOString();
    urls.push({
      loc: `/${diretorioBlog}${cat.slug}/`,
      lastmod,
      changefreq: 'weekly',
      priority: '0.8'
    });
  });

  const xml = gerarXMLUrls(baseUrl, urls);
  return new Response(xml, {
    status: 200,
    headers: gerarHeadersCache(config, 'application/xml; charset=utf-8')
  });
}

async function gerarSitemapSubcategoriasArtigos(supabase, config) {
  const baseUrl = config.dominio;
  const diretorioBlog = config.diretorio_blog && config.diretorio_blog !== 'home'
    ? `${config.diretorio_blog}/`
    : '';
  const urls = [];

  const { data: subcategorias, error: errSub } = await supabase
    .from('subcategorias')
    .select(`
      id,
      slug,
      id_categoria,
      data_hora_atualizacao,
      artigos!inner(status)
    `)
    .eq('artigos.status', 'publicado')
    .eq('status', 'ativo');

  if (errSub) {
    console.error('Erro ao buscar subcategorias para sitemap:', errSub);
    return new Response('Erro interno', { status: 500 });
  }

  if (!subcategorias || subcategorias.length === 0) {
    return new Response(
      `${getXmlHeader()}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { status: 200, headers: gerarHeadersCache(config, 'application/xml; charset=utf-8') }
    );
  }

  const categoriaIds = subcategorias.map(s => s.id_categoria);
  const categoriaSlugMap = {};
  if (categoriaIds.length > 0) {
    const { data: cats, error: errCats } = await supabase
      .from('categorias')
      .select('id, slug')
      .in('id', categoriaIds);
    if (!errCats && cats) {
      cats.forEach(c => { categoriaSlugMap[c.id] = c.slug; });
    }
  }

  const subLastmodMap = {};
  if (subcategorias.length > 0) {
    const subIds = subcategorias.map(s => s.id);
    const { data: artigosData, error: errArt } = await supabase
      .from('artigos')
      .select('subcategoria, data_hora_atualizacao')
      .in('subcategoria', subIds)
      .eq('status', 'publicado')
      .order('data_hora_atualizacao', { ascending: false });

    if (!errArt && artigosData) {
      artigosData.forEach(a => {
        if (!subLastmodMap[a.subcategoria] || a.data_hora_atualizacao > subLastmodMap[a.subcategoria]) {
          subLastmodMap[a.subcategoria] = a.data_hora_atualizacao;
        }
      });
    }
  }

  subcategorias.forEach(sub => {
    const lastmod = subLastmodMap[sub.id] || sub.data_hora_atualizacao || new Date().toISOString();
    const catSlug = categoriaSlugMap[sub.id_categoria];
    if (catSlug) {
      urls.push({
        loc: `/${diretorioBlog}${catSlug}/${sub.slug}/`,
        lastmod,
        changefreq: 'weekly',
        priority: '0.7'
      });
    }
  });

  urls.sort((a, b) => a.loc.localeCompare(b.loc));
  const xml = gerarXMLUrls(baseUrl, urls);
  return new Response(xml, {
    status: 200,
    headers: gerarHeadersCache(config, 'application/xml; charset=utf-8')
  });
}

async function gerarSitemapFerramentas(supabase, config) {
  return gerarSitemapDeTabela(
    supabase,
    config,
    'ferramentas',
    (slug) => `/ferramentas/${slug}/`,
    'monthly',
    '0.7',
    'ativo'
  );
}

export const sitemaps = [
  {
    loc: '/sitemap/sitemap-geral.xml',
    deveIncluir: async () => true,
    gerar: gerarSitemapGeral
  },
  {
    loc: '/sitemap/sitemap-artigos.xml',
    deveIncluir: async (supabase) => {
      const { count, error } = await supabase
        .from('artigos')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'publicado');
      if (error) return false;
      return (count ?? 0) > 0;
    },
    gerar: gerarSitemapArtigos
  },
  {
    loc: '/sitemap/sitemap-categorias-artigos.xml',
    deveIncluir: async (supabase) => {
      const { count, error } = await supabase
        .from('artigos')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'publicado')
        .not('categoria', 'is', null);
      if (error) return false;
      return (count ?? 0) > 0;
    },
    gerar: gerarSitemapCategoriasArtigos
  },
  {
    loc: '/sitemap/sitemap-subcategorias-artigos.xml',
    deveIncluir: async (supabase) => {
      const { count, error } = await supabase
        .from('artigos')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'publicado')
        .not('subcategoria', 'is', null);
      if (error) return false;
      return (count ?? 0) > 0;
    },
    gerar: gerarSitemapSubcategoriasArtigos
  },
  {
    loc: '/sitemap/sitemap-ferramentas.xml',
    deveIncluir: (supabase) => existeRegistroAtivo(supabase, 'ferramentas'),
    gerar: gerarSitemapFerramentas
  }
];