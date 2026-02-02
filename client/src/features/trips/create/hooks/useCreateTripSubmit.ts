import { useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createTrip, updateTripCover } from '@/features/trips/store';
import toast from 'react-hot-toast';
import { extractApiError } from '@/utils/errorHandling';
import { TOAST_MESSAGES } from '@/constants/toastMessages';
import { TripFormData } from './useCreateTripForm';

/**
 * Handles trip creation submission, optional cover upload, and navigation.
 * Single responsibility: submission orchestration + post-creation flow.
 * 
 * Note: Thunk dispatches are unwrapped directly. Error handling uses extractApiError.
 * The onUpdateLoadingStates callback manages component-level loading UI.
 */
export const useCreateTripSubmit = (onUpdateLoadingStates: (state: any) => void) => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const createdTripIdRef = useRef<string | null>(null);

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
        // Service layer already normalized - result is a Trip object with _id directly
        const createdId = result?._id;
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
            const errorMsg = extractApiError(e, 'Cover upload failed. You can set it from the trip workspace.');
            toast.error(errorMsg);
          } finally {
            onUpdateLoadingStates({ coverUploadLoading: false });
          }
        } else {
          toast.success(TOAST_MESSAGES.TRIP.CREATE_SUCCESS);
        }

        // Navigate to the created trip
        if (createdTripIdRef.current) {
          navigate(`/trips/${createdTripIdRef.current}`);
        }

        return true;
      } catch (error: any) {
        const errorMsg = extractApiError(error, TOAST_MESSAGES.GENERIC.ERROR);
        toast.error(errorMsg);
        return false;
      } finally {
        onUpdateLoadingStates({ loading: false });
      }
    },
    [dispatch, navigate, onUpdateLoadingStates]
  );

  return { handleSubmit };
};
