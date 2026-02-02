/**
 * Trip categorization utilities.
 * Feature-wide business logic used by list, dashboard, and other trip features.
 */

interface CategorizedTrips {
  all: any[];
  upcoming: any[];
  ongoing: any[];
  past: any[];
}

/**
 * Calculate trip duration in days
 */
export const calculateTripDuration = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
};

/**
 * Get category emoji mapping
 */
export const getCategoryEmoji = (category: string): string => {
  const CATEGORY_EMOJI: Record<string, string> = {
    adventure: '🗻',
    leisure: '🏖️',
    business: '💼',
    family: '👨‍👩‍👧‍👦',
    solo: '🧳',
    couple: '💑',
    friends: '👯',
    backpacking: '🎒',
    luxury: '✨',
    budget: '💰',
  };
  return CATEGORY_EMOJI[category] || '✨';
};

/**
 * Check if trips are already categorized (have all required keys)
 */
export const isCategorizedTrips = (trips: any): trips is CategorizedTrips => {
  return (
    trips &&
    !Array.isArray(trips) &&
    typeof trips === 'object' &&
    'all' in trips &&
    'upcoming' in trips &&
    'ongoing' in trips &&
    'past' in trips
  );
};

/**
 * Categorize a flat array of trips into upcoming, ongoing, and past.
 * Based on trip startDate and endDate (calendar-day basis).
 */
export const categorizeTripsByStatus = (trips: any[]): CategorizedTrips => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const categorized: CategorizedTrips = {
    upcoming: [],
    ongoing: [],
    past: [],
    all: trips.slice(),
  };

  for (const trip of trips) {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (start > today) {
      categorized.upcoming.push(trip);
    } else if (end < today) {
      categorized.past.push(trip);
    } else {
      categorized.ongoing.push(trip);
    }
  }

  return categorized;
};

/**
 * Normalize API response payload to get the raw trips array.
 * Service layer already normalizes, so this should handle both pre-normalized arrays
 * and legacy response structures.
 */
export const extractTripsFromPayload = (payload: any): any[] => {
  // If already an array, return it (service layer normalized)
  if (Array.isArray(payload)) {
    return payload;
  }

  // If already categorized object, return all trips
  if (isCategorizedTrips(payload)) {
    return payload.all;
  }

  // Handle nested data structure: { data: { trips: [...] } } (legacy)
  if (payload.data && payload.data.trips) {
    return payload.data.trips;
  }

  // Handle flat structure: { trips: [...] } (legacy)
  if (payload.trips) {
    return payload.trips;
  }

  // Fallback to empty array
  return [];
};

/**
 * Process fetched trips and categorize them.
 * Handles both pre-categorized and flat trip arrays.
 */
export const processFetchedTrips = (payload: any): CategorizedTrips => {
  const rawTrips = extractTripsFromPayload(payload);

  // If already categorized, return as-is
  if (isCategorizedTrips(rawTrips)) {
    return rawTrips;
  }

  // Otherwise, categorize the flat array
  const list = Array.isArray(rawTrips) ? rawTrips : [];
  return categorizeTripsByStatus(list);
};
