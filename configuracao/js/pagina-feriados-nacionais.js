function carregaCards(config) {
    let paginaAtual = 1;
    const numeroArtigosPorPagina = config.numero_artigos_pagina_categoria;
    let data;

    function exibirArtigosNaPagina(pagina) {
        const startIndex = (pagina - 1) * numeroArtigosPorPagina;
        const endIndex = startIndex + numeroArtigosPorPagina;
        const artigosDaPagina = data.slice(startIndex, endIndex);

        const cardHorizontalDeArtigosContainer = document.getElementById('cardHorizontalDeFeriados');
        cardHorizontalDeArtigosContainer.innerHTML = '';

        //SEÇÃO CARD HORIZONTAL DE ARTIGOS
        artigosDaPagina.forEach(item => {

            const article = document.createElement('div');
            article.classList.add('card', 'mb-3', 'card-noticias');

            const row = document.createElement('div');
            row.classList.add('row', 'g-0');

            // Imagem
            const colImagem = document.createElement('div');
            colImagem.classList.add('col-xl-6', 'col-xxl-6');
            const linkImagem = document.createElement('a');
            linkImagem.href = '/' + item.slug;
            const hoverContainer = document.createElement('div');
            hoverContainer.classList.add('hover', 'hover-3', 'text-white', 'secao-imagem');
            const imagem = document.createElement('img');
            imagem.src = 'data:image/webp;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
            imagem.setAttribute('data-src', (config.cdn_imagens === 1 ? config.diretorio_cdn_imagens : '') + '/img/anos/' + item.imagem_destaque);
            imagem.setAttribute('data-srcset',
                (config.cdn_imagens === 1 ? config.diretorio_cdn_imagens : '') + '/img/anos/' + item.imagem_destaque +
                '?tr=w-250 250w, ' +
                (config.cdn_imagens === 1 ? config.diretorio_cdn_imagens : '') + '/img/anos/' + item.imagem_destaque +
                '?tr=w-300 300w, ' +
                (config.cdn_imagens === 1 ? config.diretorio_cdn_imagens : '') + '/img/anos/' + item.imagem_destaque +
                '?tr=w-350 350w, ' +
                (config.cdn_imagens === 1 ? config.diretorio_cdn_imagens : '') + '/img/anos/' + item.imagem_destaque +
                '?tr=w-400 400w, ' +
                (config.cdn_imagens === 1 ? config.diretorio_cdn_imagens : '') + '/img/anos/' + item.imagem_destaque +
                '?tr=w-450 450w, ' +
                (config.cdn_imagens === 1 ? config.diretorio_cdn_imagens : '') + '/img/anos/' + item.imagem_destaque +
                '?tr=w-500 500w, ' +
                (config.cdn_imagens === 1 ? config.diretorio_cdn_imagens : '') + '/img/anos/' + item.imagem_destaque +
                '?tr=w-550 550w, ' +
                (config.cdn_imagens === 1 ? config.diretorio_cdn_imagens : '') + '/img/anos/' + item.imagem_destaque +
                '?tr=w-600 600w, ' +
                (config.cdn_imagens === 1 ? config.diretorio_cdn_imagens : '') + '/img/anos/' + item.imagem_destaque +
                '?tr=w-650 650w, ' +
                (config.cdn_imagens === 1 ? config.diretorio_cdn_imagens : '') + '/img/anos/' + item.imagem_destaque +
                '?tr=w-700 700w, ' +
                (config.cdn_imagens === 1 ? config.diretorio_cdn_imagens : '') + '/img/anos/' + item.imagem_destaque +
                '?tr=w-750 750w, ' +
                (config.cdn_imagens === 1 ? config.diretorio_cdn_imagens : '') + '/img/anos/' + item.imagem_destaque +
                '?tr=w-800 800w, ' +
                (config.cdn_imagens === 1 ? config.diretorio_cdn_imagens : '') + '/img/anos/' + item.imagem_destaque +
                '?tr=w-850 850w, ' +
                (config.cdn_imagens === 1 ? config.diretorio_cdn_imagens : '') + '/img/anos/' + item.imagem_destaque +
                '?tr=w-900 900w, ' +
                (config.cdn_imagens === 1 ? config.diretorio_cdn_imagens : '') + '/img/anos/' + item.imagem_destaque +
                '?tr=w-950 950w'
            );
            imagem.setAttribute('sizes', '(max-width: 125px), ' +
                '(max-width: 150px), ' +
                '(max-width: 175px), ' +
                '(max-width: 200px), ' +
                '(max-width: 225px), ' +
                '(max-width: 250px), ' +
                '(max-width: 275px), ' +
                '(max-width: 300px), ' +
                '(max-width: 325px), ' +
                '(max-width: 350px), ' +
                '(max-width: 375px), ' +
                '(max-width: 400px), ' +
                '(max-width: 425px), ' +
                '(max-width: 450px), ' +
                '(max-width: 475px), ' +
                '(-webkit-min-device-pixel-ratio: 1.1) AND (-webkit-max-device-pixel-ratio: 1.5) 80.5vw, ' +
                '(-webkit-min-device-pixel-ratio: 1.6) AND (-webkit-max-device-pixel-ratio: 2) 75.5vw, ' +
                '(-webkit-min-device-pixel-ratio: 2.1) AND (-webkit-max-device-pixel-ratio: 2.5) 55.8vw, ' +
                '(-webkit-min-device-pixel-ratio: 2.6) AND (-webkit-max-device-pixel-ratio: 3) 51.86vw, ' +
                '(-webkit-min-device-pixel-ratio: 3.1) AND (-webkit-max-device-pixel-ratio: 3.5) 42.67vw, ' +
                '(-webkit-min-device-pixel-ratio: 3.6) AND (-webkit-max-device-pixel-ratio: 4) 37.42vw');
            imagem.title = item.titulo_imagem_destaque;
            imagem.alt = item.alt_imagem_destaque;
            imagem.width = '1200';
            const hoverOverlay = document.createElement('div');
            hoverOverlay.classList.add('hover-overlay');
            const hoverContent = document.createElement('div');
            hoverContent.classList.add('hover-3-content', 'px-5', 'py-4');
            const readMoreSpan = document.createElement('span');
            readMoreSpan.classList.add('hover-3-description', 'text-uppercase', 'mb-0', 'h3');
            readMoreSpan.textContent = 'LEIA MAIS';

            hoverContent.appendChild(readMoreSpan);
            hoverContainer.appendChild(imagem);
            hoverContainer.appendChild(hoverOverlay);
            hoverContainer.appendChild(hoverContent);
            colImagem.appendChild(linkImagem);
            linkImagem.appendChild(hoverContainer);

            // Texto
            const colTexto = document.createElement('div');
            colTexto.classList.add('col-xl-6', 'col-xxl-6');
            const cardBody = document.createElement('div');
            cardBody.classList.add('card-body', 'secao-texto', 'p-4');
            const conteudo = document.createElement('div');
            conteudo.classList.add('conteudo', 'mb-4', 'mb-lg-3', 'mb-xl-4');
            const tituloLink = document.createElement('a');
            tituloLink.href = '/' + item.slug;
            const titulo = document.createElement('h2');
            titulo.classList.add('card-title', 'mb-3', 'h5');
            titulo.textContent = item.titulo_breadcumb;
            tituloLink.appendChild(titulo);
            conteudo.appendChild(tituloLink);
            const descricao = document.createElement('p');
            descricao.classList.add('card-text');
            descricao.textContent = item.descricao + ' [...]';

            // Rodapé
            const rodape = document.createElement('ul');
            rodape.classList.add('rodape', 'mb-0', 'pt-xl-1', 'pt-xxl-4');
            const liData = document.createElement('li');
            const dataPublicacao = document.createElement('small');
            dataPublicacao.textContent = calcularDiferencaTempo(item.data_hora_criacao);
            liData.appendChild(dataPublicacao);
            const liComentarios = document.createElement('li');
            liComentarios.innerHTML = '<i class="ti-comment"></i>' + item.total_comentarios;

            rodape.appendChild(liData);
            rodape.appendChild(liComentarios);

            // Monta a estrutura do card
            cardBody.appendChild(conteudo);
            cardBody.appendChild(descricao);
            cardBody.appendChild(rodape);
            colTexto.appendChild(cardBody);

            row.appendChild(colImagem);
            row.appendChild(colTexto);
            article.appendChild(row);

            cardHorizontalDeArtigosContainer.appendChild(article);

        });

        // Adia as imagens (se necessário)
        AdiarImagens();
    }

    function exibirPaginacao() {
        const totalPages = Math.ceil(data.length / numeroArtigosPorPagina);
        const paginationContainer = document.querySelector('#divPaginacao');

        // Limpa a paginação antes de exibir as páginas
        paginationContainer.innerHTML = '';

        const paginationList = document.createElement('ul');
        paginationList.classList.add('pagination');

        // Adiciona o botão "Anterior" se houver uma página anterior
        if (paginaAtual > 1) {
            const prevPageItem = document.createElement('li');
            const prevPageLink = document.createElement('a');
            prevPageLink.classList.add('page-link');
            prevPageLink.style.fontSize = '20px';
            prevPageLink.href = paginaAtual === 2 ? '/noticias/' : `?pagina=${paginaAtual - 1}`;
            prevPageLink.title = 'página anterior';
            prevPageLink.textContent = '<';

            prevPageItem.appendChild(prevPageLink);
            paginationList.appendChild(prevPageItem);
        }

        for (let i = 1; i <= totalPages; i++) {
            const paginationItem = document.createElement('li');

            if (i === paginaAtual) {
                const activeLink = document.createElement('a');
                activeLink.classList.add('active');
                activeLink.href = i === 1 ? '/noticias/' : `?pagina=${i}`;
                activeLink.title = `página ${i}`;
                activeLink.textContent = i;

                paginationItem.appendChild(activeLink);
            } else {
                const pageLink = document.createElement('a');
                pageLink.classList.add('page-link');
                pageLink.href = i === 1 ? '/noticias/' : `?pagina=${i}`;
                pageLink.title = `página ${i}`;
                pageLink.textContent = i;

                paginationItem.appendChild(pageLink);
            }

            paginationList.appendChild(paginationItem);
        }

        // Adiciona o botão "Próxima página" se houver uma próxima página
        if (paginaAtual < totalPages) {
            const nextPageItem = document.createElement('li');
            const nextPageLink = document.createElement('a');
            nextPageLink.classList.add('page-link');
            nextPageLink.style.fontSize = '20px';
            nextPageLink.href = `?pagina=${paginaAtual + 1}`;
            nextPageLink.title = 'próxima página';
            nextPageLink.textContent = '>';

            nextPageItem.appendChild(nextPageLink);
            paginationList.appendChild(nextPageItem);
        }

        // Adiciona o wrapper ao contêiner de paginação
        paginationContainer.appendChild(paginationList);
    }

    function updateURL() {
        const params = new URLSearchParams(window.location.search);
        params.set('pagina', paginaAtual);
        window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
    }

    fetch('/configuracao/json/feriados-nacionais.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro ao buscar dados. Código de status: ${response.status}`);
            }
            return response.json();
        })
        .then(responseData => {
            data = responseData;

            // Verifica se há um parâmetro 'pagina' na URL e atualiza a página
            const urlParams = new URLSearchParams(window.location.search);
            const pageParam = urlParams.get('pagina');
            if (pageParam && !isNaN(pageParam)) {
                paginaAtual = parseInt(pageParam, 10);
            }

            // Exibe os artigos na página atual e a paginação
            exibirArtigosNaPagina(paginaAtual);
            exibirPaginacao();
        })
        .catch(error => {
            console.error('Erro ao buscar dados:', error);
        });
}

/* FUNÇÃO PARA CRIAR SECTION E CARREGAR O CONTEÚDO EM DESTAQUE */
function carregaConteudoDestaque(config) {

    fetch('/configuracao/json/conteudo-destaque.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro ao buscar dados. Código de status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            
            if (data.length > 0 && config.conteudo_destaque_pagina_categoria === 1) {
                let link = '';
            
                data.forEach(conteudo => {
                    const imagem = (conteudo.tipo === 'artigos' ? `/usuarios/${conteudo.slug_tipo_autor}/${conteudo.slug_autor}/artigos/thumb/${conteudo.imagem_destaque}` : `/ferramentas/${conteudo.imagem_destaque}`);
                    const slugConteudo = (conteudo.tipo === 'artigos' ? conteudo.slug : `ferramenta/${conteudo.slug}`);
                    const categoria = (conteudo.tipo === 'artigos' ? conteudo.categoria.toUpperCase() : conteudo.tipo.toUpperCase());
            
                    link += `
                        <li>
                            <div class="alignleft shadow-sm">
                                <a href="/${slugConteudo}/">
                                    <figure>
                                        <img width="95px" height="53px" src="data:image/webp;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" data-src="${(config.cdn_imagens === 1 ? config.diretorio_cdn_imagens : "/img")}${imagem}" data-srcset="${(config.cdn_imagens === 1 ? config.diretorio_cdn_imagens : "/img")}${imagem}?tr=w-150" class="img-fluid" alt="${conteudo.alt_imagem_destaque}" title="${conteudo.titulo_imagem_destaque}" itemprop="image">
                                    </figure>
                                </a>
                            </div>
                            <small class="p-1 badge badge-primary rounded-0">${categoria}</small>
                            <h4><a href="/${slugConteudo}/">${conteudo.titulo_breadcumb}</a></h4>
                        </li>
                    `;
                });
            
                const conteudosEmDestaque = `
                    <div id="destaqueWidget" class="box_detail widget">
                        <div class="titulo_secao">
                            <h3 class="titulo">DESTAQUE</h3>
                        </div>
                        <div class="secao_artigos_em_destaque conteudo_secao_sidebar">
                            <ul>
                                ${link}
                            </ul>
                        </div>
                    </div>
                `;
                
                const sidebar = document.querySelector('aside');
                sidebar.insertAdjacentHTML("beforeend", conteudosEmDestaque);
                
            }
            
            AdiarImagens();
        
        })
        .catch(error => {
            console.error('Erro ao buscar dados:', error);
        });

}
/* FUNÇÃO PARA CRIAR SECTION E CARREGAR O CONTEÚDO EM DESTAQUE */

defineVariaveisUniversais().then(config => {
    carregaCards(config)
}).catch(error => {
    console.error('Erro ao buscar dados:', error);
});