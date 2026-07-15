import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useGoogleLogin } from "../hooks";
import { TOAST_MESSAGES } from "../../../constants/toastMessages";

interface GoogleLoginButtonProps {
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
}

export default function GoogleLoginButton({
  text,
}: GoogleLoginButtonProps = {}) {
  const { loginWithGoogle } = useGoogleLogin();
  const containerRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

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

      // Render Google's native button directly into the container
      if (containerRef.current) {
        (window as any).google.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: text || "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
          width: containerRef.current.clientWidth || 360,
        });
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
    <div className="w-full flex justify-center min-h-[44px]" ref={containerRef}>
      {busy && (
        <div className="text-sm text-gray-500 flex items-center gap-2">
          Connecting to Google...
        </div>
      )}
    </div>
  );
}
