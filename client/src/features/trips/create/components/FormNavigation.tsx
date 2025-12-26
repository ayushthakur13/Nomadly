import Icon from '@/components/icon/Icon';

interface FormNavigationProps {
  currentStep: number;
  onPrevious: () => void;
  onNext: () => void;
  isSubmitting: boolean;
  coverProcessing: boolean;
  coverUploadLoading: boolean;
}

const FormNavigation = ({
  currentStep,
  onPrevious,
  onNext,
  isSubmitting,
  coverProcessing,
  coverUploadLoading,
}: FormNavigationProps) => {
  return (
    <div className="flex justify-between pt-6 border-t border-gray-200">
      <button
        type="button"
        onClick={onPrevious}
        disabled={currentStep === 1}
        className="flex items-center gap-2 px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Icon name="chevronLeft" size={20} />
        Previous
      </button>

      {currentStep < 3 ? (
        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Continue
          <Icon name="chevronRight" size={20} />
        </button>
      ) : (
        <button
          type="submit"
          disabled={isSubmitting || coverProcessing || coverUploadLoading}
          className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          {coverProcessing
            ? 'Processing cover...'
            : coverUploadLoading
              ? 'Uploading cover...'
              : isSubmitting
                ? 'Creating Trip...'
                : 'Create Trip'}
        </button>
      )}
    </div>
  );
};

export default FormNavigation;
