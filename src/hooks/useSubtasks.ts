import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: any;
}

export function useSubtasks(spaceId: string | null, taskId: string | null) {
  const { user } = useAuth();
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!spaceId || !taskId || !user) return;

    const path = `spaces/${spaceId}/tasks/${taskId}/subtasks`;
    const q = query(collection(db, path), orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Subtask[];
      setSubtasks(list);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [spaceId, taskId, user]);

  const addSubtask = async (title: string) => {
    if (!spaceId || !taskId) return;
    const path = `spaces/${spaceId}/tasks/${taskId}/subtasks`;
    try {
      await addDoc(collection(db, path), {
        title,
        completed: false,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const toggleSubtask = async (subtaskId: string, completed: boolean) => {
    if (!spaceId || !taskId) return;
    const path = `spaces/${spaceId}/tasks/${taskId}/subtasks/${subtaskId}`;
    try {
      await updateDoc(doc(db, path), { completed });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteSubtask = async (subtaskId: string) => {
    if (!spaceId || !taskId) return;
    const path = `spaces/${spaceId}/tasks/${taskId}/subtasks/${subtaskId}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  return { subtasks, loading, addSubtask, toggleSubtask, deleteSubtask };
}
