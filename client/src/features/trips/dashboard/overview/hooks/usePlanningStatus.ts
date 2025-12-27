import { useMemo } from 'react';

export type PlanningStatus = 'Not started' | 'Started' | 'In progress' | 'Set' | 'Added';
export interface PlanningRow { label: string; status: PlanningStatus }
export interface PlanningStates {
  destinations: PlanningStatus;
  tasks: PlanningStatus;
  budget: PlanningStatus;
  stay: PlanningStatus;
}

export const usePlanningStatus = (trip: any) => {
  const { rows, states } = useMemo(() => {
    // Destinations: existence-based only
    const hasPrimaryDestination = !!(trip?.destinationLocation?.name || trip?.mainDestination);
    const destinations: PlanningStatus = hasPrimaryDestination ? 'Started' : 'Not started';

    // Tasks: no completion logic here; only existence
    const hasTasks = !!trip?.tasksCount; // optional signal; defaults to false
    const tasks: PlanningStatus = hasTasks ? 'In progress' : 'Not started';

    // Budget: configuration existence
    const hasBudget = !!trip?.budget?.id || !!trip?.budgetId || !!trip?.budgetSet; // flexible signals
    const budget: PlanningStatus = hasBudget ? 'Set' : 'Not started';

    // Stay: accommodations existence
    const hasStay = !!trip?.accommodationsCount || !!trip?.stayAdded; // flexible signals
    const stay: PlanningStatus = hasStay ? 'Added' : 'Not started';

    const states: PlanningStates = { destinations, tasks, budget, stay };
    const rows: PlanningRow[] = [
      { label: 'Destinations', status: destinations },
      { label: 'Tasks', status: tasks },
      { label: 'Budget', status: budget },
      { label: 'Stay', status: stay },
    ];

    return { rows, states };
  }, [trip?.destinationLocation?.name, trip?.mainDestination, trip?.tasksCount, trip?.budget?.id, trip?.budgetId, trip?.budgetSet, trip?.accommodationsCount, trip?.stayAdded]);

  return { rows, states };
}
