function carregaSlidesEstados() {

    defineVariaveisUniversais(slugDaPagina).then(config => {

    fetch('/configuracao/json/estados-slides.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro ao buscar dados. Código de status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {

            const slideEstados = document.getElementById('slideDeEstados');

            //SLIDES DOS ESTADOS
            data.forEach(item => {

                const slide = document.createElement('div');
                slide.classList.add('swiper-slide');

                const link = document.createElement('a');
                link.href = '/' + item.slug;

                const image = document.createElement('img');
                image.src = 'data:image/webp;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
                image.dataset.src = (config.cdn_imagens === 1 ? config.diretorio_cdn_imagens : '') + '/estados/' + item.imagem_destaque;
                image.dataset.srcset = (config.cdn_imagens === 1 ? config.diretorio_cdn_imagens : '') + '/estados/' + item.imagem_destaque + '?tr=w-940';
                image.title = item.titulo_imagem_destaque;
                image.alt = item.alt_imagem_destaque;
                image.width = '932';
                image.height = '524';
                image.classList.add('img-fluid', 'w-100');

                const titleOverlay = document.createElement('div');
                titleOverlay.classList.add('position-absolute', 'p-2', 'p-lg-3', 'b-0', 'w-100', 'bg-shadow', 'text-start');

                let categoryBadge = null;

                if (config.exibe_categorias_de_artigos === 1) {
                    categoryBadge = document.createElement('a');
                    categoryBadge.href = '/' + item.slug_categoria + '/';
                    categoryBadge.classList.add('p-2', 'badge', 'badge-primary', 'rounded-0');
                    categoryBadge.textContent = item.categoria;
                }

                const titleLink = document.createElement('a');
                titleLink.href = '/' + item.slug + '/';

                const title = document.createElement('h2');
                title.style.fontSize = '23px';
                title.classList.add('h5', 'text-white', 'my-1');
                title.textContent = item.titulo_breadcumb;

                titleLink.appendChild(title);
                config.exibe_categorias_de_artigos === 1 ? titleOverlay.appendChild(categoryBadge) : null;
                titleOverlay.appendChild(titleLink);
                link.appendChild(image);
                link.appendChild(titleOverlay);
                slide.appendChild(link);

                slideEstados.querySelector('.swiper-wrapper').appendChild(slide);
            });

            //INICIALIZA SLIDES INICIAIS
            var swiper = new Swiper('.mySwiper', {
                loop: true,
                grid: {
                    rows: 1,
                },
                autoplay: {
                    delay: 5000,
                },
                breakpoints: {
                    240: {
                        slidesPerView: 1,
                        spaceBetween: 20
                    },
                    768: {
                        slidesPerView: 4,
                        spaceBetween: 15
                    }
                }
            });

            AdiarImagens();

        })
        .catch(error => {
            console.error('Erro ao buscar dados:', error);
        });

    }).catch(error => {
        console.error('Erro ao buscar dados:', error);
    });

}

carregaSlidesEstados();