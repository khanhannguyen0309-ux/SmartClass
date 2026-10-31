import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { db } from '../services/db';
import { 
  getFirebaseAuth, 
  getFirebaseFirestore, 
  signInAnonymously, 
  onAuthStateChanged,
  doc,
  setDoc,
  User,
  handleFirestoreError,
  OperationType
} from '../services/firebase';

interface AuthContextType {
  currentUser: UserProfile;
  currentRole: UserRole;
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  selectedStudentId: string; // Used by parent/student
  setSelectedStudentId: (id: string) => void;
  switchRole: (role: UserRole) => void;
  login: (email: string, role?: UserRole) => boolean;
  logout: () => void;
  allUsers: UserProfile[];
  firebaseUser: User | null;
  isFirebaseReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const users = db.getUsers();
  
  // Default to Teacher role for immediate rich experience
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('edusmart_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* no-op */ }
    }
    return users.find(u => u.role === 'teacher') || users[0];
  });

  const [selectedClassId, setSelectedClassId] = useState<string>('cls-9a1');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('stu-9a1-01');
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isFirebaseReady, setIsFirebaseReady] = useState<boolean>(false);

  // Initialize Firebase Auth
  useEffect(() => {
    try {
      const auth = getFirebaseAuth();
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setFirebaseUser(user);
          setIsFirebaseReady(true);
        } else {
          try {
            const credential = await signInAnonymously(auth);
            setFirebaseUser(credential.user);
            setIsFirebaseReady(true);
          } catch (err) {
            console.warn('[Firebase Auth] Anonymous sign-in notice:', err);
            setIsFirebaseReady(true);
          }
        }
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn('[Firebase Auth] Initialization skipped:', err);
      setIsFirebaseReady(true);
    }
  }, []);

  // Sync profile to Firestore when currentUser or firebaseUser changes
  useEffect(() => {
    localStorage.setItem('edusmart_user', JSON.stringify(currentUser));

    if (firebaseUser) {
      const syncToFirestore = async () => {
        try {
          const firestore = getFirebaseFirestore();
          const userDocRef = doc(firestore, 'users', firebaseUser.uid);
          await setDoc(userDocRef, {
            email: currentUser.email || `${currentUser.id}@edusmart.edu.vn`,
            fullName: currentUser.fullName,
            role: currentUser.role,
            status: currentUser.status || 'active',
            phone: currentUser.phone || '',
            avatarUrl: currentUser.avatarUrl || '',
            createdAt: currentUser.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `users/${firebaseUser.uid}`, currentUser.role);
        }
      };
      syncToFirestore();
    }
  }, [currentUser, firebaseUser]);

  const switchRole = (role: UserRole) => {
    const targetUser = users.find(u => u.role === role);
    if (targetUser) {
      setCurrentUser(targetUser);
      if (role === 'teacher') {
        setSelectedClassId('cls-9a1');
      } else if (role === 'student') {
        setSelectedStudentId('stu-9a1-01');
        setSelectedClassId('cls-9a1');
      } else if (role === 'guardian') {
        setSelectedStudentId('stu-9a1-01');
      }
    }
  };

  const login = (email: string, role?: UserRole): boolean => {
    let found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found && role) {
      found = users.find(u => u.role === role);
    }
    if (found) {
      setCurrentUser(found);
      return true;
    }
    // Fallback create or select teacher
    const defaultTeacher = users.find(u => u.role === (role || 'teacher')) || users[0];
    setCurrentUser(defaultTeacher);
    return true;
  };

  const logout = () => {
    // Return to a guest or default teacher state
    const teacher = users.find(u => u.role === 'teacher') || users[0];
    setCurrentUser(teacher);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser.role,
        selectedClassId,
        setSelectedClassId,
        selectedStudentId,
        setSelectedStudentId,
        switchRole,
        login,
        logout,
        allUsers: users,
        firebaseUser,
        isFirebaseReady
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

