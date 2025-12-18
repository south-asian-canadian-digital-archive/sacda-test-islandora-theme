<!--
  @file
  Root Svelte 5 App component for SACDA Drupal integration.
  
  Uses Svelte 5 Runes ($props, $state) for reactivity.
  Includes a simple client-side router that respects Drupal's base path.
-->

<script lang="ts">
  import { onMount } from "svelte";

  // Props passed from main.ts (via Drupal.behaviors)
  interface Props {
    basePath?: string;
    csrfToken?: string;
    apiEndpoint?: string;
    userId?: number;
  }

  let {
    basePath = "/",
    csrfToken = "",
    apiEndpoint = "/jsonapi",
    userId,
  }: Props = $props();

  // Reactive state for the current route
  let currentPath = $state(window.location.pathname);

  // Simple client-side navigation (respects Drupal basePath)
  function navigate(path: string, event: MouseEvent) {
    event.preventDefault();
    const fullPath = `${basePath}${path}`.replace(/\/+/g, "/");
    window.history.pushState({}, "", fullPath);
    currentPath = fullPath;
  }

  // Handle browser Back/Forward buttons
  onMount(() => {
    const handlePopState = () => {
      currentPath = window.location.pathname;
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  });

  // Helper to check current route
  function isRoute(path: string): boolean {
    const fullPath = `${basePath}${path}`.replace(/\/+/g, "/");
    return (
      currentPath === fullPath || currentPath === fullPath.replace(/\/$/, "")
    );
  }
</script>

<div class="sacda-svelte-app">
  <nav class="app-nav">
    <a
      href="{basePath}/"
      class:active={isRoute("/")}
      onclick={(e) => navigate("/", e)}
    >
      Home
    </a>
    <a
      href="{basePath}/browse"
      class:active={isRoute("/browse")}
      onclick={(e) => navigate("/browse", e)}
    >
      Browse
    </a>
    <a
      href="{basePath}/about"
      class:active={isRoute("/about")}
      onclick={(e) => navigate("/about", e)}
    >
      About
    </a>
  </nav>

  <main class="app-content">
    {#if isRoute("/")}
      <section class="page">
        <h1>SACDA Digital Archive</h1>
        <p>Welcome to the South Asian Canadian Digital Archive.</p>

        <div class="debug-info">
          <h3>Debug Info</h3>
          <pre>
Base Path: {basePath}
API Endpoint: {apiEndpoint}
User ID: {userId ?? "Not logged in"}
CSRF Token: {csrfToken ? "✓ Present" : "✗ Missing"}
          </pre>
        </div>
      </section>
    {:else if isRoute("/browse")}
      <section class="page">
        <h1>Browse Collections</h1>
        <p>Explore our digital collections.</p>
        <!-- TODO: Add collection browser component -->
      </section>
    {:else if isRoute("/about")}
      <section class="page">
        <h1>About SACDA</h1>
        <p>
          Learn more about the South Asian Canadian Digital Archive project.
        </p>
      </section>
    {:else}
      <section class="page">
        <h1>404 - Page Not Found</h1>
        <p>The page <code>{currentPath}</code> does not exist.</p>
        <a href="{basePath}/" onclick={(e) => navigate("/", e)}
          >Return to Home</a
        >
      </section>
    {/if}
  </main>
</div>

<style>
  .sacda-svelte-app {
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }

  .app-nav {
    display: flex;
    gap: 1rem;
    padding: 1rem 0;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 2rem;
  }

  .app-nav a {
    color: #4b5563;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    transition: all 0.2s;
  }

  .app-nav a:hover {
    background-color: #f3f4f6;
    color: #111827;
  }

  .app-nav a.active {
    background-color: #3b82f6;
    color: white;
  }

  .page h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 1rem;
  }

  .page p {
    color: #6b7280;
    line-height: 1.6;
  }

  .debug-info {
    margin-top: 2rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
  }

  .debug-info h3 {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
  }

  .debug-info pre {
    font-family: ui-monospace, monospace;
    font-size: 0.75rem;
    color: #6b7280;
    margin: 0;
    white-space: pre-wrap;
  }

  code {
    background: #f3f4f6;
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-family: ui-monospace, monospace;
  }
</style>
