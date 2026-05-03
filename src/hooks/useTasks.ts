import { useState, useEffect, useCallback } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, orderBy, where, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'done';
  dueDate?: string;
  categoryId?: string;
  creatorId: string;
  createdAt: any;
  updatedAt: any;
  recurringRule?: string;
  dependencies?: string[];
}

export interface Space {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
}

export function useTasks(spaceId: string | null) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const logActivity = useCallback(async (action: string, type: string, targetId: string, targetTitle: string) => {
    if (!spaceId || !user) return;
    try {
      await addDoc(collection(db, `spaces/${spaceId}/activities`), {
        userId: user.uid,
        userName: user.displayName || 'User',
        action,
        type,
        targetId,
        targetTitle,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("Activity logging failed", e);
    }
  }, [spaceId, user]);

  useEffect(() => {
    if (!spaceId || !user) return;

    const path = `spaces/${spaceId}/tasks`;
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setTasks(taskList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [spaceId, user]);

  const addTask = async (task: Partial<Task>) => {
    if (!spaceId || !user) return;
    const path = `spaces/${spaceId}/tasks`;
    try {
      const docRef = await addDoc(collection(db, path), {
        ...task,
        creatorId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        dependencies: task.dependencies || [],
      });
      toast.success('Task created');
      logActivity('created', 'task', docRef.id, task.title || 'Untitled');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!spaceId) return;
    const path = `spaces/${spaceId}/tasks/${taskId}`;
    try {
      const oldTask = tasks.find(t => t.id === taskId);
      await updateDoc(doc(db, path), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      if (updates.status === 'done') toast.success('Task completed! 🎉');
      
      const action = updates.status ? `changed status to ${updates.status}` : 'updated details of';
      logActivity(action, 'task', taskId, updates.title || oldTask?.title || 'Task');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!spaceId) return;
    const path = `spaces/${spaceId}/tasks/${taskId}`;
    try {
      const oldTask = tasks.find(t => t.id === taskId);
      await deleteDoc(doc(db, path));
      toast.success('Task deleted');
      logActivity('deleted', 'task', taskId, oldTask?.title || 'Task');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const bulkUpdateStatus = async (taskIds: string[], status: Task['status']) => {
    if (!spaceId) return;
    const batch = writeBatch(db);
    taskIds.forEach(id => {
      const ref = doc(db, `spaces/${spaceId}/tasks/${id}`);
      batch.update(ref, { status, updatedAt: serverTimestamp() });
    });
    try {
      await batch.commit();
      toast.success(`Updated ${taskIds.length} tasks`);
      logActivity(`batch updated ${taskIds.length} tasks to`, 'task', 'multiple', status);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `spaces/${spaceId}/tasks`);
    }
  };

  const bulkDelete = async (taskIds: string[]) => {
    if (!spaceId) return;
    const batch = writeBatch(db);
    taskIds.forEach(id => {
      const ref = doc(db, `spaces/${spaceId}/tasks/${id}`);
      batch.delete(ref);
    });
    try {
      await batch.commit();
      toast.success(`Deleted ${taskIds.length} tasks`);
      logActivity(`batch deleted ${taskIds.length} tasks`, 'task', 'multiple', 'Bulk Delete');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `spaces/${spaceId}/tasks`);
    }
  };

  return { tasks, loading, addTask, updateTask, deleteTask, bulkUpdateStatus, bulkDelete };
}
