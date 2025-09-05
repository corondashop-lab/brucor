
"use client";

import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, deleteDoc, where, query, QueryDocumentSnapshot, DocumentData, addDoc, orderBy } from "firebase/firestore";
import { 
    getAuth, 
    onAuthStateChanged,
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    sendEmailVerification
} from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { StoredUser, Sale } from "./types";


const firebaseConfig: FirebaseOptions = {
    apiKey: "AIzaSyAiLLqgRblp4Dx8YksEecIiBzum4rf4pno",
    authDomain: "coronda-shop.firebaseapp.com",
    projectId: "coronda-shop",
    storageBucket: "coronda-shop.appspot.com",
    messagingSenderId: "528377964843",
    appId: "1:528377964843:web:41f27b3d7750ba09c7fd6e",
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);


// --- Firestore Helper Functions ---

/**
 * Gets all documents from a collection.
 * @param collectionName The name of the collection.
 * @returns A promise that resolves to an array of documents.
 */
export async function getCollection<T>(collectionName: string): Promise<T[]> {
    try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    } catch (error) {
        console.error(`Error fetching collection ${collectionName}:`, error);
        throw new Error("Could not fetch data.");
    }
}

/**
 * Gets a single document by its ID from a collection.
 * @param collectionName The name of the collection.
 * @param id The document ID.
 * @returns A promise that resolves to the document data or null if not found.
 */
export async function getDocument<T>(collectionName: string, id: string): Promise<(T & { id: string }) | null> {
    try {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as T & { id: string };
        }
        return null;
    } catch (error) {
        console.error(`Error fetching document ${id} from ${collectionName}:`, error);
        throw new Error("Could not fetch document.");
    }
}


/**
 * Adds a new document or updates an existing one in a collection.
 * If an ID is provided, it updates the document. If not, it creates a new one with an auto-generated ID.
 * @param collectionName The name of the collection.
 * @param data The data to be saved.
 * @param id Optional. The ID of the document to update.
 * @returns The ID of the created or updated document.
 */
export async function addOrUpdateDocument<T extends { id?: string }>(collectionName: string, data: Partial<T>, id?: string): Promise<string> {
    try {
        let docId = id;
        
        const dataToSave = { ...data };
        if (id) {
            delete dataToSave.id;
        }

        if (!docId) {
            const docRef = await addDoc(collection(db, collectionName), dataToSave);
            docId = docRef.id;
        } else {
             const docRef = doc(db, collectionName, docId);
             await setDoc(docRef, dataToSave, { merge: true });
        }
        
        return docId;
    } catch (error) {
        console.error(`Error saving document to ${collectionName}:`, error);
        throw new Error("Could not save document.");
    }
}

/**
 * Deletes a document from a collection.
 * @param collectionName The name of the collection.
 * @param id The ID of the document to delete.
 */
export async function deleteDocument(collectionName: string, id: string): Promise<void> {
    try {
        const docRef = doc(db, collectionName, id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error(`Error deleting document ${id} from ${collectionName}:`, error);
        throw new Error("Could not delete document.");
    }
}

/**
 * Finds sales for a specific user ID by retrieving the sale IDs from the user's document
 * and then fetching each sale document individually.
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of sales for the user.
 */
export async function findSalesByUserId(userId: string): Promise<Sale[]> {
    try {
        const userDoc = await getDocument<StoredUser>('users', userId);
        if (!userDoc || !userDoc.saleIds || userDoc.saleIds.length === 0) {
            return [];
        }

        const salePromises = userDoc.saleIds.map(saleId => getDocument<Sale>('sales', saleId));
        const sales = await Promise.all(salePromises);

        // Filter out any null results (if a sale was deleted but ID remained)
        return sales.filter((sale): sale is Sale => sale !== null);
    } catch (error) {
        console.error(`Error finding sales for user ${userId}:`, error);
        throw new Error("Could not fetch sales.");
    }
}


// Export auth services
export { 
    auth, 
    onAuthStateChanged,
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    sendEmailVerification
};
