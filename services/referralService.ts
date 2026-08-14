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

export interface AdminReferralCodeSummary {
  code: string;
  total_signups: number;
}

export const FIXED_REFERRAL_CODE = 'sis234';
const REFERRAL_STORAGE_KEY = 'spherelearn_referral_key';
const REFERRAL_CAPTURED_AT_KEY = 'spherelearn_referral_captured_at';
const REFERRAL_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const normaliseKey = (value: string): string => value.trim().replace(/\s+/g, '').toLowerCase().slice(0, 128);

export const captureReferralKeyFromUrl = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  const key = params.get('ref') || params.get('referral') || params.get('referral_key');
  if (!key) return getStoredReferralKey();
  const normalised = normaliseKey(key);
  if (normalised !== FIXED_REFERRAL_CODE) return getStoredReferralKey();
  localStorage.setItem(REFERRAL_STORAGE_KEY, FIXED_REFERRAL_CODE);
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
  return normaliseKey(key) === FIXED_REFERRAL_CODE ? FIXED_REFERRAL_CODE : null;
};

export const clearStoredReferralKey = (): void => {
  localStorage.removeItem(REFERRAL_STORAGE_KEY);
  localStorage.removeItem(REFERRAL_CAPTURED_AT_KEY);
};

export const attributeStoredReferral = async (sourceApp: 'pwa' | 'android' = 'pwa'): Promise<boolean> => {
  if (!isSupabaseConfigured) return false;
  const key = getStoredReferralKey();
  if (!key) return false;

  const { data, error } = await supabase.rpc('record_referral_code_signup', {
    p_referral_code: key,
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

export interface IssuedCollaboratorKey {
  collaborator_id: string;
  display_name: string;
  collaborator_email: string;
  referral_key: string;
  referral_key_hint: string;
  status: string;
  term_start: string | null;
  term_end: string | null;
}

export const fetchAdminReferralReport = async (): Promise<AdminReferralRow[]> => {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.rpc('get_admin_referral_report');
  if (error) throw error;
  return (data || []) as AdminReferralRow[];
};

export const fetchAdminReferralCodeSummary = async (): Promise<AdminReferralCodeSummary> => {
  if (!isSupabaseConfigured) return { code: FIXED_REFERRAL_CODE, total_signups: 0 };
  const { data, error } = await supabase.rpc('get_admin_referral_code_summary');
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return {
    code: row?.code || FIXED_REFERRAL_CODE,
    total_signups: Number(row?.total_signups || 0),
  };
};

export const createCollaborator = async (input: {
  email: string;
  displayName: string;
  termStart?: string;
  termEnd?: string;
}): Promise<IssuedCollaboratorKey> => {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured');
  const { data, error } = await supabase.rpc('create_collaborator', {
    p_collaborator_email: input.email.trim(),
    p_display_name: input.displayName.trim(),
    p_term_start: input.termStart || null,
    p_term_end: input.termEnd || null,
  });
  if (error) throw error;
  return data as IssuedCollaboratorKey;
};

export const setCollaboratorStatus = async (collaboratorId: string, status: 'ACTIVE' | 'PAUSED' | 'ENDED'): Promise<void> => {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured');
  const { error } = await supabase.rpc('set_collaborator_status', {
    p_collaborator_id: collaboratorId,
    p_status: status,
  });
  if (error) throw error;
};
