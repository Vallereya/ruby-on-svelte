import { reservedKeywords } from './reserved_keywords.js';

const INTERNAL_IDENTIFIERS = new Set([
    '__opal',
    '__rubyTop',
    '__rubyGlobals',
    '__syncRubyGlobals'
]);

const VALID_IDENTIFIER_REGEX = /^[A-Za-z_$][\w$]*$/;

function toSafeIdentifier(name) {
    const base = name.replace(/[^\w$]/g, '_') || '_value';
    const normalized = /^[A-Za-z_$]/.test(base) ? base : `_${base}`;

    if (reservedKeywords.has(normalized) || INTERNAL_IDENTIFIERS.has(normalized)) {
        return `_${normalized}`;
    }

    return normalized;
}

function ensureUniqueIdentifier(candidate, used) {
    let next = candidate;
    let counter = 1;

    while (used.has(next)) {
        next = `${candidate}_${counter}`;
        counter += 1;
    }

    used.add(next);
    return next;
}

function toPropertyAccess(base, property) {
    if (VALID_IDENTIFIER_REGEX.test(property)) {
        return `${base}.${property}`;
    }

    return `${base}[${JSON.stringify(property)}]`;
}

export { INTERNAL_IDENTIFIERS, ensureUniqueIdentifier, toPropertyAccess, toSafeIdentifier };
