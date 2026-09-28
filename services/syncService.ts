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
  if (item.kind === 'question_attempt') {
    const { error } = await supabase.rpc('record_question_attempt', {
      p_id: item.id,
      p_user_id: item.userId,
      p_question_id: item.payload.questionId,
      p_subject_id: item.payload.subjectId,
      p_topic_id: item.payload.topicId,
      p_answer: item.payload.answer,
      p_correct: item.payload.correct,
      p_attempted_at: item.payload.attemptedAt,
      p_version: item.payload.version,
      p_updated_at: item.payload.attemptedAt,
    });
    if (error) throw error;
    return;
  }

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

export interface RemoteStudyPack {
  packId: string;
  examType: string;
  subject: string;
  examYear: number;
  bestScore: number;
  lastScore: number;
  attempts: number;
  dateCreated: number;
}

export const upsertRemoteStudyPack = async (userId: string, pack: RemoteStudyPack): Promise<void> => {
  const { error } = await supabase.from('user_study_packs').upsert(
    {
      user_id: userId,
      pack_id: pack.packId,
      exam_type: pack.examType,
      subject: pack.subject,
      exam_year: pack.examYear,
      best_score: pack.bestScore,
      last_score: pack.lastScore,
      attempts: pack.attempts,
      date_created: pack.dateCreated,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,pack_id' }
  );
  if (error) throw error;
};

export const deleteRemoteStudyPack = async (userId: string, packId: string): Promise<void> => {
  const { error } = await supabase
    .from('user_study_packs')
    .delete()
    .eq('user_id', userId)
    .eq('pack_id', packId);
  if (error) throw error;
};

export const getRemoteStudyPacks = async (userId: string): Promise<RemoteStudyPack[]> => {
  const { data, error } = await supabase
    .from('user_study_packs')
    .select('pack_id, exam_type, subject, exam_year, best_score, last_score, attempts, date_created')
    .eq('user_id', userId)
    .order('date_created', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    packId: String(row.pack_id),
    examType: String(row.exam_type),
    subject: String(row.subject),
    examYear: Number(row.exam_year),
    bestScore: Number(row.best_score || 0),
    lastScore: Number(row.last_score || 0),
    attempts: Number(row.attempts || 0),
    dateCreated: Number(row.date_created || Date.now()),
  }));
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
