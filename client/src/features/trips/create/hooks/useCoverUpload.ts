import { useState, useCallback } from 'react';

/**
 * Manages cover image upload state (preview, processing flags).
 * Single responsibility: file preview and processing flags.
 */
export const useCoverUpload = () => {
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [coverProcessing, setCoverProcessing] = useState(false);

  const handleCoverImageSelect = useCallback((file: File, preview: string) => {
    setCoverImagePreview(preview);
    return { file, preview };
  }, []);

  return {
    coverImagePreview,
    setCoverImagePreview,
    coverProcessing,
    setCoverProcessing,
    handleCoverImageSelect,
  };
};
