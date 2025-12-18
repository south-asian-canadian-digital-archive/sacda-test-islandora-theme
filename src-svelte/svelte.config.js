import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		// Use static adapter for SPA mode
		adapter: adapter({
			// Output to theme's dist folder
			pages: '../dist',
			assets: '../dist',
			// SPA fallback - all routes serve this HTML
			fallback: 'index.html',
			// Precompress assets
			precompress: false,
			// Strict mode off for SPA
			strict: false,
		}),

		// Base path for Drupal integration
		paths: {
			base: '',
		},

		// Disable prerendering entirely for SPA mode
		prerender: {
			entries: [],
			// Ignore routes that can't be prerendered
			handleMissingId: 'ignore',
			handleHttpError: 'ignore',
			// Don't error on unseen routes - we're an SPA
			handleUnseenRoutes: 'ignore',
		},
	},
};

export default config;
