import { useState, useRef, useEffect } from "react";
import { Icon } from "@/ui";

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
    { value: "adventure", label: "Adventure", icon: "compass" as const },
    { value: "leisure", label: "Leisure", icon: "coffee" as const },
    { value: "business", label: "Business", icon: "briefcase" as const },
    { value: "family", label: "Family", icon: "smile" as const },
    { value: "solo", label: "Solo", icon: "user" as const },
    { value: "couple", label: "Couple", icon: "heart" as const },
    { value: "friends", label: "Friends", icon: "users" as const },
    { value: "backpacking", label: "Backpacking", icon: "backpack" as const },
    { value: "luxury", label: "Luxury", icon: "gem" as const },
    { value: "budget", label: "Budget", icon: "wallet" as const }
  ];

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (el) {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setShowLeftFade(scrollLeft > 2);
      setShowRightFade(scrollLeft + clientWidth < scrollWidth - 2);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  return (
    <>
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>
      <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
      {/* Categories Horizontal Scroll */}
      <div className="relative flex-1 min-w-0 md:max-w-[70%]">
        {showLeftFade && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none z-10" />
        )}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex items-center gap-2 overflow-x-auto py-2 w-full no-scrollbar"
        >
          <button
            onClick={() => setActiveCategory("")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
              activeCategory === ""
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white text-gray-600 hover:bg-gray-50 border-gray-200"
            }`}
          >
            <Icon name="globe" size={14} className={activeCategory === "" ? "text-white" : "text-gray-400"} />
            All Categories
          </button>
          {categories.map((cat) => {
            const isActive = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                  isActive
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-gray-600 hover:bg-gray-50 border-gray-200"
                }`}
              >
                <Icon name={cat.icon} size={14} className={isActive ? "text-white" : "text-gray-400"} />
                {cat.label}
              </button>
            );
          })}
        </div>
        {showRightFade && (
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none z-10" />
        )}
      </div>

      {/* Sort Switcher */}
      <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-lg border border-gray-200 w-full md:w-auto justify-center">
        <button
          onClick={() => setSortBy("recent")}
          className={`flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-center transition-all duration-200 ${
            sortBy === "recent"
              ? "bg-white text-gray-900 shadow-sm border border-gray-100"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <Icon name="clock" size={13} className={sortBy === "recent" ? "text-emerald-600" : "text-gray-400"} />
          Recent
        </button>
        <button
          onClick={() => setSortBy("most-liked")}
          className={`flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-center transition-all duration-200 ${
            sortBy === "most-liked"
              ? "bg-white text-gray-900 shadow-sm border border-gray-100"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <Icon name="trendingUp" size={13} className={sortBy === "most-liked" ? "text-emerald-600" : "text-gray-400"} />
          Popular
        </button>
      </div>
    </div>
    </>
  );
}
