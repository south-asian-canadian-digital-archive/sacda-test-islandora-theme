import { defineConfig, Plugin } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

const __dirname = dirname(fileURLToPath(import.meta.url));

function dynamicInput(): Plugin {
	return {
		name: 'dynamic-input',
		config(config, { command }) {
			// Find all CSS files in src/css/ (exclude partials starting with _)
			const cssFiles = globSync('src/css/**/[!_]*.css').reduce(
				(entries, file) => {
					const name = file.replace('src/css/', '').replace('.css', '');
					entries[name] = resolve(__dirname, file);
					return entries;
				},
				{} as Record<string, string>
			);

			// Find all JS/TS files in src/js/
			const jsFiles = globSync('src/js/**/*.{js,ts,mjs,mts}').reduce(
				(entries, file) => {
					const name = file.replace('src/js/', '').replace(/\.(m?[jt]s)$/, '');
					entries[name] = resolve(__dirname, file);
					return entries;
				},
				{} as Record<string, string>
			);

			return {
				build: {
					rollupOptions: {
						input: {
							...cssFiles,
							...jsFiles,
						},
					},
				},
			};
		},
	};
}

export default defineConfig({
	plugins: [tailwindcss(), dynamicInput()],
	build: {
		outDir: 'dist',
		emptyOutDir: true,
		manifest: false,
		minify: process.env.NODE_ENV === 'production',
		rollupOptions: {
			output: {
				// Keep consistent filenames (no hashes) for Drupal
				entryFileNames: '[name].js',
				chunkFileNames: '[name].js',
				assetFileNames: '[name][extname]',
			},
		},
	},
	css: {
		devSourcemap: true,
	},
});
