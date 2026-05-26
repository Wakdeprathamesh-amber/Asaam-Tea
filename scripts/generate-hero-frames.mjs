import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'public');
const outDir = path.join(publicDir, 'hero-frames');
const video = path.join(publicDir, 'tea-story-desktop.mp4');
const FRAME_COUNT = 140;
const CHUNK_SIZE = 30;

if (!fs.existsSync(video)) {
  console.error('Missing tea-story-desktop.mp4 — run hero encoding first.');
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

const duration = execSync(
  `ffprobe -v error -show_entries format=duration -of csv=p=0 "${video}"`,
  { encoding: 'utf8' }
).trim();

const fps = (FRAME_COUNT / parseFloat(duration)).toFixed(4);

console.log(`Extracting ${FRAME_COUNT} frames at ${fps} fps...`);

execSync(
  `ffmpeg -y -i "${video}" -vf "fps=${fps},scale=1280:-2" -c:v libwebp -lossless 0 -q:v 80 -compression_level 6 -fps_mode vfr "${path.join(outDir, 'frame_%04d.webp')}"`,
  { stdio: 'inherit' }
);

const files = fs.readdirSync(outDir).filter((f) => f.endsWith('.webp')).sort();

fs.writeFileSync(
  path.join(outDir, 'frames.json'),
  JSON.stringify(
    {
      count: files.length,
      pattern: 'frame_%04d.webp',
      chunkSize: CHUNK_SIZE,
    },
    null,
    2
  )
);

console.log(`Done: ${files.length} frames in public/hero-frames/`);
