import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createTrip, updateTripCover } from '../../store/tripsSlice';
import toast from 'react-hot-toast';
import { ChevronRight, ChevronLeft, MapPin, Image as ImageIcon } from 'lucide-react';
import LocationSearchInput from '../../components/trips/LocationSearchInput';
import CoverImageUploader from '../../components/trips/CoverImageUploader';

interface TripFormData {
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
  mainDestination: string;
  destinationCoordinates?: { lat: number; lng: number };
  isPublic: boolean;
  coverImage?: File;
}

const CreateTrip: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TripFormData>({
    tripName: '',
    description: '',
    category: '',
    startDate: '',
    endDate: '',
    mainDestination: '',
    isPublic: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [lastStepChangeAt, setLastStepChangeAt] = useState<number>(Date.now());
  const [coverProcessing, setCoverProcessing] = useState(false);
  const [coverUploadLoading, setCoverUploadLoading] = useState(false);

  const categories = [
    { value: 'adventure', label: '🗻 Adventure', emoji: '🗻' },
    { value: 'leisure', label: '🏖️ Leisure', emoji: '🏖️' },
    { value: 'business', label: '💼 Business', emoji: '💼' },
    { value: 'family', label: '👨‍👩‍👧‍👦 Family', emoji: '👨‍👩‍👧‍👦' },
    { value: 'solo', label: '🧳 Solo', emoji: '🧳' },
    { value: 'couple', label: '💑 Couple', emoji: '💑' },
    { value: 'friends', label: '👯 Friends', emoji: '👯' },
    { value: 'backpacking', label: '🎒 Backpacking', emoji: '🎒' },
    { value: 'luxury', label: '✨ Luxury', emoji: '✨' },
    { value: 'budget', label: '💰 Budget', emoji: '💰' },
  ];

  const validateStep = (step: number): boolean => {
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
      if (!formData.mainDestination.trim()) {
        newErrors.mainDestination = 'Destination is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleLocationSelect = useCallback(
    (location: any, type: 'source' | 'destination') => {
      if (type === 'source') {
        setFormData((prev) => ({
          ...prev,
          sourceLocation: {
            name: location.name,
            address: location.address,
            coordinates: { lat: location.lat, lng: location.lng },
            placeId: location.placeId,
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          mainDestination: location.name,
          destinationCoordinates: { lat: location.lat, lng: location.lng },
        }));
      }
    },
    []
  );

  const handleCoverImageSelect = (file: File, preview: string) => {
    setFormData((prev) => ({ ...prev, coverImage: file }));
    setCoverImagePreview(preview);
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
      setLastStepChangeAt(Date.now());
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (coverProcessing) {
      toast.error('Please wait until the cover image finishes uploading.');
      return;
    }

    // Prevent submitting before final step; treat Enter as Next
    if (currentStep < 3) {
      if (validateStep(currentStep)) {
        setCurrentStep((prev) => prev + 1);
        setLastStepChangeAt(Date.now());
      }
      return;
    }

    // Guard against immediate submit after advancing to step 3
    if (Date.now() - lastStepChangeAt < 300) {
      return;
    }

    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      const submitData = {
        tripName: formData.tripName.trim(),
        description: formData.description.trim(),
        category: formData.category,
        startDate: formData.startDate,
        endDate: formData.endDate,
        sourceLocation: formData.sourceLocation,
        mainDestination: formData.mainDestination.trim(),
        destinationCoordinates: formData.destinationCoordinates,
        isPublic: formData.isPublic,
      };

      const result = await dispatch(createTrip(submitData) as any).unwrap();

      // Upload cover image if selected
      const createdId = result?.data?.trip?._id || result?.trip?._id;
      if (formData.coverImage && createdId) {
        const coverFormData = new FormData();
        coverFormData.append('image', formData.coverImage);
        try {
          setCoverUploadLoading(true);
          await dispatch(updateTripCover({ tripId: createdId, formData: coverFormData }) as any).unwrap();
          toast.success('Trip created successfully! 🎉');
        } catch (e: any) {
          console.warn('Cover upload failed after creation:', e);
          const errorMsg = e?.message || e?.data?.message || e || 'Cover upload failed. You can set it from trip details.';
          toast.error(errorMsg);
        } finally {
          setCoverUploadLoading(false);
        }
      } else {
        toast.success('Trip created successfully! 🎉');
      }
      
      if (createdId) {
        navigate(`/trips/${createdId}`);
      }
    } catch (error: any) {
      toast.error(error || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#2E2E2E] mb-2">Create a New Trip</h1>
            <p className="text-gray-600">Plan your next adventure step by step</p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                      step <= currentStep
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                        step < currentStep ? 'bg-emerald-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-sm">
              <span className={currentStep === 1 ? 'text-emerald-600 font-semibold' : 'text-gray-500'}>
                Basic Info
              </span>
              <span className={currentStep === 2 ? 'text-emerald-600 font-semibold' : 'text-gray-500'}>
                Locations & Dates
              </span>
              <span className={currentStep === 3 ? 'text-emerald-600 font-semibold' : 'text-gray-500'}>
                Cover & Privacy
              </span>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && currentStep < 3) {
                e.preventDefault();
                handleNext();
              }
            }}
            className="bg-white rounded-2xl shadow-lg p-8 space-y-6"
          >
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-bold text-[#2E2E2E] mb-6">Trip Basics</h2>

                {/* Trip Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Trip Name *
                  </label>
                  <input
                    type="text"
                    name="tripName"
                    value={formData.tripName}
                    onChange={handleInputChange}
                    placeholder="e.g., Europe Summer Adventure 2024"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  {errors.tripName && <p className="text-red-600 text-sm mt-1">{errors.tripName}</p>}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Category *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, category: cat.value }));
                          setErrors((prev) => ({ ...prev, category: '' }));
                        }}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          formData.category === cat.value
                            ? 'border-emerald-600 bg-emerald-50'
                            : 'border-gray-200 hover:border-emerald-200'
                        }`}
                      >
                        <span className="text-2xl mb-2 block">{cat.emoji}</span>
                        <span className="text-sm font-medium text-gray-700">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                  {errors.category && <p className="text-red-600 text-sm mt-2">{errors.category}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe what makes this trip special..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                  />
                  <div className="flex justify-between mt-2">
                    {errors.description && (
                      <p className="text-red-600 text-sm">{errors.description}</p>
                    )}
                    <p className="text-xs text-gray-500 ml-auto">
                      {formData.description.length} / 500
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Locations & Dates */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-bold text-[#2E2E2E] mb-6 flex items-center gap-2">
                  <MapPin size={28} className="text-emerald-600" />
                  Locations & Dates
                </h2>

                {/* Start Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    {errors.startDate && <p className="text-red-600 text-sm mt-1">{errors.startDate}</p>}
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    {errors.endDate && <p className="text-red-600 text-sm mt-1">{errors.endDate}</p>}
                  </div>
                </div>

                {/* Source Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Starting Location (Optional)
                  </label>
                  <LocationSearchInput
                    onSelect={(location) => handleLocationSelect(location, 'source')}
                    placeholder="Where are you starting from?"
                  />
                  {formData.sourceLocation && (
                    <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <p className="font-semibold text-emerald-900">{formData.sourceLocation.name}</p>
                      <p className="text-sm text-emerald-700">
                        {formData.sourceLocation.coordinates.lat.toFixed(4)}, &nbsp;
                        {formData.sourceLocation.coordinates.lng.toFixed(4)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Destination */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Main Destination *
                  </label>
                  <LocationSearchInput
                    onSelect={(location) => handleLocationSelect(location, 'destination')}
                    placeholder="Where are you going?"
                  />
                  {formData.mainDestination && (
                    <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <p className="font-semibold text-emerald-900">{formData.mainDestination}</p>
                      {formData.destinationCoordinates && (
                        <p className="text-sm text-emerald-700">
                          {formData.destinationCoordinates.lat.toFixed(4)}, &nbsp;
                          {formData.destinationCoordinates.lng.toFixed(4)}
                        </p>
                      )}
                    </div>
                  )}
                  {errors.mainDestination && (
                    <p className="text-red-600 text-sm mt-1">{errors.mainDestination}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Cover Image & Privacy */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-bold text-[#2E2E2E] mb-6 flex items-center gap-2">
                  <ImageIcon size={28} className="text-emerald-600" />
                  Cover Image & Privacy
                </h2>

                {/* Cover Image Uploader */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Trip Cover Image (Optional)
                  </label>
                  <CoverImageUploader
                    onImageSelect={handleCoverImageSelect}
                    onUploadStateChange={setCoverProcessing}
                    preview={coverImagePreview}
                  />
                  {coverProcessing && (
                    <p className="text-sm text-emerald-700 mt-2 flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></span>
                      Processing cover image...
                    </p>
                  )}
                </div>

                {/* Public/Private Toggle */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Make this trip public</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {formData.isPublic
                          ? 'Anyone can see and discover your trip'
                          : 'Only you and invited members can access this trip'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPublic}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, isPublic: e.target.checked }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>

                {/* Summary */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-3">Trip Summary</h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li>
                      <strong>Name:</strong> {formData.tripName}
                    </li>
                    <li>
                      <strong>Category:</strong>{' '}
                      {categories.find((c) => c.value === formData.category)?.label}
                    </li>
                    <li>
                      <strong>Dates:</strong> {formData.startDate} to {formData.endDate}
                    </li>
                    <li>
                      <strong>Destination:</strong> {formData.mainDestination}
                    </li>
                    <li>
                      <strong>Privacy:</strong> {formData.isPublic ? 'Public' : 'Private'}
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} />
                Previous
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Next
                  <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || coverProcessing || coverUploadLoading}
                  className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  {coverProcessing
                    ? 'Processing cover...'
                    : coverUploadLoading
                      ? 'Uploading cover...'
                      : loading
                        ? 'Creating Trip...'
                        : 'Create Trip'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateTrip;
