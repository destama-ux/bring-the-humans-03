// bring-the-humans-03 entry program (Node 22, standard library only).
// It validates VIDEO.json — a JSON object whose `url` is a TikTok video
// address — and only then copies it, byte for byte, from the repository
// root to the output directory, where the house reads the video's
// address. That is all it has to do.
// The entry is the video itself: an original vertical ad for make.fun,
// posted publicly on TikTok with the bounty's line and the play code in
// its caption, VIDEO.json naming the video. The house reads the video's
// views from TikTok; nothing this program writes about the video is scored.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Validate VIDEO.json before handing its address to the house: it must be
// a JSON object whose `url` is a TikTok video address. A malformed file or
// a wrong address would otherwise be copied silently and only fail later,
// inside the house, with no sign of what went wrong.
function validateVideoJson(path: string): void {
  let raw: string;
  try {
    raw = readFileSync(path, 'utf8');
  } catch (err) {
    console.error(`VIDEO.json could not be read from ${path}: ${(err as Error).message}`);
    process.exit(1);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error(`VIDEO.json is not valid JSON: ${(err as Error).message}`);
    process.exit(1);
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    console.error('VIDEO.json must be a JSON object with a "url" field.');
    process.exit(1);
  }
  const url = (parsed as { url?: unknown }).url;
  if (typeof url !== 'string' || !url.startsWith('https://www.tiktok.com/')) {
    console.error('VIDEO.json "url" must be a string starting with "https://www.tiktok.com/".');
    process.exit(1);
  }
}

// One source path, used for both the validation above and the copy below,
// so the file that was checked is exactly the file that gets handed over.
const VIDEO_JSON = join(BOT_DIR, 'VIDEO.json');

validateVideoJson(VIDEO_JSON);

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(VIDEO_JSON, join(OUTPUT_DIR, 'VIDEO.json'));
} catch (err) {
  console.error(`VIDEO.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}
