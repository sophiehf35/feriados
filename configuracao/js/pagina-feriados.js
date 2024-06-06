document.addEventListener('DOMContentLoaded', function() {

  var acessoMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);

  //FUNÇÃO PARA ABREVIAR NOMES DOS MESES
  if (acessoMobile) {
      // Abreviar nomes dos meses
      const linhasData = document.querySelectorAll("table.tabela-customizada.feriados > tbody > tr > td.th");
      if (linhasData !== null) {
          for (const linha of linhasData) {
              const mes = linha.textContent.split(" ").splice(-1)[0];
              const mesAbreviado = mes.substring(0, 3);
              linha.textContent = linha.textContent.replace(mes, mesAbreviado);
          }
      }

      // Adicionar botão e processar descrições
      const linhasDescricao = document.querySelectorAll("table.tabela-customizada.feriados > tbody > tr > td:nth-child(2)");
      if (linhasDescricao !== null) {
          for (const linha of linhasDescricao) {
              const possuiDescricao = linha.textContent.match(/\(([^)]+)\)/);
              if (possuiDescricao !== null) {
                  if (linha.textContent.indexOf('Feriado Municipal') !== -1) {
                      const texto = linha.textContent.replace(possuiDescricao[1], "").replace("()", "");
                      linha.textContent = '';
                      linha.insertAdjacentHTML('afterbegin', '<b>' + texto + '</b>');
                      linha.insertAdjacentHTML('beforeend', '<button style="padding: 5px 5px; line-height: 10px; float: right; text-transform: lowercase;" class="btn btn-success botaoDescricao fechado" type="button">ver</button>');

                      // Adicionar o botão para exibir descrição
                      const botao = linha.children[1];
                      botao.dataset.descricao = possuiDescricao[1];

                  } else {
                      linha.textContent = linha.textContent.replace(possuiDescricao[1], "").replace("()", "");
                      linha.insertAdjacentHTML('beforeend', '<button style="padding: 5px 5px; line-height: 10px; float: right; text-transform: lowercase;" class="btn btn-success botaoDescricao fechado" type="button">ver</button>');

                      // Adicionar o botão para exibir descrição
                      const botao = linha.children[0];
                      botao.dataset.descricao = possuiDescricao[1];
                  }
              }
          }
      }
  }

  //FUNÇÃO PARA INSERIR BOTÃO DE IMPRIMIR TABELA ABAIXO DE TODAS AS TABELAS DE FERIADO
  if (!acessoMobile) {
      const tabela = document.querySelector('table.tabela-customizada.feriados');
      if (tabela !== null) {
          const button = document.createElement('button');
          button.id = 'imprimirTableFeriados';
          button.style.width = '100%';
          button.style.marginTop = '10px';
          button.className = 'btn_1 full-width fe-pulse';
          button.type = 'button';
          button.textContent = 'IMPRIMIR OU SALVAR TABELA';
          tabela.insertAdjacentElement('afterend', button);
      }
  }

  //FUNÇÃO PARA CARREGAR CALENDÁRIO (POPOVERS E DADOS)
  var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
  var popoverList = popoverTriggerList.map(function(popoverTriggerEl) {
      return new bootstrap.Popover(popoverTriggerEl)
  })
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
  })

  const hoje = new Date().toISOString().split('T')[0];

  const popups = {};
  for (const data in feriados) {
      if (feriados.hasOwnProperty(data)) {
          const feriado = feriados[data];
          popups[data] = {
              modifier: feriado.classe,
          };
      }
  }

  const calendar = new VanillaCalendar('#calendar', {
      type: 'multiple',
      months: 12,
      settings: {
          lang: 'pt-br',
          visibility: {
              theme: 'light',
              weekend: false,
              daysOutside: false,
          },
          selection: {
              day: false,
              month: false,
              year: false,
          },
          selected: {
              month: 0,
          },
      },
      popups: popups,
  });
  calendar.init();

  var isMobile = ('ontouchstart' in window);
  var popoverElements = document.getElementById('calendar').querySelectorAll('.bg-feriado-nacional, .bg-ponto-facultativo');

  popoverElements.forEach(function(popoverElement) {
      const data = popoverElement.dataset.calendarDay;
      const feriado = feriados[data];
      new bootstrap.Popover(popoverElement, {
          trigger: isMobile ? 'focus' : 'hover',
          placement: 'top',
          title: feriado.tipo,
          content: feriado.nome + '(' + feriado.descricao + ')',
          html: true
      });
  });

});


//FUNÇÃO PARA EXIBIR E OCULTAR DESCRIÇÃO DO DIA
document.addEventListener('click', function(event) {
  const target = event.target;

  if (target.classList.contains('botaoDescricao')) {
      if (target.classList.contains('aberto')) {
          target.classList.remove('aberto');
          target.classList.add('fechado');
          target.classList.remove('btn-secondary');
          target.classList.add('btn-success');
          target.innerHTML = 'ver';
          const parent = target.parentElement;
          const divElement = parent.querySelector('div');
          if (divElement) {
              parent.removeChild(divElement);
          }
      } else if (target.classList.contains('fechado')) {
          target.classList.remove('fechado');
          target.classList.add('aberto');
          target.classList.remove('btn-success');
          target.classList.add('btn-secondary');
          target.innerHTML = 'ocultar';
          const parent = target.parentElement;
          const descricaoDiv = document.createElement('div');
          descricaoDiv.className = 'descricao';
          descricaoDiv.style.marginTop = '10px';
          descricaoDiv.innerHTML = '<span>' + target.dataset.descricao + '</span>';
          parent.appendChild(descricaoDiv);
      }
  }
});

//FUNÇÃO PARA IMPRIMIR TABELA DE FERIADOS
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('imprimirTableFeriados').addEventListener("click", function (event) {
      const tituloDocumento = document.querySelector('#pagina-feriados h2').textContent;
      const printWindow = window.open();
      if (printWindow) {
        printWindow.document.write(`<html><head><title>${tituloDocumento} (fonte: www.feriadosweb.com.br)</title>`);
        printWindow.document.write('<style type="text/css">body{-webkit-print-color-adjust:exact}@page{size: landscape;}.tabela-customizada.feriados{border-collapse: collapse;margin-top: 15px;margin-bottom: 15px;font-family: sans-serif;width: 100%;box-shadow: 0 0 20px rgb(0 0 0 / 15%);}.tabela-customizada tbody tr {border-bottom: 1px solid #ddd;}.tabela-customizada tbody tr td.th {background: #005c82;color: #fff;text-transform: uppercase;}.tabela-customizada td, .tabela-customizada th {padding: 5px 15px; margin-top: 0px;margin-bottom: 0px;}</style>');
        printWindow.document.write('</head><body>');
        const tabela = document.getElementsByClassName("tabela-customizada feriados")[0].innerHTML;
        printWindow.document.write('<table class="tabela-customizada feriados">' + tabela.replace(/<\/?[a][a-z0-9]*[^<>]*>|<!--.*?-->/g, "") + '</table>');
        printWindow.document.write('</body>');
        printWindow.document.write('</html>');
        printWindow.document.close();
        printWindow.print();
      } else {
        console.error('Erro ao abrir a visualização de impressão.');
      }
  });
});


/* FUNÇÃO EXIBIR SUMÁRIO */
window.addEventListener("DOMContentLoaded", function (event) {
    var contentContainer = document.getElementById("paginas-feriados");
    var headings_geral = contentContainer.querySelectorAll("h2, h3, h4, h5");
    
    var headings = Array.from(headings_geral).filter(function(heading) {
      var tag = heading.tagName.toLowerCase();
      var text = heading.textContent.trim();
      return (
        (tag === "h3" && text !== "IMAGEM DE CAPA" && text !== "ANÚNCIO" && text !== "LEGENDA CALENDÁRIO" && text !== "SUMÁRIO" && text !== "VER NO MAPA" && text !== "LINKS ÚTEIS" && text !== "DEIXE UM COMENTÁRIO" && text !== "COMENTÁRIOS") ||
        (tag === "h2" || tag === "h4" || tag === "h5")
      );
    });
  
    var tocContainer = document.getElementById("toc");
    var ul = document.createElement("ul");
  
    ul.setAttribute("id", "tocList");
    ul.setAttribute("class", "sidenav");
  
    for (i = 0; i <= headings.length - 1; i++) {
      var id = headings[i].innerHTML
        .toLowerCase()
        .replace(",", "")
        .replace("!", "")
        .replace(".", "")
        .replace(/ /g, "-");
      var level = headings[i].localName.replace("h", "");
      var title = headings[i].innerHTML;
  
      headings[i].setAttribute("id", id);
  
      var li = document.createElement("li");
      li.setAttribute("class", "sidenav__item");
  
      var a = document.createElement("a");
      a.setAttribute("href", "#" + id);
      a.innerHTML =
        "<span style='justify-content: center; align-items: center; line-height: unset;' class='mx-1' data-icon='&#x39;'></span>" +
        title;
  
      li.setAttribute("class", "sidenav__item");
  
      if (level == 2) {
        li.appendChild(a);
        ul.appendChild(li);
      } else if (level == 3) {
        li.setAttribute("style", "padding-left: 1rem;");
        li.appendChild(a);
        ul.appendChild(li);
      } else if (level == 4) {
        li.setAttribute("style", "padding-left: 2rem;");
        li.appendChild(a);
        ul.appendChild(li);
      } else if (level == 5) {
        li.setAttribute("style", "padding-left: 3rem;");
        li.appendChild(a);
        ul.appendChild(li);
      }
    }
  
    toc.appendChild(ul);
  
    var links = tocContainer.getElementsByClassName("sidenav__item");
  
    links[0].classList.add("current");
  
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener("click", function () {
        var current = document.getElementsByClassName("current");
        current[0].className = current[0].className.replace(" current", "");
        this.className += " current";
      });
    }
  });
  /* FUNÇÃO EXIBIR SUMÁRIO */
  
  /* FUNÇÃO CLIQUE PARA RESPONDER COMENTÁRIOS */
  document.addEventListener("click", function(event) {
      if (event.target.classList.contains("responder")) {
          // Scroll
          var botaoEnviaComentario = document.querySelector(".botao_envia_comentario");
          if (botaoEnviaComentario) {
              var scrollTopValue = botaoEnviaComentario.offsetTop;
              window.scrollTo({
                  top: scrollTopValue,
                  behavior: "smooth"
              });
          }
  
          // Setar o valor do ID
          var id = event.target.getAttribute("id");
          var idInput = document.getElementById("id");
          if (idInput) {
              idInput.value = id;
          }
  
          // Dar foco no campo nome
          var nomeInput = document.getElementById("nome");
          if (nomeInput) {
              nomeInput.focus();
          }
      }
  });
  /* FUNÇÃO CLIQUE PARA RESPONDER COMENTÁRIOS */
  
  /* FUNÇÃO PARA VALIDAR E ENVIAR FORMULÁRIO DE COMENTÁRIO */
  const formComentario = document.querySelector("#formularioDeComentario");
  const id_comentario = formComentario.querySelector("#id").value;
  const tipo_pagina = document.querySelector("h1").dataset.tipoPagina;
  const id_pagina = document.querySelector("h1").dataset.id;
  
  const inputNomeComentario = formComentario.querySelector("#nome");
  const inputEmailComentario = formComentario.querySelector("#email");
  const inputSexoComentario = formComentario.querySelector("#sexo");
  const inputAvaliacaoComentario = formComentario.querySelector("#avaliacao");
  const inputMensagemComentario = formComentario.querySelector("#mensagem");
  
  const botaoEnviarComentario = document.querySelector("#envia_comentario");
  const divNotificacaoComentario = document.querySelector("#div_notificacao_comentario");
  const divBarraComentario = document.querySelector("#div_barra_comentario");
  
  function validarFormularioComentario(config) {
      botaoEnviarComentario.addEventListener("click", function (event) {
        event.preventDefault();
        
        if (inputNomeComentario.value === "") {
          //CAMPO DO NOME VAZIO
          exibirNotificacaoComentario("erro", "Erro, preencha seu nome", inputNomeComentario);
        } else if (inputEmailComentario.value === "") {
          //CAMPO DO EMAIL VAZIO
          exibirNotificacaoComentario("erro", "Erro, preencha seu email", inputEmailComentario);
        } else if (validarEmail(inputEmailComentario.value) !== true) {
          //EMAIL INVÁLIDO
          exibirNotificacaoComentario("erro", "Erro, preencha com um email válido", inputEmailComentario);
        } else if (inputSexoComentario.value === "") {
          //CAMPO DO DEPARTAMENTO VAZIO
          exibirNotificacaoComentario("erro", "Erro, selecione o seu sexo", inputSexoComentario);
        } else if (inputAvaliacaoComentario.value === "") {
          //CAMPO DO DEPARTAMENTO VAZIO
          exibirNotificacaoComentario("erro", "Erro , selecione sua nota", inputAvaliacaoComentario);
        } else if (inputMensagemComentario.value === "") {
          //CAMPO DE MENSAGEM VAZIA
          exibirNotificacaoComentario("erro", "Erro, preencha sua mensagem", inputMensagemComentario);
        } else {
          //TODOS OS CAMPOS PREENCHIDOS
          divBarraComentario.innerHTML =
            '<div style="height: 1.5rem;" class="progress"><div class="progress-bar progress-bar-striped progress-bar-animated bg-success" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div></div>';
      
          divBarraComentario.classList.remove("d-none");
          divBarraComentario.classList.add("d-block", "fade", "show");
          criaBarraProgresso(1350);
      
          setTimeout(function () {
            enviaComentario(
              config.id,
              tipo_pagina,
              id_pagina,
              inputNomeComentario.value,
              inputEmailComentario.value,
              inputSexoComentario.value,
              inputAvaliacaoComentario.value,
              inputMensagemComentario.value
            );
          }, 600);
        }
      });
      
      inputNomeComentario.addEventListener("focus", function () {
        ocultaNotificacaoComentario(verificaTipoAlerta(), inputNomeComentario);
      });
      
      inputEmailComentario.addEventListener("focus", function () {
        ocultaNotificacaoComentario(verificaTipoAlerta(), inputEmailComentario);
      });
      
      inputSexoComentario.addEventListener("focus", function () {
        ocultaNotificacaoComentario(verificaTipoAlerta(), inputSexoComentario);
      });
      
      inputAvaliacaoComentario.addEventListener("focus", function () {
        ocultaNotificacaoComentario(verificaTipoAlerta(), inputAvaliacaoComentario);
      });
      
      inputMensagemComentario.addEventListener("focus", function () {
        ocultaNotificacaoComentario(verificaTipoAlerta(), inputMensagemComentario);
      });
      
      inputNomeComentario.addEventListener("input", function (event) {
        var valorCampo = this.value;
        var valorFiltrado = valorCampo.replace(/[^a-zA-ZÀ-ÿ\s]/g, ""); // Permite apenas letras, incluindo letras acentuadas e espaços
        this.value = valorFiltrado;
      });
  }
  
  function enviaComentario(id_site, nome, email, sexo, avaliacao, mensagem) {
    const data = new URLSearchParams();
    data.append("funcao", "AdicionarComentariosPaginaDeArtigos");
    data.append("parametro1_da_funcao", id_site);
    data.append("parametro2_da_funcao", tipo_pagina);
    data.append("parametro3_da_funcao", id_pagina);
    data.append("id", id_comentario);
    data.append("nome", nome);
    data.append("email", email);
    data.append("sexo", sexo);
    data.append("avaliacao", avaliacao);
    data.append("mensagem", mensagem);
  
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: data.toString(),
    };
  
    fetch(config.endereco_funcao_php, options)
      .then((response) => {
        if (!response.ok) {
          console.error("Erro na solicitação: " + response.status);
          return;
        }
        return response.json();
      })
      .then((data) => {
        ocultaBarraComentario();
        if (data.status == 1) {
          exibirNotificacaoComentario(
            "sucesso",
            "Parabéns, comentário enviado com sucesso, em breve será revisado."
          );
        } else {
          exibirNotificacaoComentario("erro", data.mensagem, "");
        }
      })
      .catch((error) => {
        console.error("Ocorreu um erro durante a solicitação:", error);
      });
  }
  
  function exibirNotificacaoComentario(tipo, mensagem, campo) {
    var classeMensagem = "";
  
    if (tipo == "erro") {
      classeMensagem = "danger";
      iconeMensagem = "#exclamation-triangle-fill";
      campo.classList.add("is-invalid");
    } else if (tipo == "sucesso") {
      classeMensagem = "success";
      iconeMensagem = "#check-circle-fill";
    }
  
    divNotificacaoComentario.innerHTML =
      '<div class="alert alert-' +
      classeMensagem +
      ' alert-dismissible d-flex align-items-center" style="margin-bottom:0px;" role="alert"><svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="' +
      tipo +
      ':"><use xlink:href="/assets/svg/icones.svg' +
      iconeMensagem +
      '"></use></svg><div>' +
      mensagem +
      '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div></div>';
  
    divNotificacaoComentario.classList.add("d-block", "fade", "show");
    divNotificacaoComentario.classList.remove("d-none");
    verificaFechamentoNotificacao("comentario", campo);
  }
  
  function ocultaNotificacaoComentario(tipo, campo) {
    if (tipo == "erro") {
        campo.classList.remove("is-invalid");
        divNotificacaoComentario.classList.remove("show");
        divNotificacaoComentario.classList.add("fade", "d-none");
        divNotificacaoComentario.innerHTML = "";
    } else if (tipo == "sucesso") {
        divNotificacaoComentario.classList.remove("show");
        divNotificacaoComentario.classList.add("fade", "d-none");
        divNotificacaoComentario.innerHTML = "";
    }
  }
  
  function ocultaBarraComentario() {
    divBarraComentario.innerHTML = "";
    formComentario.reset();
    inputNomeComentario.focus();
    inputEmailComentario.focus();
    inputEmailComentario.blur();
    divBarraComentario.classList.remove("show");
    divBarraComentario.classList.add("fade", "d-none");
  }
  
  function verificaTipoAlerta() {
      if (divNotificacaoComentario) {
          var tipoAlerta = divNotificacaoComentario.querySelector('.alert');
          if (tipoAlerta) {
              if (tipoAlerta.classList.contains('alert-danger')) {
                  return 'erro';
              } else if (tipoAlerta.classList.contains('alert-success')) {
                  return 'sucesso';
              } 
          }
      }
      return 'nenhum';
  }
  /* FUNÇÃO PARA VALIDAR E ENVIAR FORMULÁRIO DE COMENTÁRIO */
  
  /* FUNÇÃO PARA CRIAR SECTION E CARREGAR OS ARTIGOS RELACIONADOS */
  function carregaCidadesRelacionadas(config, uf, slugPagina) {

      fetch('/configuracao/json/cidades-relacionadas.json')
          .then(response => {
              if (!response.ok) {
                  throw new Error(`Erro ao buscar dados. Código de status: ${response.status}`);
              }
              return response.json();
          })
          .then(data => {
  
                  let relacionadas = data[uf];
          
                  // Filtra as cidades relacionadas excluindo a cidade atual
                  relacionadas = relacionadas.filter(cidade => 
                    cidade.slug !== slugPagina
                  );
  
                  // Verifica se há cidades relacionadas
                  if (relacionadas.length > 0) {
                      
                      // Embaralha a ordem dos artigos relacionados
                      relacionadas.sort(() => Math.random() - 0.5);
  
                      // Pega os primeiros 4 artigos relacionados
                      const cidadesRelacionadas = relacionadas.slice(0, 4);
                      
                      // Cria a seção de artigos relacionados
                      const secaoRelacionadas = document.createElement('section');
                      secaoRelacionadas.innerHTML = `
                          <div style="margin-bottom: 20px; padding:0px" class="reviews-container box_detail">
                              <div class="titulo_secao">
                                  <h3 class="titulo">RELACIONADOS</h3>
                              </div>
                              <div style="padding: 20px 20px;" class="col-md-12">
                                  <div class="row">
                                      ${cidadesRelacionadas.map(relacionada => `
                                          <div class="col-lg-6 col-sm-6 mb-3">
                                              <a href="/${uf}/${relacionada.slug}">
                                                  <div class="card border-0 rounded-0 text-white overflow zoom position-relative mb-0">
                                                      <div class="ratio_right-cover-2 image-wrapper">
                                                          <img
                                                              src="data:image/webp;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                                                              data-src="${(config.cdn_imagens === 1 ? config.diretorio_cdn_imagens : '')}/cidades/${uf}/${relacionada.imagem_destaque}"
                                                              data-srcset="${Array.from({ length: 15 }, (_, i) => 
                                                                  `${(config.cdn_imagens === 1 ? config.diretorio_cdn_imagens : '')}/cidades/${uf}/${relacionada.imagem_destaque}?tr=w-${250 + i * 50} ${250 + i * 50}w`
                                                              ).join(', ')}"
                                                              sizes="(max-width: 125px), (max-width: 150px), (max-width: 175px), (max-width: 200px), (max-width: 225px), (max-width: 250px), (max-width: 275px), (max-width: 300px), (max-width: 325px), (max-width: 350px), (max-width: 375px), (max-width: 400px), (max-width: 425px), (max-width: 450px), (max-width: 475px), (-webkit-min-device-pixel-ratio: 1.1) AND (-webkit-max-device-pixel-ratio: 1.5) 80.5vw, (-webkit-min-device-pixel-ratio: 1.6) AND (-webkit-max-device-pixel-ratio: 2) 57.5vw, (-webkit-min-device-pixel-ratio: 2.1) AND (-webkit-max-device-pixel-ratio: 2.5) 42.5vw, (-webkit-min-device-pixel-ratio: 2.6) AND (-webkit-max-device-pixel-ratio: 3) 39.5vw, (-webkit-min-device-pixel-ratio: 3.1) AND (-webkit-max-device-pixel-ratio: 3.5) 32.5vw, (-webkit-min-device-pixel-ratio: 3.6) AND (-webkit-max-device-pixel-ratio: 4) 28.5vw"
                                                              title="${relacionada.titulo_imagem_destaque}"
                                                              alt="${relacionada.alt_imagem_destaque}"
                                                              width="1200"
                                                              height="675"
                                                              class="img-fluid w-100"
                                                          />
                                                      </div>
                                                      <div class="position-absolute p-2 p-lg-3 b-0 w-100 bg-shadow">
                                                          <h3 class="h6 text-white my-1">${relacionada.titulo_breadcumb}</h3>
                                                      </div>
                                                  </div>
                                              </a>
                                          </div>
                                      `).join('')}
                                  </div>
                              </div>
                          </div>
                      `;
  
                      // Adiciona a seção de artigos relacionados ao DOM ou faz o que for necessário
                      const secaoArtigo = document.getElementById('artigo');
                      secaoArtigo.insertAdjacentElement('afterend', secaoRelacionadas);
                  }
              
                  
              AdiarImagens();
  
          })
          .catch(error => {
              console.error('Erro ao buscar dados:', error);
          });
  
  }
  /* FUNÇÃO PARA CRIAR SECTION E CARREGAR OS ARTIGOS RELACIONADOS */
  
  /* FUNÇÃO PARA CRIAR SECTION E CARREGAR OS COMENTÁRIOS */
  function carregaComentariosAvaliacoes() {
  
    const numeroComentarios = document.querySelector("h1").dataset.comentarios;
    if (numeroComentarios > 0) {
  
        fetch('/configuracao/json/comentarios.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro ao buscar dados. Código de status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
  
                const comentariosArtigo = data.filter(dados => dados.id_artigo === parseInt(document.querySelector("h1").dataset.id, 10) && dados.id_comentario_pai === 0);
                const lista_comentarios = comentariosArtigo.map(dados => {
                    const estrelas = Array.from({
                            length: 5
                        }, (_, index) =>
                        index < dados.avaliacao ?
                        '<i class="icon_star voted"></i>' :
                        '<i class="icon_star"></i>'
                    ).join('');
                    const imagemAvatar = sexo === '1' ? '<img src="../img/feminino_comentario.webp">' : '<img src="../img/masculino_comentario.webp">';
                    const options = {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    };
                    data_hora_criacao = new Date(dados.data_hora_criacao).toLocaleDateString('pt-BR', options);
  
                return `
                  <div class="review-box clearfix">
                      <figure class="rev-thumb">${imagemAvatar}</figure>
                      <div class="rev-content">
                          <div class="rating_pequeno">${estrelas}</div>
                          <div class="rev-info">${dados.nome}</div>
                          <div class="botao_responder_comentario responder" id="${dados.id}">Responder<i style="margin-left:5px" class="fa fa-reply"></i></div>
                          <div class="rev-info">${data_hora_criacao}</div>
                          <div class="rev-text">
                              <p>${dados.comentario.charAt(0).toUpperCase() + dados.comentario.slice(1)}</p>
                          </div>
                      </div>
                  </div>
                  ${ListarComentariosDeRespostas(data, dados.id, 30)}
                  `;
                }).join('');
  
                const secaoEnviaComentarios = document.getElementById('envia_comentarios');
                secaoEnviaComentarios.insertAdjacentHTML(
                    "beforebegin",
                    '<section id="comentarios"><div style="margin-bottom: 20px; padding:0px" class="reviews-container box_detail"><div class="titulo_secao"><h3 class="titulo">COMENTÁRIOS</h3></div><div style="padding: 20px 20px 15px 20px;">' +
                    lista_comentarios +
                    "</div></div></section>"
                );
  
                function ListarComentariosDeRespostas(comentarios, id_comentario_pai, marginleft = 0) {
                    const comentariosRespostas = comentarios.filter(comentario => comentario.id_comentario_pai === id_comentario_pai);
                    const output = comentariosRespostas.map(comentario => {
  
                        const estrelas = Array.from({
                                length: 5
                            }, (_, index) =>
                            index < comentario.avaliacao ?
                            '<i class="icon_star voted"></i>' :
                            '<i class="icon_star"></i>'
                        ).join('');
                        const imagemAvatar = comentario.sexo === '1' ? '<img src="../img/feminino_comentario.webp">' : '<img src="../img/masculino_comentario.webp">';
                        const options = {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        };
  
                        return `
                        <div style="margin-left:${marginleft}px" class="review-box clearfix">
                            <figure class="rev-thumb">${imagemAvatar}</figure>
                            <div class="rev-content">
                                <div class="rating_pequeno">${estrelas}</div>
                                <div class="rev-info">${comentario.nome}</div>
                                <div class="botao_responder_comentario responder" id="${comentario.id}">Responder<i style="margin-left:5px" class="fa fa-reply"></i></div>
                                <div class="rev-info">${new Date(comentario.data_hora_criacao).toLocaleDateString('pt-BR', options)}</div>
                                <div class="rev-text">
                                    <p>${comentario.comentario.charAt(0).toUpperCase() + comentario.comentario.slice(1)}</p>
                                </div>
                            </div>
                        </div>
                        ${ListarComentariosDeRespostas(comentarios, comentario.id, marginleft + 30)}
                    `;
                    }).join('');
  
                    return output;
                }
  
            })
            .catch(error => {
                console.error('Erro ao buscar dados:', error);
            });
  
    }
  }
  /* FUNÇÃO PARA CRIAR SECTION E CARREGAR OS COMENTÁRIOS */
  
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
  
              if (data.length > 0 && config.conteudo_destaque_pagina_artigo === 1) {
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
                  
                  const sumarioWidget = document.getElementById('sumarioWidget');
                  sumarioWidget.insertAdjacentHTML("afterend", conteudosEmDestaque);
                  
              }
              
              AdiarImagens();
          
          })
          .catch(error => {
              console.error('Erro ao buscar dados:', error);
          });
  
  }
  /* FUNÇÃO PARA CRIAR SECTION E CARREGAR O CONTEÚDO EM DESTAQUE */

  window.addEventListener("DOMContentLoaded", function () {

    defineVariaveisUniversais(slugDaPagina).then(config => {

      if(document.querySelector('h1').dataset.tipoPagina === 'cidade') {
        carregaCidadesRelacionadas(config, document.querySelector("h1").dataset.uf, document.querySelector("h1").dataset.slug);
      }
      carregaConteudoDestaque(config);
      carregaComentariosAvaliacoes();
      validarFormularioComentario(config);

    }).catch(error => {
        console.error('Erro ao buscar dados:', error);
    });

    if(document.querySelector('h1').dataset.tipoPagina === 'estado') {

      fetch('/configuracao/json/estados-e-cidades.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Erro ao buscar dados. Código de status: ${response.status}`);
        }
        return response.json();
      })
      .then(dados => {

        const uf = document.querySelector('h1').dataset.uf;
        const visualizacaoMobile = window.innerWidth < 600;

        const tabelaCidades = new gridjs.Grid({
          columns: [
            { name: 'ID', hidden: window.innerWidth < 600 },
            { name: 'Cidade' },
          ],
          data: dados[uf].cidades.map((cidade, index) => ({
            id: index + 1,
            cidade: gridjs.html(`<a href='/${uf}/feriados-${cidade.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-')}-${uf}-cidade'>Feriados ${cidade}</a>`)
          })),
          className: {
            table: 'table table-striped'
          },
          style: {
            th: {
              background: '#fff',
              color: '#000',
              padding: '0.5rem'
            },
            td: {
              padding: '0.5rem'
            }
          },
          pagination: {
            limit: 10,
            summary: visualizacaoMobile ? false : true,
            buttonsCount: 2
          },
          resizable: true,
          sort: true,
          search: true,
          language: {
            search: {
                placeholder: 'Digite o nome da cidade'
            },
            pagination: {
              previous: visualizacaoMobile ? '<' : 'Anterior',
              next: visualizacaoMobile ? '>' : 'Próximo',
              showing: 'Exibindo',
              to: 'a',
              of: 'de',
              results: 'resultados'
            }
          }
        }).render(document.getElementById('tabela-cidades'));

      })
      .catch(error => {
        console.error('Erro ao buscar dados:', error);
      });

    }

  });
