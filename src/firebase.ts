import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  setLogLevel,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Suppress non-fatal Firestore network retry warnings
setLogLevel('error');

// Initialize Firestore with forced long polling and persistent local cache
// to ensure instant resilience in iframe sandboxes and proxy environments
export const db = initializeFirestore(
  app,
  {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
    experimentalForceLongPolling: true,
  },
  firebaseConfig.firestoreDatabaseId || undefined
);

export default app;


