import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { updateTripCover, deleteTripCover } from '@/store/tripsSlice';
import toast from 'react-hot-toast';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Handles cover image upload/delete with validation and dispatch.
 * Single responsibility: file validation + upload/remove operations.
 */
export const useTripCoverUpload = (tripId: string) => {
  const dispatch = useDispatch<any>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { execute: uploadCover, isLoading: coverLoading } = useAsyncAction({
    onSuccess: () => toast.success(TOAST_MESSAGES.TRIP.COVER_UPDATE_SUCCESS),
    errorMessage: 'Failed to update cover'
  });
  const { execute: removeCover } = useAsyncAction({
    onSuccess: () => toast.success(TOAST_MESSAGES.TRIP.COVER_REMOVE_SUCCESS),
    errorMessage: 'Failed to remove cover'
  });

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(TOAST_MESSAGES.IMAGE.INVALID_TYPE);
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error(TOAST_MESSAGES.IMAGE.TOO_LARGE(5));
      return;
    }

    await uploadCover(async () => {
      const formData = new FormData();
      formData.append('image', file);
      await dispatch(updateTripCover({ tripId, formData })).unwrap();
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveCover = async () => {
    await removeCover(async () => {
      await dispatch(deleteTripCover(tripId)).unwrap();
    });
  };

  return { coverLoading, fileInputRef, handleCoverFileChange, handleRemoveCover };
};
