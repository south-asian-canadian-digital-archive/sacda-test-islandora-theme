import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
	plugins: [svelte()],
	resolve: {
		alias: {
			// Allow components to import from lib easily
			'$lib': resolve(__dirname, 'components/lib'),
		},
	},
	// Base build config, will be overridden/extended by build.js
	build: {
		minify: true,
	},
	css: {
		postcss: './postcss.config.js',
	}
});
