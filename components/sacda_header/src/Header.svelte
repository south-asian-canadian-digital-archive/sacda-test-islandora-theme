<script lang="ts">
  import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js";
  import { cn } from "$lib/utils.js";
  import { navigationMenuTriggerStyle } from "$lib/components/ui/navigation-menu/navigation-menu-trigger.svelte";
  import type { HTMLAttributes } from "svelte/elements";

  // Define helper types for props matching Drupal menu structure
  interface NavItem {
    title: string;
    url?: string;
    description?: string;
    below?: {
      title: string;
      url?: string;
      description?: string;
    }[]; // Drupal uses 'below' for child items
  }

  // Receive items via props using Svelte 5 runes
  let { items = [] }: { items: NavItem[] } = $props();

  type ListItemProps = HTMLAttributes<HTMLAnchorElement> & {
    title: string;
    url: string;
    content?: string;
  };
</script>

{#snippet ListItem({
  title,
  content,
  url,
  class: className,
  ...restProps
}: ListItemProps)}
  <li>
    <NavigationMenu.Link>
      {#snippet child()}
        <a
          href={url}
          class={cn(
            "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors",
            className,
          )}
          {...restProps}
        >
          <div class="text-sm font-medium leading-none">{title}</div>
          {#if content}
            <p class="text-muted-foreground line-clamp-2 text-sm leading-snug">
              {content}
            </p>
          {/if}
        </a>
      {/snippet}
    </NavigationMenu.Link>
  </li>
{/snippet}

<NavigationMenu.Root viewport={false}>
  <NavigationMenu.List>
    {#each items as item}
      <!-- Render top-level items -->
      {#if item.below && item.below.length > 0}
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>{item.title}</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <!-- 
                Using a grid layout similar to the generic examples. 
                You can adjust grid columns (md:grid-cols-2, etc.) based on preference.
            -->
            <ul
              class="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]"
            >
              {#each item.below as subItem}
                {@render ListItem({
                  url: subItem.url ?? "#",
                  title: subItem.title,
                  content: subItem.description,
                })}
              {/each}
            </ul>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      {:else}
        <NavigationMenu.Item>
          <!-- For leaf items at top level, use a direct Link -->
          <NavigationMenu.Link
            href={item.url ?? "#"}
            class={navigationMenuTriggerStyle()}
          >
            {item.title}
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      {/if}
    {/each}
  </NavigationMenu.List>
</NavigationMenu.Root>
