import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/';
import {
  fetchTasks,
  createTask as apiCreate,
  updateTask as apiUpdate,
  deleteTask as apiDelete,
  completeTask as apiComplete,
  uncompleteTask as apiUncomplete,
} from '@/services/tasks.service';
import type { Task, CreateTaskDTO, UpdateTaskDTO } from '@shared/types';
import { extractApiError, type ApiError } from '@/utils/errorHandling';

/**
 * Helper to produce an ISO string for now
 */
const nowISO = () => new Date().toISOString();

export function useTasks() {
  const { tripId } = useParams<{ tripId: string }>();
  const { user } = useAuth();
  // Backend sends `id`; some places may still use `_id`, so normalize both
  const currentUserId = (user as any)?.id || (user as any)?._id || null;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [includeArchived, setIncludeArchived] = useState(false);

  // Track in-flight operations per task
  const [pendingOps, setPendingOps] = useState<Record<string, {
    completing?: 'complete' | 'uncomplete';
    updating?: Partial<UpdateTaskDTO>;
    deleting?: boolean;
    creating?: boolean; // only for temp IDs
  }>>({});

  // Snapshot store for rollback on failures
  const snapshotRef = useRef<Record<string, Task>>({});

  const load = async () => {
    if (!tripId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTasks(tripId, includeArchived);
      setTasks((data || []).slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      setError(extractApiError(err as ApiError, 'Failed to load tasks'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId, includeArchived]);

  /**
   * Global, stable sorting (urgency-first, no assignment priority)
   */
  const sortedTasks: Task[] = useMemo(() => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const isCompleted = (t: Task) => t.completions.some(c => c.userId === currentUserId);

    const getDueBucket = (t: Task): number => {
      if (!t.dueDate) return 3; // no due date, lowest urgency
      const due = new Date(t.dueDate);
      if (due < startOfToday) return 0; // overdue highest
      if (due.toDateString() === startOfToday.toDateString()) return 1; // due today
      return 2; // future
    };

    return [...tasks].sort((a, b) => {
      const aCompleted = isCompleted(a);
      const bCompleted = isCompleted(b);
      if (aCompleted !== bCompleted) return aCompleted ? 1 : -1; // incomplete first

      const aBucket = getDueBucket(a);
      const bBucket = getDueBucket(b);
      if (aBucket !== bBucket) return aBucket - bBucket; // overdue < today < future < none

      // within same bucket, earlier due date first
      if (a.dueDate && b.dueDate) {
        const diff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        if (diff !== 0) return diff;
      }

      // tie-breaker: createdAt DESC (newer first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks, currentUserId]);

  /**
   * Create task (optimistic)
   */
  const create = async (payload: CreateTaskDTO) => {
    if (!tripId) return null;
    setError(null);
    const tempId = `temp-${Math.random().toString(36).slice(2)}`;
    const optimistic: Task = {
      _id: tempId,
      tripId,
      title: payload.title,
      description: payload.description,
      assignedTo: payload.assignedTo === undefined ? null : (payload.assignedTo && payload.assignedTo.length > 0 ? payload.assignedTo : null),
      createdBy: currentUserId || 'me',
      dueDate: payload.dueDate ? (typeof payload.dueDate === 'string' ? payload.dueDate : (payload.dueDate as Date).toISOString()) : undefined,
      completions: [],
      isArchived: false,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    setPendingOps(prev => ({ ...prev, [tempId]: { creating: true } }));
    setTasks(prev => [optimistic, ...prev]);
    try {
      const created = await apiCreate(tripId, payload);
      setTasks(prev => prev.map(t => (t._id === tempId ? created : t)));
      setPendingOps(prev => { const { [tempId]: _, ...rest } = prev; return rest; });
      return created;
    } catch (err) {
      const msg = extractApiError(err as ApiError, 'Failed to create task');
      setError(msg);
      // rollback
      setTasks(prev => prev.filter(t => t._id !== tempId));
      setPendingOps(prev => { const { [tempId]: _, ...rest } = prev; return rest; });
      throw new Error(msg);
    }
  };

  /**
   * Update task (optimistic)
   */
  const update = async (id: string, patch: Partial<UpdateTaskDTO>) => {
    setError(null);
    // snapshot
    const original = tasks.find(t => t._id === id);
    if (original) snapshotRef.current[id] = original;

    // normalize assignedTo: [] -> null (everyone)
    const normalizedAssignedTo = patch.assignedTo !== undefined
      ? (patch.assignedTo && patch.assignedTo.length > 0 ? patch.assignedTo : null)
      : undefined;

    // optimistic
    setTasks(prev => prev.map(t => t._id === id ? {
      ...t,
      ...(patch.title !== undefined ? { title: patch.title as string } : {}),
      ...(patch.description !== undefined ? { description: patch.description as string } : {}),
      ...(patch.dueDate !== undefined ? { dueDate: (typeof patch.dueDate === 'string' ? patch.dueDate : (patch.dueDate as Date).toISOString()) } : {}),
      ...(patch.assignedTo !== undefined ? { assignedTo: normalizedAssignedTo as any } : {}),
      updatedAt: nowISO(),
    } : t));
    setPendingOps(prev => ({ ...prev, [id]: { ...prev[id], updating: patch } }));

    try {
      const updated = await apiUpdate(id, patch);
      setTasks(prev => prev.map(t => t._id === id ? { ...t, ...updated } : t));
      setPendingOps(prev => { const { [id]: _, ...rest } = prev; return rest; });
      return updated;
    } catch (err) {
      const msg = extractApiError(err as ApiError, 'Failed to update task');
      setError(msg);
      // rollback
      const snap = snapshotRef.current[id];
      if (snap) setTasks(prev => prev.map(t => t._id === id ? snap : t));
      setPendingOps(prev => { const { [id]: _, ...rest } = prev; return rest; });
      throw new Error(msg);
    }
  };

  /**
   * Delete task (optimistic)
   */
  const remove = async (id: string) => {
    setError(null);
    // snapshot
    const original = tasks.find(t => t._id === id);
    if (original) snapshotRef.current[id] = original;

    // optimistic
    setTasks(prev => prev.filter(t => t._id !== id));
    setPendingOps(prev => ({ ...prev, [id]: { ...prev[id], deleting: true } }));
    try {
      await apiDelete(id);
      setPendingOps(prev => { const { [id]: _, ...rest } = prev; return rest; });
    } catch (err) {
      const msg = extractApiError(err as ApiError, 'Failed to delete task');
      setError(msg);
      // rollback
      const snap = snapshotRef.current[id];
      if (snap) setTasks(prev => [snap, ...prev]);
      setPendingOps(prev => { const { [id]: _, ...rest } = prev; return rest; });
      throw new Error(msg);
    }
  };

  /**
   * Toggle completion (optimistic)
   */
  const toggleComplete = async (id: string, next: boolean) => {
    if (!currentUserId) return;
    setError(null);

    // snapshot before optimistic update
    const original = tasks.find(t => t._id === id);
    if (original) snapshotRef.current[id] = original;

    // optimistic update
    setTasks(prev => prev.map(t => {
      if (t._id !== id) return t;
      const isCompleted = !!t.completions.find(c => c.userId === currentUserId);
      const completions = next
        ? (isCompleted ? t.completions : [...t.completions, { userId: currentUserId, completedAt: nowISO() }])
        : t.completions.filter(c => c.userId !== currentUserId);
      return { ...t, completions, updatedAt: nowISO() };
    }));
    setPendingOps(prev => ({ ...prev, [id]: { ...prev[id], completing: next ? 'complete' : 'uncomplete' } }));

    try {
      const updated = next ? await apiComplete(id) : await apiUncomplete(id);
      setTasks(prev => prev.map(t => t._id === id ? { ...t, ...updated } : t));
      setPendingOps(prev => { const { [id]: _, ...rest } = prev; return rest; });
      return updated;
    } catch (err) {
      const msg = extractApiError(err as ApiError, 'Failed to update completion');
      setError(msg);
      // rollback using snapshot
      const snap = snapshotRef.current[id];
      if (snap) {
        setTasks(prev => prev.map(t => t._id === id ? snap : t));
      }
      setPendingOps(prev => { const { [id]: _, ...rest } = prev; return rest; });
      throw new Error(msg);
    }
  };

  return {
    tripId,
    currentUserId,
    tasks,
    sortedTasks,
    loading,
    error,
    includeArchived,
    setIncludeArchived,
    reload: load,
    create,
    update,
    remove,
    toggleComplete,
    pendingOps,
  };
}
