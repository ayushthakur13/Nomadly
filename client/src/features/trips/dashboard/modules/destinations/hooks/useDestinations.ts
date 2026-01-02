import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchDestinations,
  createDestination as apiCreate,
  updateDestination as apiUpdate,
  deleteDestination as apiDelete,
  reorderDestinations as apiReorder,
  uploadDestinationImage,
  deleteDestinationImage,
  Destination,
  DestinationPayload,
} from '@/services/destinations';

const reorderArray = (list: Destination[], fromId: string, toId: string): Destination[] => {
  if (fromId === toId) return list;
  const next = [...list];
  const fromIndex = next.findIndex((d) => d._id === fromId);
  const toIndex = next.findIndex((d) => d._id === toId);
  if (fromIndex === -1 || toIndex === -1) return list;
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next.map((d, idx) => ({ ...d, order: idx }));
};

export function useDestinations() {
  const { tripId } = useParams<{ tripId: string }>();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const load = async () => {
    if (!tripId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDestinations(tripId);
      setDestinations((data || []).sort((a, b) => a.order - b.order));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load destinations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [tripId]);

  const createDestination = async (payload: DestinationPayload) => {
    if (!tripId) return null;
    setError(null);
    const created = await apiCreate(tripId, payload);
    setDestinations((prev) => [...prev, created].sort((a, b) => a.order - b.order));
    return created;
  };

  const updateDestination = async (id: string, payload: Partial<DestinationPayload>) => {
    setError(null);
    const updated = await apiUpdate(id, payload);
    setDestinations((prev) => prev.map((d) => (d._id === id ? { ...d, ...updated } : d)));
    return updated;
  };

  const deleteDestination = async (id: string) => {
    setError(null);
    await apiDelete(id);
    setDestinations((prev) => prev.filter((d) => d._id !== id).map((d, idx) => ({ ...d, order: idx })));
  };

  const reorder = async (fromId: string, toId: string) => {
    if (!tripId || fromId === toId) return;
    const optimistic = reorderArray(destinations, fromId, toId);
    setDestinations(optimistic);
    try {
      const orderedIds = optimistic.map((d) => d._id);
      const server = await apiReorder(tripId, orderedIds);
      setDestinations(server.sort((a, b) => a.order - b.order));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Reorder failed');
      await load();
    }
  };

  const changeImage = async (id: string, formData: FormData) => {
    const updated = await uploadDestinationImage(id, formData);
    setDestinations((prev) => prev.map((d) => (d._id === id ? { ...d, ...updated } : d)));
    return updated;
  };

  const removeImage = async (id: string) => {
    const updated = await deleteDestinationImage(id);
    setDestinations((prev) => prev.map((d) => (d._id === id ? { ...d, ...updated } : d)));
    return updated;
  };

  const stats = useMemo(() => {
    const stops = destinations.length;
    const dates = destinations
      .map((d) => ({ start: d.arrivalDate ? new Date(d.arrivalDate) : null, end: d.departureDate ? new Date(d.departureDate) : null }))
      .filter((d) => d.start && d.end) as { start: Date; end: Date }[];
    const min = dates.length ? Math.min(...dates.map((d) => d.start.getTime())) : null;
    const max = dates.length ? Math.max(...dates.map((d) => d.end.getTime())) : null;
    const days = min && max ? Math.max(1, Math.round((max - min) / (1000 * 60 * 60 * 24)) + 1) : null;
    return { stops, days };
  }, [destinations]);

  return {
    tripId,
    destinations,
    loading,
    error,
    activeId,
    hoverId,
    setActiveId,
    setHoverId,
    createDestination,
    updateDestination,
    deleteDestination,
    reorder,
    changeImage,
    removeImage,
    stats,
    reload: load,
  };
}

export type { Destination, DestinationPayload } from '@/services/destinations';
