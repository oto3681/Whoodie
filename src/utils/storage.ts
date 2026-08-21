/**
 * Safe Storage Helpers
 * Prevents uncaught exceptions from corrupted JSON, QuotaExceededError,
 * disabled cookies/storage, or iframe sandboxing.
 */

export function safeGetLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = localStorage.getItem(key);
    if (!saved || saved === 'undefined' || saved === 'null') {
      return fallback;
    }
    return JSON.parse(saved);
  } catch (err) {
    console.warn(`[SafeStorage] Failed to read or parse localStorage key "${key}":`, err);
    return fallback;
  }
}

export function safeSetLocalStorage(key: string, value: unknown): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn(`[SafeStorage] Failed to write localStorage key "${key}":`, err);
    return false;
  }
}

export function safeGetSessionStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = sessionStorage.getItem(key);
    if (!saved || saved === 'undefined' || saved === 'null') {
      return fallback;
    }
    return JSON.parse(saved);
  } catch (err) {
    console.warn(`[SafeStorage] Failed to read or parse sessionStorage key "${key}":`, err);
    return fallback;
  }
}

export function safeSetSessionStorage(key: string, value: unknown): boolean {
  if (typeof window === 'undefined') return false;
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn(`[SafeStorage] Failed to write sessionStorage key "${key}":`, err);
    return false;
  }
}

export function clearAppLocalStorage(): void {
  try {
    const keysToRemove = [
      'pixelprint_products',
      'pixelprint_cart',
      'pixelprint_orders',
      'pixelprint_inquiries',
      'pixelprint_whatsapp_threads',
      'pixelprint_bot_rules',
      'pixelprint_reviews',
      'pixelprint_wp_settings',
      'pixelprint_user',
      'pixelprint_customer_contacts',
      'pixelprint_sms_templates',
      'pixelprint_email_templates',
      'pixelprint_bulk_campaigns',
      'pixelprint_admin_notifications',
      'pixelprint_zoho_quotations',
      'pixelprint_zoho_settings',
      'woodynat_widget_chat'
    ];
    keysToRemove.forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
  } catch (e) {
    console.error('Error clearing app storage:', e);
  }
}
