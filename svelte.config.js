import { mdsvex } from 'mdsvex';
import { svelteRuby } from './ruby-on-svelte/svelte-ruby.js';
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */

const config = {
	preprocess: [
        vitePreprocess(), 
        mdsvex(),
        svelteRuby()
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
