import { isSupabaseConfigured, supabase } from './supabaseClient';

export interface ReferralSummary {
  is_collaborator: boolean;
  collaborator_id?: string;
  display_name?: string;
  referral_key_hint?: string;
  status?: string;
  total_signups: number;
  qualifying_referrals: number;
}

export interface AdminReferralRow {
  collaborator_id: string;
  display_name: string;
  referral_key_hint: string;
  status: string;
  total_signups: number;
  overall_signups: number;
}

const REFERRAL_STORAGE_KEY = 'spherelearn_referral_key';
const REFERRAL_CAPTURED_AT_KEY = 'spherelearn_referral_captured_at';
const REFERRAL_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const normaliseKey = (value: string): string => value.trim().replace(/\s+/g, '').slice(0, 128);

export const captureReferralKeyFromUrl = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  const key = params.get('ref') || params.get('referral') || params.get('referral_key');
  if (!key) return getStoredReferralKey();
  const normalised = normaliseKey(key);
  if (normalised.length < 6) return getStoredReferralKey();
  localStorage.setItem(REFERRAL_STORAGE_KEY, normalised);
  localStorage.setItem(REFERRAL_CAPTURED_AT_KEY, String(Date.now()));
  return normalised;
};

export const getStoredReferralKey = (): string | null => {
  const key = localStorage.getItem(REFERRAL_STORAGE_KEY);
  const capturedAt = Number(localStorage.getItem(REFERRAL_CAPTURED_AT_KEY) || 0);
  if (!key || !capturedAt || Date.now() - capturedAt > REFERRAL_TTL_MS) {
    localStorage.removeItem(REFERRAL_STORAGE_KEY);
    localStorage.removeItem(REFERRAL_CAPTURED_AT_KEY);
    return null;
  }
  return key;
};

export const clearStoredReferralKey = (): void => {
  localStorage.removeItem(REFERRAL_STORAGE_KEY);
  localStorage.removeItem(REFERRAL_CAPTURED_AT_KEY);
};

export const attributeStoredReferral = async (sourceApp: 'pwa' | 'android' = 'pwa'): Promise<boolean> => {
  if (!isSupabaseConfigured) return false;
  const key = getStoredReferralKey();
  if (!key) return false;

  const { data, error } = await supabase.rpc('attribute_referral', {
    p_referral_key: key,
    p_source_app: sourceApp,
  });
  if (error) throw error;
  clearStoredReferralKey();
  return Boolean((data as { attributed?: boolean } | null)?.attributed);
};

export const fetchMyReferralSummary = async (): Promise<ReferralSummary | null> => {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.rpc('get_my_referral_summary');
  if (error) throw error;
  return data as ReferralSummary;
};

export const fetchAdminReferralReport = async (): Promise<AdminReferralRow[]> => {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.rpc('get_admin_referral_report');
  if (error) throw error;
  return (data || []) as AdminReferralRow[];
};
