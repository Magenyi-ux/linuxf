
export async function trackEvent(event: string, data: any = {}) {
  try {
    const savedSession = localStorage.getItem('waExamPrep_session');
    let userId = 'anonymous';
    let email = 'anonymous';

    if (savedSession) {
      const profile = JSON.parse(savedSession);
      userId = profile.id || profile.email || 'user';
      email = profile.email || 'anonymous';
    }

    // Fire and forget to not block UI
    fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        userId,
        email,
        data,
      }),
    }).catch(err => console.error('Tracking failed:', err));

  } catch (e) {
    // Silent fail for analytics
    console.warn('Analytics error:', e);
  }
}
