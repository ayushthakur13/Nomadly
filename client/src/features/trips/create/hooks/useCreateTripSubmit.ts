import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createTrip, updateTripCover } from '@/store/tripsSlice';
import toast from 'react-hot-toast';
import { TripFormData } from './useCreateTripForm';

/**
 * Handles trip creation submission, optional cover upload, and navigation.
 * Single responsibility: submission orchestration + post-creation flow.
 */
export const useCreateTripSubmit = (onUpdateLoadingStates: (state: any) => void) => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    async (formData: TripFormData, lastStepChangeAt: number) => {
      const { coverProcessing } = (window as any).__createTripState || {};

      if (coverProcessing) {
        toast.error('Please wait until the cover image finishes uploading.');
        return false;
      }

      // Guard against immediate submit after advancing to step 3
      if (Date.now() - lastStepChangeAt < 300) {
        return false;
      }

      onUpdateLoadingStates({ loading: true });

      try {
        const submitData = {
          tripName: formData.tripName.trim(),
          description: formData.description.trim(),
          category: formData.category,
          startDate: formData.startDate,
          endDate: formData.endDate,
          sourceLocation: formData.sourceLocation,
          destinationLocation: formData.destinationLocation,
          isPublic: formData.isPublic,
        };

        const result = await dispatch(createTrip(submitData)).unwrap();
        const createdId = result?.data?.trip?._id || result?.trip?._id;

        // Upload cover image if selected
        if (formData.coverImage && createdId) {
          const coverFormData = new FormData();
          coverFormData.append('image', formData.coverImage);
          try {
            onUpdateLoadingStates({ coverUploadLoading: true });
            await dispatch(
              updateTripCover({
                tripId: createdId,
                formData: coverFormData,
              })
            ).unwrap();
            toast.success('Trip created successfully! 🎉');
          } catch (e: any) {
            console.warn('Cover upload failed after creation:', e);
            const errorMsg =
              e?.message ||
              e?.data?.message ||
              e ||
              'Cover upload failed. You can set it from the trip dashboard.';
            toast.error(errorMsg);
          } finally {
            onUpdateLoadingStates({ coverUploadLoading: false });
          }
        } else {
          toast.success('Trip created successfully! 🎉');
        }

        if (createdId) {
          navigate(`/trips/${createdId}`);
        }

        return true;
      } catch (error: any) {
        toast.error(error || 'Failed to create trip');
        return false;
      } finally {
        onUpdateLoadingStates({ loading: false });
      }
    },
    [dispatch, navigate, onUpdateLoadingStates]
  );

  return { handleSubmit };
};
