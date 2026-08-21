/**
 * Safe Clipboard Copy Utility
 * Falls back to document.execCommand('copy') if navigator.clipboard fails (e.g. in sandboxed iframes).
 */

export async function safeCopyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Try modern Clipboard API first
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('[SafeClipboard] navigator.clipboard.writeText failed, attempting execCommand fallback:', err);
    }
  }

  // Fallback for sandboxed iframes or browsers without clipboard permissions
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (fallbackErr) {
    console.warn('[SafeClipboard] Fallback execCommand copy failed:', fallbackErr);
    return false;
  }
}
