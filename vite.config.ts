import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// NOTE: The 'input' variable used in the provided build configuration snippet
// is not defined in the original file. This will cause a reference error.
// For the purpose of faithfully applying the requested change, it is included
// as provided, but you will need to define 'input' or adjust this part
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
		minify: false,
		sourcemap: false, // Disable sourcemaps to avoid CSP eval issues
	},
	css: {
		postcss: './postcss.config.js',
	}
});
