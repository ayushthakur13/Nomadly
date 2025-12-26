import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { deleteTrip } from '@/store/tripsSlice';
import toast from 'react-hot-toast';

/**
 * Handles trip deletion with confirmation modal and graceful navigation.
 * Single responsibility: delete operation + navigation timing.
 */
export const useTripDelete = (tripId: string) => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { deleteLoading } = useSelector((state: any) => state.trips);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteTrip = async () => {
    try {
      await dispatch(deleteTrip(tripId)).unwrap();
      toast.success('Trip deleted');
      // Small delay to ensure Redux state updates before navigation
      setTimeout(() => {
        navigate('/trips', { replace: true });
      }, 100);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete trip');
      setShowDeleteConfirm(false);
    }
  };

  return {
    showDeleteConfirm,
    setShowDeleteConfirm,
    deleteLoading,
    handleConfirmDelete,
    handleDeleteTrip,
  };
};
