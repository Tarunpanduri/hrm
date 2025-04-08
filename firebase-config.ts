import { environment } from './environment';

// Firebase configuration dynamically pulling values from environment variables
export const firebaseConfig = {
  apiKey: process.env['FIREBASE_API_KEY'] || environment.firebaseConfig.apiKey,
  authDomain: process.env['FIREBASE_AUTH_DOMAIN'] || environment.firebaseConfig.authDomain,
  projectId: process.env['FIREBASE_PROJECT_ID'] || environment.firebaseConfig.projectId,
  storageBucket: process.env['FIREBASE_STORAGE_BUCKET'] || environment.firebaseConfig.storageBucket,
  messagingSenderId: process.env['FIREBASE_MESSAGING_SENDER_ID'] || environment.firebaseConfig.messagingSenderId,
  appId: process.env['FIREBASE_APP_ID'] || environment.firebaseConfig.appId,
  measurementId: process.env['FIREBASE_MEASUREMENT_ID'] || environment.firebaseConfig.measurementId,
  databaseURL: process.env['FIREBASE_DATABASE_URL'] || environment.firebaseConfig.databaseURL // Firebase Realtime Database URL
};
