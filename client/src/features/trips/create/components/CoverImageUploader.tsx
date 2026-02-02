import { Icon } from '@/ui/icon/';
import { useImageUpload } from '@/hooks/useImageUpload';

interface CoverImageUploaderProps {
  preview?: string | null;
  onImageSelect: (file: File, preview: string) => Promise<void> | void;
  onProcessingChange?: (loading: boolean) => void;
  className?: string;
  label?: string;
}

const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.readAsDataURL(file);
  });
};

const CoverImageUploader = ({
  preview,
  onImageSelect,
  onProcessingChange,
  className,
  label = 'Trip Cover Image (Optional)',
}: CoverImageUploaderProps) => {
  const { fileInputRef, handleFileChange, openFilePicker, isUploading } = useImageUpload({
    onUploadStart: () => onProcessingChange?.(true),
    onUploadSuccess: async (file) => {
      try {
        const dataUrl = await readFileAsDataUrl(file);
        await onImageSelect(file, dataUrl);
      } finally {
        onProcessingChange?.(false);
      }
    },
    onUploadError: () => onProcessingChange?.(false),
  });

  return (
    <div className={`space-y-3 ${className || ''}`}>
      <label className="block text-sm font-semibold text-gray-700">{label}</label>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-white hover:border-emerald-400 hover:bg-emerald-50 transition-all cursor-pointer"
        onClick={openFilePicker}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openFilePicker();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add('border-emerald-400', 'bg-emerald-50');
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove('border-emerald-400', 'bg-emerald-50');
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove('border-emerald-400', 'bg-emerald-50');
          const file = e.dataTransfer.files?.[0];
          if (file) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            const input = fileInputRef.current;
            if (input) {
              input.files = dataTransfer.files;
              handleFileChange({ target: input } as any);
            }
          }
        }}
      >
        <div className="flex flex-col items-center justify-center text-center">
          {preview ? (
            <div className="w-full max-w-xs mb-4">
              <div className="relative rounded-lg overflow-hidden shadow-md">
                <img src={preview} alt="Trip cover preview" className="w-full h-48 object-cover" />
                {isUploading && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Icon name="image" size={48} className="text-gray-300 mb-3" />
          )}
          <div className="space-y-2 text-gray-700 text-sm">
            <p className="font-semibold flex items-center justify-center gap-2">
              <Icon name="upload" size={18} className="text-emerald-600" />
              Upload or drag an image
            </p>
            <p className="text-gray-500">JPEG, PNG, or WebP up to 5MB.</p>
            <div className="inline-flex items-center gap-2 text-emerald-700 text-xs bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1">
              <Icon name="sparkles" size={14} />
              Looks great on your landing card.
            </div>
            <p className="text-xs text-gray-500">Recommended size: 1200x600px for best results.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverImageUploader;
