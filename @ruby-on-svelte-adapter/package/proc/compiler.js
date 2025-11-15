import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

let opalCompiler = null;
let compilerLoadError = null;

function normalizeLoadPathList(paths) {
    if (!paths) {
        return [];
    }
    if (Array.isArray(paths)) {
        return paths;
    }
    return [paths];
}

function resolveLoadPaths(filename, extraPaths = []) {
    const resolved = new Set();
    const cwd = process.cwd();
    const projectRoot = path.resolve(cwd);

    resolved.add(projectRoot);

    const addPath = (candidate) => {
        if (!candidate) {
            return;
        }
        const normalized = path.resolve(candidate);
        resolved.add(normalized);
    };

    const addAncestorDirectories = (start) => {
        if (!start) {
            return;
        }
        let current = path.resolve(start);
        while (true) {
            addPath(current);
            if (current === projectRoot) {
                break;
            }
            const parent = path.dirname(current);
            if (parent === current) {
                break;
            }
            current = parent;
        }
    };

    if (filename && typeof filename === 'string') {
        const absolute = path.isAbsolute(filename) ? filename : path.join(cwd, filename);
        const parentDir = path.dirname(absolute);
        if (parentDir && parentDir !== '.') {
            addAncestorDirectories(parentDir);
        }
    }

    for (const entry of normalizeLoadPathList(extraPaths)) {
        if (!entry || typeof entry !== 'string') {
            continue;
        }
        addPath(entry);
    }

    const existing = [];
    for (const candidate of resolved) {
        try {
            if (fs.statSync(candidate).isDirectory()) {
                existing.push(candidate);
            }
        } catch {
            // Ignores.
        }
    }

    return existing;
}

function loadOpalCompiler() {
    if (opalCompiler || compilerLoadError) {
        return opalCompiler;
    }

    try {
        const candidate = require('opal-compiler');

        opalCompiler = candidate?.Builder ? candidate : candidate?.default ?? null;

        if (opalCompiler && !opalCompiler.Builder) {
            throw new Error('The "opal-compiler" did not expose a Builder export.');
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
            'The "opal-compiler" was not found in Node. Install an Opal JavaScript/Node package (ex: "opal-compiler").';

        if (compilerLoadError) {
            throw new Error(`${baseMessage}\nReason: ${compilerLoadError.message}`);
        }
        throw new Error(baseMessage);
    }

    if (!compiler.Builder) {
        throw new Error(
            'Loaded "opal-compiler" does not export the Builder. Verify that "opal-compiler" is installed and at version 3.x or newer.'
        );
    }
    return compiler;
}

export async function CompileRuby(source, filename = 'Component.rb', options = {}) {
    const rubySource = source ?? '';
    if (!rubySource.trim()) {
        return { code: '', map: null };
    }

    const { Builder } = ensureCompiler();

    const builder =
        typeof Builder?.create === 'function'
            ? Builder.create()
            : Builder
              ? new Builder()
              : null;

    if (!builder || typeof builder.buildString !== 'function') {
        throw new Error('Unable to create an Opal Builder instance, do you have an incompatible "opal-compiler" version?');
    }

    const normalizedFilename =
        typeof filename === 'string' && filename.length ? filename : 'Component.rb';
    const virtualPath = normalizedFilename.endsWith('.rb')
        ? normalizedFilename
        : `${normalizedFilename}.rb`;

    const loadPaths = resolveLoadPaths(filename, options.loadPaths);
    if (loadPaths.length) {
        for (const directory of loadPaths) {
            builder.appendPaths(directory);
        }
    }

    builder.buildString(rubySource, virtualPath);
    
    const output =
        typeof builder.toString === 'function' ? builder.toString() : '';
    const code = typeof output === 'string' ? output : String(output);

    const sourceMap =
        typeof builder.getSourceMap === 'function' ? builder.getSourceMap() ?? null : null;

    return { code, map: sourceMap };
}
