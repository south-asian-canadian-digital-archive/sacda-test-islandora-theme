/**
 * @file
 * Drupal Behaviors entry point for the Svelte 5 app.
 * 
 * This file integrates the Svelte SPA with Drupal's lifecycle via behaviors.
 */

import { mount, unmount } from 'svelte';
import App from './App.svelte';
import './app.css';

// Type declarations for Drupal globals
declare global {
	interface Window {
		Drupal: {
			behaviors: Record<string, {
				attach: (context: Element | Document, settings: DrupalSettings) => void;
				detach?: (context: Element | Document, settings: DrupalSettings, trigger: string) => void;
			}>;
		};
		drupalSettings: DrupalSettings;
	}
}

interface DrupalSettings {
	sacdaSvelteApp?: {
		basePath: string;
		csrfToken: string;
		apiEndpoint: string;
		userId?: number;
	};
	path?: {
		baseUrl: string;
	};
}

// Store app instance for unmounting
let appInstance: ReturnType<typeof mount> | null = null;

/**
 * Drupal Behavior for the SACDA Svelte App.
 * 
 * Uses the data-processed attribute pattern (alternative to core/once)
 * to prevent multiple mounts on AJAX refreshes.
 */
window.Drupal = window.Drupal || { behaviors: {} };

window.Drupal.behaviors.sacdaSvelteApp = {
	attach(context: Element | Document, settings: DrupalSettings) {
		const targetId = 'sacda-svelte-app';
		const target = (context === document ? document : context).querySelector(`#${targetId}`);

		// Guard: Only mount once using data attribute
		if (target && !target.hasAttribute('data-svelte-mounted')) {
			target.setAttribute('data-svelte-mounted', 'true');

			// Get config from drupalSettings or use defaults
			const appConfig = settings?.sacdaSvelteApp || {
				basePath: settings?.path?.baseUrl || '/',
				csrfToken: '',
				apiEndpoint: '/jsonapi',
			};

			// Svelte 5 mount API
			appInstance = mount(App, {
				target: target,
				props: {
					basePath: appConfig.basePath,
					csrfToken: appConfig.csrfToken,
					apiEndpoint: appConfig.apiEndpoint,
					userId: appConfig.userId,
				},
			});
		}
	},

	detach(context: Element | Document, _settings: DrupalSettings, trigger: string) {
		// Only unmount on 'unload' trigger (page navigation), not on AJAX refreshes
		if (trigger === 'unload' && appInstance) {
			const target = (context === document ? document : context).querySelector('#sacda-svelte-app');
			if (target) {
				unmount(appInstance);
				appInstance = null;
				target.removeAttribute('data-svelte-mounted');
			}
		}
	},
};
