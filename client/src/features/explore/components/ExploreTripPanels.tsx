import { useState } from "react";
import { Icon } from "@/ui";
import { formatDateRange } from "../../../utils/formatDateRange";
import type { Destination, Accommodation, Memory } from "@shared/types";
import type { PopulatedTrip, PublicTask, PublicBudgetSummary } from "../ExploreTrip";
import { MemoryLightbox } from "@/features/trips/workspace/modules/memories/components/MemoryLightbox";

interface PanelProps {
  trip: PopulatedTrip;
  destinations: Destination[];
  accommodations: Accommodation[];
  memories: Memory[];
  tasks: PublicTask[];
  budget: PublicBudgetSummary | null;
}

export function OverviewPanel({ trip, destinations, accommodations, memories }: Omit<PanelProps, "tasks" | "budget">) {
  return (
    <div className="space-y-6 text-left">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Trip Overview</h3>
        <p className="text-gray-600 leading-relaxed text-sm">
          Welcome to the public travel blueprint of this trip. This plan has been shared as a public resource for other travellers. You can inspect the scheduled stops, stays, tasks, and budgets below, or copy this plan directly into your own workspace using the **Clone Plan** button above.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t">
        <div className="bg-gray-50 rounded-2xl p-5 border">
          <span className="text-2xl">📍</span>
          <h4 className="font-semibold text-gray-900 mt-2">Destinations</h4>
          <p className="text-sm text-gray-500 mt-1">{destinations.length} stops mapped out.</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-5 border">
          <span className="text-2xl">🏨</span>
          <h4 className="font-semibold text-gray-900 mt-2">Places to Stay</h4>
          <p className="text-sm text-gray-500 mt-1">{accommodations.length} lodges & stays.</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-5 border">
          <span className="text-2xl">📸</span>
          <h4 className="font-semibold text-gray-900 mt-2">Memories</h4>
          <p className="text-sm text-gray-500 mt-1">
            {trip.memoriesPublic
              ? `${memories.length} public photos shared.`
              : "Memories gallery is set to private."}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ItineraryPanel({ destinations }: Pick<PanelProps, "destinations">) {
  return (
    <div className="space-y-8 text-left">
      <h3 className="text-xl font-semibold text-gray-900">Stop-by-Stop Itinerary</h3>
      {destinations.length === 0 ? (
        <p className="text-gray-500 text-sm">No destinations have been mapped out for this trip yet.</p>
      ) : (
        <div className="relative border-l border-emerald-500/30 pl-6 ml-4 space-y-8">
          {destinations.map((dest, idx) => (
            <div key={dest._id} className="relative">
              {/* Timeline dot */}
              <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-emerald-600 border-4 border-white shadow-sm"></span>

              <div className="bg-gray-50 rounded-2xl border p-5">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
                  <div>
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">
                      Stop #{idx + 1}
                    </span>
                    <h4 className="text-lg font-semibold text-gray-900">{dest.name}</h4>
                  </div>
                  {(dest.arrivalDate || dest.departureDate) && (
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-emerald-100">
                      {dest.arrivalDate && dest.departureDate
                        ? formatDateRange(dest.arrivalDate, dest.departureDate)
                        : formatDateRange(dest.arrivalDate || dest.departureDate || "")}
                    </span>
                  )}
                </div>

                {dest.location?.address && (
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-3">
                    <Icon name="location" size={14} className="text-emerald-500" />
                    {dest.location.address}
                  </p>
                )}

                {dest.notes && (
                  <p className="text-sm text-gray-600 italic bg-white p-3 rounded-xl border border-gray-100">
                    "{dest.notes}"
                  </p>
                )}

                {dest.imageUrl && (
                  <div className="mt-4 max-w-md rounded-xl overflow-hidden border">
                    <img src={dest.imageUrl} alt={dest.name} className="w-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function StaysPanel({ accommodations }: Pick<PanelProps, "accommodations">) {
  return (
    <div className="space-y-6 text-left">
      <h3 className="text-xl font-semibold text-gray-900">Places to Stay</h3>
      {accommodations.length === 0 ? (
        <p className="text-gray-500 text-sm">No accommodations have been registered for this trip yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {accommodations.map(stay => (
            <div key={stay._id} className="bg-gray-50 rounded-2xl border p-5 flex flex-col h-full">
              <div className="flex justify-between items-start gap-2 mb-3">
                <h4 className="text-lg font-semibold text-gray-900 line-clamp-1">{stay.name}</h4>
                {stay.pricePerNight !== undefined && (
                  <span className="text-emerald-700 font-semibold text-sm whitespace-nowrap">
                    ${stay.pricePerNight}/night
                  </span>
                )}
              </div>

              {stay.address && (
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-4">
                  <Icon name="location" size={14} className="text-emerald-500" />
                  {stay.address}
                </p>
              )}

              <div className="mt-auto pt-4 border-t border-gray-200/60 grid grid-cols-2 gap-4 text-xs text-gray-600">
                <div>
                  <p className="font-medium text-gray-400 uppercase tracking-wider">Check In</p>
                  <p className="font-semibold text-gray-800 mt-0.5">
                    {stay.checkIn ? formatDateRange(stay.checkIn) : "—"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-400 uppercase tracking-wider">Check Out</p>
                  <p className="font-semibold text-gray-800 mt-0.5">
                    {stay.checkOut ? formatDateRange(stay.checkOut) : "—"}
                  </p>
                </div>
              </div>

              {stay.bookingUrl && (
                <a
                  href={stay.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block text-center py-2 bg-white text-emerald-600 border border-emerald-500/20 hover:bg-emerald-50 rounded-xl text-xs font-semibold transition-all"
                >
                  View Booking Page
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function MemoriesPanel({ trip, memories }: Pick<PanelProps, "trip" | "memories">) {
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  return (
    <div className="space-y-6 text-left">
      <h3 className="text-xl font-semibold text-gray-900">Memories Gallery</h3>
      {!trip.memoriesPublic ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border">
          <span className="text-4xl">🔒</span>
          <h4 className="text-lg font-semibold text-gray-800 mt-3">Private Gallery</h4>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            The author has chosen to keep the memories gallery of this trip private.
          </p>
        </div>
      ) : memories.length === 0 ? (
        <p className="text-gray-500 text-sm">No public memories have been shared for this trip yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {memories.map((memo, index) => (
              <div
                key={memo._id}
                onClick={() => setActiveLightboxIndex(index)}
                className="group relative rounded-2xl overflow-hidden border shadow-sm cursor-pointer"
              >
                <div className="aspect-square bg-gray-100">
                  <img
                    src={memo.url}
                    alt={memo.caption || "Trip Memory"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                {memo.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                    <p className="text-white text-xs line-clamp-2">{memo.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {activeLightboxIndex !== null && (
            <MemoryLightbox
              memories={memories as any}
              activeIndex={activeLightboxIndex}
              onClose={() => setActiveLightboxIndex(null)}
              onChangeIndex={setActiveLightboxIndex}
            />
          )}
        </>
      )}
    </div>
  );
}

export function TasksPanel({ tasks }: Pick<PanelProps, "tasks">) {
  return (
    <div className="space-y-6 text-left">
      <h3 className="text-xl font-semibold text-gray-900">Task List Checklist</h3>
      <p className="text-xs text-gray-500 leading-normal">
        This is a public, read-only checklist of tasks. Task assignment info has been removed for privacy.
      </p>
      {tasks.length === 0 ? (
        <p className="text-gray-500 text-sm">No public tasks have been defined for this trip yet.</p>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <div
              key={task._id}
              className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200/80"
            >
              <input
                type="checkbox"
                checked={task.isCompleted}
                readOnly
                className="mt-1 h-4.5 w-4.5 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 pointer-events-none"
              />
              <div>
                <h4
                  className={`font-semibold text-sm ${
                    task.isCompleted ? "line-through text-gray-400" : "text-gray-800"
                  }`}
                >
                  {task.title}
                </h4>
                {task.description && (
                  <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                )}
                {task.dueDate && (
                  <span className="inline-block text-[10px] bg-white border px-2 py-0.5 rounded text-gray-500 mt-2">
                    Due {formatDateRange(task.dueDate)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function BudgetPanel({ budget }: Pick<PanelProps, "budget">) {
  return (
    <div className="space-y-6 text-left">
      <h3 className="text-xl font-semibold text-gray-900">Budget & Financial Totals</h3>
      <p className="text-xs text-gray-500 leading-normal">
        This shows the public aggregate overview of the trip budget. Individual expenses and contributors are hidden for privacy.
      </p>
      {!budget ? (
        <p className="text-gray-500 text-sm">No budget calculations are available for this trip.</p>
      ) : (
        <div className="space-y-8">
          {/* Totals Cards */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
              <p className="text-xs text-emerald-700 font-medium uppercase tracking-wider">Planned Budget</p>
              <p className="text-3xl font-semibold text-emerald-800 mt-1">
                {budget.totalPlanned} {budget.baseCurrency}
              </p>
            </div>
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5">
              <p className="text-xs text-rose-700 font-medium uppercase tracking-wider">Total Spent</p>
              <p className="text-3xl font-semibold text-rose-800 mt-1">
                {budget.totalSpent} {budget.baseCurrency}
              </p>
            </div>
          </div>

          {/* Category spending Breakdown */}
          {budget.categoryBreakdown && budget.categoryBreakdown.length > 0 && (
            <div className="border-t pt-6">
              <h4 className="font-semibold text-gray-900 mb-4">Spending by Category</h4>
              <div className="space-y-4">
                {budget.categoryBreakdown.map((cat: any) => {
                  const percentage = budget.totalSpent
                    ? Math.round((cat.amount / budget.totalSpent) * 100)
                    : 0;

                  return (
                    <div key={cat.category} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-gray-700">
                        <span>{cat.category}</span>
                        <span>
                          {cat.amount} {budget.baseCurrency} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
