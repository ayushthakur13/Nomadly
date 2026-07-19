import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { LocationSearchInput, FormAlert } from '@/ui/common/';
import type { Destination, DestinationPayload } from '@/services/destinations.service';
import { Icon } from '@/ui/icon/';
import { isDateRangeInvalid } from '@/utils/dateValidation';

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
  tripStartDate?: string;
  tripEndDate?: string;
}

const DestinationFormModal = ({
  open,
  onClose,
  onSubmit,
  initial,
  tripDestination,
  tripStartDate,
  tripEndDate,
}: DestinationFormModalProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm<DestinationPayload>({
    defaultValues: { name: '', notes: '' }
  });

  const locationValue = watch('location');
  const nameValue = watch('name');
  const arrivalDate = watch('arrivalDate');
  const departureDate = watch('departureDate');
  const isDateInvalid = isDateRangeInvalid(arrivalDate, departureDate);

  const isOutOfBounds = useMemo(() => {
    if (!tripStartDate || !tripEndDate) return false;
    const tripStart = new Date(tripStartDate);
    const tripEnd = new Date(tripEndDate);
    tripStart.setHours(0, 0, 0, 0);
    tripEnd.setHours(0, 0, 0, 0);

    if (arrivalDate) {
      const arr = new Date(arrivalDate);
      arr.setHours(0, 0, 0, 0);
      if (arr < tripStart || arr > tripEnd) return true;
    }
    if (departureDate) {
      const dep = new Date(departureDate);
      dep.setHours(0, 0, 0, 0);
      if (dep < tripStart || dep > tripEnd) return true;
    }
    return false;
  }, [arrivalDate, departureDate, tripStartDate, tripEndDate]);

  // Calculate proximity from trip's main destination
  const proximity = tripDestination?.point?.coordinates ? {
    lng: tripDestination.point.coordinates[0],
    lat: tripDestination.point.coordinates[1]
  } : undefined;

  useEffect(() => {
    if (open) {
      if (initial) {
        reset({
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
        reset({ name: '', notes: '', location: undefined, arrivalDate: undefined, departureDate: undefined });
      }
      setError(null);
    }
  }, [initial, open, reset]);

  if (!open) return null;

  const onFormSubmit = async (data: DestinationPayload) => {
    setSubmitting(true);
    setError(null);
    try {
      const trimmedNotes = data.notes?.trim();
      const submission: DestinationPayload = {
        ...data,
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

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Place</label>
            <LocationSearchInput
              searchContext="destination"
              proximity={proximity}
              initialValue={locationValue?.name || nameValue}
              placeholder="Search for places, POIs, addresses..."
              onSelect={(loc) => {
                setValue('name', loc.name || '');
                setValue('location', loc.lat && loc.lng ? {
                  name: loc.name,
                  address: loc.address,
                  placeId: loc.placeId,
                  coordinates: [loc.lng, loc.lat],
                } : {
                  name: loc.name,
                  address: loc.address,
                  placeId: loc.placeId,
                });
              }}
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
                {...register("arrivalDate")}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Icon name="calendar" size={16} className="text-emerald-600" /> Departure date
              </label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                {...register("departureDate")}
              />
            </div>

            <FormAlert
              show={isDateInvalid}
              message="Departure date must be after arrival date"
              variant="error"
              className="col-span-1 md:col-span-2"
            />

            <FormAlert
              show={isOutOfBounds && !isDateInvalid}
              message={`This stop falls outside the overall trip dates (${tripStartDate ? new Date(tripStartDate).toLocaleDateString() : ''} - ${tripEndDate ? new Date(tripEndDate).toLocaleDateString() : ''}).`}
              variant="warning"
              className="col-span-1 md:col-span-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Icon name="notes" size={16} className="text-emerald-600" /> Notes
            </label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              {...register("notes")}
              placeholder="Capture intentions, vibes, people to meet..."
            />
          </div>

          <FormAlert
            show={!!error}
            message={error || ''}
            variant="error"
            className="mb-2"
          />

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
              disabled={submitting || isDateInvalid}
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

