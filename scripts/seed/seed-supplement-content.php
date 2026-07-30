<?php

/**
 * @file
 * Seeds temp content for the supplement pages: /exhibits, /about/team,
 * /about/media.
 *
 * The old sacda.ca (CollectiveAccess Pawtucket) hardcoded these lists inside PHP
 * view files, so adding a team member meant a commit and a deploy. This script
 * loads the same records as real nodes so editors can manage them in the UI.
 *
 * Run:
 *   docker exec isle-sacda-drupal-1 drush php:script \
 *     /var/www/drupal/web/themes/custom/sacda/scripts/seed/seed-supplement-content.php
 *
 * Idempotent: nodes and media are matched by title, so re-running updates the
 * existing entities rather than creating duplicates. Safe to run on PROD.
 *
 * Images and documents are NOT committed (~257MB). Point ASSET_DIR at a
 * directory holding them to attach them; without it, nodes are still created
 * with all their text, just no image/file. Recover the originals with:
 *   cd themes/custom/sacda/old_stuff
 *   git ls-files assets/pawtucket/graphics/team | while read -r f; do
 *     git show "HEAD:$f" > /some/dir/team/$(basename "$f"); done
 */

use Drupal\file\Entity\File;
use Drupal\media\Entity\Media;
use Drupal\node\Entity\Node;
use Drupal\taxonomy\Entity\Term;

/**
 * Where to find seed binaries. Env var wins; otherwise a conventional path.
 *
 * Expected layout:
 *   $ASSET_DIR/team/*     headshots
 *   $ASSET_DIR/media/*    PDFs, mp4, mp3
 * Exhibit images come from the theme's own static/graphics/exhibits/.
 */
$asset_dir = getenv('SACDA_SEED_ASSETS') ?: '/tmp/sacda-seed-assets';

$theme_dir = \Drupal::service('extension.list.theme')->getPath('sacda');
$exhibit_img_dir = \Drupal::service('file_system')->realpath($theme_dir . '/static/graphics/exhibits');

$data_file = __DIR__ . '/supplement-content.json';
if (!is_file($data_file)) {
  throw new \RuntimeException("Seed data not found: $data_file");
}
$data = json_decode(file_get_contents($data_file), TRUE, 512, JSON_THROW_ON_ERROR);

$etm = \Drupal::entityTypeManager();
$node_storage = $etm->getStorage('node');
$term_storage = $etm->getStorage('taxonomy_term');
$media_storage = $etm->getStorage('media');
$fs = \Drupal::service('file_system');

$stats = ['created' => 0, 'updated' => 0, 'media' => 0, 'skipped_assets' => []];

/**
 * Loads a taxonomy term by name, creating it if absent.
 */
$get_term = function (string $vid, string $name) use ($term_storage): Term {
  $found = $term_storage->loadByProperties(['vid' => $vid, 'name' => $name]);
  if ($found) {
    return reset($found);
  }
  $term = Term::create(['vid' => $vid, 'name' => $name]);
  $term->save();
  return $term;
};

/**
 * Creates (or reuses) a media entity wrapping a file on disk.
 *
 * Returns NULL when the source file is missing so the seed still produces
 * usable text-only nodes on a checkout without the binaries.
 */
$make_media = function (string $source, string $bundle) use (
  $media_storage, $fs, &$stats
): ?Media {
  if (!is_file($source)) {
    $stats['skipped_assets'][] = basename($source);
    return NULL;
  }

  $name = basename($source);
  $existing = $media_storage->loadByProperties(['name' => $name, 'bundle' => $bundle]);
  if ($existing) {
    return reset($existing);
  }

  $dir = 'public://seed';
  $fs->prepareDirectory($dir, \Drupal\Core\File\FileSystemInterface::CREATE_DIRECTORY);
  $dest = $dir . '/' . $name;

  // Drupal 10.3 deprecated copy() in favour of FileRepository, but copy() on the
  // file_system service is still the portable call across the 10.x line here.
  $uri = $fs->copy($source, $dest, \Drupal\Core\File\FileSystemInterface::EXISTS_REPLACE);

  $file = File::create(['uri' => $uri]);
  $file->setPermanent();
  $file->save();

  $source_field = [
    'image' => 'field_media_image',
    'document' => 'field_media_document',
    'video' => 'field_media_video_file',
    'audio' => 'field_media_audio_file',
  ][$bundle];

  $values = ['bundle' => $bundle, 'name' => $name, 'status' => 1];
  $values[$source_field] = $bundle === 'image'
    ? ['target_id' => $file->id(), 'alt' => pathinfo($name, PATHINFO_FILENAME)]
    : ['target_id' => $file->id()];

  $media = Media::create($values);
  $media->save();
  $stats['media']++;
  return $media;
};

/**
 * Loads a node of $bundle by exact title, or creates a new unsaved one.
 */
$upsert = function (string $bundle, string $title) use ($node_storage, &$stats): Node {
  $found = $node_storage->loadByProperties(['type' => $bundle, 'title' => $title]);
  if ($found) {
    $stats['updated']++;
    return reset($found);
  }
  $stats['created']++;
  return Node::create(['type' => $bundle, 'title' => $title]);
};

// ---------------------------------------------------------------------------
// Exhibits
// ---------------------------------------------------------------------------
foreach ($data['exhibits'] as $row) {
  $node = $upsert('exhibit', $row['title']);
  $node->set('field_description', $row['description']);
  $node->set('field_external_url', ['uri' => $row['url'], 'title' => '']);

  if ($media = $make_media($exhibit_img_dir . '/' . $row['image'], 'image')) {
    $node->set('field_thumbnail', ['target_id' => $media->id()]);
  }

  $node->setPublished();
  $node->save();
}

// ---------------------------------------------------------------------------
// Team members
// ---------------------------------------------------------------------------
foreach ($data['team'] as $row) {
  $node = $upsert('team_member', $row['title']);
  $node->set('field_role', $row['role']);
  $node->set('field_bio', ['value' => $row['bio'], 'format' => 'basic_html']);
  $node->set('field_weight', $row['weight']);

  $groups = [];
  foreach ($row['groups'] as $name) {
    $groups[] = ['target_id' => $get_term('team_group', $name)->id()];
  }
  $node->set('field_team_group', $groups);

  if ($media = $make_media($asset_dir . '/team/' . $row['image'], 'image')) {
    $node->set('field_photo', ['target_id' => $media->id()]);
  }

  $node->setPublished();
  $node->save();
}

// ---------------------------------------------------------------------------
// Media items
// ---------------------------------------------------------------------------
$bundle_for = ['pdf' => 'document', 'video' => 'video', 'audio' => 'audio'];

foreach ($data['media'] as $row) {
  $node = $upsert('media_item', $row['title']);
  $node->set('field_description', $row['description']);
  $node->set('field_author', $row['author']);
  $node->set('field_weight', $row['weight']);

  if (!empty($row['link'])) {
    $node->set('field_source_link', ['uri' => $row['link'], 'title' => '']);
  }
  if (!empty($row['date'])) {
    $node->set('field_publication_date', $row['date']);
  }
  $node->set('field_category', [
    'target_id' => $get_term('media_item_category', $row['category'])->id(),
  ]);

  $bundle = $bundle_for[$row['kind']] ?? 'document';
  if ($media = $make_media($asset_dir . '/media/' . $row['file'], $bundle)) {
    $node->set('field_media', ['target_id' => $media->id()]);
  }

  $node->setPublished();
  $node->save();
}

// ---------------------------------------------------------------------------
printf(
  "nodes created: %d, updated: %d; media created: %d\n",
  $stats['created'], $stats['updated'], $stats['media']
);
if ($stats['skipped_assets']) {
  $missing = array_unique($stats['skipped_assets']);
  printf(
    "%d asset(s) not found under %s — nodes created without them:\n  %s\n",
    count($missing), $asset_dir, implode("\n  ", $missing)
  );
}
