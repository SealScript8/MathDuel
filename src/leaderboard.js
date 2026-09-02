import { db } from './firebase-config.js';
import { 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    collection, 
    query, 
    where, 
    orderBy, 
    limit, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const collectionName = 'leaderboard';

export const saveScore = async (user, newScore) => {
    if (newScore === 0 || !user) return;
    
    const userDocRef = doc(db, collectionName, user.uid);
    const docSnap = await getDoc(userDocRef);
    
    // Efficiency check: Only write if user beats their existing record
    if (docSnap.exists()) {
        const currentBest = docSnap.data().score || 0;
        if (newScore <= currentBest) return; 
    }

    const displayName = user.isAnonymous 
        ? `Guest_${user.uid.substring(0, 5)}` 
        : user.email.split('@')[0];

    await setDoc(userDocRef, {
        userId: user.uid,
        username: displayName,
        score: newScore,
        timestamp: serverTimestamp()
    }, { merge: true });
};

export const updateLeaderboardUsername = async (user) => {
    if (!user) return;
    const userDocRef = doc(db, collectionName, user.uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
        await setDoc(userDocRef, {
            username: user.email.split('@')[0]
        }, { merge: true });
    }
};

export const getLeaderboard = async (filter = 'alltime') => {
    const colRef = collection(db, collectionName);
    let q;

    if (filter === 'today') {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        q = query(
            colRef,
            where('timestamp', '>=', startOfDay),
            orderBy('timestamp', 'desc'),
            orderBy('score', 'desc'),
            limit(20)
        );
    } else {
        q = query(colRef, orderBy('score', 'desc'), limit(20));
    }

    const snapshot = await getDocs(q);
    const scores = [];
    snapshot.forEach(d => scores.push(d.data()));
    
    if (filter === 'today') {
        scores.sort((a, b) => b.score - a.score);
    }
    
    return scores;
};