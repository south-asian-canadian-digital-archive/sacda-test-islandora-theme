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
 * member belonging to several groups is listed under each applicable public
 * roster without relying on Views' single grouping key.
 *
 * The public page has two rosters: team members and the Advisory Committee.
 * Project Management is a legacy classification and is folded into Advisory
 * Committee so existing nodes are fixed even before their content is updated.
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

  $buckets = [
    'team' => [
      'title' => 'Team Members',
      'rows' => [],
      'seen' => [],
    ],
    'advisory' => [
      'title' => 'Advisory Committee',
      'rows' => [],
      'seen' => [],
    ],
  ];
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

    $entity_id = (string) $node->id();
    foreach ($terms as $term) {
      $group = match ($term->label()) {
        'Advisory Committee', 'Project Management' => 'advisory',
        default => 'team',
      };

      // A legacy Project Management + Advisory assignment must not render the
      // same person twice in the merged Advisory Committee roster.
      if (!isset($buckets[$group]['seen'][$entity_id])) {
        $buckets[$group]['rows'][] = $row;
        $buckets[$group]['seen'][$entity_id] = TRUE;
      }
    }
  }

  $buckets = array_filter($buckets, static fn(array $bucket): bool => (bool) $bucket['rows']);
  if (!$buckets) {
    return;
  }

  $groups = array_values(array_map(
    static fn(array $bucket): array => [
      'title' => $bucket['title'],
      'rows' => $bucket['rows'],
    ],
    $buckets
  ));

  // Members with no group still render, in a trailing untitled grid, rather
  // than silently vanishing from the page.
  if ($ungrouped) {
    $groups[] = ['title' => '', 'rows' => $ungrouped];
  }

  $variables['groups'] = $groups;
}
