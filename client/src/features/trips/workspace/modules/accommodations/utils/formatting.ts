export const toDateInputValue = (value?: string) => {
  if (!value) return "";
  return value.split("T")[0] || value;
};

export const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const getNightCount = (checkIn?: string, checkOut?: string): number | null => {
  if (!checkIn || !checkOut) return null;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  const ms = end.getTime() - start.getTime();
  const nights = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights : null;
};

export const formatCurrency = (value?: number) => {
  if (value === undefined || value === null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
};

export interface StayTimelineInsight {
  level: "warning" | "info";
  message: string;
}

export const getStayTimelineInsights = (
  stays: Array<{ name: string; checkIn?: string; checkOut?: string }>
): StayTimelineInsight[] => {
  const dated = stays
    .filter((stay) => stay.checkIn && stay.checkOut)
    .map((stay) => ({
      ...stay,
      start: new Date(stay.checkIn as string),
      end: new Date(stay.checkOut as string),
    }))
    .filter((stay) => !Number.isNaN(stay.start.getTime()) && !Number.isNaN(stay.end.getTime()))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const insights: StayTimelineInsight[] = [];
  for (let i = 1; i < dated.length; i += 1) {
    const previous = dated[i - 1];
    const current = dated[i];
    const diffMs = current.start.getTime() - previous.end.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) {
      insights.push({
        level: "warning",
        message: `${previous.name} overlaps with ${current.name}. Review check-in/check-out dates.`,
      });
      continue;
    }

    if (diffDays >= 2) {
      insights.push({
        level: "info",
        message: `There is a ${diffDays}-day stay gap between ${previous.name} and ${current.name}.`,
      });
      continue;
    }

    if (diffDays === 0) {
      insights.push({
        level: "info",
        message: `${previous.name} and ${current.name} transition on the same day. Keep a handoff plan ready.`,
      });
    }
  }

  return insights;
};
