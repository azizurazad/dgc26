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
