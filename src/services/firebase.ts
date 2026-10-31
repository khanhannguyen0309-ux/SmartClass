import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// ============================================================================
// FIRESTORE ERROR HANDLING (Skill-compliant)
// ============================================================================
export enum OperationType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  BATCH = 'batch'
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string;
  authStatus: {
    isAuthenticated: boolean;
    userId: string | null;
    userRole: string | null;
  };
  description: string;
  recoverySuggestion: string;
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string,
  userRole?: string
): FirestoreErrorInfo {
  const auth = getFirebaseAuth();
  const currentAuthUser = auth?.currentUser || null;
  const errMessage = error instanceof Error ? error.message : String(error);

  const errorInfo: FirestoreErrorInfo = {
    error: errMessage,
    operationType,
    path,
    authStatus: {
      isAuthenticated: Boolean(currentAuthUser),
      userId: currentAuthUser?.uid || null,
      userRole: userRole || 'anonymous'
    },
    description: `Firestore ${operationType.toUpperCase()} operation failed on path "${path}".`,
    recoverySuggestion: !currentAuthUser
      ? 'Người dùng chưa đăng nhập. Vui lòng xác thực tài khoản trước khi thực hiện thao tác.'
      : 'Thao tác bị từ chối do quyền hạn hoặc quy tắc bảo mật. Vui lòng kiểm tra vai trò người dùng.'
  };

  console.error('[EduSmart Firebase Error]', JSON.stringify(errorInfo, null, 2));
  return errorInfo;
}

// ============================================================================
// FIREBASE INITIALIZATION
// ============================================================================
let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!appInstance) {
    if (getApps().length > 0) {
      appInstance = getApp();
    } else {
      appInstance = initializeApp(firebaseConfig);
    }
  }
  return appInstance;
}

export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    const app = getFirebaseApp();
    authInstance = getAuth(app);
  }
  return authInstance;
}

export function getFirebaseFirestore(): Firestore {
  if (!firestoreInstance) {
    const app = getFirebaseApp();
    const dbId = (firebaseConfig as any).firestoreDatabaseId;
    if (dbId && dbId !== '(default)') {
      try {
        firestoreInstance = getFirestore(app, dbId);
      } catch (e) {
        console.warn('Named Firestore database fallback to default:', e);
        firestoreInstance = getFirestore(app);
      }
    } else {
      firestoreInstance = getFirestore(app);
    }
  }
  return firestoreInstance;
}

export const firebaseConfigData = firebaseConfig;
export { collection, doc, setDoc, getDoc, getDocs, query, where, onSnapshot, signInAnonymously, onAuthStateChanged };
export type { User };
