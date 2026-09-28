export interface ProgressPayload {
  subject: string;
  examType: string;
  examYear: number | null;
  questionsAttempted: number;
  questionsCorrect: number;
  xpEarned: number;
}

export interface AchievementPayload {
  achievementKey: string;
  earnedAt: string;
}

export interface QuestionAttemptPayload {
  questionId: string;
  subjectId: string;
  topicId: string | null;
  answer: string;
  correct: boolean;
  attemptedAt: string;
  version: number;
}

export type OfflineQueueItem =
  | {
      id: string;
      userId: string;
      kind: 'progress';
      createdAt: string;
      payload: ProgressPayload;
    }
  | {
      id: string;
      userId: string;
      kind: 'achievement';
      createdAt: string;
      payload: AchievementPayload;
    }
  | {
      id: string;
      userId: string;
      kind: 'question_attempt';
      createdAt: string;
      payload: QuestionAttemptPayload;
    };

const STORAGE_KEY = 'examply_offline_sync_queue_v1';

const createId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const readQueue = (): OfflineQueueItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as OfflineQueueItem[]) : [];
  } catch (error) {
    console.warn('Could not read offline sync queue:', error);
    return [];
  }
};

const writeQueue = (queue: OfflineQueueItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Could not persist offline sync queue:', error);
  }
};

export const listQueuedItems = (userId?: string): OfflineQueueItem[] => {
  const queue = readQueue();
  return userId ? queue.filter((item) => item.userId === userId) : queue;
};

export const enqueueProgress = (userId: string, payload: ProgressPayload): string => {
  const item: OfflineQueueItem = {
    id: createId(),
    userId,
    kind: 'progress',
    createdAt: new Date().toISOString(),
    payload,
  };
  writeQueue([...readQueue(), item]);
  return item.id;
};

export const enqueueQuestionAttempt = (userId: string, payload: QuestionAttemptPayload): string => {
  const item: OfflineQueueItem = {
    id: createId(),
    userId,
    kind: 'question_attempt',
    createdAt: new Date().toISOString(),
    payload,
  };
  writeQueue([...readQueue(), item]);
  return item.id;
};

export const enqueueAchievement = (userId: string, payload: AchievementPayload): string => {
  const item: OfflineQueueItem = {
    id: createId(),
    userId,
    kind: 'achievement',
    createdAt: new Date().toISOString(),
    payload,
  };
  writeQueue([...readQueue(), item]);
  return item.id;
};

/** Remove an item only after the remote write has returned successfully. */
export const acknowledgeQueuedItem = (itemId: string): void => {
  writeQueue(readQueue().filter((item) => item.id !== itemId));
};

export const clearQueueForUser = (userId: string): void => {
  writeQueue(readQueue().filter((item) => item.userId !== userId));
};

export const getQueueLength = (userId?: string): number => listQueuedItems(userId).length;
