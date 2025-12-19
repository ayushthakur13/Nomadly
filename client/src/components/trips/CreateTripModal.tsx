import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createTrip } from '../../store/tripsSlice';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTripModal = ({ isOpen, onClose }: Props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { createLoading } = useSelector((state: any) => state.trips);

  const [formData, setFormData] = useState({
    tripName: '',
    mainDestination: '',
    startDate: '',
    endDate: '',
    category: '',
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    { value: 'adventure', label: '🗻 Adventure' },
    { value: 'leisure', label: '🏖️ Leisure' },
    { value: 'business', label: '💼 Business' },
    { value: 'family', label: '👨‍👩‍👧‍👦 Family' },
    { value: 'solo', label: '🧳 Solo' },
    { value: 'couple', label: '💑 Couple' },
    { value: 'friends', label: '👯 Friends' },
    { value: 'backpacking', label: '🎒 Backpacking' },
    { value: 'luxury', label: '✨ Luxury' },
    { value: 'budget', label: '💰 Budget' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.tripName.trim()) {
      newErrors.tripName = 'Trip name is required';
    }

    if (!formData.mainDestination.trim()) {
      newErrors.mainDestination = 'Destination is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      const result = await dispatch(createTrip(formData) as any).unwrap();
      toast.success('Trip created successfully!');
      onClose();
      navigate(`/trips/${result.trip._id}`);
    } catch (error: any) {
      toast.error(error || 'Failed to create trip');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">Create New Trip</h2>
          <button
            onClick={onClose}
            disabled={createLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Trip Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trip Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="tripName"
              value={formData.tripName}
              onChange={handleChange}
              placeholder="e.g., Summer Beach Vacation 2025"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                errors.tripName ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={createLoading}
            />
            {errors.tripName && (
              <p className="mt-1 text-sm text-red-600">{errors.tripName}</p>
            )}
          </div>

          {/* Main Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Main Destination <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="mainDestination"
              value={formData.mainDestination}
              onChange={handleChange}
              placeholder="e.g., Bali, Indonesia"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                errors.mainDestination ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={createLoading}
            />
            {errors.mainDestination && (
              <p className="mt-1 text-sm text-red-600">{errors.mainDestination}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={createLoading}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                  errors.endDate ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={createLoading}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={createLoading}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Share some details about your trip..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
              disabled={createLoading}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={createLoading}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createLoading}
              className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {createLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-plus"></i>
                  <span>Create Trip</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTripModal;
