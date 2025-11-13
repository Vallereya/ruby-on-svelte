import { mdsvex } from 'mdsvex';
import { RubyOnSvelte } from './@ruby-on-svelte/adapter/index.js';
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */

const config = {
	preprocess: [
        vitePreprocess(), 
        mdsvex(),
        RubyOnSvelte({
            loadPaths: [
                'src/lib/modules/ruby'
            ]
        })
    ],
	kit: { 
        adapter: adapter() 
    },
	extensions: [
        '.svelte', 
        '.svx'
    ]
};

export default config;
