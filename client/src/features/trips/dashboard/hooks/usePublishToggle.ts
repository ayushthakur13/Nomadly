import { useDispatch } from 'react-redux';
import { publishTrip, unpublishTrip } from '@/store/tripsSlice';
import toast from 'react-hot-toast';

/**
 * Orchestration hook: handles publish/unpublish dispatch and toasts.
 * Single responsibility: publish toggle flow.
 */
export const usePublishToggle = (tripId: string, isPublic: boolean) => {
  const dispatch = useDispatch<any>();

  const handlePublishToggle = async () => {
    try {
      if (isPublic) {
        await dispatch(unpublishTrip(tripId) as any).unwrap();
        toast.success('Trip unpublished successfully');
      } else {
        await dispatch(publishTrip(tripId) as any).unwrap();
        toast.success('Trip published successfully');
      }
    } catch (error: any) {
      toast.error(error || `Failed to ${isPublic ? 'unpublish' : 'publish'} trip`);
    }
  };

  return { handlePublishToggle };
};
