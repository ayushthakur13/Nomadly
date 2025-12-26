/**
 * Trip-level utility functions (pure compute, no side effects).
 */

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
 * Categorize trips by status (upcoming, ongoing, past)
 */
export const categorizeTripsByStatus = (
  trips: any[]
): { upcoming: any[]; ongoing: any[]; past: any[] } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = [];
  const ongoing = [];
  const past = [];

  for (const trip of trips) {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (start > today) upcoming.push(trip);
    else if (end < today) past.push(trip);
    else ongoing.push(trip);
  }

  return { upcoming, ongoing, past };
};
