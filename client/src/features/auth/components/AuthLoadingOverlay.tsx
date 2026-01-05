interface AuthLoadingOverlayProps {
  isLoading: boolean;
}

export default function AuthLoadingOverlay({ isLoading }: AuthLoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div 
      className="absolute inset-0 bg-black/5 backdrop-blur-[1px] flex items-center justify-center z-10"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
