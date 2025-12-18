/**
 * @file
 * SvelteKit layout config - enables SPA mode.
 * 
 * Setting ssr = false makes all routes client-side rendered,
 * which is required for embedding in Drupal.
 */

// Disable server-side rendering - we're a pure SPA
export const ssr = false;

// Disable prerendering - handled at runtime
export const prerender = false;
