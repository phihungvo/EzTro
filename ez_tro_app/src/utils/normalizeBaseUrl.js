export const normalizeApiBaseUrl = (rawBaseUrl) => {
    const fallback = '/api';

    if (!rawBaseUrl || typeof rawBaseUrl !== 'string') {
        return fallback;
    }

    const trimmed = rawBaseUrl.trim().replace(/\/+$/, '');
    if (!trimmed) {
        return fallback;
    }

    // If it's already a relative API root, keep it.
    if (trimmed === '/api' || trimmed.endsWith('/api') || trimmed.includes('/api/')) {
        return trimmed;
    }

    // If it looks like a relative path, keep it relative.
    if (trimmed.startsWith('/')) {
        return `${trimmed}/api`;
    }

    // If it looks like an absolute URL (http(s) etc.), append `/api`.
    if (/^[a-zA-Z][a-zA-Z\\d+.-]*:/.test(trimmed)) {
        return `${trimmed}/api`;
    }

    // Last resort: treat as relative path segment.
    return `/${trimmed}/api`;
};

