import { Icon } from '@/ui/icon/';
import { LocationSearchInput } from '@/ui/common/';

interface StepLocationsDatesProps {
  startDate: string;
  endDate: string;
  destinationName?: string;
  sourceName?: string;
  errors: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectDestination: (location: any) => void;
  onSelectSource: (location: any) => void;
  durationPreview: string;
}

const StepLocationsDates = ({
  startDate,
  endDate,
  destinationName,
  sourceName,
  errors,
  onInputChange,
  onSelectDestination,
  onSelectSource,
  durationPreview,
}: StepLocationsDatesProps) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-[#2E2E2E] mb-6 flex items-center gap-2">
        <Icon name="location" size={28} className="text-emerald-600" />
        Locations & Dates
      </h2>

      {/* Destination */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Main Destination *</label>
        <LocationSearchInput
          onSelect={onSelectDestination}
          initialValue={destinationName || ''}
          placeholder="Where are you going?"
        />
        {errors.destinationLocation && (
          <p className="text-red-600 text-sm mt-1">{errors.destinationLocation}</p>
        )}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date *</label>
          <input
            type="date"
            name="startDate"
            value={startDate}
            onChange={onInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          {errors.startDate && <p className="text-red-600 text-sm mt-1">{errors.startDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">End Date *</label>
          <input
            type="date"
            name="endDate"
            value={endDate}
            onChange={onInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          {errors.endDate && <p className="text-red-600 text-sm mt-1">{errors.endDate}</p>}
        </div>
      </div>

      {/* Duration preview */}
      {durationPreview && (
        <div className="flex items-center gap-2 text-emerald-700 text-sm bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          <Icon name="clock" size={16} className="text-emerald-700" />
          <span>{durationPreview}</span>
        </div>
      )}

      {/* Source Location */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Starting Location (Optional)</label>
        <LocationSearchInput
          onSelect={onSelectSource}
          initialValue={sourceName || ''}
          placeholder="Where are you starting from?"
        />
      </div>
    </div>
  );
};

export default StepLocationsDates;
