# Chinese pixel font provenance

The game bundles **Fusion Pixel 12px Proportional, Simplified Chinese (zh-Hans), Regular**, release **2026.09.25**, unchanged from TakWolf's official release.

- Official project: https://github.com/TakWolf/fusion-pixel-font
- Pinned release: https://github.com/TakWolf/fusion-pixel-font/releases/tag/2026.09.25
- Downloaded archive: https://github.com/TakWolf/fusion-pixel-font/releases/download/2026.09.25/fusion-pixel-font-12px-proportional-otf.woff2-v2026.09.25.zip
- Official font statistics: https://github.com/TakWolf/fusion-pixel-font/blob/2026.09.25/docs/info-12px-proportional.md
- Archive SHA256, checked against the official release: `44b456f6f920d700f98d5865e03152d6a7357ed0a8ee388376ac0530d2d57072`
- Archive member: `fusion-pixel-12px-proportional-zh_hans.otf.woff2`
- Bundled filename: `fusion-pixel-12px-proportional-zh_hans-v2026.09.25.woff2`
- Font SHA256: `0ebd99e6f1e9b650a793a3f759c1c3dfa99f0c5b6502e78569b48ddb43767e40`
- File size: **666,264 bytes**.
- Actual font character map: **36,999 Unicode mappings**; **36,436 glyphs**.
- Design: **12-pixel proportional outlines**, 1200 units per em; regular weight. CSS alias: `Fusion Pixel SC`.
- Copyright: Copyright (c) 2022, TakWolf (https://takwolf.com).
- License: **SIL Open Font License 1.1**. The exact release license and upstream Ark Pixel, Cubic 11, and Galmuri notices are retained under `fusion-pixel-licenses/`. No font outlines, names, or metadata have been modified.

## Actual glyph verification

The font's decoded character map was checked against the Chinese characters and CJK punctuation in the current `index.html`, `game.js`, `story.js`, and the user's `The_Day_the_Letter_Came_Playable_Narrative_Revision_v02.md`. At completion, all **90 distinct required characters** were present, with **zero missing glyphs or empty visible outlines**. This includes the Chinese game title, Ningbo/Hong Kong/Shanghai labels, Chunxiu's name, and the Chinese letter.

`FONT-GLYPH-COVERAGE.json` records the exact per-file characters and checks and may be refreshed as narrative text changes. Only the font character map establishes this coverage; a fallback font was not used for the audit. A local render at 18, 24, and 36 pixels was also visually inspected for legibility.

## Typography in the game

`style.css` declares a local WOFF2 `@font-face`. Chinese title/wordmark/place text uses the Chinese pixel face; mixed UI and subtitles use Pixelify Sans followed by Fusion Pixel SC. The Chinese letter uses 24-pixel text with the existing text-size control and generous line height. Regular pixel outlines are kept intact by disabling synthetic weight/slant. Reading panels wrap long lines; touch controls keep at least 48-pixel targets. The approved jade/ochre/navy palette is unchanged.

HTML preload recommendation: `<link rel="preload" href="assets/fusion-pixel-12px-proportional-zh_hans-v2026.09.25.woff2" as="font" type="font/woff2" crossorigin>`.

Canvas-drawn Chinese text must also include `"Fusion Pixel SC"` in its `ctx.font` family stack; CSS font-family does not change the canvas context.
