import { auth } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signInAnonymously, 
    signOut,
    onAuthStateChanged,
    EmailAuthProvider,
    linkWithCredential
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

const formatAuthError = (errorCode) => {
    switch (errorCode) {
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Invalid email or password.';
        case 'auth/email-already-in-use':
            return 'An account with this email already exists.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Try again later.';
        case 'auth/credential-already-in-use':
            return 'This email is already linked to another account.';
        default:
            return 'Authentication failed. Please check your details and try again.';
    }
};

export const registerUser = async (email, password) => {
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        return { success: true };
    } catch (error) {
        return { success: false, message: formatAuthError(error.code) };
    }
};

export const loginUser = async (email, password) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        return { success: true };
    } catch (error) {
        return { success: false, message: formatAuthError(error.code) };
    }
};

export const loginGuest = async () => {
    try {
        await signInAnonymously(auth);
        return { success: true };
    } catch (error) {
        return { success: false, message: formatAuthError(error.code) };
    }
};

export const linkGuestToAccount = async (email, password) => {
    if (!auth.currentUser) return { success: false, message: "No active session found." };
    try {
        const credential = EmailAuthProvider.credential(email, password);
        await linkWithCredential(auth.currentUser, credential);
        return { success: true };
    } catch (error) {
        return { success: false, message: formatAuthError(error.code) };
    }
};

export const logoutUser = () => signOut(auth);

export const listenToAuthChanges = (callback) => {
    onAuthStateChanged(auth, callback);
};