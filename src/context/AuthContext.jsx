/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useMemo, useState } from "react";
import { auth } from "../services/firebase";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { db } from "../services/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  const signup = async (name, email, password) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name.trim() });
    await setDoc(
      doc(db, "users", credential.user.uid),
      {
        name: name.trim(),
        email: credential.user.email,
        createdAt: serverTimestamp(),
      },
      { merge: true },
    );
    return credential;
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return firebaseSignOut(auth);
  };

  const updateUserName = async (nextName) => {
    if (!auth.currentUser) {
      throw new Error("No authenticated user.");
    }

    const trimmedName = nextName.trim();
    await updateProfile(auth.currentUser, { displayName: trimmedName });
    await setDoc(
      doc(db, "users", auth.currentUser.uid),
      {
        name: trimmedName,
        email: auth.currentUser.email,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    setUserName(trimmedName);
  };

  useEffect(() => {
    let isActive = true;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!isActive) {
        return;
      }
      setUser(currentUser);

      if (!currentUser) {
        setUserName("");
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        const storedName = userDoc.exists() ? userDoc.data().name : "";
        setUserName(storedName || currentUser.displayName || "");
      } catch {
        setUserName(currentUser.displayName || "");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({ user, userName, login, signup, logout, updateUserName }),
    [user, userName],
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
