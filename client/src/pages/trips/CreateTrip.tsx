import React, { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createTrip, updateTripCover } from "../../store/tripsSlice";
import toast from "react-hot-toast";
import Icon from "../../components/icon/Icon";
import LocationSearchInput from "../../components/trips/LocationSearchInput";
import CoverImageUploader from "../../components/trips/CoverImageUploader";

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
  destinationLocation?: {
    name: string;
    address?: string;
    coordinates: { lat: number; lng: number };
    placeId?: string;
  };
  isPublic: boolean;
  coverImage?: File;
}

const CreateTrip: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TripFormData>({
    tripName: "",
    description: "",
    category: "",
    startDate: "",
    endDate: "",
    destinationLocation: undefined,
    isPublic: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null
  );
  const [lastStepChangeAt, setLastStepChangeAt] = useState<number>(Date.now());
  const [coverProcessing, setCoverProcessing] = useState(false);
  const [coverUploadLoading, setCoverUploadLoading] = useState(false);

  const categories = [
    { value: "adventure", label: "🗻 Adventure", emoji: "🗻" },
    { value: "leisure", label: "🏖️ Leisure", emoji: "🏖️" },
    { value: "business", label: "💼 Business", emoji: "💼" },
    { value: "family", label: "👨‍👩‍👧‍👦 Family", emoji: "👨‍👩‍👧‍👦" },
    { value: "solo", label: "🧳 Solo", emoji: "🧳" },
    { value: "couple", label: "💑 Couple", emoji: "💑" },
    { value: "friends", label: "👯 Friends", emoji: "👯" },
    { value: "backpacking", label: "🎒 Backpacking", emoji: "🎒" },
    { value: "luxury", label: "✨ Luxury", emoji: "✨" },
    { value: "budget", label: "💰 Budget", emoji: "💰" },
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.tripName.trim())
        newErrors.tripName = "Trip name is required";
      if (!formData.category) newErrors.category = "Category is required";
      if (formData.description && formData.description.length > 500) {
        newErrors.description = "Description must be 500 characters or less";
      }
    } else if (step === 2) {
      if (!formData.startDate) newErrors.startDate = "Start date is required";
      if (!formData.endDate) newErrors.endDate = "End date is required";
      if (formData.startDate && formData.endDate) {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        if (end < start)
          newErrors.endDate = "End date must be after start date";
      }
      if (!formData.destinationLocation?.name.trim()) {
        newErrors.destinationLocation = "Destination is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleLocationSelect = useCallback(
    (location: any, type: "source" | "destination") => {
      if (type === "source") {
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
          destinationLocation: {
            name: location.name,
            address: location.address,
            coordinates: { lat: location.lat, lng: location.lng },
            placeId: location.placeId,
          },
        }));
      }
    },
    []
  );

  const handleCoverImageSelect = (file: File, preview: string) => {
    setFormData((prev) => ({ ...prev, coverImage: file }));
    setCoverImagePreview(preview);
  };

  const getDurationPreview = () => {
    if (!formData.startDate || !formData.endDate) return "";
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start)
      return "";
    const diff =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${diff} day${diff > 1 ? "s" : ""} trip`;
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
      toast.error("Please wait until the cover image finishes uploading.");
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
        destinationLocation: formData.destinationLocation,
        isPublic: formData.isPublic,
      };

      const result = await dispatch(createTrip(submitData) as any).unwrap();

      // Upload cover image if selected
      const createdId = result?.data?.trip?._id || result?.trip?._id;
      if (formData.coverImage && createdId) {
        const coverFormData = new FormData();
        coverFormData.append("image", formData.coverImage);
        try {
          setCoverUploadLoading(true);
          await dispatch(
            updateTripCover({
              tripId: createdId,
              formData: coverFormData,
            }) as any
          ).unwrap();
          toast.success("Trip created successfully! 🎉");
        } catch (e: any) {
          console.warn("Cover upload failed after creation:", e);
          const errorMsg =
            e?.message ||
            e?.data?.message ||
            e ||
            "Cover upload failed. You can set it from the trip dashboard.";
          toast.error(errorMsg);
        } finally {
          setCoverUploadLoading(false);
        }
      } else {
        toast.success("Trip created successfully! 🎉");
      }

      if (createdId) {
        navigate(`/trips/${createdId}`);
      }
    } catch (error: any) {
      toast.error(error || "Failed to create trip");
    } finally {
      setLoading(false);
    }
  };

  const progressPercent = (currentStep / 3) * 100;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with compact progress */}
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-[#2E2E2E] mb-2">
                Create a New Trip
              </h1>
              <p className="text-gray-600">
                Plan your next adventure step by step
              </p>
            </div>
            <div className="w-40 sm:w-48 flex flex-col items-end gap-2">
              <div className="text-sm font-semibold text-gray-800">
                Step {currentStep} of 3
              </div>
              <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter" && currentStep < 3) {
                e.preventDefault();
                handleNext();
              }
            }}
            className="bg-white rounded-2xl shadow-lg p-8 space-y-6"
          >
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-bold text-[#2E2E2E] mb-2">
                  Start with a thought
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Just the vibe and a name for now. We’ll add the details later.
                </p>

                {/* Trip Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    What’s this trip called? *
                  </label>
                  <input
                    type="text"
                    name="tripName"
                    value={formData.tripName}
                    onChange={handleInputChange}
                    placeholder="e.g. Goa winter escape, Kyoto solo week..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  {errors.tripName && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.tripName}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Pick a vibe *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(showAllCategories
                      ? categories
                      : categories.slice(0, 4)
                    ).map((cat) => {
                      const selected = formData.category === cat.value;
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              category: cat.value,
                            }));
                            setErrors((prev) => ({ ...prev, category: "" }));
                          }}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm font-medium shadow-sm ${
                            selected
                              ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                              : "border-gray-200 bg-white text-gray-700 hover:border-emerald-200"
                          }`}
                        >
                          <span>{cat.emoji}</span>
                          <span>{cat.label.replace(/^[^\s]+\s/, "")}</span>
                        </button>
                      );
                    })}
                  </div>
                  {categories.length > 4 && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                        onClick={() => setShowAllCategories((prev) => !prev)}
                      >
                        {showAllCategories ? "Show fewer" : "Show more"}
                        <span className="text-xs">▾</span>
                      </button>
                    </div>
                  )}
                  {errors.category && (
                    <p className="text-red-600 text-sm mt-2">
                      {errors.category}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Why this trip? (Optional)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Mood, goal, or who you’re travelling with."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                  />
                  <div className="flex justify-between mt-2">
                    {errors.description && (
                      <p className="text-red-600 text-sm">
                        {errors.description}
                      </p>
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
                  <Icon name="location" size={28} className="text-emerald-600" />
                  Locations & Dates
                </h2>

                {/* Destination first */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Main Destination *
                  </label>
                  <LocationSearchInput
                    onSelect={(location) =>
                      handleLocationSelect(location, "destination")
                    }
                    initialValue={formData.destinationLocation?.name || ""}
                    placeholder="Where are you going?"
                  />
                  {formData.destinationLocation && (
                    <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <p className="font-semibold text-emerald-900">
                        {formData.destinationLocation.name}
                      </p>
                      {formData.destinationLocation.coordinates && (
                        <p className="text-sm text-emerald-700">
                          {formData.destinationLocation.coordinates.lat.toFixed(4)},
                          &nbsp;
                          {formData.destinationLocation.coordinates.lng.toFixed(4)}
                        </p>
                      )}
                    </div>
                  )}
                  {errors.destinationLocation && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.destinationLocation}
                    </p>
                  )}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    {errors.startDate && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.startDate}
                      </p>
                    )}
                  </div>

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
                    {errors.endDate && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.endDate}
                      </p>
                    )}
                  </div>
                </div>

                {/* Duration preview */}
                {getDurationPreview() && (
                  <div className="flex items-center gap-2 text-emerald-700 text-sm bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    <Icon name="clock" size={16} className="text-emerald-700" />
                    <span>{getDurationPreview()}</span>
                  </div>
                )}

                {/* Source Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Starting Location (Optional)
                  </label>
                  <LocationSearchInput
                    onSelect={(location) =>
                      handleLocationSelect(location, "source")
                    }
                    initialValue={formData.sourceLocation?.name || ""}
                    placeholder="Where are you starting from?"
                  />
                  {formData.sourceLocation && (
                    <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <p className="font-semibold text-emerald-900">
                        {formData.sourceLocation.name}
                      </p>
                      <p className="text-sm text-emerald-700">
                        {formData.sourceLocation.coordinates.lat.toFixed(4)},
                        &nbsp;
                        {formData.sourceLocation.coordinates.lng.toFixed(4)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Cover Image & Privacy */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-bold text-[#2E2E2E] mb-6 flex items-center gap-2">
                  <Icon name="image" size={28} className="text-emerald-600" />
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
                  {!coverImagePreview && !coverProcessing && (
                    <p className="text-sm text-gray-500 mt-2">
                      Best for sharing and discovery. Totally optional!
                    </p>
                  )}
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
                      <h3 className="font-semibold text-gray-900">
                        Make this trip public
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {formData.isPublic
                          ? "Anyone can view this trip if it’s public."
                          : "Only you and invited members can access this trip"}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPublic}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            isPublic: e.target.checked,
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>

                {/* Summary */}
                <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Review your trip
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-800">
                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Name</p>
                      <p className="font-semibold text-gray-900 truncate">{formData.tripName || '—'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Dates</p>
                      <p className="font-semibold text-gray-900 truncate">{formData.startDate || '—'} to {formData.endDate || '—'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Destination</p>
                      <p className="font-semibold text-gray-900 truncate">{formData.destinationLocation?.name || '—'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Category</p>
                      <p className="font-semibold text-gray-900 truncate">{categories.find((c) => c.value === formData.category)?.label || '—'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 sm:col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Privacy</p>
                      <p className="font-semibold text-gray-900 truncate">{formData.isPublic ? 'Public' : 'Private'}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">You can edit everything later.</p>
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
                <Icon name="chevronLeft" size={20} />
                Previous
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Continue
                  <Icon name="chevronRight" size={20} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || coverProcessing || coverUploadLoading}
                  className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  {coverProcessing
                    ? "Processing cover..."
                    : coverUploadLoading
                    ? "Uploading cover..."
                    : loading
                    ? "Creating Trip..."
                    : "Create Trip"}
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
