import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useGoogleLogin } from "../hooks";
import { TOAST_MESSAGES } from "../../../constants/toastMessages";

interface GoogleLoginButtonProps {
  text?: string;
}

export default function GoogleLoginButton({
  text,
}: GoogleLoginButtonProps = {}) {
  const { loginWithGoogle } = useGoogleLogin();
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  
  const handleClick = () => {
    if (!ready || busy) return;
    const googleButton = containerRef.current?.querySelector(
      'div[role="button"]'
    ) as HTMLElement | null;
    googleButton?.click();
  };

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      toast.error(
        "Google Sign-In not configured (missing VITE_GOOGLE_CLIENT_ID)"
      );
      return;
    }

    if (
      !(window as any).google ||
      !(window as any).google.accounts ||
      !(window as any).google.accounts.id
    ) {
      toast.error("Google Sign-In script not loaded");
      return;
    }

    // Initialize Google Identity Services (ID token flow)
    try {
      (window as any).google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          setBusy(true);
          try {
            if (!response?.credential) {
              throw new Error("No Google credential received");
            }
            
            await loginWithGoogle({ idToken: response.credential });
            
            toast.success(TOAST_MESSAGES.AUTH.LOGIN_SUCCESS);
          } catch (error) {
            const errorMessage = typeof error === 'string' ? error : 'Google login failed';
            toast.error(errorMessage);
          } finally {
            setBusy(false);
          }
        },
      });

      // Render button (kept invisible; we forward clicks to it)
      if (containerRef.current) {
        (window as any).google.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: text || "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
        });
        setReady(true);
      }

      // Show One Tap prompt automatically
      (window as any).google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // One Tap was not displayed or was skipped
          console.log(
            "One Tap prompt skipped:",
            notification.getNotDisplayedReason() ||
              notification.getSkippedReason()
          );
        }
      });
    } catch {
      toast.error("Failed to initialize Google Sign-In");
    }
  }, [loginWithGoogle, text]);

  return (
    <div className="w-full relative">
      <div
        className="absolute inset-0 opacity-0 pointer-events-none"
        ref={containerRef}
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={!ready || busy}
        className="w-full p-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white transition-all duration-200 hover:border-emerald-500 hover:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 48 48">
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.9-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.17 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48z"
          />
        </svg>

        <span>
          {busy ? "Connecting..." : text ? text : "Continue with Google"}
        </span>
      </button>
    </div>
  );
}
