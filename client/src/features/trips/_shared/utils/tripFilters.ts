/**
 * Pure trip filtering and sorting utilities.
 * Frontend-first approach with future backend query building support.
 */

import type { Trip } from '@/services/trips.service';

export type TimelineTab = 'all' | 'ongoing' | 'upcoming' | 'past';
export type SortKey = 'startDate' | 'createdAt' | 'views';
export type SortOrder = 'asc' | 'desc';

interface CategorizedTrips {
  all: Trip[];
  upcoming: Trip[];
  ongoing: Trip[];
  past: Trip[];
}

/**
 * Filter trips by timeline status (all, ongoing, upcoming, past).
 * Reads from pre-categorized Redux state.
 */
export const applyTimelineFilter = (
  categorizedTrips: CategorizedTrips,
  tab: TimelineTab
): Trip[] => {
  switch (tab) {
    case 'ongoing':
      return categorizedTrips.ongoing;
    case 'upcoming':
      return categorizedTrips.upcoming;
    case 'past':
      return categorizedTrips.past;
    case 'all':
    default:
      return categorizedTrips.all;
  }
};

/**
 * Filter trips by category.
 * Empty category means "all categories".
 */
export const applyCategoryFilter = (
  trips: Trip[],
  category: string
): Trip[] => {
  if (!category) return trips;
  return trips.filter((trip) => trip.category === category);
};

/**
 * Determine if a trip is currently ongoing.
 */
const isTripOngoing = (trip: Trip): boolean => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const start = new Date(trip.startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(trip.endDate);
  end.setHours(0, 0, 0, 0);
  
  return start <= now && end >= now;
};

/**
 * Sort trips by the given key and order.
 * Priority: Ongoing trips always appear first (when viewing "all" trips).
 * Then sorted by the specified key and order.
 * Returns a new sorted array (does not mutate).
 */
export const applySort = (
  trips: Trip[],
  sortKey: SortKey,
  order: SortOrder,
  prioritizeOngoing: boolean = false
): Trip[] => {
  const sorted = [...trips];

  sorted.sort((a, b) => {
    // Priority 1: Ongoing trips first (if enabled)
    if (prioritizeOngoing) {
      const aOngoing = isTripOngoing(a);
      const bOngoing = isTripOngoing(b);
      
      if (aOngoing && !bOngoing) return -1;
      if (!aOngoing && bOngoing) return 1;
    }

    // Priority 2: Regular sorting by selected key
    let aValue: any;
    let bValue: any;

    switch (sortKey) {
      case 'startDate':
        aValue = new Date(a.startDate).getTime();
        bValue = new Date(b.startDate).getTime();
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'views':
        aValue = a.engagement?.views || 0;
        bValue = b.engagement?.views || 0;
        break;
      default:
        return 0;
    }

    if (order === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  return sorted;
};

/**
 * Compose all filters and sorting into a single pipeline.
 * This is the main function to use in UI.
 */
export const applyTripsFilters = (
  categorizedTrips: CategorizedTrips,
  {
    timeline,
    category,
    sort,
    order,
  }: {
    timeline: TimelineTab;
    category: string;
    sort: SortKey;
    order: SortOrder;
  }
): Trip[] => {
  const timelineFiltered = applyTimelineFilter(categorizedTrips, timeline);
  const categoryFiltered = applyCategoryFilter(timelineFiltered, category);
  
  // Prioritize ongoing trips only when viewing "all" trips
  const prioritizeOngoing = timeline === 'all';
  const sorted = applySort(categoryFiltered, sort, order, prioritizeOngoing);
  
  return sorted;
};

/**
 * Future-proofing: Build query object for backend filtering.
 * When we want to switch back to backend-driven filtering,
 * we can use this to construct API query params.
 */
export const buildTripQuery = ({
  timeline,
  category,
  sort,
  order,
}: {
  timeline?: TimelineTab;
  category?: string;
  sort?: SortKey;
  order?: SortOrder;
}) => {
  const query: Record<string, string> = {};

  // Timeline maps to backend 'status' param (if we want backend filtering)
  if (timeline && timeline !== 'all') {
    query.status = timeline;
  }

  if (category) {
    query.category = category;
  }

  if (sort) {
    query.sort = sort;
  }

  if (order) {
    query.order = order;
  }

  return query;
};
