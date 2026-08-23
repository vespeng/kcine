import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const projectRoot = process.cwd();

test('narrow player controls reserve space for both fullscreen actions', () => {
  const controls = readFileSync(
    join(projectRoot, 'components/player/desktop/DesktopControls.tsx'),
    'utf8',
  );
  const leftControls = readFileSync(
    join(projectRoot, 'components/player/desktop/DesktopLeftControls.tsx'),
    'utf8',
  );
  const rightControls = readFileSync(
    join(projectRoot, 'components/player/desktop/DesktopRightControls.tsx'),
    'utf8',
  );
  const styles = readFileSync(
    join(projectRoot, 'app/styles/video-player.css'),
    'utf8',
  );

  assert.match(controls, /player-controls-row flex min-w-0/);
  assert.match(leftControls, /player-controls-left flex min-w-0 flex-1/);
  assert.match(leftControls, /player-volume-control/);
  assert.match(leftControls, /player-duration-display/);
  assert.match(rightControls, /player-controls-right[^\n]*shrink-0/);
  assert.match(rightControls, /onClick=\{onToggleWebFullscreen\}/);
  assert.match(rightControls, /onClick=\{onToggleNativeFullscreen\}/);

  assert.match(styles, /\.kcine-container\s*\{\s*container-type:\s*inline-size;/);
  assert.match(styles, /@container \(max-width: 36rem\)[\s\S]*?\.player-volume-control\s*\{\s*display:\s*none;/);
  assert.match(styles, /@container \(max-width: 36rem\)[\s\S]*?\.player-controls-right\s*\{[\s\S]*?flex:\s*0 0 auto;/);
  assert.match(styles, /@container \(max-width: 24rem\)[\s\S]*?\.player-duration-display\s*\{\s*display:\s*none;/);
});
