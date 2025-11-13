import {
    INTERNAL_IDENTIFIERS,
    ensureUniqueIdentifier,
    toPropertyAccess,
    toSafeIdentifier
} from './identifier_utils.js';

const runtime = `import 'opal-runtime/src/opal.js';`;

function createRubyReadExpression(binding) {
    if (binding.bindingType === 'instance') {
        return `__rubyTop.$instance_variable_get(${JSON.stringify(binding.rubyIdentifier)})`;
    }

    if (binding.bindingType === 'class') {
        return `__rubyTop.$class_variable_get(${JSON.stringify(binding.rubyIdentifier)})`;
    }

    return toPropertyAccess('__rubyGlobals', binding.accessName);
}

function createRubyWriteStatement(binding, valueIdentifier) {
    if (binding.bindingType === 'instance') {
        return `__rubyTop.$instance_variable_set(${JSON.stringify(binding.rubyIdentifier)}, ${valueIdentifier});`;
    }

    if (binding.bindingType === 'class') {
        return `__rubyTop.$class_variable_set(${JSON.stringify(binding.rubyIdentifier)}, ${valueIdentifier});`;
    }

    return `${toPropertyAccess('__rubyGlobals', binding.accessName)} = ${valueIdentifier};`;
}

export function buildRuntimeBridge(compiledJS, metadata) {
    const segments = [runtime];
    const bindingEntries = metadata.globals ?? [];
    const methodEntries = metadata.methods ?? [];
    const hasBindings = bindingEntries.length > 0;
    const usedIdentifiers = new Set(INTERNAL_IDENTIFIERS);

    if (hasBindings) {
        segments.push(`import { writable } from 'svelte/store';`);
    }

    segments.push(compiledJS.trim());

    segments.push(
        `if (typeof globalThis === 'undefined' || !globalThis.Opal) {`,
        `    throw new Error('Opal runtime failed to load. Make sure "opal-runtime/src/opal.js" is imported to the client.');`,
        `}`,
        `const __opal = globalThis.Opal;`,
        `const __rubyTop = __opal.top;`,
        `const __rubyGlobals = __opal.gvars;`
    );

    if (hasBindings) {
        const stores = bindingEntries.map((binding) => {
            const hint =
                binding.bindingType === 'global'
                    ? binding.accessName
                    : `${binding.accessName}_${binding.bindingType}`;
            const jsName = ensureUniqueIdentifier(toSafeIdentifier(hint), usedIdentifiers);
            return { ...binding, jsName };
        });

        for (const entry of stores) {
            segments.push(`const ${entry.jsName} = writable(${createRubyReadExpression(entry)});`);
        }

        segments.push(`function __syncRubyGlobals() {`);
        for (const entry of stores) {
            segments.push(`    ${entry.jsName}.set(${createRubyReadExpression(entry)});`);
        }
        segments.push(`}`);

        for (const entry of stores) {
            segments.push(
                `${entry.jsName}.subscribe(value => {`,
                `    ${createRubyWriteStatement(entry, 'value')}`,
                `});`
            );
        }

        segments.push(`__syncRubyGlobals();`);
    }

    if (methodEntries.length) {
        for (const method of methodEntries) {
            const jsName = ensureUniqueIdentifier(toSafeIdentifier(method), usedIdentifiers);
            segments.push(`const ${jsName} = (...args) => {`);
            segments.push(`    const __result = __rubyTop.$${method}(...args);`);

            if (hasBindings) {
                segments.push(`    __syncRubyGlobals();`);
            }

            segments.push(`    return __result;`);
            segments.push(`};`);
        }
    }

    return segments.join('\n');
}
