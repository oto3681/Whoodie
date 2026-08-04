import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeMpesaEnvironment, getMpesaBaseUrl, getMpesaCredentials, getMpesaRuntimeConfig } from '../server/mpesa';

test('normalizes live environment values', () => {
  assert.equal(normalizeMpesaEnvironment('LIVE'), 'production');
  assert.equal(normalizeMpesaEnvironment('sandbox'), 'sandbox');
  assert.equal(normalizeMpesaEnvironment('production'), 'production');
});

test('uses the live Safaricom base URL in production mode', () => {
  assert.equal(getMpesaBaseUrl('production'), 'https://api.safaricom.co.ke');
  assert.equal(getMpesaBaseUrl('sandbox'), 'https://sandbox.safaricom.co.ke');
});

test('returns production config details without injecting sandbox defaults', () => {
  const config = getMpesaCredentials({
    environment: 'production',
    consumerKey: '',
    consumerSecret: '',
    passkey: '',
    paybillNumber: '247247',
  });

  assert.equal(config.isProduction, true);
  assert.equal(config.baseUrl, 'https://api.safaricom.co.ke');
  assert.equal(config.businessShortCode, '247247');
  assert.equal(config.consumerKey, '');
  assert.equal(config.consumerSecret, '');
});

test('flags missing production credentials before live checkout', () => {
  const config = getMpesaRuntimeConfig({
    environment: 'production',
    consumerKey: '',
    consumerSecret: '',
    passkey: '',
    paybillNumber: '247247',
    appUrl: '',
  });

  assert.equal(config.isReady, false);
  assert.deepEqual(config.missingFields, ['MPESA_CONSUMER_KEY', 'MPESA_CONSUMER_SECRET', 'MPESA_PASSKEY', 'APP_URL']);
});
