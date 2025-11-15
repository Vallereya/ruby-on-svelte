import { CompileRuby } from './proc/compiler.js';
import { analyzeRubySource } from './proc/analyze_ruby_source.js';
import { buildRuntimeBridge } from './proc/runtime_bridge.js';

export function RubyOnSvelte(options = {}) {
    const { loadPaths } = options;

    return {
        async script({ content, attributes, filename }) {
            const lang = attributes?.lang?.toLowerCase();
            if (lang !== 'ruby' && lang !== 'rb') {
                return null;
            }

            try {
                const rubySource = content ?? '';
                const metadata = analyzeRubySource(rubySource);
                const compiled = await CompileRuby(rubySource, filename, { loadPaths });
                const bridged = buildRuntimeBridge(compiled.code, metadata);

                return {
                    code: bridged,
                    map: null
                };
            } catch (error) {
                error.message = `[RubyOnSvelte:${filename ?? 'unknown'}] ${error.message}`;
                throw error;
            }
        }
    };
}
