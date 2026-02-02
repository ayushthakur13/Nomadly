import { useMemo, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchTasks } from '@/services/tasks.service';
import type { Task, Trip } from '@shared/types';

export interface AttentionItem {
  id: string;
  title: string; // one-line insight
  why: string; // subtle reason
  cta: string; // clear CTA label
  icon: string;
  href: string; // target route
  urgency: number; // lower is more urgent
}

export const useNeedsAttention = (trip: Trip, stage: 'Upcoming' | 'Ongoing' | 'Past') => {
  const { tripId } = useParams<{ tripId: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  // Fetch tasks to check if any exist
  useEffect(() => {
    const loadTasks = async () => {
      if (!tripId) return;
      try {
        setTasksLoading(true);
        const fetchedTasks = await fetchTasks(tripId, false);
        setTasks(fetchedTasks || []);
      } catch (error) {
        console.error('Failed to fetch tasks for needs attention check:', error);
        setTasks([]);
      } finally {
        setTasksLoading(false);
      }
    };
    loadTasks();
  }, [tripId]);

  const items = useMemo<AttentionItem[]>(() => {
    if (stage === 'Past') return [];

    const list: AttentionItem[] = [];

    // Check if destinations have been added
    const hasDestinations = trip.destinations && trip.destinations.length > 0;
    if (!hasDestinations) {
      list.push({
        id: 'route',
        title: 'No itinerary yet',
        why: 'Add your first stop to shape the journey.',
        cta: 'Add first stop',
        icon: 'map',
        href: `/trips/${trip._id}/destinations`,
        urgency: 1,
      });
    }

    const hasMultipleTravellers = (trip.membersCount || trip.members?.length || 1) > 1;
    if (!hasMultipleTravellers) {
      list.push({
        id: 'members',
        title: 'Travellers not invited',
        why: 'Trips are better together. Invite your crew.',
        cta: 'Invite members',
        icon: 'users',
        href: `/trips/${trip._id}/members`,
        urgency: 3,
      });
    }

    // Budget placeholder: always attention until implemented
    list.push({
      id: 'budget',
      title: 'Budget not started',
      why: 'Set expectations and avoid surprises.',
      cta: 'Plan budget',
      icon: 'dollarSign',
      href: `/trips/${trip._id}/budget`,
      urgency: 2,
    });

    // Tasks: only show if no tasks exist
    const hasTasks = tasks && tasks.length > 0;
    if (!hasTasks) {
      list.push({
        id: 'tasks',
        title: 'No tasks yet',
        why: 'A simple list keeps everyone aligned.',
        cta: 'Create tasks',
        icon: 'check',
        href: `/trips/${trip._id}/tasks`,
        urgency: stage === 'Ongoing' ? 1 : 4,
      });
    }

    return list.sort((a, b) => a.urgency - b.urgency).slice(0, 5);
  }, [trip._id, trip.destinations?.length, trip.membersCount, trip.members?.length, tasks.length, stage]);

  return { items };
}
