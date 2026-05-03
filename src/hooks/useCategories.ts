import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export interface Category {
  id: string;
  name: string;
  color: string;
}

export function useCategories(spaceId: string | null) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!spaceId || !user) return;

    const path = `spaces/${spaceId}/categories`;
    const q = query(collection(db, path));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setCategories(list);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [spaceId, user]);

  const addCategory = async (name: string, color: string) => {
    if (!spaceId) return;
    const path = `spaces/${spaceId}/categories`;
    try {
      await addDoc(collection(db, path), { name, color });
      toast.success('Category added');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  return { categories, loading, addCategory };
}
