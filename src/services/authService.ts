import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
    GoogleAuthProvider,
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User } from '@/types/models/User';
import { logger } from '@/lib/logger';
import { FIREBASE_PATHS } from '@/constants/firebasePaths';

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

export const authService = {
    async login(email: string, password: string): Promise<User> {
        logger.info('Auth service: Attempting email login', { email });
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            logger.info('Auth service: Email login successful', { uid: result.user.uid });
            return firebaseUserToUser(result.user);
        } catch (error) {
            logger.error('Auth service: Email login failed', error);
            throw error;
        }
    },

    async loginWithGoogle(): Promise<User> {
        logger.info('Auth service: Attempting Google login');
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            // Create user document in Firestore if it doesn't exist
            const userDocRef = doc(db, FIREBASE_PATHS.PARENTS, result.user.uid);
            await setDoc(userDocRef, {
                email: result.user.email,
                displayName: result.user.displayName,
                photoURL: result.user.photoURL,
                createdAt: serverTimestamp(),
            }, { merge: true });

            logger.info('Auth service: Google login successful', { uid: result.user.uid });
            return firebaseUserToUser(result.user);
        } catch (error) {
            logger.error('Auth service: Google login failed', error);
            throw error;
        }
    },

    async register(email: string, password: string, displayName: string): Promise<User> {
        logger.info('Auth service: Attempting registration', { email, displayName });
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);

            // Update user profile with display name
            await updateProfile(result.user, { displayName });

            // Create user document in Firestore
            const userDocRef = doc(db, FIREBASE_PATHS.PARENTS, result.user.uid);
            await setDoc(userDocRef, {
                email: result.user.email,
                displayName: displayName,
                photoURL: result.user.photoURL,
                createdAt: serverTimestamp(),
            });

            logger.info('Auth service: Registration successful', { uid: result.user.uid });
            return firebaseUserToUser(result.user);
        } catch (error) {
            logger.error('Auth service: Registration failed', error);
            throw error;
        }
    },

    async logout(): Promise<void> {
        logger.info('Auth service: Attempting logout');
        try {
            await signOut(auth);
            logger.info('Auth service: Logout successful');
        } catch (error) {
            logger.error('Auth service: Logout failed', error);
            throw error;
        }
    },

    getCurrentUser(): User | null {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) return null;
        return firebaseUserToUser(firebaseUser);
    },

    getCurrentFirebaseUser(): FirebaseUser | null {
        return auth.currentUser;
    },
};
