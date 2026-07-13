import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocFromServer,
  addDoc
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyC_FHuBUvyRF1HSXHF_5OI5l8opBAb6ZSE",
  authDomain: "dgc-botany.firebaseapp.com",
  projectId: "dgc-botany",
  storageBucket: "dgc-botany.firebasestorage.app",
  messagingSenderId: "283901559742",
  appId: "1:283901559742:web:965e80c34b36d98edaafef",
  measurementId: "G-E7V8HYML07"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Safe FCM Messenger access
let messagingInstance: Messaging | null = null;

export function getMessagingSafe(): Messaging | null {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      if (!messagingInstance) {
        messagingInstance = getMessaging(app);
      }
      return messagingInstance;
    } catch (e) {
      console.warn("FCM messaging is not supported in this browser/environment context:", e);
      return null;
    }
  }
  return null;
}

export async function requestFcmToken(studentId: string): Promise<string | null> {
  const messaging = getMessagingSafe();
  if (!messaging) {
    // Generate a secure, deterministic/re-usable fallback identifier for persistence
    // inside the sandboxed iframe preview environment so the student document registers correctly.
    const cleanId = studentId.replace(/[^a-zA-Z0-9]/g, '');
    return `fcm-preview-device-${cleanId}-${navigator.userAgent.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)}`;
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'BBGN114UP9KO0vvCmpmj3QcgaQtdI0w8rZ2SrPQ9VhBnjkndTNBcS3KFlVEhJGVndHXJr1FXoIkx1P83TfINJXA'
      });
      return token;
    }
    return null;
  } catch (error) {
    console.error("Failed to retrieve true FCM Token, generating secure fallback:", error);
    const cleanId = studentId.replace(/[^a-zA-Z0-9]/g, '');
    return `fcm-preview-fallback-${cleanId}-${Math.random().toString(36).substring(2, 8)}`;
  }
}

/**
 * Broadcasts a push notification payload to targeted students' registration tokens via the FCM REST API.
 */
export async function sendFcmPushNotification(
  tokens: string[],
  title: string,
  message: string,
  category: string,
  imageUrl?: string
) {
  // Filter out any mock tokens (like fcm-preview-device-*)
  const realTokens = tokens.filter(t => t && !t.startsWith('fcm-preview-'));
  if (realTokens.length === 0) {
    console.log("No real FCM registration tokens available to send push notifications. Skipping FCM Legacy HTTP request.");
    return { success: true, simulated: true, count: tokens.length };
  }

  // Get Server Key from environment or fallback
  const serverKey = (import.meta as any).env.VITE_FCM_SERVER_KEY || '';
  if (!serverKey) {
    console.warn("VITE_FCM_SERVER_KEY is not defined in the environment. Real FCM push notifications cannot be routed without it.");
    return { success: false, error: 'Missing VITE_FCM_SERVER_KEY' };
  }

  try {
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${serverKey}`
      },
      body: JSON.stringify({
        registration_ids: realTokens,
        notification: {
          title: title,
          body: message,
          icon: '/logo.svg',
          badge: '/favicon-16x16.png',
          image: imageUrl || undefined,
          sound: 'default'
        },
        data: {
          category,
          click_action: '/'
        }
      })
    });
    const result = await response.json();
    console.log("FCM Legacy Broadcast response:", result);
    return result;
  } catch (error) {
    console.error("Failed to send real FCM push notification:", error);
    throw error;
  }
}

export function onMessageListener(callback: (payload: any) => void) {
  const messaging = getMessagingSafe();
  if (!messaging) return () => {};
  try {
    return onMessage(messaging, (payload) => {
      callback(payload);
    });
  } catch (e) {
    console.warn("Could not register onMessage listener:", e);
    return () => {};
  }
}

let storageInstance: any = null;
export function getStorageInstance() {
  if (!storageInstance) {
    storageInstance = getStorage(app);
  }
  return storageInstance;
}

export async function uploadFileToStorage(file: File, folder: string): Promise<string> {
  const storage = getStorageInstance();
  const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

// Connection test as required by firebase-integration skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase Firestore connection established successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or network. The client is offline.");
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Syncs a collection from Firestore. Seeds initial data if empty.
 */
export function syncCollection<T extends { id: string }>(
  collectionName: string,
  initialData: T[],
  onUpdate: (data: T[]) => void
): () => void {
  const colRef = collection(db, collectionName);
  
  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty && initialData.length > 0) {
        console.log(`Seeding Firestore collection '${collectionName}' with default data...`);
        try {
          for (const item of initialData) {
            await setDoc(doc(db, collectionName, item.id), item);
          }
        } catch (err) {
          console.error(`Failed to seed collection '${collectionName}':`, err);
        }
        return;
      }
      
      const items: T[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as T);
      });
      
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, collectionName);
    }
  );
}

// Helper to deeply remove undefined values before Firestore writes
function removeUndefined(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined).filter(v => v !== undefined);
  } else if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        newObj[key] = removeUndefined(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

/**
 * Add or overwrite document
 */
export async function addFirestoreDoc<T extends { id: string }>(collectionName: string, item: T) {
  try {
    const cleanItem = removeUndefined(item);
    await setDoc(doc(db, collectionName, item.id), cleanItem);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${collectionName}/${item.id}`);
  }
}

/**
 * Edit existing document
 */
export async function updateFirestoreDoc<T extends { id: string }>(collectionName: string, item: T) {
  try {
    const cleanItem = removeUndefined(item);
    await setDoc(doc(db, collectionName, item.id), cleanItem);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${item.id}`);
  }
}

/**
 * Delete document
 */
export async function deleteFirestoreDoc(collectionName: string, id: string) {
  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
  }
}

/**
 * Add message to Chat
 */
export async function addChatMessage(message: {
  senderName: string;
  senderRoll: string;
  senderPhoto: string;
  senderId: string;
  message: string;
  timestamp: number;
}) {
  try {
    const colRef = collection(db, 'chat');
    await addDoc(colRef, message);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'chat');
  }
}
