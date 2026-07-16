interface ExploreFiltersProps {
  activeCategory: string;
  setActiveCategory: (val: string) => void;
  sortBy: "recent" | "most-liked";
  setSortBy: (val: "recent" | "most-liked") => void;
}

export default function ExploreFilters({
  activeCategory,
  setActiveCategory,
  sortBy,
  setSortBy,
}: ExploreFiltersProps) {
  const categories = [
    { value: "adventure", label: "🗻 Adventure" },
    { value: "leisure", label: "🏖️ Leisure" },
    { value: "business", label: "💼 Business" },
    { value: "family", label: "👨‍👩‍👧‍👦 Family" },
    { value: "solo", label: "🧳 Solo" },
    { value: "couple", label: "💑 Couple" },
    { value: "friends", label: "👯 Friends" },
    { value: "backpacking", label: "🎒 Backpacking" },
    { value: "luxury", label: "✨ Luxury" },
    { value: "budget", label: "💰 Budget" }
  ];

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
      {/* Categories Horizontal Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto py-2 w-full md:max-w-[70%] no-scrollbar">
        <button
          onClick={() => setActiveCategory("")}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 ${
            activeCategory === ""
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 ${
              activeCategory === cat.value
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Sort Switcher */}
      <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm w-full md:w-auto justify-center">
        <button
          onClick={() => setSortBy("recent")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
            sortBy === "recent"
              ? "bg-gray-100 text-gray-900"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Recent
        </button>
        <button
          onClick={() => setSortBy("most-liked")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
            sortBy === "most-liked"
              ? "bg-gray-100 text-gray-900"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Popular
        </button>
      </div>
    </div>
  );
}
