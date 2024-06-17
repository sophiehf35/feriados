/* BARRA BUSCA FERIADOS MUNICIPAIS - ESTADO | CIDADE */
document.addEventListener('DOMContentLoaded', function () {
    let dados; // Declare a variável dados no escopo mais amplo

    //CARREGA OS ESTADOS
    fetch('/configuracao/json/estados-e-cidades.json')
        .then(response => response.json())
        .then(data => {
            dados = data;
            if (dados) {

                // Adicione o evento de mudança de ano
                document.getElementById('cmbAno').addEventListener('change', function (e) {
                    var ano = document.getElementById('cmbAno').value;
                    if (ano) {

                        var option = '<option hidden="true" value="">Selecione o Estado</option>';
                        Object.keys(dados).forEach(uf => {
                            option += `<option value="${uf}">${dados[uf].estado}</option>`;
                        });
                        document.getElementById('cmbEstado').innerHTML = option;
                        document.getElementById('cmbEstado').style.display = 'block';

                        document.getElementById('cmbCidade').innerHTML = '<option hidden="true" value="">Selecione a Cidade</option>';

                        document.getElementById('botaoBuscar').disabled = false;
                        document.getElementById('cmbAno').style.border = '';
                        document.getElementById('cmbAno').style.background = '';
                        document.getElementById('cmbEstado').style.border = '';
                        document.getElementById('cmbEstado').style.background = '';
                        document.getElementById('cmbCidade').style.border = '';
                        document.getElementById('cmbCidade').style.background = '';
                    } else {
                        // Limpa as opções da cidade se o estado não estiver selecionado
                        document.getElementById('cmbEstado').innerHTML = '<option hidden="true" value="">Selecione o Estado</option>';
                        document.getElementById('cmbEstado').style.display = 'none';
                        document.getElementById('cmbCidade').innerHTML = '<option hidden="true" value="">Selecione a Cidade</option>';
                        document.getElementById('cmbCidade').style.display = 'none';
                        document.getElementById('botaoBuscar').disabled = true;
                        document.getElementById('cmbAno').style.border = '1px solid #f5c6cb';
                        document.getElementById('cmbAno').style.background = '#f8d7da';
                    }
                });

                //PREENCHE O ANO DE ACORDO COM A PÁGINA
                if (document.querySelector("h1").dataset.ano !== "todos") {
                    document.querySelector("#cmbAno").value = document.querySelector("h1").dataset.ano;
                    document.querySelector("#cmbAno").dispatchEvent(new Event('change'));
                }

                // Adicione o evento de mudança de estado
                document.getElementById('cmbEstado').addEventListener('change', function (e) {
                    var uf = document.getElementById('cmbEstado').value;
                    if (ano && uf) {
                        var cidades = dados[uf].cidades;
                        var option = '<option hidden="true" value="">Selecione a Cidade</option>';
                        cidades.forEach(cidade => {
                            option += `<option value="${cidade.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-')}-${uf}">${cidade}</option>`;
                        });
                        var cmbCidade = document.getElementById('cmbCidade');
                        cmbCidade.innerHTML = option;
                        cmbCidade.value = '';
                        cmbCidade.style.display = 'block';
                        document.getElementById('botaoBuscar').disabled = false;
                        document.getElementById('cmbEstado').style.border = '';
                        document.getElementById('cmbEstado').style.background = '';
                        document.getElementById('cmbCidade').style.border = '';
                        document.getElementById('cmbCidade').style.background = '';
                    } else {
                        // Limpa as opções da cidade se o estado não estiver selecionado
                        document.getElementById('cmbCidade').innerHTML = '<option hidden="true" value="">Selecione a Cidade</option>';
                        document.getElementById('cmbCidade').style.display = 'none';
                        document.getElementById('botaoBuscar').disabled = true;
                        document.getElementById('cmbEstado').style.border = '1px solid #f5c6cb';
                        document.getElementById('cmbEstado').style.background = '#f8d7da';
                    }
                });

                //PREENCHE O ESTADO DE ACORDO COM A PÁGINA
                if (document.querySelector("h1").dataset.uf !== "todos") {
                    document.querySelector("#cmbEstado").value = document.querySelector("h1").dataset.uf;
                    document.querySelector("#cmbEstado").dispatchEvent(new Event('change'));
                }

                //PREENCHE A CIDADE DE ACORDO COM A PÁGINA
                if (document.querySelector("h1").dataset.cidade !== "todas") {
                    document.querySelector("#cmbCidade").value = document.querySelector("h1").dataset.cidade;
                    document.querySelector("#cmbCidade").dispatchEvent(new Event('change'));
                }

                document.getElementById('botaoBuscar').addEventListener('click', function (e) {
                    const selectAno = document.getElementById('cmbAno');
                    const ano = document.getElementById('cmbAno').value;
                    const uf = document.getElementById('cmbEstado').value;
                    const cidade = document.getElementById('cmbCidade').value;
                
                    if (ano.length === 0) {
                        document.getElementById('botaoBuscar').disabled = true;
                        selectAno.style.border = '1px solid #f5c6cb';
                        selectAno.style.background = '#f8d7da';
                    } else {

                        let destino;

                        if (cidade.length !== 0) {
                            destino = `${ano}/${uf}/${cidade}`;
                        } else if (uf.length !== 0) {
                            destino = `${ano}/${uf}`;
                        } else if (ano.length !== 0) {
                            destino = ano;
                        }

                        const dominio = window.location.protocol + '//' + window.location.hostname;
                        if (destino.length > 0) {
                            window.location.href = dominio + '/' + destino + '/';
                        }
                    }
                });

            } else {
                document.getElementById('cmbEstado').selectedIndex = 0;
            }
        })
        .catch(error => console.error('Erro ao carregar estados:', error));

});
/* BARRA BUSCA FERIADOS MUNICIPAIS - ESTADO | CIDADE */