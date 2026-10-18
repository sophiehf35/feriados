// src/js/utils.js

export function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function capitalizar(str) {
    if (!str) return '';
    return String(str)
        .toLowerCase()
        .replace(/(^|\s|[-/])([a-zà-ú])/g, (m, sep, letra) => sep + letra.toUpperCase());
}

export function slugify(str) {
    if (!str) return '';
    return String(str)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
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
    try {
        if (!encoded) return null;
        const json = decodeURIComponent(atob(encoded));
        return JSON.parse(json);
    } catch (_) {
        return null;
    }
}

export function normalizar(str) {
    if (typeof str !== 'string') return str;
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}