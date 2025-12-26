interface TripsFiltersProps {
  activeTab: string;
  sortBy: string;
  selectedCategory: string;
  onTabChange: (tab: string) => void;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: string) => void;
  counts: { all?: number; ongoing?: number; upcoming?: number; past?: number };
}

const TripsFilters = ({
  activeTab,
  sortBy,
  selectedCategory,
  onTabChange,
  onCategoryChange,
  onSortChange,
  counts,
}: TripsFiltersProps) => {
  const categories = [
    { value: 'adventure', label: 'Adventure' },
    { value: 'leisure', label: 'Leisure' },
    { value: 'business', label: 'Business' },
    { value: 'family', label: 'Family' },
    { value: 'solo', label: 'Solo' },
    { value: 'couple', label: 'Couple' },
    { value: 'friends', label: 'Friends' },
    { value: 'backpacking', label: 'Backpacking' },
    { value: 'luxury', label: 'Luxury' },
    { value: 'budget', label: 'Budget' },
  ];

  const tabs: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'ongoing', label: 'Ongoing' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'past', label: 'Past' },
  ];

  return (
    <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
      {/* Status Tabs */}
      <div className="flex gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-lg ${
              activeTab === tab.id
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {tab.label} {counts[tab.id as keyof typeof counts] !== undefined &&
              `(${counts[tab.id as keyof typeof counts] || 0})`}
          </button>
        ))}
      </div>

      {/* Sort + Category Filters */}
      <div className="hidden sm:flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Filter
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-700"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Sort
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-700"
          >
            <option value="startDate">Start Date</option>
            <option value="createdAt">Date Created</option>
            <option value="tripName">Trip Name</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TripsFilters;
