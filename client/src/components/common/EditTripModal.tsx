import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { extractApiError } from '@/utils/errorHandling';
import Icon from '../icon/Icon';
import LocationSearchInput from '../trips/LocationSearchInput';

interface EditTripModalProps {
  isOpen: boolean;
  trip: {
    _id: string;
    tripName: string;
    description?: string;
    category?: string;
    sourceLocation?: any;
    destinationLocation?: any;
    startDate: string;
    endDate: string;
  };
  isLoading: boolean;
  onClose: () => void;
  onSave: (updates: any) => Promise<void>;
}

const EditTripModal = ({
  isOpen,
  trip,
  isLoading,
  onClose,
  onSave,
}: EditTripModalProps) => {
  // Form state
  const [formData, setFormData] = useState({
    tripName: '',
    category: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  // Location state (store full location objects)
  const [sourceLocation, setSourceLocation] = useState<any>(null);
  const [destinationLocation, setDestinationLocation] = useState<any>(null);

  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [dateWarningDismissed, setDateWarningDismissed] = useState(false);

  // Initialize form with trip data
  useEffect(() => {
    if (isOpen && trip) {
      setFormData({
        tripName: trip.tripName || '',
        category: trip.category || '',
        description: trip.description || '',
        startDate: trip.startDate ? trip.startDate.split('T')[0] : '',
        endDate: trip.endDate ? trip.endDate.split('T')[0] : '',
      });
      
      // Initialize location states - use null if undefined to match initial state
      setSourceLocation(trip.sourceLocation || null);
      setDestinationLocation(trip.destinationLocation || null);
      
      setDescriptionExpanded(!!trip.description);
      setDateWarningDismissed(false);
    }
  }, [isOpen, trip]);

  // Detect dirty state (changes from original)
  const isDirty = useMemo(() => {
    // Helper to compare locations (treat null/undefined as equal)
    const locationChanged = (current: any, original: any) => {
      if (!current && !original) return false; // Both empty
      if (!current || !original) return true;  // One empty, one not
      return current !== original; // Both exist, compare by reference
    };

    return (
      formData.tripName !== (trip?.tripName || '') ||
      formData.category !== (trip?.category || '') ||
      formData.description !== (trip?.description || '') ||
      formData.startDate !== (trip?.startDate ? trip.startDate.split('T')[0] : '') ||
      formData.endDate !== (trip?.endDate ? trip.endDate.split('T')[0] : '') ||
      locationChanged(sourceLocation, trip?.sourceLocation) ||
      locationChanged(destinationLocation, trip?.destinationLocation)
    );
  }, [formData, trip, sourceLocation, destinationLocation]);

  // Check if dates changed
  const dateChanged =
    formData.startDate !== (trip?.startDate ? trip.startDate.split('T')[0] : '') ||
    formData.endDate !== (trip?.endDate ? trip.endDate.split('T')[0] : '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSourceSelect = useCallback((location: any) => {
    setSourceLocation(location.lat && location.lng ? {
      name: location.name,
      address: location.address,
      coordinates: { lat: location.lat, lng: location.lng },
      placeId: location.placeId
    } : {
      name: location.name,
      address: location.address,
      placeId: location.placeId
    });
  }, []);

  const handleDestinationSelect = useCallback((location: any) => {
    setDestinationLocation(location.lat && location.lng ? {
      name: location.name,
      address: location.address,
      coordinates: { lat: location.lat, lng: location.lng },
      placeId: location.placeId
    } : {
      name: location.name,
      address: location.address,
      placeId: location.placeId
    });
  }, []);

  const handleSave = async () => {
    if (!isDirty) return;

    // Build updates object - only include fields that changed
    const updates: any = {};

    if (formData.tripName !== (trip?.tripName || '')) {
      updates.tripName = formData.tripName;
    }
    if (formData.category !== (trip?.category || '')) {
      updates.category = formData.category;
    }
    if (formData.description !== (trip?.description || '')) {
      updates.description = formData.description;
    }
    // Send sourceLocation as object if location was changed
    if (sourceLocation !== trip?.sourceLocation) {
      updates.sourceLocation = sourceLocation;
    }
    // Send destinationLocation as object if location was changed
    if (destinationLocation !== trip?.destinationLocation) {
      updates.destinationLocation = destinationLocation;
    }
    if (formData.startDate !== (trip?.startDate ? trip.startDate.split('T')[0] : '')) {
      updates.startDate = new Date(formData.startDate).toISOString();
    }
    if (formData.endDate !== (trip?.endDate ? trip.endDate.split('T')[0] : '')) {
      updates.endDate = new Date(formData.endDate).toISOString();
    }

    try {
      await onSave(updates);
      toast.success('Trip updated');
      onClose();
    } catch (error: any) {
      const errorMsg = extractApiError(error, 'Failed to update trip');
      toast.error(errorMsg);
    }
  };

  const handleClose = useCallback(() => {
    if (isDirty) {
      const confirmed = window.confirm('You have unsaved changes. Close without saving?');
      if (!confirmed) return;
    }
    onClose();
  }, [isDirty, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Handle Escape key and backdrop click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Modal */}
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Edit trip</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Section 1: Trip Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Icon name="sparkles" size={14} className="text-emerald-600" />
                Trip Details
              </h3>

              {/* Row 1: Trip Name and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Trip Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Trip name
                  </label>
                  <input
                    type="text"
                    name="tripName"
                    value={formData.tripName}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 transition-all"
                    placeholder="My amazing trip"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 transition-all"
                  >
                    <option value="">Select a category</option>
                    <option value="adventure">Adventure</option>
                    <option value="leisure">Leisure</option>
                    <option value="business">Business</option>
                    <option value="family">Family</option>
                    <option value="solo">Solo</option>
                    <option value="couple">Couple</option>
                    <option value="friends">Friends</option>
                    <option value="backpacking">Backpacking</option>
                    <option value="luxury">Luxury</option>
                    <option value="budget">Budget</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Route */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Icon name="mapPin" size={14} className="text-emerald-600" />
                Route
              </h3>

              {/* Row: Route Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Source */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Departing from
                  </label>
                  <LocationSearchInput
                    onSelect={handleSourceSelect}
                    initialValue={sourceLocation?.name || ""}
                    placeholder="Search departure city..."
                  />
                  {sourceLocation?.coordinates && (
                    <p className="text-xs text-gray-500 mt-1.5">
                      {sourceLocation.coordinates.lat.toFixed(4)}, {sourceLocation.coordinates.lng.toFixed(4)}
                    </p>
                  )}
                </div>

                {/* Destination */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Going to
                  </label>
                  <LocationSearchInput
                    onSelect={handleDestinationSelect}
                    initialValue={destinationLocation?.name || ""}
                    placeholder="Search destination..."
                  />
                  {destinationLocation?.coordinates && (
                    <p className="text-xs text-gray-500 mt-1.5">
                      {destinationLocation.coordinates.lat.toFixed(4)}, {destinationLocation.coordinates.lng.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Dates */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Icon name="calendar" size={14} className="text-emerald-600" />
                Dates
              </h3>

              {/* Row: Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Departure
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 transition-all"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Return
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 transition-all"
                  />
                </div>
              </div>

              {/* Date warning - only show if dates changed */}
              {dateChanged && !dateWarningDismissed && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Icon name="alertCircle" size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-blue-700">
                      Changing dates won't affect existing tasks yet
                    </p>
                  </div>
                  <button
                    onClick={() => setDateWarningDismissed(true)}
                    className="text-blue-600 hover:text-blue-700 ml-2 flex-shrink-0"
                  >
                    <Icon name="close" size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Section 4: Description - Separate collapsible section */}
            <div className="space-y-2 border-t border-gray-200 pt-6">
              <button
                onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                disabled={isLoading}
                className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-2 disabled:opacity-50 w-full py-1"
              >
                <Icon
                  name="chevronRight"
                  size={14}
                  className={`transition-transform ${descriptionExpanded ? 'rotate-90' : ''}`}
                />
                Description (optional)
              </button>
              {descriptionExpanded && (
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isLoading}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 transition-all resize-none"
                  placeholder="Tell us about your trip..."
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2.5 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isDirty || isLoading}
              className="px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Save changes
            </button>
          </div>
        </div>
      </div>
    );

  return createPortal(modalContent, document.body);
};

export default EditTripModal;
