import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, where, addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Space } from './useTasks';

export function useSpaces() {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // In this simplified version, we'll query spaces where the user is a member
    // Usually you'd query a user's memberships collection first or use a collectionGroup
    // For simplicity, we'll look at a spaces collection where ownerId == user.uid
    const q = query(collection(db, 'spaces'), where('ownerId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const spaceList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Space[];
      setSpaces(spaceList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'spaces');
    });

    return () => unsubscribe();
  }, [user]);

  const createSpace = async (name: string) => {
    if (!user) return;
    try {
      const spaceRef = await addDoc(collection(db, 'spaces'), {
        name,
        ownerId: user.uid,
        createdAt: new Date().toISOString()
      });
      
      // Also add the owner as a member
      await setDoc(doc(db, `spaces/${spaceRef.id}/members/${user.uid}`), {
        role: 'owner',
        email: user.email,
        joinedAt: new Date().toISOString()
      });

      return spaceRef.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'spaces');
    }
  };

  return { spaces, loading, createSpace };
}
