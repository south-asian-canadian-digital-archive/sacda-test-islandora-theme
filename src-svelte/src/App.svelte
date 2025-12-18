<!--
  Root Svelte 5 App with custom router.
  Uses page components from $lib/routes/
-->

<script lang="ts">
  import { onMount } from "svelte";

  // Import page components
  import HomePage from "$lib/routes/+page.svelte";
  import AboutPage from "$lib/routes/about/+page.svelte";
  import Layout from "$lib/routes/+layout.svelte";

  // Props from main.ts
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

  // Current route state
  let currentPath = $state(window.location.pathname);

  // Normalize path helper
  function normalizePath(path: string): string {
    return path.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
  }

  // Check if current path matches a route
  function isRoute(path: string): boolean {
    const normalized = normalizePath(basePath + path);
    const current = normalizePath(currentPath);
    return current === normalized;
  }

  // Handle browser back/forward
  onMount(() => {
    const handlePopState = () => {
      currentPath = window.location.pathname;
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  });
</script>

<div class="sacda-svelte-app">
  <Layout>
    {#snippet children()}
      {#if isRoute("/")}
        <HomePage />
      {:else if isRoute("/about")}
        <AboutPage />
      {:else}
        <section class="not-found">
          <h1>404 - Page Not Found</h1>
          <p>The page <code>{currentPath}</code> does not exist.</p>
        </section>
      {/if}
    {/snippet}
  </Layout>
</div>

<style>
  .sacda-svelte-app {
    min-height: 100vh;
  }

  .not-found {
    padding: 2rem;
    text-align: center;
  }

  .not-found h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .not-found code {
    background: #f3f4f6;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
  }
</style>
