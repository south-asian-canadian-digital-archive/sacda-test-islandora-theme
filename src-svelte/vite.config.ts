/**
 * @file
 * Vite configuration for SACDA Svelte app.
 * 
 * Builds a single bundle for Drupal integration (IIFE format).
 * Output goes to ../dist for the theme's libraries.yml to reference.
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
				// Enable dev mode warnings in development
				dev: mode !== 'production',
			},
		}),
	],

	build: {
		// Output to theme's dist folder (sibling to src-svelte)
		outDir: '../dist',
		emptyOutDir: true,

		// Generate source maps for debugging
		sourcemap: mode !== 'production',

		rollupOptions: {
			input: `${__dirname}/src/main.ts`,

			output: {
				// IIFE format for Drupal script tag loading
				format: 'iife',

				// Consistent filenames (no hashes) for libraries.yml stability
				entryFileNames: 'js/sacda-app.js',
				assetFileNames: (assetInfo) => {
					if (assetInfo.name?.endsWith('.css')) {
						return 'css/sacda-app.css';
					}
					return 'assets/[name][extname]';
				},

				// Global variable name for the bundle
				name: 'SacdaSvelteApp',

				// Map external dependencies to Drupal globals
				globals: {
					drupal: 'Drupal',
					drupalSettings: 'drupalSettings',
				},
			},

			// Don't bundle these - they're provided by Drupal
			external: ['drupal', 'drupalSettings'],
		},

		// Minification settings (esbuild is built-in, terser requires separate install)
		minify: mode === 'production' ? 'esbuild' : false,
	},

	// Resolve aliases
	resolve: {
		alias: {
			$lib: `${__dirname}/src/lib`,
		},
	},

	// Fix for Drupal environment globals
	define: {
		'process.env': {},
	},
}));
