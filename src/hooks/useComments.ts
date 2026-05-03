import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, doc, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export interface Comment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  createdAt: any;
}

export function useComments(spaceId: string | null, taskId: string | null) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!spaceId || !taskId || !user) return;

    const path = `spaces/${spaceId}/tasks/${taskId}/comments`;
    const q = query(collection(db, path), orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(list);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [spaceId, taskId, user]);

  const addComment = async (text: string) => {
    if (!spaceId || !taskId || !user) return;
    const path = `spaces/${spaceId}/tasks/${taskId}/comments`;
    try {
      await addDoc(collection(db, path), {
        text,
        authorId: user.uid,
        authorName: user.displayName || 'Unknown User',
        authorPhoto: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  return { comments, loading, addComment };
}
