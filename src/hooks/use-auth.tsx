
"use client";

import type { User, StoredUser } from "@/lib/types";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { 
    addOrUpdateDocument, 
    getDocument, 
    auth, 
    signOut, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    sendEmailVerification
} from "@/lib/firebase";
import { useToast } from "./use-toast";

// This hook provides a complete Firebase authentication flow.
// It handles user registration, login, logout, and session management.

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  register: (credentials: Omit<User, 'id'> & { password?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setLoading(true);
        if (firebaseUser) {
            // User is signed in, check if they are verified (or if it's the special admin user)
            const userDoc = await getDocument<User>('users', firebaseUser.uid);
            
            if (userDoc && (firebaseUser.emailVerified || userDoc.isAdmin)) {
                sessionStorage.setItem("minimalStoreUser", JSON.stringify(userDoc));
                setUser(userDoc);
            } else if (!userDoc) {
                // This case handles if a user exists in Auth but not in Firestore DB.
                await signOut(auth);
                setUser(null);
                sessionStorage.removeItem("minimalStoreUser");
            } else {
                // User is signed in but not verified, treat as logged out.
                setUser(null);
                sessionStorage.removeItem("minimalStoreUser");
            }
        } else {
            // User is signed out
            sessionStorage.removeItem("minimalStoreUser");
            setUser(null);
        }
        setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);
  
  const login = async (email: string, password: string): Promise<User> => {
    let userCredential;
    try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
        // If user does not exist and it's the admin email, try to create it.
        if (error.code === 'auth/user-not-found' && email === 'admin@store.com') {
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
        } else {
            // Handle other auth errors, like wrong password.
             if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                throw new Error("La contraseña o el email son incorrectos.");
            }
            throw new Error("Error de autenticación. Por favor, inténtalo de nuevo.");
        }
    }
    
    const firebaseUser = userCredential.user;
    let userDoc = await getDocument<StoredUser>('users', firebaseUser.uid);

    // If it's the admin user and the document doesn't exist in Firestore, create it.
    if (email === 'admin@store.com' && !userDoc) {
        const adminData: StoredUser = { 
            id: firebaseUser.uid, 
            name: 'Admin', 
            email: email, 
            isAdmin: true,
        };
        await addOrUpdateDocument('users', adminData, firebaseUser.uid);
        userDoc = adminData;
    }
    
    if (userDoc && !userDoc.isAdmin && !firebaseUser.emailVerified) {
        await signOut(auth);
        throw new Error("Tu cuenta no ha sido verificada. Por favor, revisa tu email.");
    }

    if (!userDoc) {
        await signOut(auth);
        throw new Error("No se encontró el registro de usuario. Contacta a soporte.");
    }

    sessionStorage.setItem("minimalStoreUser", JSON.stringify(userDoc));
    setUser(userDoc);
    return userDoc;
  };

  const register = async (credentials: Omit<User, 'id'> & { password: string }) => {
    if (!credentials.password) throw new Error("La contraseña es requerida.");

    const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
    const firebaseUser = userCredential.user;
    
    const newUser: StoredUser = {
        id: firebaseUser.uid,
        name: credentials.name,
        email: credentials.email,
        isAdmin: false,
    };
    
    await addOrUpdateDocument("users", newUser, firebaseUser.uid);
    
    // Send verification email
    await sendEmailVerification(firebaseUser);
    
    // Log out the user immediately after registration. They must verify their email to log in.
    await signOut(auth);
  };
  

  const logout = async () => {
    await signOut(auth);
    sessionStorage.removeItem("minimalStoreUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
