import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  applyTripsFilters,
  type TimelineTab,
  type SortKey,
  type SortOrder,
} from '../../_shared/utils';
import type { Trip } from '@/services/trips.service';

interface TripsState {
  trips: {
    all: Trip[];
    upcoming: Trip[];
    ongoing: Trip[];
    past: Trip[];
  };
  loading: boolean;
  error: string | null;
}

/**
 * Manages trips filter state (tabs, category, sort) and URL sync.
 * Frontend-first filtering: applies filters locally to Redux state.
 * No backend calls on filter/sort changes.
 */
export const useTripsFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TimelineTab>('all');
  const [sortBy, setSortBy] = useState<SortKey>('startDate');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Read trips directly from Redux
  const { trips, loading } = useSelector((state: any) => state.trips as TripsState);

  // Initialize tab from query param
  useEffect(() => {
    const tab = (searchParams.get('tab') || 'all').toLowerCase();
    const allowed = ['all', 'ongoing', 'upcoming', 'past'];
    if (allowed.includes(tab)) setActiveTab(tab as TimelineTab);
  }, [searchParams]);

  // Compute filtered and sorted trips (frontend-only, instant)
  const filteredTrips = useMemo(() => {
    const order: SortOrder = sortBy === 'startDate' ? 'asc' : 'desc';
    
    return applyTripsFilters(trips, {
      timeline: activeTab,
      category: selectedCategory,
      sort: sortBy,
      order,
    });
  }, [trips, activeTab, selectedCategory, sortBy]);

  const handleTabChange = useCallback(
    (tab: string) => {
      setActiveTab(tab as TimelineTab);
      setSearchParams({ tab }, { replace: true });
    },
    [setSearchParams]
  );

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handleSortChange = useCallback((sort: string) => {
    setSortBy(sort as SortKey);
  }, []);

  return {
    activeTab,
    sortBy,
    selectedCategory,
    filteredTrips,
    loading,
    handleTabChange,
    handleCategoryChange,
    handleSortChange,
  };
};
