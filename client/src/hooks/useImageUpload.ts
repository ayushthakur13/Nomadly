import { useRef, useState } from 'react';
import toast from 'react-hot-toast';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface UseImageUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  onUploadStart?: () => string | void; // Returns destination ID for use in onUploadSuccess
  onUploadSuccess?: (file: File, destId?: string) => Promise<void> | void; // Receives File object
  onUploadError?: (message: string) => void;
}

/**
 * Reusable hook for image file selection and upload across the app.
 * Handles validation, file reading, and provides a clean API.
 */
export const useImageUpload = ({
  maxSize = MAX_SIZE,
  allowedTypes = ALLOWED_TYPES,
  onUploadStart,
  onUploadSuccess,
  onUploadError,
}: UseImageUploadOptions = {}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      const message = 'Please upload a JPEG, PNG, or WebP image';
      toast.error(message);
      onUploadError?.(message);
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      const sizeMB = Math.round(maxSize / (1024 * 1024));
      const message = `Image must be less than ${sizeMB}MB`;
      toast.error(message);
      onUploadError?.(message);
      return;
    }

    setIsUploading(true);
    const destId = onUploadStart?.(); // Capture the ID returned from onUploadStart

    try {
      // Pass the file directly to onUploadSuccess
      await onUploadSuccess?.(file, destId as string | undefined);
    } catch (error: any) {
      const message = error?.message || 'Upload failed';
      toast.error(message);
      onUploadError?.(message);
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return { 
    fileInputRef, 
    handleFileChange, 
    openFilePicker,
    isUploading 
  };
};
