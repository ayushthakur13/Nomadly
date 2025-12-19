import React, { useRef, useState } from 'react';
import { Upload, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface CoverImageUploaderProps {
  onImageSelect: (file: File, preview: string) => void;
  onUploadStateChange?: (uploading: boolean) => void;
  preview?: string | null;
}

const CoverImageUploader: React.FC<CoverImageUploaderProps> = ({ onImageSelect, onUploadStateChange, preview: initialPreview }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(initialPreview || null);
  const [fileName, setFileName] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    processFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const processFiles = (files: FileList) => {
    const file = files[0];
    if (!file) return;

    setUploading(true);
    onUploadStateChange?.(true);

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, or WebP image');
      setUploading(false);
      onUploadStateChange?.(false);
      return;
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      toast.error('Image must be less than 5MB');
      setUploading(false);
      onUploadStateChange?.(false);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      setFileName(file.name);
      onImageSelect(file, result);
      toast.success('Image selected successfully');
      setUploading(false);
      onUploadStateChange?.(false);
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
      setUploading(false);
      onUploadStateChange?.(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setFileName('');
    setUploading(false);
    onUploadStateChange?.(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  if (preview) {
    return (
      <div className="space-y-4">
        {/* Preview */}
        <div className="relative rounded-lg overflow-hidden h-48 sm:h-64 bg-gray-100">
          <img
            src={preview}
            alt="Cover preview"
            className="w-full h-full object-cover"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="flex items-start justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle size={20} className="text-emerald-600" />
            <div>
              <p className="font-semibold text-emerald-900">Cover Image Ready</p>
              <p className="text-sm text-emerald-700">{fileName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemoveImage}
            className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-emerald-600" />
          </button>
        </div>

        {/* Info */}
        <p className="text-xs text-gray-500">
          Recommended size: 1200x600px. Supported formats: JPEG, PNG, WebP (max 5MB)
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClickUpload}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 sm:p-12 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all"
      >
        <Upload className="mx-auto mb-4 text-gray-400" size={32} />
        <p className="font-semibold text-gray-900 mb-1">Drag and drop your image</p>
        <p className="text-sm text-gray-600 mb-4">or click to browse from your device</p>
        <p className="text-xs text-gray-500">JPEG, PNG or WebP • Max 5MB</p>
      </div>

      {/* Hidden Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Info */}
      <p className="text-xs text-gray-500">
        Recommended size: 1200x600px for best results on all devices
      </p>
    </div>
  );
};

export default CoverImageUploader;
