// src/js/tabela.js

import { escapeHtml } from './utils.js';

export class TabelaGenerica {
    constructor({
        dados,
        containerId,
        colunas = [],
        chaveBusca = null,
        itensPorPagina = 10,
        labelBusca = 'Buscar...',
        renderLinha = null,
        hideOnMobile = []
    }) {
        this.dados = dados || [];
        this.containerId = containerId;
        this.colunas = colunas;
        this.chaveBusca = chaveBusca;
        this.itensPorPagina = itensPorPagina;
        this.labelBusca = labelBusca;
        this.renderLinha = renderLinha;
        this.hideOnMobile = hideOnMobile || [];

        this.filteredItems = [];
        this.currentPage = 1;
        this.searchTerm = '';
        this.sortColumn = this.colunas[0]?.key || 'id';
        this.sortDirection = 'asc';
        this._tbody = null;
        this._paginationContainer = null;
        this._searchInput = null;
        this._limparBtn = null;
        this._isRendering = false;
        this._isMobile = window.innerWidth < 768;
        this._innerContainerId = this.containerId + '-inner';

        this.itensPorPagina = this._isMobile ? 5 : itensPorPagina;
    }

    _normalize(value) {
        if (typeof value !== 'string') return value;
        return value
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }

    _applyFiltersAndSort() {
        let result = [...this.dados];
        const term = this._normalize(this.searchTerm);

        if (term !== '' && this.chaveBusca) {
            result = result.filter(item => {
                const val = this._normalize(item[this.chaveBusca] ?? '');
                return val.includes(term);
            });
        }

        result.sort((a, b) => {
            let aVal = a[this.sortColumn] ?? '';
            let bVal = b[this.sortColumn] ?? '';
            aVal = this._normalize(aVal);
            bVal = this._normalize(bVal);

            if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        this.filteredItems = result;
        this.currentPage = 1;
        this._updateTable();
    }

    _getPaginatedItems() {
        const start = (this.currentPage - 1) * this.itensPorPagina;
        return this.filteredItems.slice(start, start + this.itensPorPagina);
    }

    _updateTable() {
        if (this._isRendering) return;
        this._isRendering = true;

        const totalPages = Math.ceil(this.filteredItems.length / this.itensPorPagina);
        const paginated = this._getPaginatedItems();

        let colunasAtivas = this.colunas;
        if (this._isMobile && this.hideOnMobile.length > 0) {
            colunasAtivas = this.colunas.filter(col => !this.hideOnMobile.includes(col.key));
        }

        if (this._tbody) {
            if (paginated.length === 0) {
                this._tbody.innerHTML = `<tr><td colspan="${colunasAtivas.length}" class="text-center py-8 text-gray-500">Nenhum resultado encontrado.</td></tr>`;
            } else {
                let html = '';
                paginated.forEach(item => {
                    html += this.renderLinha ? this.renderLinha(item, colunasAtivas) : this._renderLinhaPadrao(item, colunasAtivas);
                });
                this._tbody.innerHTML = html;
            }
        }

        if (this._paginationContainer) {
            if (totalPages > 1) {
                const startItem = (this.currentPage - 1) * this.itensPorPagina + 1;
                const endItem = Math.min(this.currentPage * this.itensPorPagina, this.filteredItems.length);
                const totalItems = this.filteredItems.length;

                let pagHtml = '';

                pagHtml += `
                    <span class="text-sm font-normal text-gray-700 mb-4 md:mb-0 hidden md:block">
                        Mostrando <span class="font-semibold text-gray-900">${startItem}-${endItem}</span> de <span class="font-semibold text-gray-900">${totalItems}</span>
                    </span>
                `;

                pagHtml += `<ul class="flex -space-x-px text-sm">`;

                const useIcons = this._isMobile && totalPages > 3;

                const prevDisabled = this.currentPage === 1;
                const prevClass = `flex items-center justify-center bg-white border border-gray-300 hover:bg-gray-100 font-medium text-sm h-9 ${this._isMobile ? 'px-2' : 'px-3'} rounded-l-md ${prevDisabled ? 'opacity-50 cursor-not-allowed' : ''}`;
                pagHtml += `
                    <li>
                        <button class="${prevClass}" ${prevDisabled ? 'disabled' : ''} data-page="prev">
                            ${useIcons ? `
                                <svg class="w-5 h-5" viewBox="0 0 640 640" fill="currentColor" aria-hidden="true">
                                    <path d="M169.4 297.4C156.9 309.9 156.9 330.2 169.4 342.7L361.4 534.7C373.9 547.2 394.2 547.2 406.7 534.7C419.2 522.2 419.2 501.9 406.7 489.4L237.3 320L406.6 150.6C419.1 138.1 419.1 117.8 406.6 105.3C394.1 92.8 373.8 92.8 361.3 105.3L169.3 297.3z"/>
                                </svg>
                            ` : 'Anterior'}
                        </button>
                    </li>
                `;

                if (this._isMobile) {
                    let pages = [];
                    if (totalPages <= 5) {
                        for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                        let start = Math.max(1, this.currentPage - 2);
                        let end = Math.min(totalPages, this.currentPage + 2);
                        if (end - start < 4) {
                            if (start === 1) end = Math.min(5, totalPages);
                            else if (end === totalPages) start = Math.max(1, totalPages - 4);
                        }
                        for (let i = start; i <= end; i++) pages.push(i);
                    }

                    let htmlPages = '';
                    for (const p of pages) {
                        const active = p === this.currentPage ? 'text-blue-600 bg-blue-50 border border-blue-300 hover:bg-blue-100' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-100';
                        htmlPages += `
                            <li>
                                <button class="flex items-center justify-center font-medium text-sm w-9 h-9 ${active}" data-page="${p}">${p}</button>
                            </li>
                        `;
                    }
                    pagHtml += htmlPages;
                } else {
                    let start = Math.max(1, this.currentPage - 2);
                    let end = Math.min(totalPages, start + 4);
                    if (end - start < 4) start = Math.max(1, end - 4);

                    for (let i = start; i <= end; i++) {
                        const active = i === this.currentPage ? 'text-blue-600 bg-blue-50 border border-blue-300 hover:bg-blue-100' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-100';
                        pagHtml += `
                            <li>
                                <button class="flex items-center justify-center font-medium text-sm w-9 h-9 ${active}" data-page="${i}">${i}</button>
                            </li>
                        `;
                    }
                    if (end < totalPages - 1) {
                        pagHtml += `
                            <li><span class="flex items-center justify-center bg-white border border-gray-300 font-medium text-sm w-9 h-9 cursor-default">...</span></li>
                            <li>
                                <button class="flex items-center justify-center text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 font-medium text-sm w-9 h-9" data-page="${totalPages}">${totalPages}</button>
                            </li>
                        `;
                    } else if (end < totalPages) {
                        pagHtml += `
                            <li>
                                <button class="flex items-center justify-center text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 font-medium text-sm w-9 h-9" data-page="${totalPages}">${totalPages}</button>
                            </li>
                        `;
                    }
                }

                const nextDisabled = this.currentPage === totalPages;
                const nextClass = `flex items-center justify-center bg-white border border-gray-300 hover:bg-gray-100 font-medium text-sm h-9 ${this._isMobile ? 'px-2' : 'px-3'} rounded-r-md ${nextDisabled ? 'opacity-50 cursor-not-allowed' : ''}`;
                pagHtml += `
                    <li>
                        <button class="${nextClass}" ${nextDisabled ? 'disabled' : ''} data-page="next">
                            ${useIcons ? `
                                <svg class="w-5 h-5" viewBox="0 0 640 640" fill="currentColor" aria-hidden="true">
                                    <path d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z"/>
                                </svg>
                            ` : 'Próximo'}
                        </button>
                    </li>
                `;

                pagHtml += `</ul>`;
                this._paginationContainer.innerHTML = pagHtml;

                this._paginationContainer.querySelectorAll('[data-page]').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        const page = btn.dataset.page;
                        if (page === 'prev' && this.currentPage > 1) {
                            this.currentPage--;
                            this._updateTable();
                        } else if (page === 'next' && this.currentPage < totalPages) {
                            this.currentPage++;
                            this._updateTable();
                        } else if (page !== 'prev' && page !== 'next') {
                            const num = parseInt(page, 10);
                            if (!isNaN(num) && num !== this.currentPage) {
                                this.currentPage = num;
                                this._updateTable();
                            }
                        }
                    });
                });
            } else {
                this._paginationContainer.innerHTML = '';
            }
        }
        this._isRendering = false;
    }

    _renderLinhaPadrao(item, colunasAtivas) {
        let cells = '';
        colunasAtivas.forEach((col, index) => {
            const tdClass = col.tdClass || '';
            const isMobile = this._isMobile;
            let style = '';
            if (isMobile && index === 0 && col.key === 'id') {
                style = 'width: 50px; max-width: 50px;';
            }
            if (isMobile && index === 1 && (col.key === 'cidade' || col.key === 'estado' || col.key === 'bairro')) {
                style = 'width: auto; min-width: 0;';
            }
            cells += `<td class="px-3 py-2 ${tdClass}" style="${style}">${escapeHtml(item[col.key] ?? '')}</td>`;
        });
        return `<tr class="bg-white border-b border-gray-200 hover:bg-gray-50">${cells}</tr>`;
    }

    _buildTableStructure() {
        const outerContainer = document.getElementById(this.containerId);
        if (!outerContainer) return;

        let innerContainer = document.getElementById(this._innerContainerId);
        if (!innerContainer) {
            innerContainer = document.createElement('div');
            innerContainer.id = this._innerContainerId;
            outerContainer.appendChild(innerContainer);
        }

        const container = innerContainer;

        this._tbody = document.getElementById(`${this.containerId}-tbody`);
        this._paginationContainer = document.getElementById(`${this.containerId}-paginacao`);
        this._searchInput = document.getElementById(`${this.containerId}-busca`);
        this._limparBtn = document.getElementById(`${this.containerId}-limpar`);

        if (!this._tbody || !this._paginationContainer) {
            container.innerHTML = this._getTableHTML();
            this._tbody = document.getElementById(`${this.containerId}-tbody`);
            this._paginationContainer = document.getElementById(`${this.containerId}-paginacao`);
            this._searchInput = document.getElementById(`${this.containerId}-busca`);
            this._limparBtn = document.getElementById(`${this.containerId}-limpar`);
        }

        if (this._searchInput && !this._searchInput._listenerAttached) {
            this._searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this._applyFiltersAndSort();
            });
            this._searchInput._listenerAttached = true;
        }
        if (this._limparBtn && !this._limparBtn._listenerAttached) {
            this._limparBtn.addEventListener('click', () => {
                if (this._searchInput) {
                    this._searchInput.value = '';
                    this.searchTerm = '';
                    this._applyFiltersAndSort();
                }
            });
            this._limparBtn._listenerAttached = true;
        }

        container.querySelectorAll('.sortable').forEach(th => {
            if (!th._listenerAttached) {
                th.addEventListener('click', () => {
                    const column = th.dataset.sort;
                    if (this.sortColumn === column) {
                        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
                    } else {
                        this.sortColumn = column;
                        this.sortDirection = 'asc';
                    }
                    this._applyFiltersAndSort();
                });
                th._listenerAttached = true;
            }
        });
    }

    _getTableHTML() {
        const hasSearch = !!this.chaveBusca;
        const searchHtml = hasSearch ? `
            <div class="flex flex-nowrap items-center gap-2">
                <div class="relative flex-1 min-w-0">
                    <input type="text" id="${this.containerId}-busca" placeholder=" " class="block px-2.5 pb-2 pt-3 w-full text-sm text-gray-900 bg-transparent rounded-md border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer">
                    <label for="${this.containerId}-busca" class="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">${this.labelBusca || 'Buscar...'}</label>
                </div>
                <div class="flex-shrink-0">
                    <button id="${this.containerId}-limpar" type="button" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-gray-300 bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        <span>Limpar</span>
                    </button>
                </div>
            </div>
        ` : '';

        let colunasAtivas = this.colunas;
        if (this._isMobile && this.hideOnMobile.length > 0) {
            colunasAtivas = this.colunas.filter(col => !this.hideOnMobile.includes(col.key));
        }

        let colgroupHtml = '';
        colunasAtivas.forEach(col => {
            let style = '';
            if (col.key === 'id') {
                style = 'width: 50px; max-width: 50px;';
            } else if (col.key === 'agencias' || col.key === 'lockers') {
                style = 'width: 80px; max-width: 80px;';
            } else {
                style = 'width: auto;';
            }
            colgroupHtml += `<col style="${style}">`;
        });

        let theadHtml = '<tr>';
        colunasAtivas.forEach((col, index) => {
            const thClass = col.thClass || '';
            const sortable = col.sortable !== false ? `cursor-pointer hover:bg-gray-100 sortable` : '';
            const dataSort = col.sortable !== false ? `data-sort="${col.key}"` : '';
            let style = '';
            if (this._isMobile && index === 0 && col.key === 'id') {
                style = 'width: 50px; max-width: 50px;';
            }
            if (this._isMobile && index === 1 && (col.key === 'cidade' || col.key === 'estado' || col.key === 'bairro')) {
                style = 'width: auto; min-width: 0;';
            }
            theadHtml += `<th scope="col" class="px-3 py-3 border-b border-gray-200 ${sortable} ${thClass}" style="${style}" ${dataSort}>${col.label}</th>`;
        });
        theadHtml += '</tr>';

        return `
            <div class="space-y-4">
                ${searchHtml}
                <div class="relative overflow-x-auto bg-white shadow-sm rounded-md border border-gray-200">
                    <div class="tabela-container relative w-full min-w-0 max-w-full overflow-x-auto">
                        <table class="w-full min-w-0 table-fixed text-sm text-left rtl:text-right text-gray-700 border-collapse">
                            <colgroup>
                                ${colgroupHtml}
                            </colgroup>
                            <thead class="text-sm text-gray-700 bg-gray-50">
                                ${theadHtml}
                            </thead>
                            <tbody id="${this.containerId}-tbody"></tbody>
                        </table>
                    </div>
                    <div id="${this.containerId}-paginacao" class="flex items-center flex-column flex-wrap md:flex-row justify-between p-4 border-t border-gray-200"></div>
                </div>
            </div>
        `;
    }

    renderizar() {
        this.filteredItems = [...this.dados];
        this.currentPage = 1;
        this._buildTableStructure();
        this._applyFiltersAndSort();
    }

    atualizarDados(novosDados) {
        this.dados = novosDados || [];
        this.filteredItems = [...this.dados];
        this.currentPage = 1;
        this._applyFiltersAndSort();
    }
}