/* BARRA BUSCA FERIADOS MUNICIPAIS - ESTADO | CIDADE */
document.addEventListener('DOMContentLoaded', function () {
    let dados; // Declare a variável dados no escopo mais amplo

    // CARREGA OS ESTADOS
    fetch('/configuracao/json/estados-e-cidades.json')
        .then(response => response.json())
        .then(data => {
            dados = data; // Atribua os dados à variável dados
            if (dados) {
                var option = '<option hidden="true" value="">Selecione o Estado</option>';
                Object.keys(dados).forEach(estado => {
                    option += `<option value="${estado}">${dados[estado].estado}</option>`;
                });
                document.getElementById('cmbEstado').innerHTML = option;
                document.getElementById('cmbEstado').style.display = 'block';

                // Adicione o evento de mudança de ano
                document.getElementById('cmbAno').addEventListener('change', function (e) {
                    var ano = document.getElementById('cmbAno').value;
                    if (ano) {
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

                // Adicione o evento de mudança de estado aqui, após os dados serem carregados
                document.getElementById('cmbEstado').addEventListener('change', function (e) {
                    var uf = document.getElementById('cmbEstado').value;
                    if (uf) {
                        var cidades = dados[uf].cidades;
                        var option = '<option hidden="true" value="">Selecione a Cidade</option>';
                        cidades.forEach(cidade => {
                            option += `<option value="${uf + '/feriados-' + cidade.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-') + '-' + uf + '-cidade'}">${cidade}</option>`;
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

                document.getElementById('botaoBuscar').addEventListener('click', function (e) {
                    const selectEstado = document.getElementById('cmbEstado');
                    const selectAno = document.getElementById('cmbAno');
                    const ano = document.getElementById('cmbAno').value;
                    const uf = document.getElementById('cmbEstado').value;
                    const cidadeSlug = document.getElementById('cmbCidade').value;
                
                    if (ano.length === 0) {
                        document.getElementById('botaoBuscar').disabled = true;
                        selectAno.style.border = '1px solid #f5c6cb';
                        selectAno.style.background = '#f8d7da';
                    } else if (uf.length === 0) {
                        document.getElementById('botaoBuscar').disabled = true;
                        selectEstado.style.border = '1px solid #f5c6cb';
                        selectEstado.style.background = '#f8d7da';
                    } else {
                        let destino;
                        if (cidadeSlug.length === 0) {
                            const estado = document.getElementById("cmbEstado").options[document.getElementById("cmbEstado").selectedIndex].text;
                            destino = '/feriados-' + estado.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-') + '-' + uf + '-estado';
                        } else {
                            destino = cidadeSlug;
                        }
                        const dominio = window.location.protocol + '//' + window.location.hostname;
                        if (destino.length > 0) {
                            window.location.href = dominio + '/' + destino + '/';
                        }
                    }

                    if (uf.length === 0 && cidadeSlug.length === 0) {
                        document.getElementById('botaoBuscar').disabled = true;
                    } else if (uf.length === 0) {
                        document.getElementById('botaoBuscar').disabled = true;
                        selectEstado.style.border = '1px solid #f5c6cb';
                        selectEstado.style.background = '#f8d7da';
                    } else if (cidadeSlug.length === 0) {
                        document.getElementById('botaoBuscar').disabled = true;
                    } else {
                        const destino = cidadeSlug;
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