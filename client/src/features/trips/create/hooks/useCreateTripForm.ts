import { useState, useCallback } from 'react';

export interface TripFormData {
  tripName: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  sourceLocation?: {
    name: string;
    address?: string;
    coordinates: { lat: number; lng: number };
    placeId?: string;
  };
  destinationLocation?: {
    name: string;
    address?: string;
    coordinates: { lat: number; lng: number };
    placeId?: string;
  };
  isPublic: boolean;
  coverImage?: File;
}

/**
 * Manages form state, field updates, validation, and step transitions.
 * Single responsibility: form state and validation logic.
 */
export const useCreateTripForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<TripFormData>({
    tripName: '',
    description: '',
    category: '',
    startDate: '',
    endDate: '',
    destinationLocation: undefined,
    isPublic: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lastStepChangeAt, setLastStepChangeAt] = useState<number>(Date.now());

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.tripName.trim()) newErrors.tripName = 'Trip name is required';
      if (!formData.category) newErrors.category = 'Category is required';
      if (formData.description && formData.description.length > 500) {
        newErrors.description = 'Description must be 500 characters or less';
      }
    } else if (step === 2) {
      if (!formData.startDate) newErrors.startDate = 'Start date is required';
      if (!formData.endDate) newErrors.endDate = 'End date is required';
      if (formData.startDate && formData.endDate) {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        if (end < start) newErrors.endDate = 'End date must be after start date';
      }
      if (!formData.destinationLocation?.name.trim()) {
        newErrors.destinationLocation = 'Destination is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
      setLastStepChangeAt(Date.now());
    }
  }, [currentStep, validateStep]);

  const handlePrevious = useCallback(() => {
    setCurrentStep((prev) => prev - 1);
  }, []);

  const getDurationPreview = () => {
    if (!formData.startDate || !formData.endDate) return '';
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return '';
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${diff} day${diff > 1 ? 's' : ''} trip`;
  };

  return {
    currentStep,
    setCurrentStep,
    formData,
    setFormData,
    errors,
    setErrors,
    lastStepChangeAt,
    setLastStepChangeAt,
    validateStep,
    handleInputChange,
    handleNext,
    handlePrevious,
    getDurationPreview,
  };
};
