import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/ui/icon";
import type { Accommodation, CreateAccommodationDTO } from "@shared/types";
import { DEFAULT_ACCOMMODATION_FORM_VALUES } from "../utils/constants";
import { toDateInputValue } from "../utils/formatting";

interface AccommodationFormModalProps {
  open: boolean;
  initial?: Accommodation | null;
  submitting?: boolean;
  destinationSuggestions?: Array<{
    id: string;
    name: string;
    address?: string;
    arrivalDate?: string;
    departureDate?: string;
  }>;
  onClose: () => void;
  onSubmit: (payload: CreateAccommodationDTO) => Promise<void>;
}

const AccommodationFormModal = ({
  open,
  initial,
  submitting = false,
  destinationSuggestions = [],
  onClose,
  onSubmit,
}: AccommodationFormModalProps) => {
  const [payload, setPayload] = useState<CreateAccommodationDTO>(DEFAULT_ACCOMMODATION_FORM_VALUES);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setPayload({
        name: initial.name,
        address: initial.address ?? "",
        bookingUrl: initial.bookingUrl ?? "",
        checkIn: toDateInputValue(initial.checkIn),
        checkOut: toDateInputValue(initial.checkOut),
        pricePerNight: initial.pricePerNight,
        notes: initial.notes ?? "",
        destinationId: initial.destinationId,
        checkInInstructions: initial.checkInInstructions ?? "",
        hostContactName: initial.hostContactName ?? "",
        hostContactPhone: initial.hostContactPhone ?? "",
        hostContactWhatsApp: initial.hostContactWhatsApp ?? "",
        handoffNotes: initial.handoffNotes ?? "",
      });
    } else {
      setPayload(DEFAULT_ACCOMMODATION_FORM_VALUES);
    }
    setError(null);
  }, [open, initial]);

  const title = useMemo(() => (initial ? "Update stay" : "Add a stay"), [initial]);
  const subtitle = useMemo(
    () => (initial ? "Edit accommodation details" : "Capture where the group will stay"),
    [initial]
  );

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!payload.name || !payload.name.trim()) {
      setError("Accommodation name is required");
      return;
    }

    try {
      await onSubmit({
        ...payload,
        name: payload.name.trim(),
        address: payload.address?.trim(),
        bookingUrl: payload.bookingUrl?.trim(),
        notes: payload.notes?.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Unable to save accommodation");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-gray-500">{subtitle}</p>
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          </div>
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500" onClick={onClose}>
            <Icon name="close" size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Name</label>
              <input
                type="text"
                value={payload.name}
                onChange={(e) => setPayload((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Hotel, hostel, Airbnb..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Address</label>
              <input
                type="text"
                value={payload.address || ""}
                onChange={(e) => setPayload((prev) => ({ ...prev, address: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Street address or locality"
              />
            </div>

            {destinationSuggestions.length > 0 && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Link destination (optional)</label>
                <select
                  value={(payload.destinationId as string) || ""}
                  onChange={(e) => {
                    const selectedId = e.target.value || undefined;
                    const selected = destinationSuggestions.find((item) => item.id === selectedId);
                    setPayload((prev) => ({
                      ...prev,
                      destinationId: selectedId,
                      address: selected?.address || prev.address,
                      checkIn: selected?.arrivalDate ? toDateInputValue(selected.arrivalDate) : prev.checkIn,
                      checkOut: selected?.departureDate ? toDateInputValue(selected.departureDate) : prev.checkOut,
                    }));
                  }}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="">No linked destination</option>
                  {destinationSuggestions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Check-in</label>
              <input
                type="date"
                value={typeof payload.checkIn === "string" ? payload.checkIn : ""}
                onChange={(e) => setPayload((prev) => ({ ...prev, checkIn: e.target.value || undefined }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Check-out</label>
              <input
                type="date"
                value={typeof payload.checkOut === "string" ? payload.checkOut : ""}
                onChange={(e) => setPayload((prev) => ({ ...prev, checkOut: e.target.value || undefined }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Price per night</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={payload.pricePerNight ?? ""}
                onChange={(e) =>
                  setPayload((prev) => ({
                    ...prev,
                    pricePerNight: e.target.value === "" ? undefined : Number(e.target.value),
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Booking URL</label>
              <input
                type="text"
                value={payload.bookingUrl || ""}
                onChange={(e) => setPayload((prev) => ({ ...prev, bookingUrl: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="booking.com/... or full URL"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Notes</label>
              <textarea
                rows={3}
                value={payload.notes || ""}
                onChange={(e) => setPayload((prev) => ({ ...prev, notes: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Check-in instructions, host contact, reminders..."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Check-in instructions</label>
              <input
                type="text"
                value={(payload.checkInInstructions as string) || ""}
                onChange={(e) => setPayload((prev) => ({ ...prev, checkInInstructions: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Door code, front desk note..."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Host contact name</label>
              <input
                type="text"
                value={(payload.hostContactName as string) || ""}
                onChange={(e) => setPayload((prev) => ({ ...prev, hostContactName: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Host/manager name"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Host phone</label>
              <input
                type="text"
                value={(payload.hostContactPhone as string) || ""}
                onChange={(e) => setPayload((prev) => ({ ...prev, hostContactPhone: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="+91..."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Host WhatsApp</label>
              <input
                type="text"
                value={(payload.hostContactWhatsApp as string) || ""}
                onChange={(e) => setPayload((prev) => ({ ...prev, hostContactWhatsApp: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="+91..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Handoff notes</label>
              <textarea
                rows={2}
                value={(payload.handoffNotes as string) || ""}
                onChange={(e) => setPayload((prev) => ({ ...prev, handoffNotes: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Who carries keys, late arrival plan, handover sequence..."
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 py-2 font-semibold text-gray-700 hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-emerald-600 text-white py-2 font-semibold hover:bg-emerald-700 disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? "Saving..." : initial ? "Update stay" : "Add stay"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AccommodationFormModal;
