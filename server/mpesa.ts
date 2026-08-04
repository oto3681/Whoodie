import dotenv from 'dotenv';

dotenv.config();

export type MpesaEnvironment = 'sandbox' | 'production';

export interface MpesaConfig {
  environment: MpesaEnvironment;
  consumerKey: string;
  consumerSecret: string;
  passkey: string;
  paybillNumber: string;
  appUrl: string;
}

export function normalizeMpesaEnvironment(value?: string): MpesaEnvironment {
  const normalized = (value || process.env.MPESA_ENVIRONMENT || 'production').toLowerCase();
  return normalized === 'sandbox' ? 'sandbox' : 'production';
}

export function getMpesaBaseUrl(environment: string): string {
  return normalizeMpesaEnvironment(environment) === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';
}

export function getMpesaCredentials(overrides: Partial<MpesaConfig> = {}) {
  const environment = normalizeMpesaEnvironment(overrides.environment);
  const consumerKey = (overrides.consumerKey ?? process.env.MPESA_CONSUMER_KEY ?? '').trim();
  const consumerSecret = (overrides.consumerSecret ?? process.env.MPESA_CONSUMER_SECRET ?? '').trim();
  const passkey = (overrides.passkey ?? process.env.MPESA_PASSKEY ?? '').trim();
  const paybillNumber = (overrides.paybillNumber ?? process.env.MPESA_SHORTCODE ?? '247247').trim();
  const appUrl = (overrides.appUrl ?? process.env.APP_URL ?? '').trim();

  return {
    environment,
    consumerKey,
    consumerSecret,
    passkey,
    paybillNumber,
    appUrl,
    isProduction: environment === 'production',
    baseUrl: getMpesaBaseUrl(environment),
    businessShortCode: paybillNumber,
  };
}

export function getMpesaRuntimeConfig(overrides: Partial<MpesaConfig> = {}) {
  const config = getMpesaCredentials(overrides);
  const missingFields: string[] = [];

  if (config.isProduction) {
    if (!config.consumerKey) missingFields.push('MPESA_CONSUMER_KEY');
    if (!config.consumerSecret) missingFields.push('MPESA_CONSUMER_SECRET');
    if (!config.passkey) missingFields.push('MPESA_PASSKEY');
    if (!config.appUrl) missingFields.push('APP_URL');
  }

  return {
    ...config,
    missingFields,
    isReady: missingFields.length === 0,
  };
}

export function buildMpesaCallbackUrl(appUrl: string): string {
  if (!appUrl) return '';
  return `${appUrl.replace(/\/$/, '')}/api/mpesa/callback`;
}
