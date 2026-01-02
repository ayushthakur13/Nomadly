import Icon from '@/components/icon/Icon';
import CoverImageUploader from './CoverImageUploader';

interface StepCoverPrivacyProps {
  coverImagePreview: string | null;
  coverProcessing: boolean;
  setCoverProcessing: (v: boolean) => void;
  onImageSelect: (file: File, preview: string) => void;
  isPublic: boolean;
  onTogglePublic: (checked: boolean) => void;
  summary: {
    tripName: string;
    startDate: string;
    endDate: string;
    destination?: string;
    categoryLabel?: string;
  };
}

const StepCoverPrivacy = ({
  coverImagePreview,
  coverProcessing,
  setCoverProcessing,
  onImageSelect,
  isPublic,
  onTogglePublic,
  summary,
}: StepCoverPrivacyProps) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-[#2E2E2E] mb-6 flex items-center gap-2">
        <Icon name="image" size={28} className="text-emerald-600" />
        Cover Image & Privacy
      </h2>

      {/* Cover Image */}
      <div>
        <CoverImageUploader
          preview={coverImagePreview}
          onProcessingChange={setCoverProcessing}
          onImageSelect={onImageSelect}
          className="mb-2"
        />
        {!coverImagePreview && !coverProcessing && (
          <p className="text-sm text-gray-500 mt-2">Best for sharing and discovery. Totally optional!</p>
        )}
        {coverProcessing && (
          <p className="text-sm text-emerald-700 mt-2 flex items-center gap-2">
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></span>
            Processing cover image...
          </p>
        )}
      </div>

      {/* Public/Private Toggle */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Make this trip public</h3>
            <p className="text-sm text-gray-600 mt-1">
              {isPublic ? 'Anyone can view this trip if it\'s public.' : 'Only you and invited members can access this trip'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => onTogglePublic(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3">Review your trip</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-800">
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Name</p>
            <p className="font-semibold text-gray-900 truncate">{summary.tripName || '—'}</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Dates</p>
            <p className="font-semibold text-gray-900 truncate">{summary.startDate || '—'} to {summary.endDate || '—'}</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Destination</p>
            <p className="font-semibold text-gray-900 truncate">{summary.destination || '—'}</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Category</p>
            <p className="font-semibold text-gray-900 truncate">{summary.categoryLabel || '—'}</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">You can edit everything later.</p>
      </div>
    </div>
  );
};

export default StepCoverPrivacy;
