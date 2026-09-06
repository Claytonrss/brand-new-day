#!/usr/bin/env node
/**
 * Inspects a .glb file: size, glTF JSON chunk stats (meshes, materials,
 * textures, bones, animations), and metadata. No dependencies required.
 *
 * Usage: node scripts/inspect-glb.mjs [path-to-glb]
 */
import { readFileSync, statSync } from 'node:fs';
import { basename } from 'node:path';

const glbPath = process.argv[2] ?? 'public/models/spider-man_brand_new_day-v2.glb';

const buf = readFileSync(glbPath);
const { size } = statSync(glbPath);

// --- GLB container parsing -----------------------------------------------
const magic = buf.readUInt32LE(0);
if (magic !== 0x46546c67) {
  console.error('ERROR: not a GLB file (bad magic)');
  process.exit(1);
}
const version = buf.readUInt32LE(4);
const totalLength = buf.readUInt32LE(8);

const jsonChunkLength = buf.readUInt32LE(12);
const jsonChunkType = buf.readUInt32LE(16);
if (jsonChunkType !== 0x4e4f534a) {
  console.error('ERROR: first chunk is not JSON');
  process.exit(1);
}
const json = JSON.parse(buf.subarray(20, 20 + jsonChunkLength).toString('utf8'));

// --- Report ----------------------------------------------------------------
const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`;

console.log('# GLB Inspection Report');
console.log(`file: ${basename(glbPath)}`);
console.log(`size: ${mb(size)} (${size} bytes)`);
console.log(`glb version: ${version}, declared length: ${mb(totalLength)}`);
console.log('');

const count = (key) => (Array.isArray(json[key]) ? json[key].length : 0);

console.log('## Counts');
for (const key of ['scenes', 'nodes', 'meshes', 'materials', 'textures', 'images', 'skins', 'animations', 'cameras', 'samplers', 'accessors', 'bufferViews']) {
  console.log(`${key}: ${count(key)}`);
}
console.log('');

if (json.asset) {
  console.log('## Asset metadata');
  for (const [k, v] of Object.entries(json.asset)) {
    console.log(`${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`);
  }
  console.log('');
}

// Images / textures detail
if (Array.isArray(json.images) && json.images.length) {
  console.log('## Images');
  json.images.forEach((img, i) => {
    const bv = img.bufferView !== undefined ? json.bufferViews?.[img.bufferView] : null;
    const sizeStr = bv ? mb(bv.byteLength ?? 0) : (img.uri ? 'external uri' : '?');
    console.log(`[${i}] ${img.name ?? '(unnamed)'} mime=${img.mimeType ?? '?'} size=${sizeStr}`);
  });
  console.log('');
}

// Materials
if (Array.isArray(json.materials) && json.materials.length) {
  console.log('## Materials');
  json.materials.forEach((m, i) => {
    const pbr = m.pbrMetallicRoughness ?? {};
    const tex = [];
    if (pbr.baseColorTexture) tex.push('baseColor');
    if (pbr.metallicRoughnessTexture) tex.push('metalRough');
    if (m.normalTexture) tex.push('normal');
    if (m.emissiveTexture) tex.push('emissive');
    if (m.occlusionTexture) tex.push('occlusion');
    console.log(`[${i}] ${m.name ?? '(unnamed)'} textures=[${tex.join(',')}] alphaMode=${m.alphaMode ?? 'OPAQUE'}`);
  });
  console.log('');
}

// Skins / bones
if (Array.isArray(json.skins) && json.skins.length) {
  console.log('## Skins / Bones');
  json.skins.forEach((skin, i) => {
    const jointNames = (skin.joints ?? []).map((j) => json.nodes?.[j]?.name ?? `#${j}`);
    console.log(`skin[${i}] ${skin.name ?? '(unnamed)'} — ${jointNames.length} joints`);
    console.log('joint names:');
    for (const name of jointNames) console.log(`  - ${name}`);
  });
  console.log('');
} else {
  console.log('## Skins / Bones');
  console.log('(no skins found — head-tracking bone fallback needed)');
  console.log('');
}

// Animations
if (Array.isArray(json.animations) && json.animations.length) {
  console.log('## Animations');
  json.animations.forEach((a, i) => {
    console.log(`[${i}] ${a.name ?? '(unnamed)'} channels=${a.channels?.length ?? 0}`);
  });
  console.log('');
}

// Meshes + bounding box from POSITION accessors
if (Array.isArray(json.meshes) && json.meshes.length) {
  console.log('## Meshes');
  let totalPrims = 0;
  json.meshes.forEach((m, i) => {
    const prims = m.primitives?.length ?? 0;
    totalPrims += prims;
    console.log(`[${i}] ${m.name ?? '(unnamed)'} primitives=${prims}`);
  });
  console.log(`total primitives (draw calls, rough): ${totalPrims}`);
  console.log('');
}

// Global bounding box
let globalMin = [Infinity, Infinity, Infinity];
let globalMax = [-Infinity, -Infinity, -Infinity];
if (Array.isArray(json.meshes)) {
  for (const mesh of json.meshes) {
    for (const prim of mesh.primitives ?? []) {
      const posAccessor = json.accessors?.[prim.attributes?.POSITION];
      if (posAccessor?.min && posAccessor?.max) {
        for (let i = 0; i < 3; i++) {
          globalMin[i] = Math.min(globalMin[i], posAccessor.min[i]);
          globalMax[i] = Math.max(globalMax[i], posAccessor.max[i]);
        }
      }
    }
  }
}
if (globalMin[0] !== Infinity) {
  const dims = globalMax.map((v, i) => v - globalMin[i]);
  console.log('## Bounding box (model space, no node transforms)');
  console.log(`min: [${globalMin.map((v) => v.toFixed(2)).join(', ')}]`);
  console.log(`max: [${globalMax.map((v) => v.toFixed(2)).join(', ')}]`);
  console.log(`dimensions: ${dims.map((v) => v.toFixed(2)).join(' × ')} units`);
  console.log('');
}

// Node tree summary (top-level)
if (Array.isArray(json.scenes) && json.scenes.length && Array.isArray(json.nodes)) {
  console.log('## Scene graph (top-level nodes)');
  const roots = json.scenes[0].nodes ?? [];
  const walk = (idx, depth) => {
    const node = json.nodes[idx];
    if (!node || depth > 2) return;
    console.log(`${'  '.repeat(depth)}- ${node.name ?? `(node ${idx})`}${node.mesh !== undefined ? ' [mesh]' : ''}${node.skin !== undefined ? ' [skin]' : ''}`);
    for (const child of node.children ?? []) walk(child, depth + 1);
  };
  for (const r of roots) walk(r, 0);
  console.log('');
}

// Warnings
console.log('## Warnings');
let warned = false;
const jsonStr = JSON.stringify(json);
if (/[A-Za-z]:\\\\|\/Users\/|\/home\//.test(jsonStr)) {
  console.log('- WARNING: possible local filesystem paths embedded in metadata');
  warned = true;
}
if (size > 30 * 1024 * 1024) {
  console.log(`- WARNING: file is ${mb(size)} — mobile optimization required before production`);
  warned = true;
}
if (!json.skins?.length) {
  console.log('- WARNING: no skin/bones — Hero head-tracking needs fallback strategy');
  warned = true;
}
if (!warned) console.log('(none)');
