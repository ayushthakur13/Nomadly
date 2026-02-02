import { useMemo } from "react";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

const endOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

/**
 * Computes trip status (Upcoming / Ongoing / Past) and badge metadata.
 * Calendar-day based (not time-of-day).
 */
export const useTripStatus = (startDate: string, endDate: string) => {
  const statusInfo = useMemo(() => {
    const now = startOfDay(new Date());
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));

    // Inclusive day count
    const totalDays = Math.max(
      1,
      Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY) + 1
    );

    const daysToStart = Math.max(
      0,
      Math.ceil((start.getTime() - now.getTime()) / MS_PER_DAY)
    );

    const daysSinceStart = Math.max(
      0,
      Math.floor((now.getTime() - start.getTime()) / MS_PER_DAY)
    );

    if (now < start) {
      return {
        status: "Upcoming",
        text: daysToStart === 1 ? "1 day to go" : `${daysToStart} days to go`,
        badgeColor: "bg-blue-100 text-blue-700",
        icon: "calendar",
      };
    }

    if (now >= start && now <= end) {
      // Calendar day index (1-based)
      const currentDay = Math.min(daysSinceStart + 1, totalDays);

      return {
        status: "Ongoing",
        text: `Day ${currentDay} of ${totalDays}`,
        badgeColor: "bg-emerald-100 text-emerald-700",
        icon: "zap",
      };
    }

    return {
      status: "Past",
      text: "Trip completed",
      badgeColor: "bg-gray-100 text-gray-700",
      icon: "checkCircle",
    };
  }, [startDate, endDate]);

  return { statusInfo };
};
