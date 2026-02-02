import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useSignup, useAuth } from "../hooks";
import { TOAST_MESSAGES } from "../../../constants/toastMessages";
import { validateSignupCredentials } from "../validators/authValidators";
import { AUTH_ROUTES } from "../constants/authConstants";
import { 
  GoogleLoginButton, 
  AuthFormField, 
  PasswordInput, 
  PasswordStrengthMeter, 
  AuthLoadingOverlay, 
  AuthErrorAlert } from "../components/";
import type { SignupCredentials } from "../types/auth.types";

const Signup = () => {
  const { signup } = useSignup();
  const { loading, error } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupCredentials>();

  const passwordValue = watch("password") || "";

  const onSubmit = async (data: SignupCredentials) => {
    const validation = validateSignupCredentials(
      data.username,
      data.email,
      data.password
    );
    
    if (!validation.isValid) {
      toast.error(validation.error || "Please check your inputs");
      return;
    }

    try {
      await signup({
        username: data.username.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password.trim(),
      });
      
      toast.success(TOAST_MESSAGES.AUTH.SIGNUP_SUCCESS);
    } catch (error) {
      toast.error(typeof error === 'string' ? error : "Signup failed");
    }
  };

  return (
    <div className="w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 relative">
      <AuthLoadingOverlay isLoading={loading} />
      
      <div className="w-full max-w-md">
        <div className="text-center mb-5 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Create your Nomadly account
          </h1>
          <p className="text-sm text-gray-500">Start planning smarter trips in minutes</p>
        </div>

        <AuthErrorAlert error={error} />

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
          <AuthFormField
            {...register("username", {
              required: "Username is required",
              minLength: { value: 3, message: "Min 3 characters" },
              maxLength: { value: 20, message: "Max 20 characters" },
              pattern: { value: /^[a-zA-Z0-9_]+$/, message: "Letters, numbers, underscore only" }
            })}
            type="text"
            placeholder="Enter username"
            error={errors.username?.message}
            helperText="3-20 characters. Letters, numbers, underscore."
          />

          <AuthFormField
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            type="email"
            placeholder="Enter email"
            error={errors.email?.message}
            helperText="Use a valid email (we'll verify later)."
          />

          <div>
            <PasswordInput
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              placeholder="Enter password (min 6 characters)"
              error={errors.password?.message}
              helperText="Use 6+ characters."
            />
            <PasswordStrengthMeter password={passwordValue} />
          </div>

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full p-3 bg-emerald-600 text-white border-none rounded-lg text-lg sm:text-xl font-medium cursor-pointer transition-colors duration-200 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Signup"}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Free forever. We never post without your permission.
          </p>
        </form>

        <div className="flex items-center text-center my-6 sm:my-8 text-[#888] text-sm">
          <div className="flex-1 border-b border-[#ccc] mr-3"></div>
          <span className="px-2">or continue with</span>
          <div className="flex-1 border-b border-[#ccc] ml-3"></div>
        </div>

        <div className="flex flex-col gap-3">
          <GoogleLoginButton />
        </div>

        <p className="text-center mt-8 text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to={AUTH_ROUTES.LOGIN}
            className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
