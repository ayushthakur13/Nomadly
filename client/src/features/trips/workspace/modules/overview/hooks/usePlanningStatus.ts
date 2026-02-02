import { useMemo } from 'react';
import type { Trip } from '@shared/types';

export type PlanningStatus = 'Not started' | 'Started' | 'In progress' | 'Set' | 'Added';
export interface PlanningRow { label: string; status: PlanningStatus }
export interface PlanningStates {
  destinations: PlanningStatus;
  tasks: PlanningStatus;
  budget: PlanningStatus;
  stay: PlanningStatus;
}

export const usePlanningStatus = (trip: Trip) => {
  const { rows, states } = useMemo(() => {
    // Destinations: existence-based only
    const hasPrimaryDestination = !!(trip?.destinations && trip.destinations.length > 0);
    const destinations: PlanningStatus = hasPrimaryDestination ? 'Started' : 'Not started';

    // Tasks: no completion logic here; only existence
    const hasTasks = !!trip?.tasksCount; // optional signal; defaults to false
    const tasks: PlanningStatus = hasTasks ? 'In progress' : 'Not started';

    // Budget: not yet tracked in current Trip model
    const budget: PlanningStatus = 'Not started';

    // Stay: not yet tracked in current Trip model
    const stay: PlanningStatus = 'Not started';

    const states: PlanningStates = { destinations, tasks, budget, stay };
    const rows: PlanningRow[] = [
      { label: 'Destinations', status: destinations },
      { label: 'Tasks', status: tasks },
      { label: 'Budget', status: budget },
      { label: 'Stay', status: stay },
    ];

    return { rows, states };
  }, [trip?.destinations?.length, trip?.tasksCount]);

  return { rows, states };
}
