<?php

/**
 * @file
 * Groups the /about/team listing by Team Group.
 *
 * Views' own grouping can't do this job: StylePluginBase::renderFields()
 * early-returns when the style doesn't use fields, and the team_members view
 * renders whole nodes (row plugin `entity:node`) rather than field columns. The
 * grouping key therefore comes back empty and every member lands in one
 * unnamed group.
 *
 * Doing it here also handles something Views grouping structurally cannot: a
 * member belonging to several groups is listed under each of them, which the
 * old sacda.ca team page relied on (one member sits in both Project Management
 * and the Advisory Committee).
 *
 * Groups are ordered by taxonomy term weight, so reordering them is a taxonomy
 * edit rather than a code change, and a newly added term appears automatically.
 */

/**
 * Implements hook_preprocess_HOOK() for views-view-unformatted.
 *
 * Adds a `groups` variable: a list of ['title' => string, 'rows' => array].
 * Falls back to leaving `groups` unset when the field is missing, so the
 * template can degrade to a flat grid.
 */
function sacda_preprocess_views_view_unformatted__team_members(array &$variables): void {
  $view = $variables['view'] ?? NULL;
  if (!$view || empty($variables['rows'])) {
    return;
  }

  $buckets = [];
  $ungrouped = [];

  foreach ($variables['rows'] as $i => $row) {
    $node = $view->result[$i]->_entity ?? NULL;
    if (!$node || !$node->hasField('field_team_group')) {
      $ungrouped[] = $row;
      continue;
    }

    $terms = $node->get('field_team_group')->referencedEntities();
    if (!$terms) {
      $ungrouped[] = $row;
      continue;
    }

    // A member with several groups is intentionally repeated under each.
    foreach ($terms as $term) {
      $tid = $term->id();
      if (!isset($buckets[$tid])) {
        $buckets[$tid] = [
          'title' => $term->label(),
          'weight' => (int) $term->getWeight(),
          'rows' => [],
        ];
      }
      $buckets[$tid]['rows'][] = $row;
    }
  }

  if (!$buckets) {
    return;
  }

  uasort($buckets, static fn(array $a, array $b) => $a['weight'] <=> $b['weight']);

  $groups = array_values(array_map(
    static fn(array $b) => ['title' => $b['title'], 'rows' => $b['rows']],
    $buckets
  ));

  // Members with no group still render, in a trailing untitled grid, rather
  // than silently vanishing from the page.
  if ($ungrouped) {
    $groups[] = ['title' => '', 'rows' => $ungrouped];
  }

  $variables['groups'] = $groups;
}
