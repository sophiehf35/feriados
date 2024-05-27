window.addEventListener("DOMContentLoaded", function () {

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

      const tabelaEstados = new gridjs.Grid({
        columns: [
          { name: 'ID', hidden: window.innerWidth < 600 },
          { name: 'Estado' },
          { name: 'UF' }
        ],
        data: Object.entries(dados).map(([sigla, info], index) => ({
            id: index + 1,
            estado: gridjs.html(`<a href='/feriados-${info.estado.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-')}-${sigla}-estado'>Feriados ${info.estado}</a>`),
            uf: sigla,
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
              placeholder: 'Digite o nome do estado'
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
      }).render(document.getElementById('tabela-estados'));

    })
    .catch(error => {
      console.error('Erro ao buscar dados:', error);
    });

});