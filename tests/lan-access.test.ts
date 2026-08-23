import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_LAN_ALLOWED_DEV_ORIGINS,
  getLanAllowedDevOrigins,
  isLanAccessEnabled,
  parseBooleanEnv,
  parseLanAllowedDevOrigins,
} from '@/lib/config/lan-access';

test('parseBooleanEnv only enables explicit truthy values', () => {
  assert.equal(parseBooleanEnv('true'), true);
  assert.equal(parseBooleanEnv('  ON '), true);
  assert.equal(parseBooleanEnv('1'), true);
  assert.equal(parseBooleanEnv('false'), false);
  assert.equal(parseBooleanEnv('0'), false);
  assert.equal(parseBooleanEnv(undefined), false);
});

test('isLanAccessEnabled only supports the unified ALLOW_LAN_ACCESS env name', () => {
  assert.equal(isLanAccessEnabled({}), false);
  assert.equal(isLanAccessEnabled({ ALLOW_LAN_ACCESS: 'true' }), true);
  assert.equal(isLanAccessEnabled({ NEXT_PUBLIC_ALLOW_LAN_ACCESS: 'yes' }), false);
});

test('parseLanAllowedDevOrigins accepts hostnames, URLs, ports, and comma lists', () => {
  assert.deepEqual(
    parseLanAllowedDevOrigins('http://192.168.1.10:3000, local.kcine.test:8080 *.lan.test'),
    ['192.168.1.10', 'local.kcine.test', '*.lan.test']
  );
});

test('getLanAllowedDevOrigins returns defaults and custom origins only when enabled', () => {
  assert.deepEqual(getLanAllowedDevOrigins({ LAN_ALLOWED_DEV_ORIGINS: '192.168.50.10' }), []);

  const origins = getLanAllowedDevOrigins({
    ALLOW_LAN_ACCESS: 'true',
    LAN_ALLOWED_DEV_ORIGINS: '192.168.50.10',
  });

  assert.ok(origins.includes('10.*.*.*'));
  assert.ok(origins.includes('172.16.*.*'));
  assert.ok(origins.includes('172.31.*.*'));
  assert.ok(origins.includes('192.168.*.*'));
  assert.ok(origins.includes('192.168.50.10'));
  assert.equal(origins.length, DEFAULT_LAN_ALLOWED_DEV_ORIGINS.length + 1);
});
