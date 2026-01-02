import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { deleteTrip } from '@/store/tripsSlice';
import toast from 'react-hot-toast';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

/**
 * Handles trip deletion with confirmation modal and graceful navigation.
 * Single responsibility: delete operation + navigation timing.
 */
export const useTripDelete = (tripId: string) => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { deleteLoading } = useSelector((state: any) => state.trips);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { execute: performDelete } = useAsyncAction({
    showToast: true,
    errorMessage: 'Failed to delete trip',
    onSuccess: () => {
      // Small delay to ensure Redux state updates before navigation
      setTimeout(() => {
        navigate('/trips', { replace: true });
      }, 100);
    }
  });

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteTrip = async () => {
    await performDelete(async () => {
      await dispatch(deleteTrip(tripId)).unwrap();
    }).catch(() => {
      setShowDeleteConfirm(false);
    });
  };

  return {
    showDeleteConfirm,
    setShowDeleteConfirm,
    deleteLoading,
    handleConfirmDelete,
    handleDeleteTrip,
  };
};
