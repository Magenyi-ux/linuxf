import { capturePostHogEvent } from './posthogClient';

const allowedProperties = new Set([
  'method',
  'score_band',
  'percentage_band',
  'exam_type',
  'subject',
  'year',
  'questions_attempted',
  'questions_correct',
  'xp_earned',
  'attempted',
  'acknowledged',
  'failed',
  'remaining',
  'online',
  'name',
]);

const safeProperties = (data: Record<string, unknown>): Record<string, string | number | boolean | null> =>
  Object.entries(data).reduce<Record<string, string | number | boolean | null>>((safe, [key, value]) => {
    if (!allowedProperties.has(key)) return safe;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null) {
      safe[key] = value;
    }
    return safe;
  }, {});

const normaliseEvent = (event: string): string | null => {
  switch (event) {
    case 'app_session_start':
      return 'app_session_start';
    case 'practice_finish':
      return 'quiz_completed';
    case 'user_logout':
      return 'sign_out';
    case 'feature_used':
      return 'feature_used';
    case 'sign_in':
    case 'sign_up':
    case 'achievement_earned':
    case 'sync_completed':
      return event;
    default:
      return null;
  }
};

export async function trackEvent(event: string, data: Record<string, unknown> = {}): Promise<void> {
  const name = normaliseEvent(event);
  if (!name) return;

  const properties = safeProperties(data);

  if (name === 'quiz_completed' && typeof data.percentage === 'number') {
    const percentage = data.percentage;
    properties.percentage_band = percentage >= 80 ? '80_100' : percentage >= 60 ? '60_79' : percentage >= 40 ? '40_59' : '0_39';
    delete properties.score_band;
  }

  capturePostHogEvent(name, properties);
}
