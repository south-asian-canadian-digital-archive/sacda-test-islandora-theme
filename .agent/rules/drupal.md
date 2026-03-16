---
trigger: always_on
---

# Islandora/drupal docker context
- docker compose is used for this container setup. 
- main docker compose file is located in ~/islandora-dev/ so all the docker compose commands should be run from there.
- Drupal rootfs is located in ~/islandora-dev/drupal/rootfs/var/www
- the custom themes are mounted in ~/islandora-dev/drupal/rootfs/var/www/drupal/web/themes/custom/ where this sacda theme is located.
- the docker contaner name is drupal-dev when using docker compose but isle-site-template-drupal-dev-1 with just docker

you don't need to build containers, they will be running when you start working. And don't need to clear cache manually every command because of volume mounts, changes will be reflected immediately.

# Drupal Templates 

Because Drupal's available variables change completely depending on the specific template you are overriding (e.g., a node template will have completely different variables than a block or a facet list), there is no single "full list" of all variables. You will generally find the specific variables available for a given template documented in the comments at the very top of the original core Twig file.

However, Drupal does provide global variables available in all templates, as well as a standardized set of core variables like `attributes` that you must handle carefully.

### Global Twig Variables
These are available in every single Twig template in Drupal:
*   `_context`: This references the current context and contains every single variable passed to the template (from preprocess functions or theme calls).[1] Running `{{ dump(_context|keys) }}` is how you see the top-level list of everything available.[1]
*   `_charset`: References the current character set of the page.[1]

### Standard Template Variables
While templates differ, almost all structural templates (nodes, blocks, views, facets) share these core variables:
*   `attributes`: A special Drupal `Attribute` object containing the HTML attributes, classes, and IDs for the main HTML wrapper. 
*   `title_prefix` and `title_suffix`: Empty render arrays specifically designed for modules to inject content directly before or after the main title. Contextual links are the most common feature stored in `title_suffix`. If you do not print these in your template, those features simply won't render.
*   `content`: Usually a render array containing the actual child elements, fields, or items meant to be displayed.

### Conserving and Manipulating Attributes
When building a Tailwind theme, you might be tempted to hardcode your classes like this: `<div class="flex flex-col">`. **Do not do this.** 

If you discard the `attributes` variable, you will break Drupal's JavaScript behaviors, AJAX re-attachments, and module integrations, because Drupal relies on the `attributes` object to inject specific `data-` attributes and IDs into the DOM. 

Instead, you must manipulate the `attributes` object using Twig methods before printing it:

**1. Adding Classes (The right way to add Tailwind)**
Use the `addClass()` method to merge your Tailwind classes into the existing array of Drupal classes.
```twig
<div{{ attributes.addClass('flex', 'flex-col', 'bg-white', 'shadow-md') }}>
```

**2. Removing Core Classes**
If a core Drupal class is interfering with your Tailwind layout, remove it specifically using `removeClass()` rather than deleting the whole attribute object.
```twig
<div{{ attributes.removeClass('item-list__links').addClass('flex', 'space-x-4') }}>
```

**3. Setting and Removing Other Attributes**
You can dynamically modify other HTML attributes using `setAttribute()` and `removeAttribute()`.
```twig
<div{{ attributes.setAttribute('id', 'my-custom-id').removeAttribute('role') }}>
```

**4. Filtering Attributes**
If you need to print the attributes but want to strip out *all* classes (for instance, to move them to an inner wrapper), you can use the `without` filter.
```twig
<div{{ attributes|without('class') }}>
```