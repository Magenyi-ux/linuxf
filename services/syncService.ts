import { capturePostHogEvent } from './posthogClient';
import { supabase } from './supabaseClient';
import {
  acknowledgeQueuedItem,
  listQueuedItems,
  type OfflineQueueItem,
} from './offlineQueue';

export interface SyncResult {
  attempted: number;
  acknowledged: number;
  remaining: number;
  failed: number;
}

const sendItem = async (item: OfflineQueueItem): Promise<void> => {
  if (item.kind === 'progress') {
    const { error } = await supabase.rpc('record_progress_event', {
      p_event_id: item.id,
      p_subject: item.payload.subject,
      p_exam_type: item.payload.examType,
      p_exam_year: item.payload.examYear,
      p_questions_attempted: item.payload.questionsAttempted,
      p_questions_correct: item.payload.questionsCorrect,
      p_xp_earned: item.payload.xpEarned,
    });
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from('achievements').upsert(
    {
      id: item.id,
      user_id: item.userId,
      achievement_key: item.payload.achievementKey,
      earned_at: item.payload.earnedAt,
      synced_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,achievement_key', ignoreDuplicates: true }
  );
  if (error) throw error;
};

export const syncUserData = async (userId: string): Promise<SyncResult> => {
  if (!navigator.onLine) {
    return { attempted: 0, acknowledged: 0, remaining: listQueuedItems(userId).length, failed: 0 };
  }

  const items = listQueuedItems(userId);
  let acknowledged = 0;
  let failed = 0;

  for (const item of items) {
    try {
      await sendItem(item);
      // This is deliberately after the successful network response.
      acknowledgeQueuedItem(item.id);
      acknowledged += 1;
    } catch (error) {
      failed += 1;
      console.warn(`Sync item ${item.id} was retained for retry:`, error);
    }
  }

  const result = {
    attempted: items.length,
    acknowledged,
    remaining: listQueuedItems(userId).length,
    failed,
  };

  capturePostHogEvent('sync_completed', {
    attempted: result.attempted,
    acknowledged: result.acknowledged,
    failed: result.failed,
    remaining: result.remaining,
    online: true,
  });

  return result;
};

export const getRemoteAchievementKeys = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('achievements')
    .select('achievement_key')
    .eq('user_id', userId);

  if (error) throw error;
  return (data || [])
    .map((row) => row.achievement_key)
    .filter((key): key is string => typeof key === 'string' && key.length > 0);
};

export const getRemoteProgressTotals = async (userId: string): Promise<{
  xp: number;
  attempted: number;
  correct: number;
}> => {
  const { data, error } = await supabase
    .from('user_progress')
    .select('questions_attempted, questions_correct, xp_earned')
    .eq('user_id', userId);

  if (error) throw error;

  return (data || []).reduce(
    (totals, row) => ({
      xp: totals.xp + Number(row.xp_earned || 0),
      attempted: totals.attempted + Number(row.questions_attempted || 0),
      correct: totals.correct + Number(row.questions_correct || 0),
    }),
    { xp: 0, attempted: 0, correct: 0 }
  );
};
