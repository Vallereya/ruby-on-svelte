import { compileRubyToJS } from './ruby-compiler.js';

const runtime = `import 'opal-runtime/src/opal.js';`;

function analyzeRubySource(source) {
    const globals = new Set();
    const methods = new Set();

    const globalRegex = /\$([a-zA-Z_]\w*)/g;

    for (const match of source.matchAll(globalRegex)) {
        globals.add(match[1]);
    }

    const methodRegex = /^\s*def\s+(?:self\.)?([a-zA-Z_]\w*)/gm;

    for (const match of source.matchAll(methodRegex)) {
        methods.add(match[1]);
    }

    return {
        globals: Array.from(globals),
        methods: Array.from(methods)
    };
}

function buildRuntimeBridge(compiledJS, metadata) {
    const segments = [runtime];

    if (metadata.globals.length) {
        segments.push(`import { writable } from 'svelte/store';`);
    }

    segments.push(compiledJS.trim());

    segments.push(
        `const __opal = globalThis.Opal;`,
        `if (!__opal) {`,
        `    throw new Error('Opal runtime failed to load. Make sure "opal-runtime/src/opal.js" is imported.');`,
        `}`,
        `const __rubyTop = __opal.top;`,
        `const __rubyGlobals = __opal.gvars;`
    );

    if (metadata.globals.length) {
        for (const name of metadata.globals) {
            segments.push(`const ${name} = writable(__rubyGlobals.${name});`);
        }

        segments.push(`function __syncRubyGlobals() {`);
        for (const name of metadata.globals) {
            segments.push(`    ${name}.set(__rubyGlobals.${name});`);
        }
        segments.push(`}`);
        segments.push(`__syncRubyGlobals();`);
    }

    if (metadata.methods.length) {
        for (const method of metadata.methods) {
            segments.push(`const ${method} = (...args) => {`);
            segments.push(`    const __result = __rubyTop.$${method}(...args);`);
            
            if (metadata.globals.length) {
                segments.push(`    __syncRubyGlobals();`);
            }

            segments.push(`    return __result;`);
            segments.push(`};`);
        }
    }

    return segments.join('\n');
}

export function svelteRuby() {
    return {
        async script({ content, attributes, filename }) {
            if (!attributes || attributes.lang !== 'ruby') return null;

            const metadata = analyzeRubySource(content);
            const compiled = await compileRubyToJS(content, filename);
            const bridged = buildRuntimeBridge(compiled, metadata);

            return {
                code: bridged,
                map: null
            };
        }
    };
}
