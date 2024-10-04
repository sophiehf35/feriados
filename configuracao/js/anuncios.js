window.addEventListener("DOMContentLoaded", function() {

    if (document.querySelector('h1').dataset.nomePagina === 'home') {

        //INSERE ANUNCIOS NA PAGINA HOME

        inserirAnuncio('anuncioDiv1_desktop', '3e9f61e063c5fc84a5dd322cbb2735a4', 60, 468, '//www.topcreativeformat.com/3e9f61e063c5fc84a5dd322cbb2735a4/invoke.js');
        inserirAnuncio('anuncioDiv1_mobile', 'b1000047c9b6c6b178480d7dc2f38cd6', 250, 300, '//www.topcreativeformat.com/b1000047c9b6c6b178480d7dc2f38cd6/invoke.js');
        inserirAnuncio('anuncioDiv2_desktop', 'b1000047c9b6c6b178480d7dc2f38cd6', 250, 300, '//www.topcreativeformat.com/b1000047c9b6c6b178480d7dc2f38cd6/invoke.js');
        inserirAnuncio('anuncioDiv2_mobile', '0a68be50fbc2e928e7f99ad53da57021', 300, 160, '//www.topcreativeformat.com/0a68be50fbc2e928e7f99ad53da57021/invoke.js');
        inserirAnuncio('anuncioDiv3', '15c285e51680cc952b97285d8cb103a5', 90, 728, '//www.topcreativeformat.com/15c285e51680cc952b97285d8cb103a5/invoke.js');

    } else if (document.querySelector('h1').dataset.tipoPagina === 'ano' || document.querySelector('h1').dataset.tipoPagina === 'estado' || document.querySelector('h1').dataset.tipoPagina === 'cidade' || document.querySelector('h1').dataset.tipoPagina === 'mes') {

        //INSERE AS DIVS DOS ANUNCIOS NO HTML DAS PAGINAS DE FERIADOS (ANO, ESTADO, CIDADE E MESES)

        //ANUNCIO 1
        const anuncio1 = `<div style="box-shadow: 0px 0px 30px 0px rgb(0 0 0 / 10%); background-color: #fff; margin-top: 25px; border-radius: 3px;" class="box_account text-center">
            <div class="col-12 d-none d-md-block d-lg-block pt-2 pb-1" id="anuncioDiv1_desktop"></div>
            <div class="col-12 d-block d-md-none d-lg-none pt-2 pb-1" id="anuncioDiv1_mobile"></div>
        </div>`;
        const tempDiv1 = document.createElement('div');
        tempDiv1.innerHTML = anuncio1;
        document.querySelector('section').insertAdjacentElement('beforeend', tempDiv1.firstChild);

        //ANUNCIO 2
        const anuncio2 = `<div class="text-center">
            <div class="col-12 d-none d-md-block d-lg-block" id="anuncioDiv2"></div>
        </div>`;
        const tempDiv2 = document.createElement('div');
        tempDiv2.innerHTML = anuncio2;
        document.getElementById('rastrear_objeto').insertAdjacentElement('afterend', tempDiv2.firstChild);

        //ANUNCIO 3
        const anuncio3 = `<div class="box_detail widget">
            <div class="titulo_secao">
                <h3 class="titulo">ANÃšNCIO</h3>
            </div>
            <div class="conteudo_secao_sidebar">
                <div class="text-center">
                    <div class="col-12 d-none d-md-block d-lg-block" id="anuncioDiv3"></div>
                </div>
            </div>
        </div>`;
        const tempDiv3 = document.createElement('div');
        tempDiv3.innerHTML = anuncio3;
        document.querySelector('aside').insertBefore(tempDiv3.firstChild, document.querySelector('aside').firstChild);

        //INSERE ANUNCIOS NAS PAGINAS DE UNIDADES (ANO, ESTADO, CIDADE E MESES)

        inserirAnuncio('anuncioDiv1_desktop', '3e9f61e063c5fc84a5dd322cbb2735a4', 60, 468, '//www.topcreativeformat.com/3e9f61e063c5fc84a5dd322cbb2735a4/invoke.js');
        inserirAnuncio('anuncioDiv1_mobile', 'b1000047c9b6c6b178480d7dc2f38cd6', 250, 300, '//www.topcreativeformat.com/b1000047c9b6c6b178480d7dc2f38cd6/invoke.js');
        inserirAnuncio('anuncioDiv2', 'b1000047c9b6c6b178480d7dc2f38cd6', 250, 300, '//www.topcreativeformat.com/b1000047c9b6c6b178480d7dc2f38cd6/invoke.js');
        inserirAnuncio('anuncioDiv3', '0a68be50fbc2e928e7f99ad53da57021', 300, 160, '//www.topcreativeformat.com/0a68be50fbc2e928e7f99ad53da57021/invoke.js');
        
    }

});