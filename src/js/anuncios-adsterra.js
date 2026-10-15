// src/js/anuncios-adsterra.js

function inserirAnuncio(div, anuncio) {
  if (!div) return;
  div.innerHTML = '';

  if (anuncio.tipo === 'iframe') {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('width', anuncio.largura || 0);
    iframe.setAttribute('height', anuncio.altura || 0);
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('scrolling', 'no');
    iframe.style.margin = '0 auto';
    iframe.style.display = 'block';
    div.appendChild(iframe);

    function injectScripts() {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        if (!doc) {
          setTimeout(injectScripts, 100);
          return;
        }
        const script1 = doc.createElement('script');
        script1.textContent = `
          try {
            Object.defineProperty(this, 'atOptions', {
              value: {
                'key' : '${anuncio.chave}',
                'format' : 'iframe',
                'height' : ${anuncio.altura},
                'width' : ${anuncio.largura},
                'params' : {}
              },
              writable: true,
              configurable: true,
              enumerable: true
            });
          } catch(e) {
            window.atOptions = {
              'key' : '${anuncio.chave}',
              'format' : 'iframe',
              'height' : ${anuncio.altura},
              'width' : ${anuncio.largura},
              'params' : {}
            };
          }
        `;
        doc.head.appendChild(script1);

        const script2 = doc.createElement('script');
        script2.src = anuncio.script_src;
        script2.async = true;
        script2.onerror = function() {
          console.warn('Erro ao carregar script de anúncio:', anuncio.script_src);
        };
        doc.head.appendChild(script2);
      } catch (e) {
        console.error('Erro ao injetar anúncio no iframe:', e);
      }
    }
    setTimeout(injectScripts, 50);
  } else if (anuncio.tipo === 'html' && anuncio.conteudo_html) {
    div.innerHTML = anuncio.conteudo_html;
  }
}

export function injetarAnuncios() {
  const config = window.__ANUNCIOS_CONFIG || {};
  if (Object.keys(config).length === 0) return;

  const isMobile = window.innerWidth < 768;

  for (const [posicao, anuncios] of Object.entries(config)) {
    const isMobilePos = posicao.includes('mobile');
    const isDesktopPos = posicao.includes('desktop');

    if ((isMobile && isMobilePos) || (!isMobile && isDesktopPos) || (!isMobilePos && !isDesktopPos)) {
      const divs = document.querySelectorAll(`[data-posicao="${posicao}"]`);
      divs.forEach(div => {
        div.classList.remove('hidden');
        div.style.display = 'flex';
        div.style.justifyContent = 'center';
        div.style.alignItems = 'center';
        div.style.width = '100%';
        div.innerHTML = '';

        anuncios.forEach(anuncio => {
          const innerDiv = document.createElement('div');
          innerDiv.className = 'anuncio-item';
          innerDiv.style.display = 'flex';
          innerDiv.style.justifyContent = 'center';
          innerDiv.style.width = '100%';
          div.appendChild(innerDiv);
          inserirAnuncio(innerDiv, anuncio);
        });
      });
    }
  }
}