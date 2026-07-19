import { Icon } from "@/ui";
import defaultTripCardCover from "@/assets/illustrations/default-trip-cover.webp";

interface ExploreHeroProps {
  searchDestination: string;
  setSearchDestination: (val: string) => void;
}

export default function ExploreHero({ searchDestination, setSearchDestination }: ExploreHeroProps) {
  return (
    <div className="relative rounded-2xl text-white overflow-hidden shadow-md mb-12 p-5 sm:p-8 md:p-10 text-center bg-slate-900">
      {/* Background Image - lighter (opacity-65) with original colors (no mix-blend-multiply) */}
      <img
        src={defaultTripCardCover}
        alt="Travel cover background"
        className="absolute inset-0 w-full h-full object-cover opacity-65"
      />
      {/* Soft gradient only at the bottom/middle where text needs contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent"></div>
      
      <div className="relative z-10 max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-white text-xs font-medium uppercase tracking-wider mb-3 border border-white/20">
          <Icon name="compass" size={12} className="text-emerald-400" /> Discovery Hub
        </span>
        {/* Swapped headline: specific value-prop copy is main title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3 drop-shadow-sm">
          Clone Itineraries & Shape Your Travel Blueprints
        </h1>
        {/* Shorter subtext */}
        <p className="text-xs sm:text-sm text-gray-200/95 max-w-xl mx-auto leading-relaxed mb-5">
          Explore public itineraries published by global wanderers. Get inspired, clone plans to your workspace, and customize your adventure.
        </p>

        {/* Solid Card Quick Search */}
        <div className="w-full max-w-xl mx-auto bg-white p-1 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2.5 px-3 py-2 bg-gray-50 rounded-lg focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all duration-200">
            <Icon name="mapPin" size={18} className="text-emerald-600 flex-shrink-0" />
            <input
              type="text"
              placeholder="Filter by destination..."
              value={searchDestination}
              onChange={(e) => setSearchDestination(e.target.value)}
              className="bg-transparent border-none text-gray-950 placeholder-gray-400 focus:outline-none w-full text-sm font-medium"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
