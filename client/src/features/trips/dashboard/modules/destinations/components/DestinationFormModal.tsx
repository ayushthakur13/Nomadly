import { useEffect, useState } from 'react';
import LocationSearchInput from '@/components/trips/LocationSearchInput';
import { Destination, DestinationPayload } from '../hooks/useDestinations';
import Icon from '@/components/icon/Icon';

const normalizeDateInput = (value?: string) => {
  if (!value) return undefined;
  return value.split('T')[0] || value;
};

interface DestinationFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: DestinationPayload) => Promise<void>;
  initial?: Destination | null;
  tripDestination?: { name?: string; point?: { coordinates: [number, number] } };
}

const DestinationFormModal = ({ open, onClose, onSubmit, initial, tripDestination }: DestinationFormModalProps) => {
  const [payload, setPayload] = useState<DestinationPayload>({ name: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate proximity from trip's main destination
  const proximity = tripDestination?.point?.coordinates ? {
    lng: tripDestination.point.coordinates[0],
    lat: tripDestination.point.coordinates[1]
  } : undefined;

  useEffect(() => {
    if (initial) {
      setPayload({
        name: initial.name,
        location: initial.location?.point?.coordinates
          ? {
              name: initial.location?.name || initial.location?.address,
              address: initial.location?.address,
              placeId: initial.location?.placeId,
              coordinates: initial.location.point.coordinates,
            }
          : initial.location,
        arrivalDate: normalizeDateInput(initial.arrivalDate),
        departureDate: normalizeDateInput(initial.departureDate),
        notes: initial.notes ?? '',
      });
    } else {
      setPayload({ name: '', notes: '' });
    }
    setError(null);
  }, [initial, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const trimmedNotes = payload.notes?.trim();
      const submission: DestinationPayload = {
        ...payload,
        notes: trimmedNotes ?? '',
      };

      await onSubmit(submission);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Unable to save destination');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-gray-500">{initial ? 'Edit stop' : 'Add stop'}</p>
            <h3 className="text-xl font-semibold text-gray-900">{initial ? 'Update destination' : 'Add a new destination'}</h3>
          </div>
          <button
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
            onClick={onClose}
          >
            <Icon name="close" size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Place</label>
            <LocationSearchInput
              searchContext="destination"
              proximity={proximity}
              initialValue={payload.location?.name || payload.name}
              placeholder="Search for places, POIs, addresses..."
              onSelect={(loc) =>
                setPayload((prev) => ({
                  ...prev,
                  name: loc.name || prev.name,
                  location: loc.lat && loc.lng ? {
                    name: loc.name,
                    address: loc.address,
                    placeId: loc.placeId,
                    coordinates: [loc.lng, loc.lat],
                  } : {
                    name: loc.name,
                    address: loc.address,
                    placeId: loc.placeId,
                  },
                }))
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Icon name="calendar" size={16} className="text-emerald-600" /> Arrival date
              </label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={payload.arrivalDate || ''}
                onChange={(e) => setPayload((p) => ({ ...p, arrivalDate: e.target.value || undefined }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Icon name="calendar" size={16} className="text-emerald-600" /> Departure date
              </label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={payload.departureDate || ''}
                onChange={(e) => setPayload((p) => ({ ...p, departureDate: e.target.value || undefined }))}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Icon name="notes" size={16} className="text-emerald-600" /> Notes
            </label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={payload.notes || ''}
              onChange={(e) => setPayload((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Capture intentions, vibes, people to meet..."
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

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
              {submitting ? 'Saving...' : initial ? 'Update stop' : 'Add stop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DestinationFormModal;
