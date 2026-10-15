// functions/[[path]].js

import {
  carregarArtigos,
  carregarFerramentas,
  carregarComentarios,
  carregarCategoriasComArtigos,
  carregarSubcategoriasPorCategoria,
  buscarPaginaPorSlug,
  buscarFerramentaPorSlug,
  buscarCategoriaPorSlug,
  buscarSubcategoriaPorSlug,
  buscarArtigoPorSlug,
  buscarArtigosRelacionados,
  renderizarPagina,
  renderizarBase,
  gerarMetaTags,
  renderizarBlogHome,
  renderizarFerramentas,
  renderizarCategoria,
  renderizarSubcategoria,
  renderizarArtigo,
  renderizarNaoEncontrado,
  criarMapaAutores
} from '@sophiehf35/plataforma-base';

import {
  gerarIndiceSitemap,
  resolverSitemap,
  gerarArquivoXSLTSitemap
} from '../src/renderizadores/sitemaps/_utils.js';

import { obterConfigPortal, getSupabaseClient } from './utils/central.js';
import { gerarHeadersCache } from '../src/js/utils.js';

import { mapa as paginas } from '../src/renderizadores/paginas/_indice.js';
import { mapa as ferramentasCustomizadas } from '../src/renderizadores/ferramentas/_indice.js';
import { rotas as rotasCustomizadas } from '../src/rotas/_indice.js';

let __manifestCache = null;

async function carregarManifest(request) {
  if (__manifestCache) return __manifestCache;
  try {
    const r = await fetch(new URL('/assets/manifest.json', request.url));
    if (!r.ok) return null;
    __manifestCache = await r.json();
    return __manifestCache;
  } catch {
    return null;
  }
}

function criarRespostaHtml(html, status = 200, config = null) {
  return new Response(html, {
    status,
    headers: gerarHeadersCache(config || {})
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  let config;
  try {
    config = await obterConfigPortal(env);
  } catch (err) {
    console.error('Erro ao obter config:', err);
    return new Response(`Erro: ${err.message}`, { status: 500 });
  }

  config.possui_turnstile = config.possui_turnstile === true || config.possui_turnstile === 'true';
  config.possui_blog = config.possui_blog === true || config.possui_blog === 'true';
  config.possui_adsterra = config.possui_adsterra === true || config.possui_adsterra === 'true';

  if (!config.dominio) {
    return new Response('Domínio não configurado.', { status: 500 });
  }

  if (config.possui_blog && !config.diretorio_blog) config.diretorio_blog = 'blog';
  if (!config.possui_blog) config.diretorio_blog = null;

  const supabase = await getSupabaseClient(env);
  const portalId = env.PORTAL_ID;
  if (!portalId) {
    return new Response('Erro: PORTAL_ID não definido.', { status: 500 });
  }

  if (pathname === '/robots.txt') {
    const content = `User-Agent: *\nAllow: /*\nDisallow: /cdn-cgi/\n\nSitemap: ${config.dominio}/sitemap.xml`;
    return new Response(content, {
      status: 200,
      headers: gerarHeadersCache(config, 'text/plain; charset=utf-8')
    });
  }

  if (pathname === '/sitemap.xml') {
    return gerarIndiceSitemap(config, supabase);
  }

  if (pathname === '/sitemap/sitemap.xsl') {
    return gerarArquivoXSLTSitemap(config);
  }

  if (pathname.startsWith('/sitemap/')) {
    return resolverSitemap(pathname, supabase, config);
  }

  const manifest = await carregarManifest(request);
  const mMain = manifest?.['src/js/main.js'];
  if (mMain?.file) {
    config.portalJsUrl = '/' + mMain.file;
    config.portalCssUrl = mMain.css?.[0] ? '/' + mMain.css[0] : '/assets/css/main.css';
  } else {
    config.portalJsUrl = '/assets/js/main.js';
    config.portalCssUrl = '/assets/css/main.css';
  }

  let anunciosData = [];
  let anunciosError = null;

  if (config.possui_adsterra) {
    const r = await supabase
      .from('anuncios_adsterra')
      .select('*')
      .eq('ativo', true)
      .order('prioridade', { ascending: false });
    anunciosData = r.data || [];
    anunciosError = r.error;
  }

  if (!anunciosError && anunciosData.length > 0) {
    const p = {};
    anunciosData.forEach(a => {
      if (!p[a.posicao]) p[a.posicao] = [];
      p[a.posicao].push(a);
    });
    config.anuncios = p;
  } else {
    config.anuncios = {};
  }

  const scriptsAdicionaisBase = (config.possui_adsterra && Object.keys(config.anuncios).length > 0)
    ? `<script>window.__ANUNCIOS_CONFIG = ${JSON.stringify(config.anuncios)};</script>`
    : '';

  const autoresMap = criarMapaAutores(config.administradores);
  const slugParts = pathname.replace(/^\/|\/$/g, '').split('/').filter(Boolean);

  if (
    config.possui_blog &&
    config.diretorio_blog &&
    config.diretorio_blog !== 'home' &&
    slugParts.length === 1 &&
    slugParts[0] === config.diretorio_blog
  ) {
    const pagAtual = parseInt(url.searchParams.get('pagina')) || 1;

    const artigosData = await carregarArtigos(
      supabase, config, null, null, pagAtual, config.numero_artigos_pagina_home || 12
    );

    let categoriasComArtigos = [];
    if (config.exibe_slide_categorias_blog_home !== false) {
      categoriasComArtigos = await carregarCategoriasComArtigos(supabase);
    }

    const paginaBlog = await buscarPaginaPorSlug(supabase, config.diretorio_blog) || {
      slug: config.diretorio_blog,
      nome: 'Blog',
      meta_titulo: null,
      meta_descricao: null,
      imagem_destaque: null
    };

    const html = await renderizarBlogHome(
      config,
      paginaBlog,
      { autoresMap, artigos: artigosData, categorias: categoriasComArtigos },
      scriptsAdicionaisBase
    );

    return criarRespostaHtml(html, 200, config);
  }

  if (slugParts[0] === 'ferramentas' && slugParts.length === 2) {
    const ferramenta = await buscarFerramentaPorSlug(supabase, slugParts[1]);
    if (!ferramenta) {
      return criarRespostaHtml(renderizarNaoEncontrado(config), 404, config);
    }

    const mod = ferramentasCustomizadas[ferramenta.slug];
    if (!mod || typeof mod.render !== 'function') {
      console.warn(`[router] ferramenta "${ferramenta.slug}" sem renderizador em ferramentas/`);
      return criarRespostaHtml(renderizarNaoEncontrado(config), 404, config);
    }

    const html = await mod.render(config, ferramenta, {
      scriptsAdicionais: scriptsAdicionaisBase,
      supabase,
      url
    });

    return criarRespostaHtml(html, 200, config);
  }

  if (slugParts.length === 0 || slugParts.length === 1) {
    const slug = slugParts[0] || 'home';
    const pagina = await buscarPaginaPorSlug(supabase, slug);

    if (pagina) {
      const pagAtual = parseInt(url.searchParams.get('pagina')) || 1;

      if (pagina.slug === 'home' && config.possui_blog && config.diretorio_blog === 'home') {
        const dados = {
          autoresMap,
          artigos: await carregarArtigos(supabase, config, null, null, pagAtual, config.numero_artigos_pagina_home || 12),
          categorias: await carregarCategoriasComArtigos(supabase)
        };
        const html = await renderizarBlogHome(config, pagina, dados, scriptsAdicionaisBase);
        return criarRespostaHtml(html, 200, config);
      }

      if (pagina.slug === 'ferramentas') {
        const dados = {
          autoresMap,
          ferramentas: await carregarFerramentas(supabase, config, pagAtual)
        };
        const html = renderizarFerramentas(config, pagina, dados, scriptsAdicionaisBase);
        return criarRespostaHtml(html, 200, config);
      }

      if (pagina.conteudo_customizado === false) {
        const html = renderizarPagina(config, pagina, pagina.conteudo, scriptsAdicionaisBase);
        return criarRespostaHtml(html, 200, config);
      }

      const mod = paginas[pagina.slug];
      if (!mod || typeof mod.render !== 'function') {
        console.warn(`[router] página "${pagina.slug}" sem renderizador em paginas/`);
        return criarRespostaHtml(renderizarNaoEncontrado(config), 404, config);
      }

      const dados = {
        autoresMap,
        scriptsAdicionais: scriptsAdicionaisBase,
        supabase,
        url
      };

      const html = await mod.render(config, pagina, dados);
      return criarRespostaHtml(html, 200, config);
    }
  }

  if (config.possui_blog && config.diretorio_blog && slugParts.length > 0) {
    let slugsParaAnalisar;
    if (config.diretorio_blog === 'home') {
      slugsParaAnalisar = slugParts;
    } else if (slugParts[0] === config.diretorio_blog) {
      slugsParaAnalisar = slugParts.slice(1);
    } else {
      slugsParaAnalisar = null;
    }

    if (slugsParaAnalisar && slugsParaAnalisar.length >= 1 && slugsParaAnalisar.length <= 3) {
      const pagAtual = parseInt(url.searchParams.get('pagina')) || 1;
      let html = null;

      if (slugsParaAnalisar.length === 1) {
        const categoria = await buscarCategoriaPorSlug(supabase, slugsParaAnalisar[0]);
        if (categoria) {
          const [artigosData, subcategorias] = await Promise.all([
            carregarArtigos(
              supabase, config, categoria.id, null, pagAtual, config.numero_artigos_pagina_categoria
            ),
            carregarSubcategoriasPorCategoria(supabase, categoria.id)
          ]);
          html = renderizarCategoria(config, categoria, artigosData, autoresMap, subcategorias);
        }
      } else if (slugsParaAnalisar.length === 2) {
        const categoria = await buscarCategoriaPorSlug(supabase, slugsParaAnalisar[0]);
        if (categoria) {
          const subcategoria = await buscarSubcategoriaPorSlug(supabase, slugsParaAnalisar[1]);
          if (subcategoria && subcategoria.id_categoria === categoria.id) {
            const artigosData = await carregarArtigos(
              supabase, config, categoria.id, subcategoria.id, pagAtual, config.numero_artigos_pagina_categoria
            );
            html = renderizarSubcategoria(config, subcategoria, categoria, artigosData, autoresMap);
          } else {
            const artigo = await buscarArtigoPorSlug(supabase, slugsParaAnalisar[1]);
            if (artigo && artigo.categoria?.id === categoria.id && !artigo.subcategoria) {
              const comentarios = await carregarComentarios(supabase, artigo.id);
              const relacionados = await buscarArtigosRelacionados(supabase, artigo, 3);
              html = renderizarArtigo(config, artigo, comentarios, relacionados, autoresMap, scriptsAdicionaisBase);
            }
          }
        }
      } else if (slugsParaAnalisar.length === 3) {
        const categoria = await buscarCategoriaPorSlug(supabase, slugsParaAnalisar[0]);
        if (categoria) {
          const subcategoria = await buscarSubcategoriaPorSlug(supabase, slugsParaAnalisar[1]);
          if (subcategoria && subcategoria.id_categoria === categoria.id) {
            const artigo = await buscarArtigoPorSlug(supabase, slugsParaAnalisar[2]);
            if (artigo && artigo.categoria?.id === categoria.id && artigo.subcategoria?.id === subcategoria.id) {
              const comentarios = await carregarComentarios(supabase, artigo.id);
              const relacionados = await buscarArtigosRelacionados(supabase, artigo, 3);
              html = renderizarArtigo(config, artigo, comentarios, relacionados, autoresMap, scriptsAdicionaisBase);
            }
          }
        }
      }

      if (html) {
        return criarRespostaHtml(html, 200, config);
      }
    }
  }

  for (const rota of Object.values(rotasCustomizadas)) {
    if (typeof rota?.resolver !== 'function') continue;

    try {
      const resultado = await rota.resolver({
        supabase,
        slugParts,
        config,
        scriptsAdicionaisBase,
        autoresMap,
        url
      });

      if (resultado && resultado.html) {
        return criarRespostaHtml(resultado.html, resultado.status || 200, config);
      }
    } catch (err) {
      console.error(`[router] erro na rota customizada:`, err);
    }
  }

  if (slugParts.length === 1 && paginas[slugParts[0]]) {
    console.warn(`[router] arquivo "paginas/${slugParts[0]}.js" existe mas nenhuma página com esse slug no banco`);
  }
  if (slugParts[0] === 'ferramentas' && slugParts.length === 2 && ferramentasCustomizadas[slugParts[1]]) {
    console.warn(`[router] arquivo "ferramentas/${slugParts[1]}.js" existe mas nenhuma ferramenta com esse slug no banco`);
  }

  return criarRespostaHtml(renderizarNaoEncontrado(config), 404, config);
}