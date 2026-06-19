"use client";

import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

let app: FirebaseApp | null = null;
let analyticsPromise: Promise<Analytics | null> | null = null;

export function getFirebaseApp() {
  if (app) return app;

  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
  };

  if (!config.apiKey || !config.appId) return null;
  app = initializeApp(config);
  return app;
}

export function getFirebaseAnalytics() {
  if (analyticsPromise) return analyticsPromise;

  analyticsPromise = (async () => {
    const firebaseApp = getFirebaseApp();
    if (!firebaseApp) return null;
    if (!(await isSupported())) return null;
    return getAnalytics(firebaseApp);
  })();

  return analyticsPromise;
}
