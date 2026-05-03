import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  type: 'task' | 'member' | 'space' | 'comment';
  targetId: string;
  targetTitle: string;
  createdAt: any;
}

export function useActivities(spaceId: string | null) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!spaceId || !user) return;

    const path = `spaces/${spaceId}/activities`;
    const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Activity[];
      setActivities(list);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [spaceId, user]);

  return { activities, loading };
}
