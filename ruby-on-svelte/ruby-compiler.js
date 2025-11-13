import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

let opalCompiler = null;
let compilerLoadError = null;

function loadOpalCompiler() {
    if (opalCompiler || compilerLoadError) {
        return opalCompiler;
    }

    try {
        const candidate = require('opal-compiler');

        opalCompiler = candidate?.Builder ? candidate : candidate?.default ?? null;

        if (opalCompiler && !opalCompiler.Builder) {
            throw new Error('The opal-compiler did not expose to a Builder export.');
        }
    } catch (error) {
        compilerLoadError = error;
        opalCompiler = null;
    }

    return opalCompiler;
}

function ensureCompiler() {
    const compiler = loadOpalCompiler();

    if (!compiler) {
        const baseMessage = 
            'The opal-compiler was not found in Node. Install an Opal JavaScript/Node package (ex: "opal-compiler").';

        if (compilerLoadError) {
            throw new Error(`${baseMessage}\nReason: ${compilerLoadError.message}`);
        }
        throw new Error(baseMessage);
    }

    if (!compiler.Builder) {
        throw new Error(
            'Loaded Opal compiler does not export Builder. Verify that "opal-compiler" is installed at version 3.x or newer.'
        );
    }
    return compiler;
}

export async function compileRubyToJS(source, filename = 'Component.rb') {
    if (!source?.trim()) {
        return '';
    }

    const { Builder } = ensureCompiler();

    const builder =
        typeof Builder?.create === 'function' ? Builder.create() : Builder ? new Builder() : null;

    if (!builder || typeof builder.buildString !== 'function') {
        throw new Error('Unable to create an Opal Builder instance.');
    }

    const virtualPath = filename.endsWith('.rb') ? filename : `${filename}.rb`;

    builder.buildString(source, virtualPath);
    
    const output = builder.toString();

    return typeof output === 'string' ? output : String(output);
}
