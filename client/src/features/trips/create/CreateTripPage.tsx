import { useState, FC } from 'react';
import {
  useCreateTripForm,
  useCreateTripSubmit,
  useCoverUpload,
  useLocationsSelect,
} from './hooks';
import { CreateTripHeader, StepBasicInfo, StepLocationsDates, StepCoverPrivacy, FormNavigation } from './components';

const CreateTripPage: FC = () => {
  // Compose hooks
  const form = useCreateTripForm();
  const { coverImagePreview, coverProcessing, setCoverProcessing, handleCoverImageSelect } =
    useCoverUpload();
  const { handleLocationSelect: mapLocationSelect } = useLocationsSelect((location, type) => {
    form.setFormData((prev) => ({ ...prev, [`${type}Location`]: location }));
  });
  const [loading, setLoading] = useState(false);
  const [coverUploadLoading, setCoverUploadLoading] = useState(false);

  const { handleSubmit } = useCreateTripSubmit((state) => {
    if (state.loading !== undefined) setLoading(state.loading);
    if (state.coverUploadLoading !== undefined) setCoverUploadLoading(state.coverUploadLoading);
  });

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

  const [showAllCategories, setShowAllCategories] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent submitting before final step; treat Enter as Next
    if (form.currentStep < 3) {
      if (form.validateStep(form.currentStep)) {
        form.setCurrentStep((prev) => prev + 1);
        form.setLastStepChangeAt(Date.now());
      }
      return;
    }

    await handleSubmit(form.formData, form.lastStepChangeAt);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <CreateTripHeader currentStep={form.currentStep} />

        {/* Form */}
        <form
          onSubmit={handleFormSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && form.currentStep < 3) {
              e.preventDefault();
              form.handleNext();
            }
          }}
          className="bg-white rounded-2xl shadow-lg p-8 space-y-6"
        >
          {/* Step 1: Basic Info */}
          {form.currentStep === 1 && (
            <StepBasicInfo
              tripName={form.formData.tripName}
              description={form.formData.description}
              category={form.formData.category}
              errors={form.errors}
              categories={categories}
              showAllCategories={showAllCategories}
              onToggleShowAll={() => setShowAllCategories((prev) => !prev)}
              onInputChange={form.handleInputChange}
              onSelectCategory={(value) => {
                form.setFormData((prev) => ({ ...prev, category: value }));
                form.setErrors((prev) => ({ ...prev, category: '' }));
              }}
            />
          )}

          {/* Step 2: Locations & Dates */}
          {form.currentStep === 2 && (
            <StepLocationsDates
              startDate={form.formData.startDate}
              endDate={form.formData.endDate}
              destinationName={form.formData.destinationLocation?.name}
              sourceName={form.formData.sourceLocation?.name}
              errors={form.errors}
              onInputChange={form.handleInputChange}
              onSelectDestination={(location) =>
                mapLocationSelect(location, 'destination')
              }
              onSelectSource={(location) => mapLocationSelect(location, 'source')}
              durationPreview={form.getDurationPreview()}
            />
          )}

          {/* Step 3: Cover Image & Privacy */}
          {form.currentStep === 3 && (
            <StepCoverPrivacy
              coverImagePreview={coverImagePreview}
              coverProcessing={coverProcessing}
              setCoverProcessing={setCoverProcessing}
              onImageSelect={(file, preview) => {
                handleCoverImageSelect(file, preview);
                form.setFormData((prev) => ({ ...prev, coverImage: file }));
              }}
              isPublic={form.formData.isPublic}
              onTogglePublic={(checked) =>
                form.setFormData((prev) => ({ ...prev, isPublic: checked }))
              }
              summary={{
                tripName: form.formData.tripName,
                startDate: form.formData.startDate,
                endDate: form.formData.endDate,
                destination: form.formData.destinationLocation?.name,
                categoryLabel: categories.find((c) => c.value === form.formData.category)?.label,
              }}
            />
          )}

          {/* Navigation Buttons */}
          <FormNavigation
            currentStep={form.currentStep}
            onPrevious={form.handlePrevious}
            onNext={form.handleNext}
            isSubmitting={loading}
            coverProcessing={coverProcessing}
            coverUploadLoading={coverUploadLoading}
          />
        </form>
      </div>
    </div>
  );
};

export default CreateTripPage;
