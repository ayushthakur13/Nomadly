import React, { useState, useRef, useEffect, useMemo } from 'react';
import Icon from '../icon/Icon';
import { debounce } from '../../utils/debounce';
import api from '../../services/api';

interface LocationResult {
  name: string;
  address?: string;
  lat: number;
  lng: number;
  placeId?: string;
}

interface LocationSearchInputProps {
  onSelect: (location: LocationResult) => void;
  placeholder?: string;
  initialValue?: string;
}

const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  onSelect,
  placeholder = 'Search location...',
  initialValue = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Create debounced search function once with useMemo to avoid recreating on every render
  const searchLocations = useMemo(
    () =>
      debounce(async (query: string) => {
        if (!query.trim() || query.length < 2) {
          setResults([]);
          return;
        }

        setLoading(true);
        try {
          const response = await api.get('/trips/search-location', {
            params: { query },
          });
          const locations = ((response as any)?.data?.data?.locations || []).map((loc: any) => ({
            name: loc?.name ?? loc?.text ?? (loc?.place_name ? String(loc.place_name).split(',')[0] : ''),
            address: loc?.address ?? loc?.place_name ?? undefined,
            lat: typeof loc?.coordinates?.lat === 'number'
              ? loc.coordinates.lat
              : (Array.isArray(loc?.center) ? Number(loc.center[1]) : Number(loc?.lat)),
            lng: typeof loc?.coordinates?.lng === 'number'
              ? loc.coordinates.lng
              : (Array.isArray(loc?.center) ? Number(loc.center[0]) : Number(loc?.lng)),
            placeId: loc?.placeId ?? loc?.id ?? undefined,
          })).filter((l: any) => Number.isFinite(l.lat) && Number.isFinite(l.lng));
          setResults(locations);
        } catch (error: any) {
          if (error.response?.status === 429) {
            console.warn('Rate limit exceeded for location search');
            // Silently handle rate limit - show cached or default results
          } else {
            console.error('Location search error:', error);
          }
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 300),
    []
  );

  useEffect(() => {
    searchLocations(searchQuery);
  }, [searchQuery]);

  // Sync when parent-provided initial value changes (e.g., returning to a step)
  useEffect(() => {
    setSearchQuery(initialValue);
  }, [initialValue]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (location: LocationResult) => {
    setSearchQuery(location.name);
    setShowResults(false);
    onSelect(location);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowResults(true);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Icon name="search" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
        />
        {loading && <Icon name="loader" className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-600 animate-spin" size={20} />}
      </div>

      {/* Dropdown Results */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {results.map((location, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(location)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Icon name="location" size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">{location.name}</p>
                  {location.address && <p className="text-xs text-gray-500">{location.address}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {showResults && searchQuery.length > 0 && results.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center">
          <p className="text-gray-500">No locations found. Try a different search.</p>
        </div>
      )}
    </div>
  );
};

export default LocationSearchInput;
