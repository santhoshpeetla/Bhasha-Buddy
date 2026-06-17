"use client";

export async function trackEvent(name: string, params?: Record<string, string | number | boolean>) {
  try {
    const { logEvent } = await import("firebase/analytics");
    const { getFirebaseAnalytics } = await import("@/lib/firebase");
    
    const analytics = await getFirebaseAnalytics();
    if (!analytics) return;
    logEvent(analytics, name, params);
  } catch (err) {
    console.warn("Analytics event tracking failed or was blocked:", err);
  }
}
