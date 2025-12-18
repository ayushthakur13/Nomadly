import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import api, { setAccessToken } from "../../services/api";
import { loginStart, loginSuccess, loginFailure } from "../../store/authSlice";

interface GoogleLoginButtonProps {
  text?: string;
}

export default function GoogleLoginButton({ text }: GoogleLoginButtonProps = {}) {
  const dispatch = useDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      toast.error("Google Sign-In not configured (missing VITE_GOOGLE_CLIENT_ID)");
      return;
    }

    if (!(window as any).google || !(window as any).google.accounts || !(window as any).google.accounts.id) {
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
            dispatch(loginStart());
            const { data } = await api.post("/auth/google", { idToken: response.credential });
            const { user, accessToken, csrfToken } = data.data;
            if (csrfToken) {
              const { setCsrfToken } = await import('../../utils/auth');
              setCsrfToken(csrfToken);
            }
            setAccessToken(accessToken);
            dispatch(loginSuccess({ token: accessToken, user }));
            toast.success("Logged in with Google");
          } catch (err: any) {
            const msg = err.response?.data?.message || err.message || "Google login failed";
            dispatch(loginFailure(msg));
            toast.error(msg);
          } finally {
            setBusy(false);
          }
        },
      });

      // Render invisible button in hidden container to capture styles
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
          console.log("One Tap prompt skipped:", notification.getNotDisplayedReason() || notification.getSkippedReason());
        }
      });
    } catch {
      toast.error("Failed to initialize Google Sign-In");
    }
  }, [dispatch, text]);

  return (
    <div className="w-full">
      {/* Styled wrapper for Google button */}
      <div 
        ref={containerRef}
        style={{ opacity: busy ? 0.6 : 1 }}
        className="w-full [&>div]:w-full [&>div>div]:w-full [&_iframe]:w-full [&>div]:border-[#aaa] [&>div]:rounded-lg [&>div]:transition-all [&>div]:duration-300 [&>div:hover]:border-[#4FB286] [&>div:hover]:shadow-[0_0_5px_rgba(79,178,134,0.3)] [&>div]:overflow-hidden"
      />
    </div>
  );
}
