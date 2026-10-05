# Pixel-comic ending assets · v0.3

Created for the authorized ending build based on `The_Day_the_Letter_Came_Ending_Directors_Cut_v03.md`. These are original fictional illustrations of the established story, not historical facsimiles or archival images.

## Tool and references

All artwork used the **built-in imagegen tool**. Four new compositions were generated, then small phone-orientation and resident-identity corrections were made with the same tool in edit mode. No fallback CLI, stock artwork, or external game assets were used.

The two initial inputs were references only, never initial edit targets:

1. Exact known courtyard geography, architecture, palette and pixel treatment: `/Users/macbookpro/Documents/Codex/2026-10-04/bui/outputs/the-day-the-letter-came/dist/assets/ningbo-courtyard.webp`
2. Human/character drawing treatment and cream-shirt Sheng design: `/Users/macbookpro/Documents/Codex/2026-10-04/bui/outputs/the-day-the-letter-came/dist/assets/family-page.webp`

All outputs are opaque. Important dialogue, document wording, Chinese text and the saved childhood sentence are separate runtime layers. No game text, labels, logos or phone UI is baked into these artworks.

## Selected production files

The WebP files were exported losslessly without resizing. The source pixels were checked against their selected native PNGs. Native originals remain in the generated-images directory; selected PNG copies are also retained in the workspace.

| Integrated artwork | Dimensions | Selected native PNG | Workspace original |
| --- | --- | --- | --- |
| `dist/assets/comic-reunion.webp` | 1586 × 992 | `/Users/macbookpro/.codex/generated_images/01a10736-70d6-7b40-bc90-9e5824753f66/exec-5da593da-505b-469e-b64e-b283998aebd8.png` | `/Users/macbookpro/Documents/Codex/2026-10-04/bui/work/assets-source/comic-reunion-v03.png` |
| `dist/assets/comic-courtyards.webp` | 1586 × 992 | `/Users/macbookpro/.codex/generated_images/01a10736-70d6-7b40-bc90-9e5824753f66/exec-cbaa9b12-50da-4f77-aedc-0423d9d6b6be.png` | `/Users/macbookpro/Documents/Codex/2026-10-04/bui/work/assets-source/comic-courtyards-v03.png` |
| `dist/assets/comic-open-call.webp` | 1586 × 992 | `/Users/macbookpro/.codex/generated_images/01a10736-70d6-7b40-bc90-9e5824753f66/exec-2de48fed-2a5f-41d4-935f-0a7e37ce8e5a.png` | `/Users/macbookpro/Documents/Codex/2026-10-04/bui/work/assets-source/comic-open-call-v03.png` |
| `dist/assets/comic-support.webp` | 1586 × 992 | `/Users/macbookpro/.codex/generated_images/01a10736-70d6-7b40-bc90-9e5824753f66/exec-185494fd-3ea2-4d87-88a7-dc1c38cf9049.png` | `/Users/macbookpro/Documents/Codex/2026-10-04/bui/work/assets-source/comic-support-v03.png` |

## Crop layouts

- **Reunion:** use full `(0,0,1586,992)`. Grown cream-shirt Sheng is visibly taller than the brown-shirt returning father; their feet share the same ground plane. There is no specified return year or precise age.
- **Matched courtyards:** two equal wide panels stacked. Childhood: `(sx:0,sy:0,sw:1586,sh:496)`. Present: `(sx:0,sy:496,sw:1586,sh:496)`. Each crop has a 16:5 aspect ratio. The doorway, chipped step, left laundry, right shelter and gray-tiled house match between panels. The present tea-table resident is a dark-haired woman in ochre, distinct from Sheng at the other end of the call.
- **Open call:** use the full `(0,0,1586,992)` spread. The generated spatial divider is approximately `x724–749`, so the left room occupies about 46% and the right courtyard about 54%; it is not an exact 50% crop boundary. The screen of Jo's tabletop phone visibly faces Jo; its rear camera is on the far side toward the courtyard.
- **Support atlas:** exact 2 × 2 layout. Each crop is **793 × 496** (8:5). Upper left `(0,0,793,496)`: Jo/Auntie, phone and family folder at tea table. Upper right `(793,0,793,496)`: normal hands opening blank ruled notebook. Lower left `(0,496,793,496)`: ordinary older Sheng with phone, thoughtful rather than frail. Lower right `(793,496,793,496)`: Jo holding the phone out; blank screen faces her and the far rear camera faces the yard.

## Optional restrained animation anchors

Approximate source-pixel positions in the selected **open-call** spread; divide x by 1586 and y by 992 for normalized overlay coordinates:

| Detail | Source coordinates | Normalized coordinates |
| --- | --- | --- |
| Foreground tea-cup steam origin | `(1137,596)` | `(0.7169,0.6008)` |
| Foreground tea-cup rim | `(1137,598)` | `(0.7169,0.6028)` |
| Friend's cup rim | `(1150,554)` | `(0.7251,0.5585)` |
| Pale hanging cloth center | `(810,198)` | `(0.5107,0.1996)` |
| Pale hanging cloth bounds | `(790,166,40,65)` | Approximate only |
| Native settled ball center | `(1464,427)`, radius about 24 | `(0.9231,0.4304)` |
| Child's feet | `(1340,447)`, `(1412,434)` | Approximate only |
| Jo's visible seated foot | `(1215,905)` | `(0.7661,0.9123)` |

The final illustration already contains **one ball by the child**. A temporary pass overlay should fade into that native ball at arrival and disappear in the settled frame. If only one ball should be visible during the flight, mask the native ball area temporarily. Reduced-motion presentation can show the selected settled image directly.

## Visual verification

All initial outputs and selected edits were viewed. The reunion's eyeline/height relation, solid ordinary bodies, consistent live courtyard palette, matched landmarks, separate phone locations, blank notebook, and corrected phone faces were checked. The known courtyard remains recognizable. The caller is not duplicated as a cream-shirt resident in the present diptych. There are no ghosts, tears, uniforms or grave imagery.

Only art files and this production note were changed in this asset task; game code and CSS were not edited.

## Exact prompts and source lineage

The complete submitted text follows. No omitted shorthand is needed to reproduce the inputs. The selected outputs depend on the listed original references/edit targets as well as each prompt.

### Initial generation 1: comic-reunion

Tool mode: built-in imagegen **generate**; `transparent_background:false`. Both reference paths listed above were supplied as `referenced_image_paths`. Native initial output: `/Users/macbookpro/.codex/generated_images/01a10736-70d6-7b40-bc90-9e5824753f66/exec-5da593da-505b-469e-b64e-b283998aebd8.png`.

```text
Use case: illustration-story
Asset type: production hero artwork for an original fictional pixel-comic game finale.
Format: landscape 8:5 (1600x1000 ideal), full canvas, opaque.
Input roles: image1 is the EXACT familiar courtyard architecture/geography plus palette reference; image2 is pixel character drawing and the cream-shirt Sheng design reference. Both are REFERENCES ONLY; generate new illustrations, do not edit either source.
Style: deliberately authored FLAT nostalgic 16-bit pixel art, crisp visible square pixels and stepped outlines, restrained handdrawn game illustration, same logical pixel scale across figures and environment. Golden ochre stone/wood, warm cream, muted jade greenery, dark gray roof tiles, deep indigo/navy shadows and red accents. Ordinary properly proportioned adult bodies, no photo, no smooth oil painting or glossy 3D.
Character consistency where present: grown Sheng has short dark hair, plain CREAM shirt, NAVY trousers; older present-day Sheng is the same man with short GRAY hair, cream shirt/navy trousers, ordinary healthy older-adult posture. Adult Jo is an East Asian woman with short dark bob hair, plain muted RED shirt/jacket and dark NAVY trousers. Mother Chunxiu has tied-back dark hair and a TEAL dress/work outfit; Auntie is an ordinary older woman in muted teal/gray clothing. No unexplained frailty.
Geography where courtyard appears: the same gray-tiled house spans upper edge, dark goal-like doorway just LEFT of center around x37%, chipped stone step beneath, laundry at LEFT edge, sewing/mending table beneath tiled rain shelter at upper-RIGHT around x80%, plants along right edge, familiar projecting stone corner lower-left. Keep these relationships, not a random similar courtyard.
Constraints for every panel: NO text, letters, Chinese glyphs, labels, numerals, speech balloons, UI, logos, watermarks, dates, seals, invented stamps. No ghosts, graves, death imagery, tears, uniforms, or dramatic grief. No caption or thesis drawn into art. Original fictional staging, not historical facsimile.
Primary scene: ONE single hero composition at the familiar courtyard threshold, visualizing the father's later return without specifying any exact year, age or duration. A returning East Asian FATHER in a plain muted BROWN shirt faces his now-GROWN adult son Sheng in cream shirt/navy trousers. Father is clearly SHORTER than the grown son. Both feet stand on the SAME LEVEL of courtyard ground, so the height difference is bodily, not produced by the step. Father lifts his gaze gently upward toward Sheng; Sheng's chin and eyeline tilt slightly down toward father. This eyeline and shoulder-height relation is the primary subject. Father has simple short dark/graying hair, ordinary ununiformed clothing, no luggage. A modest beginning of a hand lifted toward the taller son's shoulder is optional; no embrace required.
Composition: both figures full-body or below-knee readable at center-left beside dark doorway and chipped step; human proportions, two adults, son not a little boy. Show familiar facade and a glimpse of right rain shelter to anchor the place. Quiet ordinary reunion, life continuing, warm restrained light. No child duplicate, no present-day older caller in this scene, no third generation. The father really returned.
```

### Initial generation 2: comic-courtyards

Tool mode: built-in imagegen **generate**; `transparent_background:false`. Both reference paths listed above were supplied as `referenced_image_paths`. Native initial output: `/Users/macbookpro/.codex/generated_images/01a10736-70d6-7b40-bc90-9e5824753f66/exec-4b539474-e9d1-4f67-b764-76d3ad348a26.png`.

```text
Use case: illustration-story
Asset type: production hero artwork for an original fictional pixel-comic game finale.
Format: landscape 8:5 (1600x1000 ideal), full canvas, opaque.
Input roles: image1 is the EXACT familiar courtyard architecture/geography plus palette reference; image2 is pixel character drawing and the cream-shirt Sheng design reference. Both are REFERENCES ONLY; generate new illustrations, do not edit either source.
Style: deliberately authored FLAT nostalgic 16-bit pixel art, crisp visible square pixels and stepped outlines, restrained handdrawn game illustration, same logical pixel scale across figures and environment. Golden ochre stone/wood, warm cream, muted jade greenery, dark gray roof tiles, deep indigo/navy shadows and red accents. Ordinary properly proportioned adult bodies, no photo, no smooth oil painting or glossy 3D.
Character consistency where present: grown Sheng has short dark hair, plain CREAM shirt, NAVY trousers; older present-day Sheng is the same man with short GRAY hair, cream shirt/navy trousers, ordinary healthy older-adult posture. Adult Jo is an East Asian woman with short dark bob hair, plain muted RED shirt/jacket and dark NAVY trousers. Mother Chunxiu has tied-back dark hair and a TEAL dress/work outfit; Auntie is an ordinary older woman in muted teal/gray clothing. No unexplained frailty.
Geography where courtyard appears: the same gray-tiled house spans upper edge, dark goal-like doorway just LEFT of center around x37%, chipped stone step beneath, laundry at LEFT edge, sewing/mending table beneath tiled rain shelter at upper-RIGHT around x80%, plants along right edge, familiar projecting stone corner lower-left. Keep these relationships, not a random similar courtyard.
Constraints for every panel: NO text, letters, Chinese glyphs, labels, numerals, speech balloons, UI, logos, watermarks, dates, seals, invented stamps. No ghosts, graves, death imagery, tears, uniforms, or dramatic grief. No caption or thesis drawn into art. Original fictional staging, not historical facsimile.
Primary scene: exactly TWO perfectly equal WIDE panels STACKED vertically, split at exactly50% of canvas HEIGHT, clean narrow dark horizontal rule at the split and no other frame/gutters. Top and bottom repeat precisely the SAME courtyard composition/camera/doorway/step/rain shelter/laundry positions from image1; the architecture must visually line up vertically between panels. This is an editorial past/present comparison, not supernatural imagery. Both panels equally vivid in the same jade/ochre/navy palette; no sepia past or gray abandoned present.
TOP PANEL: childhood afternoon in the known courtyard. Mother Chunxiu in teal is busy mending under the RIGHT rain shelter. Small cream-shirt boy Sheng moves back across open yard toward two friends: rust-shirt Qiang and younger yellow-shirt child, with a small ordinary ball. Mother remains recognizably occupied with paid work. Do not invent a score or trophy; allow a simple return-to-play gesture.
BOTTOM PANEL: present-day same living courtyard, repaired surfaces and modest contemporary belongings. Adult Jo in red/dark trousers holds a phone near left-middle, accompanied by her jade-shirt friend. An older resident/Auntie and one present child are ordinary current residents, fully solid, no deceased relatives. Modest tea table at right-middle beside the familiar shelter. The old doorway, chipped step, left laundry and right shelter hold the exact geography from TOP. Clear open space, ordinary visit and continued life.
No overlap or translucent figure across the split. NO text or dates in either panel.
```

### Initial generation 3: comic-open-call

Tool mode: built-in imagegen **generate**; `transparent_background:false`. Both reference paths listed above were supplied as `referenced_image_paths`. Native initial output: `/Users/macbookpro/.codex/generated_images/01a10736-70d6-7b40-bc90-9e5824753f66/exec-b0e457ae-224e-43e6-b5d9-6b8ba98f8369.png`.

```text
Use case: illustration-story
Asset type: production hero artwork for an original fictional pixel-comic game finale.
Format: landscape 8:5 (1600x1000 ideal), full canvas, opaque.
Input roles: image1 is the EXACT familiar courtyard architecture/geography plus palette reference; image2 is pixel character drawing and the cream-shirt Sheng design reference. Both are REFERENCES ONLY; generate new illustrations, do not edit either source.
Style: deliberately authored FLAT nostalgic 16-bit pixel art, crisp visible square pixels and stepped outlines, restrained handdrawn game illustration, same logical pixel scale across figures and environment. Golden ochre stone/wood, warm cream, muted jade greenery, dark gray roof tiles, deep indigo/navy shadows and red accents. Ordinary properly proportioned adult bodies, no photo, no smooth oil painting or glossy 3D.
Character consistency where present: grown Sheng has short dark hair, plain CREAM shirt, NAVY trousers; older present-day Sheng is the same man with short GRAY hair, cream shirt/navy trousers, ordinary healthy older-adult posture. Adult Jo is an East Asian woman with short dark bob hair, plain muted RED shirt/jacket and dark NAVY trousers. Mother Chunxiu has tied-back dark hair and a TEAL dress/work outfit; Auntie is an ordinary older woman in muted teal/gray clothing. No unexplained frailty.
Geography where courtyard appears: the same gray-tiled house spans upper edge, dark goal-like doorway just LEFT of center around x37%, chipped stone step beneath, laundry at LEFT edge, sewing/mending table beneath tiled rain shelter at upper-RIGHT around x80%, plants along right edge, familiar projecting stone corner lower-left. Keep these relationships, not a random similar courtyard.
Constraints for every panel: NO text, letters, Chinese glyphs, labels, numerals, speech balloons, UI, logos, watermarks, dates, seals, invented stamps. No ghosts, graves, death imagery, tears, uniforms, or dramatic grief. No caption or thesis drawn into art. Original fictional staging, not historical facsimile.
Primary scene: ONE large final spread split into two PHYSICALLY SEPARATE present-day locations, a clear NARROW dark vertical divider at exactly50% image width. LEFT is an ordinary room elsewhere; RIGHT is the familiar courtyard. Do NOT merge their architecture into one magical space.
LEFT HALF: older Sheng with short gray hair, cream shirt/navy trousers sits comfortably on an ordinary wooden chair in a modest jade-walled room, holding his smartphone and looking attentively at it. Gentle ordinary posture, not frail or bereaved. A small cup and book nearby, no memorial portrait. No phone screen UI visible.
RIGHT HALF: adult Jo in red shirt and dark trousers now SEATED at a small tea table in the ACTUAL courtyard from image1. Her smartphone is propped UPRIGHT beside a cup, still supporting the open call. IMPORTANT phone orientation: its REAR CAMERA points outward into the OPEN YARD; its blank dark SCREEN faces Jo. Show a slight side/back view of the phone and a tiny rear-lens dot so this practical arrangement makes sense. Do not point rear lens toward Jo, lay the phone face down, or draw a video face/interface into it. Jade-shirt friend nearby moves a cup or stands beside table. A solid present-day child plays with a ball beyond them in the open yard. Familiar doorway and chipped step at left background of RIGHT half, mending rain shelter at right background, lively green plants. Little steam from cup and hanging cloth.
Compatible ordinary light and figure scale connect the two halves while the divider makes spatial distinction obvious. The composition should feel complete and worth staying with after dialogue is gone. Exactly one older caller LEFT and one Jo RIGHT; no duplicated faces or grief symbols.
```

### Initial generation 4: comic-support

Tool mode: built-in imagegen **generate**; `transparent_background:false`. Both reference paths listed above were supplied as `referenced_image_paths`. Native initial output: `/Users/macbookpro/.codex/generated_images/01a10736-70d6-7b40-bc90-9e5824753f66/exec-a523232e-31f1-4221-adf8-9640db3119ab.png`.

```text
Use case: illustration-story
Asset type: production hero artwork for an original fictional pixel-comic game finale.
Format: landscape 8:5 (1600x1000 ideal), full canvas, opaque.
Input roles: image1 is the EXACT familiar courtyard architecture/geography plus palette reference; image2 is pixel character drawing and the cream-shirt Sheng design reference. Both are REFERENCES ONLY; generate new illustrations, do not edit either source.
Style: deliberately authored FLAT nostalgic 16-bit pixel art, crisp visible square pixels and stepped outlines, restrained handdrawn game illustration, same logical pixel scale across figures and environment. Golden ochre stone/wood, warm cream, muted jade greenery, dark gray roof tiles, deep indigo/navy shadows and red accents. Ordinary properly proportioned adult bodies, no photo, no smooth oil painting or glossy 3D.
Character consistency where present: grown Sheng has short dark hair, plain CREAM shirt, NAVY trousers; older present-day Sheng is the same man with short GRAY hair, cream shirt/navy trousers, ordinary healthy older-adult posture. Adult Jo is an East Asian woman with short dark bob hair, plain muted RED shirt/jacket and dark NAVY trousers. Mother Chunxiu has tied-back dark hair and a TEAL dress/work outfit; Auntie is an ordinary older woman in muted teal/gray clothing. No unexplained frailty.
Geography where courtyard appears: the same gray-tiled house spans upper edge, dark goal-like doorway just LEFT of center around x37%, chipped stone step beneath, laundry at LEFT edge, sewing/mending table beneath tiled rain shelter at upper-RIGHT around x80%, plants along right edge, familiar projecting stone corner lower-left. Keep these relationships, not a random similar courtyard.
Constraints for every panel: NO text, letters, Chinese glyphs, labels, numerals, speech balloons, UI, logos, watermarks, dates, seals, invented stamps. No ghosts, graves, death imagery, tears, uniforms, or dramatic grief. No caption or thesis drawn into art. Original fictional staging, not historical facsimile.
Asset type override: supporting pixel-comic scene atlas.
Primary request: outer landscape8:5 divided into a perfectly equal2x2 grid of FOUR landscape panels, exact splits at50%width and50%height, no outer border/gutters, a thin dark rule between scenes only. Each quadrant will be cropped separately, so scene content must stay inside its quadrant.
UPPER LEFT: Jo in red and older Auntie in muted teal/gray at a modest courtyard tea table, Jo holding phone for Auntie to see, a plain open family folder and cup on table. Familiar dark doorway/chipped step/shelter in background relationships. Warm ordinary welcome, no drama.
UPPER RIGHT: close-up of two normal fully clothed people's hands opening a small warm cream unlettered NOTEBOOK on the wooden table, one steadies the edge while another turns page. Big clear blank paper area for separately rendered accessible text. Faint ruled lines allowed, NO written glyphs/numbers, no face needed.
LOWER LEFT: dedicated close-up of older Sheng's gray-haired face and cream-shirt shoulders, one ordinary hand holds phone beside/lower than face. Thoughtful, a little turned gaze, not frail, not weeping; modest jade room background. Match olderSheng in final spread.
LOWER RIGHT: Jo in red holding and turning her smartphone so its REAR CAMERA faces outward toward the ACTUAL familiar courtyard doorway/step/shelter; phone screen toward Jo, no UI. Over-the-shoulder or side angle, readable practical hand adjustment; coherent short dark bob.
Only normal solid people, no ghost overlays. Exactly these four panels in this order. Character proportions consistent with references and other hero compositions.
```

### Targeted edit 1: Open-call phone orientation edit

Tool mode: built-in imagegen **edit**; `transparent_background:false`. Sole edit target supplied via `referenced_image_paths`: `/Users/macbookpro/.codex/generated_images/01a10736-70d6-7b40-bc90-9e5824753f66/exec-b0e457ae-224e-43e6-b5d9-6b8ba98f8369.png`. Native output: `/Users/macbookpro/.codex/generated_images/01a10736-70d6-7b40-bc90-9e5824753f66/exec-d9921d78-8fb6-4319-ba67-daaa41f903d1.png`. The first correction left the visible rear-lens circles; the literal follow-up below supplies the selected final version.

```text
Use case: precise-object-edit
Image1 is the EDIT TARGET, the existing pixel-art final open-call spread. Make ONE focused correction: the upright smartphone on the tea table in the RIGHT courtyard half must support the rear-camera view of the yard.
Keep EVERYTHING else exactly the same: entire composition, split divider, left older Sheng, seated red-shirt Jo, friend, child with ball, cups/table, actual courtyard architecture, colors, shadows and pixel style.
Correct the tabletop phone so its SCREEN SIDE faces Jo and the viewer, shown as simple blank dark glass with NO UI and NO rear-lens circles on that face. Rotate the upright phone/stand slightly as needed. Its actual REAR CAMERA is on the FAR SIDE, facing AWAY from Jo and OUT into the background open yard where the child is playing. The camera lens may therefore be hidden on the far side; do not show the rear lens toward Jo or the viewer. Make the spatial device orientation unambiguous: Jo sees the screen, the rear lens sees the courtyard, phone remains standing upright beside tea.
Preserve all pixel-art details outside this small device/stand. No writing, labels, UI, text or new people.
```

### Targeted edit 2: Supporting camera-view phone correction

Tool mode: built-in imagegen **edit**; `transparent_background:false`. Sole edit target supplied via `referenced_image_paths`: `/Users/macbookpro/.codex/generated_images/01a10736-70d6-7b40-bc90-9e5824753f66/exec-a523232e-31f1-4221-adf8-9640db3119ab.png`. Native output: `/Users/macbookpro/.codex/generated_images/01a10736-70d6-7b40-bc90-9e5824753f66/exec-185494fd-3ea2-4d87-88a7-dc1c38cf9049.png`. Selected final supporting atlas.

```text
Use case: precise-object-edit
Image1 is the EDIT TARGET, a four-quadrant pixel-art support atlas. Change ONLY the smartphone face/orientation in the LOWER RIGHT quadrant where red-shirt Jo holds the phone out toward the yard.
Keep ALL FOUR equal quadrants and their exact boundaries, all people, hands, notebook, rooms, architecture and colors identical. Do not change Jo's pose, head, clothing, courtyard view or any other quadrant.
The phone should show Jo and the viewer the FRONT SCREEN side as simple blank dark glass, NO UI and NO rear-lens circles visible on that face. Its REAR CAMERA must point on the FAR SIDE AWAY from Jo into the background courtyard/doorway. From this over-the-shoulder position we see the SCREEN facing Jo; the far hidden rear lens sees the yard. Keep it horizontal in her normal hands, so this is a practical rear-camera view, not a selfie. Remove the rear-lens circles currently on the face toward Jo and make that face the blank screen instead.
No text, numbers, logos, labels or interface. Preserve crisp visible square pixels and all unedited details.
```

### Targeted edit 3: Present courtyard resident identity correction

Tool mode: built-in imagegen **edit**; `transparent_background:false`. Sole edit target supplied via `referenced_image_paths`: `/Users/macbookpro/.codex/generated_images/01a10736-70d6-7b40-bc90-9e5824753f66/exec-4b539474-e9d1-4f67-b764-76d3ad348a26.png`. Native output: `/Users/macbookpro/.codex/generated_images/01a10736-70d6-7b40-bc90-9e5824753f66/exec-cbaa9b12-50da-4f77-aedc-0423d9d6b6be.png`. Selected final diptych. Only the seated cream-shirt/gray-haired resident was replaced.

```text
Use case: precise-object-edit
Image1 is the EDIT TARGET, an existing pixel-art courtyard diptych with two equal stacked panels.
Make ONE targeted character correction ONLY in the BOTTOM PRESENT-DAY panel: the seated gray-haired man in a CREAM shirt at the BOTTOM-RIGHT tea table looks too much like older Sheng, who is actually elsewhere on the phone. Replace ONLY that one seated figure with an ordinary unnamed MIDDLE-AGED FEMALE RESIDENT, with DARK hair, a muted OCHRE blouse and dark trousers. Keep her seated naturally in exactly the existing figure's position and scale, holding the existing cup or resting her hands naturally. A fully clothed ordinary resident, no named-relative symbolism.
Keep EVERYTHING ELSE identical: exact two-panel split at half height, dimensions, actual courtyard architecture/doorway/chipped step/shelter/laundry, all plants/stones, TOP Mother and children, BOTTOM red-shirt Jo/green-shirt friend, older teal resident, child/cat, cups/table, lighting, palette and square pixels. Do not add a new person elsewhere or alter the camera.
No text, labels, glyphs, logos, dates, UI, ghost imagery or dramatic grief. Preserve all unedited details.
```

### Targeted edit 4: Literal tabletop screen correction

Tool mode: built-in imagegen **edit**; `transparent_background:false`. Sole edit target supplied via `referenced_image_paths`: `/Users/macbookpro/.codex/generated_images/01a10736-70d6-7b40-bc90-9e5824753f66/exec-d9921d78-8fb6-4319-ba67-daaa41f903d1.png`. Native output: `/Users/macbookpro/.codex/generated_images/01a10736-70d6-7b40-bc90-9e5824753f66/exec-2de48fed-2a5f-41d4-935f-0a7e37ce8e5a.png`. Selected final open-call spread. The tabletop phone's visible front now has plain light blue-gray glass with no rear-camera lenses.

```text
Use case: precise-object-edit
Edit the supplied final split-spread image. The first phone correction did not remove the camera lenses, so make a very literal visible replacement now.
Only change the small upright TABLETOP PHONE in the RIGHT-HAND COURTYARD. Its box is approximately x1060–1112, y545–635 in this1586x992 image (about68% across,60% down). This is NOT the phone held by the older man on the left.
Replace the visible face of that tabletop phone with a CLEAR BLANK LIGHT BLUE-GRAY GLASS SCREEN inside a thin dark bezel. One subtle diagonal glass reflection is enough. REMOVE BOTH ROUND CAMERA LENSES currently visible at the upper-left corner of that face. Absolutely no circular camera dots, no camera module and no round holes may remain on the face we see.
Keep the phone upright in its existing stand beside the cup, orienting this now-visible FRONT SCREEN toward seated red-shirt Jo. The far hidden BACK and its rear camera point away from Jo into the background courtyard with the child. Showing the actual rear lens is unnecessary; we should see the obvious flat screen facing Jo, not the camera back.
Keep all other pixels/composition effectively unchanged: left older Sheng and his handheld phone, divider, Jo, friend, child/ball, cups/table, architecture, plants, lighting, crisp pixel style. No UI, text, icons, letters, numbers or video face on the replacement screen. This is a small device correction only.
```


