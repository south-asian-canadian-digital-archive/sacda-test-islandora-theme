import { build } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readdirSync, statSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const componentsDir = resolve(__dirname, 'components');

// Function to get directories in components folder, excluding 'lib'
function getComponentDirectories(srcPath) {
	return readdirSync(srcPath).filter(file => {
		const filePath = resolve(srcPath, file);
		return statSync(filePath).isDirectory() && file !== 'lib';
	});
}

async function buildComponents() {
	const components = getComponentDirectories(componentsDir);

	for (const component of components) {
		console.log(`Building component: ${component}`);
		const componentSrc = resolve(componentsDir, component, 'src');
		const componentDist = resolve(componentsDir, component, 'dist');
		const entryFile = resolve(componentSrc, 'main.ts');

		try {
			await build({
				root: componentSrc, // Set root to component source for resolving relative imports if needed
				configFile: resolve(__dirname, 'vite.config.ts'), // Use root vite config
				build: {
					outDir: componentDist,
					emptyOutDir: true,
					rollupOptions: {
						input: entryFile,
						output: {
							entryFileNames: 'assets/[name].js',
							assetFileNames: 'assets/[name].[ext]',
							// Ensure the output is a module so Drupal can load it cleanly
							format: 'es'
						}
					}
				},
				// Define any defines or other shared config here if not in vite.config.ts
			});
			console.log(`Successfully built ${component}`);
		} catch (e) {
			console.error(`Failed to build ${component}:`, e);
			process.exit(1);
		}
	}
}

buildComponents();
