import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    type User as FirebaseUser
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { User } from '@/types/models/User';
import { logger } from '@/lib/logger';

interface AuthContextType {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function firebaseUserToUser(firebaseUser: FirebaseUser): User {
    return {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || undefined,
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: firebaseUser.metadata.creationTime
            ? new Date(firebaseUser.metadata.creationTime)
            : undefined,
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        logger.info('Setting up auth state listener');

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            logger.debug('Auth state changed', { uid: firebaseUser?.uid });

            if (firebaseUser) {
                setFirebaseUser(firebaseUser);
                setUser(firebaseUserToUser(firebaseUser));
            } else {
                setFirebaseUser(null);
                setUser(null);
            }
            setLoading(false);
        });

        return () => {
            logger.info('Cleaning up auth state listener');
            unsubscribe();
        };
    }, []);

    const login = async (email: string, password: string) => {
        logger.info('Attempting email login', { email });
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            logger.info('Email login successful', { uid: result.user.uid });
            setUser(firebaseUserToUser(result.user));
            setFirebaseUser(result.user);
        } catch (error) {
            logger.error('Email login failed', error);
            throw error;
        }
    };

    const loginWithGoogle = async () => {
        logger.info('Attempting Google login');
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            logger.info('Google login successful', { uid: result.user.uid });
            setUser(firebaseUserToUser(result.user));
            setFirebaseUser(result.user);
        } catch (error) {
            logger.error('Google login failed', error);
            throw error;
        }
    };

    const logout = async () => {
        logger.info('Attempting logout');
        try {
            await firebaseSignOut(auth);
            logger.info('Logout successful');
            setUser(null);
            setFirebaseUser(null);
        } catch (error) {
            logger.error('Logout failed', error);
            throw error;
        }
    };

    const value = {
        user,
        firebaseUser,
        loading,
        login,
        loginWithGoogle,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
