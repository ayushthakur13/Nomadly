import Icon from '@/components/icon/Icon';

interface CreateTripHeaderProps {
  currentStep: number;
}

const CreateTripHeader = ({ currentStep }: CreateTripHeaderProps) => {
  const progressPercent = (currentStep / 3) * 100;

  return (
    <div className="mb-8 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-4xl font-bold text-[#2E2E2E] mb-2">Create a New Trip</h1>
        <p className="text-gray-600">Plan your next adventure step by step</p>
      </div>
      <div className="w-40 sm:w-48 flex flex-col items-end gap-2">
        <div className="text-sm font-semibold text-gray-800">Step {currentStep} of 3</div>
        <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default CreateTripHeader;
