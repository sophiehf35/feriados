// src/js/utils.js

export function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function slugify(text) {
    if (!text) return '';
    return String(text)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

export function capitalizar(string) {
    if (!string) return '';
    const excecoes = ['de', 'do', 'da', 'dos', 'das'];
    const palavras = string.split(' ');
    const resultado = palavras.map(palavra => {
        const lower = palavra.toLowerCase();
        if (excecoes.includes(lower)) {
            return lower;
        } else {
            return palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase();
        }
    });
    return resultado.join(' ');
}

export function ufParaSlug(uf) {
    const estados = {
        ac: "acre", al: "alagoas", ap: "amapa", am: "amazonas",
        ba: "bahia", ce: "ceara", df: "distrito-federal", es: "espirito-santo",
        go: "goias", ma: "maranhao", mt: "mato-grosso", ms: "mato-grosso-do-sul",
        mg: "minas-gerais", pa: "para", pb: "paraiba", pr: "parana",
        pe: "pernambuco", pi: "piaui", rj: "rio-de-janeiro", rn: "rio-grande-do-norte",
        rs: "rio-grande-do-sul", ro: "rondonia", rr: "roraima", sc: "santa-catarina",
        sp: "sao-paulo", se: "sergipe", to: "tocantins"
    };
    return estados[uf.toLowerCase()] || null;
}

export function criarSlug(valor) {
    if (!valor) return "n-a";
    valor = valor.replace(/<\/?[^>]+(>|$)/g, "");
    valor = valor.replace(/[^\p{L}\d]+/gu, "-");
    valor = valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    valor = valor.toLowerCase();
    valor = valor.replace(/[^0-9a-z]/g, "-");
    valor = valor.replace(/-+/g, "-");
    valor = valor.replace(/^-+|-+$/g, "");
    return valor || "n-a";
}

export function erroNoCampo(opcao, input) {
    if (opcao === 'adicionar') {
        input.style.border = '1px solid #f5c6cb';
        input.style.background = '#f8d7da';
    } else if (opcao === 'remover') {
        input.style.border = '';
        input.style.background = '';
    }
}

export function carregarOptions(selectElement, items, getOptionValue, getOptionText, placeholder = null) {
    selectElement.innerHTML = '';
    if (placeholder !== null) {
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.selected = true;
        placeholderOption.textContent = placeholder;
        selectElement.appendChild(placeholderOption);
    }
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = getOptionValue(item);
        option.textContent = getOptionText(item);
        selectElement.appendChild(option);
    });
}

export function encodeData(data) {
    try {
        const json = JSON.stringify(data);
        return btoa(encodeURIComponent(json));
    } catch (_) {
        return '';
    }
}

export function decodeData(encoded) {
    if (!encoded) return null;
    try {
        const json = decodeURIComponent(atob(encoded));
        return JSON.parse(json);
    } catch (_) {
        try {
            return JSON.parse(encoded);
        } catch (_2) {
            return null;
        }
    }
}

export function gerarHeadersCache(config, contentType = 'text/html; charset=utf-8') {
    const baseHeaders = {
        'Content-Type': contentType,
        'Cache-Control': 'no-store, must-revalidate'
    };

    if (config?.possui_cache_cloudflare && config?.cache_cloudflare_ttl) {
        baseHeaders['CDN-Cache-Control'] = `public, max-age=${config.cache_cloudflare_ttl}`;
    } else {
        baseHeaders['CDN-Cache-Control'] = 'no-cache';
    }

    return baseHeaders;
}