import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateTripCover, deleteTripCover } from '@/store/tripsSlice';
import toast from 'react-hot-toast';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Handles cover image upload/delete with validation and dispatch.
 * Single responsibility: file validation + upload/remove operations.
 */
export const useTripCoverUpload = (tripId: string) => {
  const dispatch = useDispatch<any>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [coverLoading, setCoverLoading] = useState(false);

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, or WebP image');
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      setCoverLoading(true);
      await dispatch(updateTripCover({ tripId, formData })).unwrap();
      toast.success('Cover updated');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update cover');
    } finally {
      setCoverLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveCover = async () => {
    try {
      setCoverLoading(true);
      await dispatch(deleteTripCover(tripId)).unwrap();
      toast.success('Cover removed');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to remove cover');
    } finally {
      setCoverLoading(false);
    }
  };

  return { coverLoading, fileInputRef, handleCoverFileChange, handleRemoveCover };
};
