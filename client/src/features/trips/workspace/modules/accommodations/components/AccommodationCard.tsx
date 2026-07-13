import type { Accommodation } from "@shared/types";
import { Icon } from "@/ui/icon";
import { formatCurrency, formatDate, getNightCount } from "../utils/formatting";

interface AccommodationCardProps {
  accommodation: Accommodation;
  canManage: boolean;
  onEdit: (accommodation: Accommodation) => void;
  onDelete: (accommodation: Accommodation) => void;
  onCreateExpenseDraft: (accommodation: Accommodation) => void;
}

const AccommodationCard = ({
  accommodation,
  canManage,
  onEdit,
  onDelete,
  onCreateExpenseDraft,
}: AccommodationCardProps) => {
  const nights = getNightCount(accommodation.checkIn, accommodation.checkOut);
  const estimatedTotal =
    nights && accommodation.pricePerNight !== undefined ? nights * accommodation.pricePerNight : null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{accommodation.name}</h3>
          {accommodation.address && (
            <p className="mt-1 text-sm text-gray-600 flex items-center gap-1">
              <Icon name="mapPin" size={14} className="text-gray-500" />
              {accommodation.address}
            </p>
          )}
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(accommodation)}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              aria-label="Edit accommodation"
            >
              <Icon name="edit2" size={16} />
            </button>
            <button
              onClick={() => onDelete(accommodation)}
              className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
              aria-label="Delete accommodation"
            >
              <Icon name="delete" size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg bg-gray-50 px-3 py-2">
          <p className="text-gray-500">Check-in</p>
          <p className="font-medium text-gray-900">{formatDate(accommodation.checkIn)}</p>
        </div>
        <div className="rounded-lg bg-gray-50 px-3 py-2">
          <p className="text-gray-500">Check-out</p>
          <p className="font-medium text-gray-900">{formatDate(accommodation.checkOut)}</p>
        </div>
        <div className="rounded-lg bg-gray-50 px-3 py-2">
          <p className="text-gray-500">Price per night</p>
          <p className="font-medium text-gray-900">{formatCurrency(accommodation.pricePerNight)}</p>
        </div>
        <div className="rounded-lg bg-gray-50 px-3 py-2">
          <p className="text-gray-500">Estimated total</p>
          <p className="font-medium text-gray-900">
            {estimatedTotal !== null ? formatCurrency(estimatedTotal) : "—"}
          </p>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1">
          <Icon name="clock" size={12} />
          {nights ? `${nights} ${nights === 1 ? "night" : "nights"}` : "Nights pending"}
        </span>
        {accommodation.bookingUrl && (
          <a
            href={accommodation.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 px-2.5 py-1 hover:bg-blue-100"
          >
            Booking link <Icon name="arrowRight" size={12} />
          </a>
        )}
        <button
          onClick={() => onCreateExpenseDraft(accommodation)}
          className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 px-2.5 py-1 hover:bg-amber-100"
        >
          Expense draft <Icon name="receipt" size={12} />
        </button>
      </div>

      <p className="mt-2 text-xs text-gray-500">
        Added by {accommodation.createdByName || "A trip member"}
      </p>

      {(accommodation.checkInInstructions ||
        accommodation.hostContactName ||
        accommodation.hostContactPhone ||
        accommodation.hostContactWhatsApp ||
        accommodation.handoffNotes) && (
        <div className="mt-2 text-xs text-gray-600 space-y-1">
          {accommodation.checkInInstructions && <p>Check-in: {accommodation.checkInInstructions}</p>}
          {accommodation.hostContactName && (
            <p>
              Host: {accommodation.hostContactName}
              {accommodation.hostContactPhone ? ` (${accommodation.hostContactPhone})` : ""}
            </p>
          )}
          {accommodation.hostContactWhatsApp && <p>WhatsApp: {accommodation.hostContactWhatsApp}</p>}
          {accommodation.handoffNotes && <p>Handoff: {accommodation.handoffNotes}</p>}
        </div>
      )}

      {accommodation.notes && (
        <p className="mt-3 text-sm text-gray-700 border-t border-gray-100 pt-2">{accommodation.notes}</p>
      )}
    </div>
  );
};

export default AccommodationCard;
