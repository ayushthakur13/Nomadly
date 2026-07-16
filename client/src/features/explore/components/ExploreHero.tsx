import { Icon } from "@/ui";

interface ExploreHeroProps {
  searchDestination: string;
  setSearchDestination: (val: string) => void;
}

export default function ExploreHero({ searchDestination, setSearchDestination }: ExploreHeroProps) {
  return (
    <div className="relative rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white overflow-hidden shadow-xl mb-12 p-8 sm:p-12 md:p-16 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)]"></div>
      <div className="relative z-10 max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-100 text-xs font-semibold uppercase tracking-wider mb-4 border border-emerald-400/30">
          <Icon name="compass" size={14} className="text-emerald-100" /> Discovery Hub
        </span>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-6 drop-shadow-sm">
          Discover Your Next Journey
        </h1>
        <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed mb-8">
          Explore public itineraries published by global wanderers. Get inspired, clone travel plans, and kickstart your adventure.
        </p>

        {/* Quick Search */}
        <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-white/10 rounded-xl">
            <Icon name="search" size={18} className="text-emerald-250" />
            <input
              type="text"
              placeholder="Search by destination..."
              value={searchDestination}
              onChange={(e) => setSearchDestination(e.target.value)}
              className="bg-transparent border-none text-white placeholder-emerald-200 focus:outline-none w-full text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
