# Quest 5 rooms 3–8 · production art

This release uses six separate walkable ground layers, twelve transparent obstacle cutouts and five new enemy sprites. All 23 assets were generated for this build, inspected and exported as WebP. Existing desert D6/D8 creatures and the Swift D6 are reused from the approved rooms.

The shared art direction is warm honey sandstone, amber sand, worn bronze and muted teal fabric, with light from the upper left. Ground images contain no collision objects. Obstacle cutouts have genuine transparency and no baked square ground bases; the renderer clips their physical silhouettes to the server footprint and casts a soft shadow from the resulting silhouette. Character selection, role labels and HP bars remain separate game layers.

The ground is unique to each room: ridge plateau, caravan yard, dry crossing, fortress yard, smuggler trading yard and toll plaza. Props are grouped into the approved map footprints instead of repeating an individual tile for every blocked square. Actor variants distinguish Swift, Ranged, Armoured and Boss enemies.

`QUEST5_COMPLETE_ART_MANIFEST.json` records the production briefs, final dimensions, file sizes and SHA-256 hashes. The toll ground received a further image edit to remove accidental lettering from its lower-left corner before export. New creature briefs used the approved desert creatures as visual references. The manifest records the creature-specific brief, rather than claiming to reproduce every reference image and common generation instruction.

## Integration and performance

- `public/v2-quest5-layouts.mjs` supplies the approved room geometry, foe positions and scenery footprints.
- `public/v2-premium-desert.mjs` loads only the assets required by the room being visited, reuses shared images and caches at most three rendered scenery layers.
- Grounds are 1507 × 1044 pixels; new actors are 640 × 640 pixels. Prop exports are sized for their deployed footprints.
- All pre-existing artwork bytes, including 5-1 and 5-2, are unchanged.
- Old saves with an enemy type absent from the new art set retain the existing generic renderer for that enemy.

The original map sheets in this folder remain the layout reference. Browser review used the shipping canvas renderer with the real game engine through a local test transport. This is implementation evidence, not a concept-art mock-up or a live Cloudflare deployment test.
