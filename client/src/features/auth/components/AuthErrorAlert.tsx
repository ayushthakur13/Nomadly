interface AuthErrorAlertProps {
  error: string | null;
}

export default function AuthErrorAlert({ error }: AuthErrorAlertProps) {
  if (!error) return null;

  return (
    <div 
      className="bg-red-50 text-red-600 border border-red-300 p-3 mx-auto mb-4 max-w-sm rounded-lg text-center font-medium"
      role="alert"
      aria-live="assertive"
    >
      {error}
    </div>
  );
}
