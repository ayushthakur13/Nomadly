import { useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createTrip, updateTripCover } from '@/store/tripsSlice';
import toast from 'react-hot-toast';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { TOAST_MESSAGES } from '@/constants/toastMessages';
import { TripFormData } from './useCreateTripForm';

/**
 * Handles trip creation submission, optional cover upload, and navigation.
 * Single responsibility: submission orchestration + post-creation flow.
 */
export const useCreateTripSubmit = (onUpdateLoadingStates: (state: any) => void) => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const createdTripIdRef = useRef<string | null>(null);
  
  const { execute: submitTrip, isLoading: isSubmitting } = useAsyncAction({
    showToast: false,
    onSuccess: () => {
      if (createdTripIdRef.current) {
        navigate(`/trips/${createdTripIdRef.current}`);
      }
    }
  });

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
        await submitTrip(async () => {
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
          createdTripIdRef.current = createdId;

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
              toast.success(TOAST_MESSAGES.TRIP.CREATE_SUCCESS);
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
            toast.success(TOAST_MESSAGES.TRIP.CREATE_SUCCESS);
          }
        });

        return true;
      } catch (error: any) {
        toast.error(error || TOAST_MESSAGES.GENERIC.ERROR);
        return false;
      } finally {
        onUpdateLoadingStates({ loading: false });
      }
    },
    [dispatch, submitTrip, onUpdateLoadingStates]
  );

  return { handleSubmit };
};
