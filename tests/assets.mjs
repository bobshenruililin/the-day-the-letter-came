import assert from 'node:assert/strict';
import {readFile, readdir, stat} from 'node:fs/promises';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

// Accept an extracted release directory as well as the working copy.
const root = resolve(process.argv[2] || fileURLToPath(new URL('..', import.meta.url)));
const manifest = JSON.parse(await readFile(join(root, '.openai/hosting.json'), 'utf8'));
assert.equal(manifest.static.directory, 'dist');
const web = join(root, manifest.static.directory);
const checked = new Set();
async function resource(path) {
  assert.ok(path.startsWith(web + '/'), `Resource escapes the published directory: ${path}`);
  const bytes = await readFile(path);
  assert.ok(bytes.length > 0, `Empty resource: ${path}`);
  checked.add(path);
  return bytes;
}
for (const name of ['index.html', 'style.css', 'finale.css', 'game.js', 'finale.js', 'mechanics.js', 'story.js']) {
  const path = join(web, name), text = (await resource(path)).toString();
  const references = [...text.matchAll(/(?:src|href)="([^"?#]+)(?:\?[^"#]*)?"|url\(['"]?([^'"\)]+)['"]?\)|from\s+['"]([^'"]+)['"]/g)];
  for (const match of references) {
    const ref = (match[1] || match[2] || match[3]).split('?')[0];
    if (/^(data:|https?:|#)/.test(ref)) continue;
    let target = resolve(dirname(path), ref);
    if ((await stat(target)).isDirectory()) target = join(target, 'index.html');
    await resource(target);
  }
}
const game = await readFile(join(web, 'game.js'), 'utf8');
const finale = await readFile(join(web, 'finale.js'), 'utf8');
const canvasList = game.match(/async function loadAssets\(\).*?Promise\.all\(\[([^\]]+)\]/s);
assert.ok(canvasList, 'Cannot find canvas artwork list');
const names = [...canvasList[1].matchAll(/'([^']+)'/g)].map(m => `${m[1]}.webp`);
for (const match of finale.matchAll(/(?:image|yard)\('([^']+\.webp)'/g)) names.push(match[1]);
names.push('comic-reunion.webp', 'comic-courtyards.webp', 'comic-support.webp', 'comic-open-call.webp');
for (const name of new Set(names)) {
  const bytes = await resource(join(web, 'assets', name));
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', `Invalid image: ${name}`);
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', `Invalid image: ${name}`);
}
// Count all payloads too: licenses and provenance must travel with the fonts.
async function visit(dir) {
  for (const name of await readdir(dir)) {
    const path = join(dir, name);
    if ((await stat(path)).isDirectory()) await visit(path); else await resource(path);
  }
}
await visit(join(web, 'assets'));
console.log(`Release assets verified: ${checked.size} files, including ${new Set(names).size} valid WebP illustrations and all referenced modules/fonts.`);
