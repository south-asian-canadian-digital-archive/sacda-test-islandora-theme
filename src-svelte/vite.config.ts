/**
 * @file
 * Vite configuration for SACDA Svelte app.
 * 
 * Builds a single IIFE bundle for Drupal integration.
 * Uses vanilla Svelte (not SvelteKit) for simpler embedding.
 */

import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ mode }) => ({
	plugins: [
		tailwindcss(),
		svelte({
			compilerOptions: {
				dev: mode !== 'production',
			},
		}),
	],

	build: {
		outDir: '../dist',
		emptyOutDir: true,
		sourcemap: mode !== 'production',

		rollupOptions: {
			input: `${__dirname}/src/main.ts`,

			output: {
				format: 'iife',
				entryFileNames: 'js/sacda-app.js',
				assetFileNames: (assetInfo) => {
					if (assetInfo.name?.endsWith('.css')) {
						return 'css/sacda-app.css';
					}
					return 'assets/[name][extname]';
				},
				name: 'SacdaSvelteApp',
				globals: {
					drupal: 'Drupal',
					drupalSettings: 'drupalSettings',
				},
			},

			external: ['drupal', 'drupalSettings'],
		},

		minify: mode === 'production' ? 'esbuild' : false,
	},

	resolve: {
		alias: {
			$lib: `${__dirname}/src/lib`,
		},
	},

	define: {
		'process.env': {},
	},
}));
