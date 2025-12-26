interface StepBasicInfoProps {
  tripName: string;
  description: string;
  category: string;
  errors: Record<string, string>;
  categories: { value: string; label: string; emoji: string }[];
  showAllCategories: boolean;
  onToggleShowAll: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectCategory: (value: string) => void;
}

const StepBasicInfo = ({
  tripName,
  description,
  category,
  errors,
  categories,
  showAllCategories,
  onToggleShowAll,
  onInputChange,
  onSelectCategory,
}: StepBasicInfoProps) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-[#2E2E2E] mb-2">Start with a thought</h2>
      <p className="text-sm text-gray-500 mb-4">
        Just the vibe and a name for now. We'll add the details later.
      </p>

      {/* Trip Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          What's this trip called? *
        </label>
        <input
          type="text"
          name="tripName"
          value={tripName}
          onChange={onInputChange}
          placeholder="e.g. Goa winter escape, Kyoto solo week..."
          className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
        />
        {errors.tripName && <p className="text-red-600 text-sm mt-1">{errors.tripName}</p>}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Pick a vibe *</label>
        <div className="flex flex-wrap gap-2">
          {(showAllCategories ? categories : categories.slice(0, 4)).map((cat) => {
            const selected = category === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => onSelectCategory(cat.value)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm font-medium shadow-sm ${
                  selected
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-200'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label.replace(/^[^\s]+\s/, '')}</span>
              </button>
            );
          })}
        </div>
        {categories.length > 4 && (
          <div className="flex justify-end">
            <button
              type="button"
              className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              onClick={onToggleShowAll}
            >
              {showAllCategories ? 'Show fewer' : 'Show more'}
              <span className="text-xs">▾</span>
            </button>
          </div>
        )}
        {errors.category && <p className="text-red-600 text-sm mt-2">{errors.category}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Why this trip? (Optional)
        </label>
        <textarea
          name="description"
          value={description}
          onChange={onInputChange}
          placeholder="Mood, goal, or who you're travelling with."
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
        />
        <div className="flex justify-between mt-2">
          {errors.description && <p className="text-red-600 text-sm">{errors.description}</p>}
          <p className="text-xs text-gray-500 ml-auto">{description.length} / 500</p>
        </div>
      </div>
    </div>
  );
};

export default StepBasicInfo;
