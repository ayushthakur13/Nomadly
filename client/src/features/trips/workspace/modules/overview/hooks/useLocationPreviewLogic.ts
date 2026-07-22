import { useMapboxStatic } from '@/features/trips/_shared/hooks';
import type { LocationPoint, StopPoint, UseMapboxStaticReturn } from '@/features/trips/_shared/hooks';

export type { LocationPoint, StopPoint };
export type UseLocationPreviewLogicReturn = UseMapboxStaticReturn;

/**
 * Custom hook to handle LocationPreview logic in Workspace Overview.
 * Delegated to shared `useMapboxStatic` hook.
 */
export function useLocationPreviewLogic(
  destinationLocation?: LocationPoint,
  stops?: StopPoint[],
  sourceLocation?: LocationPoint
): UseLocationPreviewLogicReturn {
  return useMapboxStatic({
    destinationLocation,
    stops,
    sourceLocation,
  });
}
