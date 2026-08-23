import test from 'node:test';
import assert from 'node:assert/strict';

import {
  isCloudflareDeployment,
  isVercelDeployment,
  shouldEnableVercelAnalytics,
} from '@/lib/config/deployment';

test('self-hosted deployments do not enable Vercel Analytics', () => {
  const env = {};

  assert.equal(isVercelDeployment(env), false);
  assert.equal(isCloudflareDeployment(env), false);
  assert.equal(shouldEnableVercelAnalytics(env), false);
});

test('Vercel deployments enable Vercel Analytics', () => {
  assert.equal(shouldEnableVercelAnalytics({ VERCEL: '1' }), true);
  assert.equal(shouldEnableVercelAnalytics({ VERCEL_ENV: 'production' }), true);
});

test('Cloudflare deployments do not enable Vercel Analytics', () => {
  assert.equal(shouldEnableVercelAnalytics({ CF_PAGES: '1' }), false);
  assert.equal(shouldEnableVercelAnalytics({ CF_PAGES_URL: 'https://kcine.pages.dev' }), false);
});

test('Cloudflare wins when adapter environments expose Vercel-like variables', () => {
  const env = {
    VERCEL: '1',
    VERCEL_ENV: 'production',
    CF_PAGES: '1',
  };

  assert.equal(isVercelDeployment(env), true);
  assert.equal(isCloudflareDeployment(env), true);
  assert.equal(shouldEnableVercelAnalytics(env), false);
});
