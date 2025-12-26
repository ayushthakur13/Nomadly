import React, { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import useTripsCache from '@/hooks/useTripsCache';

/**
 * Manages trips filter state (tabs, category, sort) and URL sync.
 * Orchestration hook: handles refresh trigger on filter change.
 */
export const useTripsFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = React.useState('all');
  const [sortBy, setSortBy] = React.useState('startDate');
  const [selectedCategory, setSelectedCategory] = React.useState('');

  const { refreshTrips } = useTripsCache();

  // Initialize tab from query param
  React.useEffect(() => {
    const tab = (searchParams.get('tab') || 'all').toLowerCase();
    const allowed = ['all', 'ongoing', 'upcoming', 'past'];
    if (allowed.includes(tab)) setActiveTab(tab);
  }, [searchParams]);

  // Refresh trips when sort or category changes
  React.useEffect(() => {
    const order = sortBy === 'startDate' ? 'asc' : 'desc';
    refreshTrips({ category: selectedCategory || undefined, sort: sortBy, order });
  }, [sortBy, selectedCategory, refreshTrips]);

  const handleTabChange = useCallback(
    (tab: string) => {
      setActiveTab(tab);
      setSearchParams({ tab }, { replace: true });
    },
    [setSearchParams]
  );

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handleSortChange = useCallback((sort: string) => {
    setSortBy(sort);
  }, []);

  return {
    activeTab,
    sortBy,
    selectedCategory,
    handleTabChange,
    handleCategoryChange,
    handleSortChange,
  };
};
