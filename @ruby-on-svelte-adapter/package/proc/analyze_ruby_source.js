const STORE_DIRECTIVE_REGEX = /^\s*#\s*@store(?:\s+([@:$]?[A-Za-z_]\w*))?\s*$/;
const BINDING_TARGET_REGEX = /(\$[A-Za-z_]\w*|@@[A-Za-z_]\w*|@[A-Za-z_]\w*)/;
const METHOD_REGEX = /^\s*def\s+(?:self\.)?([A-Za-z_]\w*)/gm;

function sanitizeRubySource(source) {
    const lines = source.split(/\r?\n/);
    let inBlockComment = false;
    const filtered = [];

    for (const line of lines) {
        const trimmed = line.trim();

        if (!inBlockComment && trimmed.startsWith('=begin')) {
            inBlockComment = true;
            filtered.push('');
            continue;
        }

        if (inBlockComment) {
            if (trimmed.startsWith('=end')) {
                inBlockComment = false;
            }
            filtered.push('');
            continue;
        }

        filtered.push(line);
    }

    const flattened = filtered.join('\n');
    let result = '';
    let mode = 'code';

    for (let i = 0; i < flattened.length; i += 1) {
        const char = flattened[i];

        if (mode === 'single') {
            if (char === '\\' && i + 1 < flattened.length) {
                i += 1;
                continue;
            }
            if (char === '\'') {
                mode = 'code';
            }
            continue;
        }

        if (mode === 'double') {
            if (char === '\\' && i + 1 < flattened.length) {
                i += 1;
                continue;
            }
            if (char === '"') {
                mode = 'code';
            }
            continue;
        }

        if (char === '\'') {
            mode = 'single';
            continue;
        }

        if (char === '"') {
            mode = 'double';
            continue;
        }

        if (char === '#') {
            while (i < flattened.length && flattened[i] !== '\n') {
                i += 1;
            }
            if (i < flattened.length && flattened[i] === '\n') {
                result += '\n';
            }
            continue;
        }

        result += char;
    }

    return result;
}

function normalizeBindingToken(token, source = 'annotation') {
    if (!token) {
        return null;
    }

    const trimmed = token.trim().replace(/^:+/, '');

    if (!trimmed) {
        return null;
    }

    if (trimmed.startsWith('@@')) {
        return {
            bindingType: 'class',
            rubyIdentifier: trimmed,
            accessName: trimmed.slice(2),
            source
        };
    }

    if (trimmed.startsWith('@')) {
        return {
            bindingType: 'instance',
            rubyIdentifier: trimmed,
            accessName: trimmed.slice(1),
            source
        };
    }

    if (trimmed.startsWith('$')) {
        return {
            bindingType: 'global',
            rubyIdentifier: trimmed,
            accessName: trimmed.slice(1),
            source
        };
    }

    if (/^[A-Za-z_]\w*$/.test(trimmed)) {
        return {
            bindingType: 'global',
            rubyIdentifier: `$${trimmed}`,
            accessName: trimmed,
            source
        };
    }

    return null;
}

function collectStoreAnnotations(source) {
    const directives = [];
    const lines = source.split(/\r?\n/);
    let awaitingTarget = false;

    for (const rawLine of lines) {
        const line = rawLine ?? '';
        const directive = line.match(STORE_DIRECTIVE_REGEX);

        if (directive) {
            const [, explicitName] = directive;
            if (explicitName) {
                const binding = normalizeBindingToken(explicitName);
                if (binding) {
                    directives.push(binding);
                }
                awaitingTarget = false;
                continue;
            }
            awaitingTarget = true;
            continue;
        }

        if (!awaitingTarget) {
            continue;
        }

        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith('#')) {
            continue;
        }

        const target = line.match(BINDING_TARGET_REGEX);

        if (target) {
            const binding = normalizeBindingToken(target[1]);
            if (binding) {
                directives.push(binding);
            }
            awaitingTarget = false;
            continue;
        }

        awaitingTarget = false;
    }

    return directives;
}

function bindingKey(binding) {
    return `${binding.bindingType}:${binding.accessName}`;
}

export function analyzeRubySource(source) {
    const globals = new Map();
    const methods = new Set();
    const sanitized = sanitizeRubySource(source ?? '');

    const addBinding = (binding) => {
        if (!binding) {
            return;
        }
        const key = bindingKey(binding);
        if (!globals.has(key)) {
            globals.set(key, binding);
        }
    };

    for (const annotation of collectStoreAnnotations(source ?? '')) {
        addBinding(annotation);
    }

    const globalRegex = /\$([A-Za-z_]\w*)/g;
    for (const match of sanitized.matchAll(globalRegex)) {
        const [, name] = match;
        addBinding({
            bindingType: 'global',
            rubyIdentifier: `$${name}`,
            accessName: name,
            source: 'implicit'
        });
    }

    for (const match of sanitized.matchAll(METHOD_REGEX)) {
        methods.add(match[1]);
    }

    return {
        globals: Array.from(globals.values()),
        methods: Array.from(methods)
    };
}
