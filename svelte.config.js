import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [vitePreprocess(), mdsvex()],
	kit: {
		adapter: adapter({
			runtime: 'nodejs22.x'
		}),
		prerender: {
			handleHttpError: ({ path, referrer, message }) => {
				// Ignore missing assets referenced in blog posts
				if (path.startsWith('/assets/')) {
					console.warn(`Missing asset: ${path} (referenced from ${referrer})`);
					return;
				}
				throw new Error(message);
			}
		}
	},
	extensions: ['.svelte', '.svx']
};

export default config;
