import {
    collection,
    query,
    onSnapshot,
    addDoc,
    serverTimestamp,
    setDoc,
    doc,
    deleteDoc,
    updateDoc,
    getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ChildProfile } from '@/types/models/ChildProfile';
import { logger } from '@/lib/logger';
import { FIREBASE_PATHS } from '@/constants/firebasePaths';

function generatePairingCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export const childService = {
    subscribeToChildren(
        parentId: string,
        callback: (children: ChildProfile[]) => void
    ): () => void {
        logger.info('Child service: Subscribing to children', { parentId });

        const childrenRef = collection(db, FIREBASE_PATHS.PARENTS, parentId, FIREBASE_PATHS.CHILDREN);
        const q = query(childrenRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const children = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as ChildProfile[];

            logger.debug('Child service: Children fetched', { count: children.length });
            callback(children);
        }, (error) => {
            logger.error('Child service: Failed to fetch children', error);
            callback([]);
        });

        return unsubscribe;
    },

    async createChild(parentId: string, name: string, ageGroup: string): Promise<ChildProfile> {
        logger.info('Child service: Creating child profile', { parentId, name, ageGroup });

        try {
            const pairingCode = generatePairingCode();
            const childrenRef = collection(db, FIREBASE_PATHS.PARENTS, parentId, FIREBASE_PATHS.CHILDREN);

            const childData = {
                name,
                ageGroup,
                blockedApps: [],
                blockedWebsites: [],
                storageRestricted: false,
                protectionActive: false,
                pairingCode,
                createdAt: serverTimestamp(),
                linkedAt: null,
            };

            const docRef = await addDoc(childrenRef, childData);

            // Create child link
            await setDoc(doc(db, FIREBASE_PATHS.CHILD_LINKS, docRef.id), {
                parentId,
                childName: name,
                pairingCode,
                createdAt: serverTimestamp(),
            });

            // Create pairing code record
            await setDoc(doc(db, FIREBASE_PATHS.PAIRING_CODES, pairingCode), {
                childId: docRef.id,
                parentId,
                childName: name,
                createdAt: serverTimestamp(),
            });

            logger.info('Child service: Child profile created', { childId: docRef.id });

            return {
                id: docRef.id,
                name: childData.name,
                ageGroup: childData.ageGroup,
                blockedApps: childData.blockedApps,
                blockedWebsites: childData.blockedWebsites,
                storageRestricted: childData.storageRestricted,
                protectionActive: childData.protectionActive,
                pairingCode: childData.pairingCode,
            } as unknown as ChildProfile;
        } catch (error) {
            logger.error('Child service: Failed to create child profile', error);
            throw error;
        }
    },

    async updateChild(parentId: string, childId: string, updates: Partial<ChildProfile>): Promise<void> {
        logger.info('Child service: Updating child profile', { parentId, childId, updates });

        try {
            const childRef = doc(db, FIREBASE_PATHS.PARENTS, parentId, FIREBASE_PATHS.CHILDREN, childId);
            await updateDoc(childRef, {
                ...updates,
                updatedAt: serverTimestamp(),
            });

            logger.info('Child service: Child profile updated', { childId });
        } catch (error) {
            logger.error('Child service: Failed to update child profile', error);
            throw error;
        }
    },

    async deleteChild(parentId: string, childId: string): Promise<void> {
        logger.info('Child service: Deleting child profile', { parentId, childId });

        try {
            // Delete child profile
            const childRef = doc(db, FIREBASE_PATHS.PARENTS, parentId, FIREBASE_PATHS.CHILDREN, childId);
            await deleteDoc(childRef);

            // Delete child link
            const childLinkRef = doc(db, FIREBASE_PATHS.CHILD_LINKS, childId);
            await deleteDoc(childLinkRef);

            logger.info('Child service: Child profile deleted', { childId });
        } catch (error) {
            logger.error('Child service: Failed to delete child profile', error);
            throw error;
        }
    },

    async getChild(parentId: string, childId: string): Promise<ChildProfile | null> {
        logger.info('Child service: Getting child profile', { parentId, childId });

        try {
            const childRef = doc(db, FIREBASE_PATHS.PARENTS, parentId, FIREBASE_PATHS.CHILDREN, childId);
            const childSnap = await getDoc(childRef);
            if (childSnap.exists()) {
                return { id: childSnap.id, ...childSnap.data() } as ChildProfile;
            }
            return null;
        } catch (error) {
            logger.error('Child service: Failed to get child profile', error);
            throw error;
        }
    },

    async linkChildDevice(childId: string, deviceId: string): Promise<void> {
        logger.info('Child service: Linking child device', { childId, deviceId });

        try {
            const childLinkRef = doc(db, FIREBASE_PATHS.CHILD_LINKS, childId);
            await updateDoc(childLinkRef, {
                deviceId,
                linkedAt: serverTimestamp(),
            });

            logger.info('Child service: Child device linked', { childId });
        } catch (error) {
            logger.error('Child service: Failed to link child device', error);
            throw error;
        }
    },

    async verifyPairingCode(pairingCode: string): Promise<{ childId: string; parentId: string } | null> {
        logger.info('Child service: Verifying pairing code', { pairingCode });

        try {
            const pairingCodeRef = doc(db, FIREBASE_PATHS.PAIRING_CODES, pairingCode);
            const pairingSnap = await getDoc(pairingCodeRef);
            if (pairingSnap.exists()) {
                const data = pairingSnap.data();
                return {
                    childId: data.childId,
                    parentId: data.parentId
                };
            }
            return null;
        } catch (error) {
            logger.error('Child service: Failed to verify pairing code', error);
            return null;
        }
    },
};
