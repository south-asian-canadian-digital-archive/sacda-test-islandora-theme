<?php

/**
 * @file
 * Suppresses node body output on the theme-templated info pages.
 *
 * /about, /contact and /newsletter are `page` nodes whose layout lives entirely
 * in templates/page/page--*.html.twig. The node itself exists only so the route,
 * path alias, menu link and contextual edit links work — its body is a
 * placeholder ("content provided by theme template") that would otherwise print
 * in the middle of the designed layout.
 *
 * The node is still rendered (so admins keep the contextual pencil and the
 * content region isn't empty); only the body field is dropped.
 *
 * Done here rather than in the entity view display because hiding `body` in
 * config would hide it for EVERY basic page, including ordinary editorial ones
 * that have no bespoke template.
 */

/**
 * Info-page aliases whose node body is layout-managed by a page template.
 *
 * Add a path here when a new `page` node gets its own page--*.html.twig.
 */
const SACDA_TEMPLATED_INFO_PATHS = [
  '/about',
  '/contact',
  '/newsletter',
];

/**
 * Implements hook_preprocess_HOOK() for node.
 */
function sacda_preprocess_node(array &$variables): void {
  $node = $variables['node'] ?? NULL;
  if (!$node || $node->bundle() !== 'page' || empty($variables['content']['body'])) {
    return;
  }

  // Match on the node's own alias rather than the current path, so the body
  // stays hidden however the node is routed to.
  $alias = \Drupal::service('path_alias.manager')
    ->getAliasByPath('/node/' . $node->id());

  if (in_array($alias, SACDA_TEMPLATED_INFO_PATHS, TRUE)) {
    unset($variables['content']['body']);
  }
}
