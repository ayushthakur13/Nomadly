import { X } from 'lucide-react';

interface ImageLightboxProps {
  src: string;
  title: string;
  onClose: () => void;
}

const ImageLightbox = ({ src, title, onClose }: ImageLightboxProps) => {
  if (!src) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
        <img src={src} alt={title} className="w-full max-h-[80vh] object-contain rounded-xl shadow-2xl" />
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/70 text-white hover:bg-black"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ImageLightbox;
