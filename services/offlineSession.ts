const STORAGE_KEY = 'examply-offline-session-v1';

interface OfflineSessionRecord {
  userId: string;
  key: string;
  createdAt: string;
  lastOnlineAt: string;
}

const createKey = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

const readRecord = (): OfflineSessionRecord | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OfflineSessionRecord;
    if (
      typeof parsed.userId !== 'string' ||
      typeof parsed.key !== 'string' ||
      typeof parsed.createdAt !== 'string' ||
      typeof parsed.lastOnlineAt !== 'string'
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

/**
 * This is a local capability marker, not a replacement for Supabase Auth.
 * It is created only after a successful authenticated session and is used to
 * distinguish a previously signed-in browser from a brand-new/offline browser.
 */
export const activateOfflineSession = (userId: string): void => {
  try {
    const existing = readRecord();
    const now = new Date().toISOString();

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        userId,
        key: existing?.userId === userId ? existing.key : createKey(),
        createdAt: existing?.userId === userId ? existing.createdAt : now,
        lastOnlineAt: now,
      } satisfies OfflineSessionRecord)
    );
  } catch (error) {
    console.warn('Could not persist offline session marker:', error);
  }
};

export const hasOfflineSession = (userId: string): boolean => {
  const record = readRecord();
  return Boolean(record && record.userId === userId && record.key);
};

export const clearOfflineSession = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Could not clear offline session marker:', error);
  }
};

export const getOfflineSessionUserId = (): string | null => readRecord()?.userId ?? null;
