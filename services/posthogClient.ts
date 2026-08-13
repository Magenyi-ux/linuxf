import posthog from 'posthog-js';

const posthogKey = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const posthogHost = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || 'https://us.i.posthog.com';

let initialised = false;

export const initPostHog = (): void => {
  if (initialised || !posthogKey || typeof window === 'undefined') return;

  posthog.init(posthogKey, {
    api_host: posthogHost,
    capture_pageview: false,
    capture_pageleave: false,
    autocapture: false,
    disable_session_recording: true,
    disable_surveys: true,
    respect_dnt: true,
    persistence: 'localStorage',
    person_profiles: 'identified_only',
  });

  initialised = true;
};

export const capturePostHogEvent = (
  event: string,
  properties: Record<string, string | number | boolean | null | undefined> = {}
): void => {
  if (!initialised) initPostHog();
  if (!initialised) return;

  posthog.capture(event, properties);
};

export const resetPostHog = (): void => {
  if (initialised) posthog.reset();
};
