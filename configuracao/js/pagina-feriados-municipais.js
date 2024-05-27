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
  
      const tabelaCidades = new gridjs.Grid({
        columns: [
          { name: 'ID', hidden: window.innerWidth < 600 },
          { name: 'Cidade' },
          { name: 'UF' },
          { name: 'Estado' }
        ],
        data: Object.entries(dados).flatMap(([uf, infoEstado]) => (
          infoEstado.cidades.map((cidade, index) => ({
            id: index + 1,
            cidade: gridjs.html(`<a href='/${uf}/feriados-${cidade.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-')}-${uf}-cidade'>Feriados ${cidade}</a>`),
            uf: uf,
            estado: infoEstado.estado
          }))
        )),
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

});