import posthog from 'posthog-js';

const posthogKey = (import.meta.env.VITE_POSTHOG_KEY as string | undefined)?.trim();
const posthogHost = ((import.meta.env.VITE_POSTHOG_HOST as string | undefined) || 'https://us.i.posthog.com').trim();

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

  // Track the online entry page explicitly without sending query-string values
  // such as referral parameters into analytics.
  posthog.capture('$pageview', {
    $current_url: `${window.location.origin}${window.location.pathname}`,
  });
};

export const identifyPostHogUser = (userId: string): void => {
  if (!userId) return;
  if (!initialised) initPostHog();
  if (!initialised) return;

  // Use the stable Supabase ID only. Do not send email or display-name properties.
  posthog.identify(userId);
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
