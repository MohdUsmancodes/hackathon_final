import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider, db } from '../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signUp = async (email, password, userData) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', userCredential.user.uid), userData);
    return userCredential;
  };

  const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const googleSignIn = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', result.user.uid), {
        fullName: result.user.displayName,
        email: result.user.email,
      });
    }
    return result;
  };

  const logOut = () => signOut(auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, googleSignIn, logOut, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}; 