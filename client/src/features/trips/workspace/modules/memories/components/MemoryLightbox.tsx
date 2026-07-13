import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Memory } from '@/services/memories.service';
import { Icon } from '@/ui/icon';

interface MemoryLightboxProps {
  memories: Memory[];
  activeIndex: number;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
}

export const MemoryLightbox = ({
  memories,
  activeIndex,
  onClose,
  onChangeIndex,
}: MemoryLightboxProps) => {
  const currentMemory = memories[activeIndex];
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, memories.length]);

  if (!currentMemory) return null;

  const handleNext = () => {
    onChangeIndex((activeIndex + 1) % memories.length);
  };

  const handlePrev = () => {
    onChangeIndex((activeIndex - 1 + memories.length) % memories.length);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (downloading) return;

    setDownloading(true);
    try {
      const response = await fetch(currentMemory.url);
      const blob = await response.blob();
      const localUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = localUrl;
      link.download = `nomadly-memory-${currentMemory._id}.jpg`;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(localUrl);
    } catch (err) {
      console.error('Failed to download image locally, falling back to new tab:', err);
      window.open(currentMemory.url, '_blank', 'noopener,noreferrer');
    } finally {
      setDownloading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 select-none">
      {/* Click outside target */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      {/* Control bar */}
      <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-6 z-10 text-white">
        <div className="flex items-center gap-2">
          {currentMemory.uploadedBy?.profilePicUrl ? (
            <img
              src={currentMemory.uploadedBy.profilePicUrl}
              alt={currentMemory.uploadedBy.username}
              className="h-8 w-8 rounded-full object-cover border border-white/20"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold border border-white/20">
              {currentMemory.uploadedBy?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold">{currentMemory.uploadedBy?.username || 'Uploader'}</p>
            <p className="text-[10px] text-gray-400">
              Uploaded {new Date(currentMemory.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
            title="Download image"
          >
            {downloading ? (
              <Icon name="loader" size={20} className="animate-spin" />
            ) : (
              <Icon name="download" size={20} />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close viewer"
          >
            <Icon name="close" size={20} />
          </button>
        </div>
      </div>

      {/* Slide Navigation: Prev */}
      {memories.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="absolute left-4 p-3 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all z-10"
        >
          <Icon name="chevronLeft" size={24} />
        </button>
      )}

      {/* Main image container */}
      <div className="relative max-w-5xl max-h-[80vh] flex items-center justify-center z-0 p-4">
        <img
          src={currentMemory.url}
          alt={currentMemory.caption || 'Trip photo'}
          className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl select-none"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Slide Navigation: Next */}
      {memories.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-4 p-3 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all z-10"
        >
          <Icon name="chevronRight" size={24} />
        </button>
      )}

      {/* Footer bar: Caption */}
      {currentMemory.caption && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 max-w-xl text-center px-6 py-3 rounded-xl bg-black/60 border border-white/10 text-white shadow-lg backdrop-blur-sm z-10">
          <p className="text-sm md:text-base font-medium">{currentMemory.caption}</p>
        </div>
      )}
    </div>,
    document.body
  );
};

export default MemoryLightbox;

