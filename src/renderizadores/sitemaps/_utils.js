// src/renderizadores/sitemaps/_utils.js

import { gerarHeadersCache } from '../../js/utils.js';
import { mapa } from './_indice.js';

const sitemaps = Object.values(mapa).flatMap(m => m.sitemaps || []);

export function gerarXSLTSitemap() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Mapa do Site</title>
        <style>
          * { box-sizing: border-box; }
          html, body { margin: 0; padding: 0; }
          body { font-family: Arial, Helvetica, sans-serif; background: #ffffff; color: #333333; padding: 30px; }
          .container { width: 100%; max-width: 1200px; margin: 0 auto; }
          h1 { margin: 0 0 24px; color: #333333; font-size: 28px; line-height: 1.3; }
          table { width: 100%; border-collapse: collapse; background: #ffffff; }
          th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #dddddd; vertical-align: top; }
          th { background: #eeeeee; font-weight: 700; color: #333333; }
          tr:hover td { background: #f8f8f8; }
          a { color: #0066cc; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .url { word-break: break-all; overflow-wrap: anywhere; }
          @media (max-width: 768px) {
            body { padding: 15px; }
            h1 { font-size: 22px; margin-bottom: 18px; }
            table { font-size: 14px; }
            th, td { padding: 8px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Mapa do Site</h1>
          <xsl:choose>
            <xsl:when test="sitemap:sitemapindex">
              <table>
                <thead><tr><th>Sitemap</th><th>Última modificação</th></tr></thead>
                <tbody>
                  <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
                    <tr>
                      <td class="url"><a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a></td>
                      <td><xsl:value-of select="sitemap:lastmod"/></td>
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </xsl:when>
            <xsl:otherwise>
              <xsl:variable name="temLastmod" select="count(sitemap:urlset/sitemap:url/sitemap:lastmod) > 0"/>
              <xsl:variable name="temChangefreq" select="count(sitemap:urlset/sitemap:url/sitemap:changefreq) > 0"/>
              <xsl:variable name="temPriority" select="count(sitemap:urlset/sitemap:url/sitemap:priority) > 0"/>
              <table>
                <thead>
                  <tr>
                    <th>URL</th>
                    <xsl:if test="$temLastmod"><th>Última modificação</th></xsl:if>
                    <xsl:if test="$temChangefreq"><th>Frequência</th></xsl:if>
                    <xsl:if test="$temPriority"><th>Prioridade</th></xsl:if>
                  </tr>
                </thead>
                <tbody>
                  <xsl:for-each select="sitemap:urlset/sitemap:url">
                    <tr>
                      <td class="url"><a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a></td>
                      <xsl:if test="$temLastmod"><td><xsl:value-of select="sitemap:lastmod"/></td></xsl:if>
                      <xsl:if test="$temChangefreq"><td><xsl:value-of select="sitemap:changefreq"/></td></xsl:if>
                      <xsl:if test="$temPriority"><td><xsl:value-of select="sitemap:priority"/></td></xsl:if>
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </xsl:otherwise>
          </xsl:choose>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`;
}

export function getXmlHeader() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap/sitemap.xsl"?>`;
}

export function gerarArquivoXSLTSitemap(config) {
  return new Response(gerarXSLTSitemap(), {
    status: 200,
    headers: gerarHeadersCache(config, 'text/xsl; charset=utf-8')
  });
}

export function gerarXMLUrls(baseUrl, urls) {
  if (!urls || urls.length === 0) {
    return `${getXmlHeader()}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
  }
  return `${getXmlHeader()}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `
  <url>
    <loc>${baseUrl}${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('')}
</urlset>`;
}

// Busca paginada. Aceita filtro no formato { coluna, valor }.
// Ordena sempre pela primeira coluna do select para a paginação ser estável.
async function buscarTodos(supabase, tabela, colunas, filtro = null) {
  const pageSize = 1000;
  let todos = [];
  let from = 0;
  let to = pageSize - 1;

  const primeiraColuna = String(colunas).split(',')[0].trim();

  while (true) {
    let query = supabase.from(tabela).select(colunas);
    if (filtro && filtro.coluna) {
      query = query.eq(filtro.coluna, filtro.valor);
    }
    query = query.order(primeiraColuna);
    const { data, error } = await query.range(from, to);
    if (error) throw error;
    if (!data || data.length === 0) break;
    todos = todos.concat(data);
    from += pageSize;
    to += pageSize;
  }
  return todos;
}

async function contarComFiltro(supabase, tabela, colunaSelect, filtro = null) {
  try {
    let query = supabase.from(tabela).select(colunaSelect, { count: 'exact', head: true });
    if (filtro && filtro.coluna) {
      query = query.eq(filtro.coluna, filtro.valor);
    }
    const { count, error } = await query;
    if (error) return 0;
    return count ?? 0;
  } catch (_) {
    return 0;
  }
}

export async function existeRegistroAtivo(supabase, tabela) {
  return (await contarComFiltro(supabase, tabela, 'id')) > 0;
}

// Sitemap simples de uma tabela: uma linha por registro.
// `colunaSlug` é a coluna que alimenta o urlBuilder.
// `filtro` é opcional: { coluna, valor }.
export function criarSitemapTabela({
  loc,
  tabela,
  colunaSlug = 'slug',
  filtro = null,
  urlBuilder,
  changefreq,
  priority
}) {
  return {
    loc,
    deveIncluir: async (supabase) =>
      (await contarComFiltro(supabase, tabela, colunaSlug, filtro)) > 0,
    gerar: async (supabase, config) => {
      const baseUrl = config.dominio;
      let data;
      try {
        data = await buscarTodos(
          supabase,
          tabela,
          `${colunaSlug}, data_hora_atualizacao`,
          filtro
        );
      } catch (error) {
        console.error(`Erro ao buscar ${tabela}:`, error);
        return new Response('Erro interno', { status: 500 });
      }

      const urls = (data || []).map(item => ({
        loc: urlBuilder(item[colunaSlug]),
        lastmod: item.data_hora_atualizacao || new Date().toISOString(),
        changefreq,
        priority
      }));

      const xml = gerarXMLUrls(baseUrl, urls);
      return new Response(xml, {
        status: 200,
        headers: gerarHeadersCache(config, 'application/xml; charset=utf-8')
      });
    }
  };
}

// Sitemap cruzado: combina N queries independentes e delega no urlBuilder
// a geração da lista final de URLs.
// `queries`: [{ chave, tabela, select, filtro }]
// `urlBuilder`: (...resultados) => array de strings de URL (com barra inicial)
export function criarSitemapCruzado({ loc, changefreq, priority, queries, urlBuilder }) {
  return {
    loc,
    deveIncluir: async (supabase) => {
      try {
        for (const q of queries) {
          const n = await contarComFiltro(supabase, q.tabela, q.select, q.filtro || null);
          if (!n) return false;
        }
        return true;
      } catch (_) {
        return false;
      }
    },
    gerar: async (supabase, config) => {
      const baseUrl = config.dominio;
      try {
        const resultados = await Promise.all(
          queries.map(q => buscarTodos(supabase, q.tabela, q.select, q.filtro || null))
        );
        const listaUrls = urlBuilder(...resultados);
        const urls = (listaUrls || []).map(u => ({
          loc: u,
          changefreq,
          priority
        }));
        const xml = gerarXMLUrls(baseUrl, urls);
        return new Response(xml, {
          status: 200,
          headers: gerarHeadersCache(config, 'application/xml; charset=utf-8')
        });
      } catch (error) {
        console.error(`Erro ao gerar sitemap cruzado ${loc}:`, error);
        return new Response('Erro interno', { status: 500 });
      }
    }
  };
}

export async function gerarIndiceSitemap(config, supabase) {
  const baseUrl = config.dominio;
  const now = new Date().toISOString().split('T')[0];
  const itens = [];

  for (const s of sitemaps) {
    let incluir = true;
    if (typeof s.deveIncluir === 'function') {
      try {
        incluir = await s.deveIncluir(supabase, config);
      } catch (_) {
        incluir = false;
      }
    }
    if (incluir) itens.push({ loc: s.loc, lastmod: now });
  }

  const xml = `${getXmlHeader()}
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${itens.map(s => `
  <sitemap>
    <loc>${baseUrl}${s.loc}</loc>
    <lastmod>${s.lastmod}</lastmod>
  </sitemap>`).join('')}
</sitemapindex>`;

  return new Response(xml, {
    status: 200,
    headers: gerarHeadersCache(config, 'application/xml; charset=utf-8')
  });
}

export async function resolverSitemap(pathname, supabase, config) {
  const s = sitemaps.find(x => x.loc === pathname);
  if (!s) return new Response('Sitemap não encontrado', { status: 404 });
  return s.gerar(supabase, config);
}
