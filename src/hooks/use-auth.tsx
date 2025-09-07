
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
  register: (credentials: Omit<User, 'id'> & { password?: string }, recaptchaToken: string) => Promise<void>;
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
            const userDoc = await getDocument<StoredUser>('users', firebaseUser.uid);
            
            if (userDoc) {
                let needsUpdate = false;
                if (firebaseUser.emailVerified && !userDoc.isVerified) {
                    userDoc.isVerified = true;
                    needsUpdate = true;
                }

                if (needsUpdate) {
                    await addOrUpdateDocument('users', { isVerified: userDoc.isVerified }, firebaseUser.uid);
                }
                
                if (userDoc.isVerified || userDoc.isAdmin) {
                    sessionStorage.setItem("minimalStoreUser", JSON.stringify(userDoc));
                    setUser(userDoc);
                } else {
                    setUser(null);
                    sessionStorage.removeItem("minimalStoreUser");
                }

            } else {
                await signOut(auth);
                setUser(null);
                sessionStorage.removeItem("minimalStoreUser");
            }
        } else {
            sessionStorage.removeItem("minimalStoreUser");
            setUser(null);
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const login = async (email: string, password: string): Promise<User> => {
    let userCredential;
    try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
        if (error.code === 'auth/user-not-found' && email === 'admin@store.com') {
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
        } else {
             if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                throw new Error("La contraseña o el email son incorrectos.");
            }
            throw new Error("Error de autenticación. Por favor, inténtalo de nuevo.");
        }
    }
    
    const firebaseUser = userCredential.user;
    let userDoc = await getDocument<StoredUser>('users', firebaseUser.uid);

    if (email === 'admin@store.com' && !userDoc) {
        const adminData: StoredUser = { 
            id: firebaseUser.uid, 
            name: 'Admin', 
            email: email, 
            isAdmin: true,
            isVerified: true
        };
        await addOrUpdateDocument('users', adminData, firebaseUser.uid);
        userDoc = adminData;
    }
    
    if (userDoc && !userDoc.isAdmin && !firebaseUser.emailVerified) {
        await signOut(auth);
        throw new Error("Tu cuenta no ha sido verificada. Por favor, revisa tu email.");
    }
    
    if (userDoc && firebaseUser.emailVerified && !userDoc.isVerified) {
        await addOrUpdateDocument('users', { isVerified: true }, firebaseUser.uid);
        userDoc.isVerified = true;
    }


    if (!userDoc) {
        await signOut(auth);
        throw new Error("No se encontró el registro de usuario. Contacta a soporte.");
    }

    sessionStorage.setItem("minimalStoreUser", JSON.stringify(userDoc));
    setUser(userDoc);
    return userDoc;
  };

  const register = async (credentials: Omit<User, 'id'> & { password: string }, recaptchaToken: string) => {
    if (!credentials.password) throw new Error("La contraseña es requerida.");

    const recaptchaResponse = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: recaptchaToken }),
    });

    const recaptchaData = await recaptchaResponse.json();

    if (!recaptchaData.success) {
        throw new Error(recaptchaData.message || 'La verificación de reCAPTCHA falló. Intenta de nuevo.');
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
        const firebaseUser = userCredential.user;
        
        const newUser: StoredUser = {
            id: firebaseUser.uid,
            name: credentials.name,
            email: credentials.email,
            isAdmin: false,
            isVerified: false,
        };
        
        await addOrUpdateDocument("users", newUser, firebaseUser.uid);
        
        await sendEmailVerification(firebaseUser);
        
        await signOut(auth);
    } catch(error: any) {
        if (error.code === 'auth/weak-password') {
            throw new Error('La contraseña es demasiado débil. Debe tener al menos 6 caracteres.');
        }
        throw error;
    }
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
