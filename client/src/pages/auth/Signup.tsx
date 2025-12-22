import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useState } from "react";
import Icon from "../../components/icon/Icon";
import { loginStart, loginSuccess, loginFailure } from "../../store/authSlice";
import api from "../../services/api";
import GoogleLoginButton from "../../components/auth/GoogleLoginButton";

const Signup = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: any) => state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  const [showPassword, setShowPassword] = useState(false);

  // Password strength meter
  const passwordValue: string = watch("password") || "";
  const computeStrength = (pwd: string) => {
    const len = pwd.length;
    const lengthNormalized = Math.max(0, Math.min(1, (len - 4) / 12));
    let sets = 0;
    if (/[a-z]/.test(pwd)) sets++;
    if (/[A-Z]/.test(pwd)) sets++;
    if (/\d/.test(pwd)) sets++;
    if (/[^A-Za-z0-9]/.test(pwd)) sets++;
    const varietyScore = sets > 0 ? (sets - 1) / 3 : 0;
    const score = Math.round((0.7 * lengthNormalized + 0.3 * varietyScore) * 100);
    return Math.max(0, Math.min(100, score));
  };
  const strength = computeStrength(passwordValue);
  const strengthLabel = strength < 25 ? "Weak" : strength < 50 ? "Fair" : strength < 75 ? "Good" : "Strong";
  const strengthBarColor = strength < 25 ? "bg-red-500" : strength < 50 ? "bg-amber-500" : strength < 75 ? "bg-emerald-500" : "bg-emerald-600";
  const strengthTextColor = strength < 25 ? "text-red-600" : strength < 50 ? "text-amber-600" : "text-emerald-600";

  const onSubmit = async (data: any) => {
    try {
      dispatch(loginStart());

      const sanitizedUsername = data.username?.trim();
      const sanitizedEmail = data.email?.trim().toLowerCase();
      const sanitizedPassword = data.password?.trim();

      if (
        !sanitizedUsername ||
        !sanitizedEmail ||
        !sanitizedPassword
      ) {
        throw new Error("All fields are required");
      }

      if (sanitizedPassword.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      const response = await api.post("/auth/register", {
        username: sanitizedUsername,
        email: sanitizedEmail,
        password: sanitizedPassword,
      });

      const { accessToken, user, csrfToken } = response.data.data;

      if (csrfToken) {
        const { setCsrfToken } = await import("../../utils/auth");
        setCsrfToken(csrfToken);
      }

      dispatch(loginSuccess({ token: accessToken, user }));
      toast.success("Account created successfully!");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Signup failed";
      dispatch(loginFailure(errorMessage));
      toast.error(errorMessage);
    }
  };

  return (
    // SaaS-first auth layout: centered form, no decorative illustrations
    // Tightened spacing to reduce visual emptiness and avoid extra scrollbars
    <div className="w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 relative">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] flex items-center justify-center z-10" aria-hidden="true">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div className="w-full max-w-md">
        <div className="text-center mb-5 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Create your Nomadly account
          </h1>
          <p className="text-sm text-gray-500">Start planning smarter trips in minutes</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-300 p-3 mx-auto mb-4 max-w-sm rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 w-full"
        >
          <div className="w-full">
            <input
              {...register("username", {
                required: "Username is required",
                minLength: { value: 3, message: "Min 3 characters" },
                maxLength: { value: 20, message: "Max 20 characters" },
                pattern: { value: /^[a-zA-Z0-9_]+$/, message: "Letters, numbers, underscore only" }
              })}
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter username"
            />
            {errors.username && (
              <p className="text-red-600 text-sm mt-2">
                {String(errors.username.message)}
              </p>
            )}
            {!errors.username && (
              <p className="text-xs text-gray-500 mt-1" aria-live="polite">3-20 characters. Letters, numbers, underscore.</p>
            )}
          </div>

          <div className="w-full">
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              type="email"
              className="w-full p-3 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter email"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-2">
                {String(errors.email.message)}
              </p>
            )}
            {!errors.email && (
              <p className="text-xs text-gray-500 mt-1" aria-live="polite">Use a valid email (we’ll verify later).</p>
            )}
          </div>

          <div className="w-full">
            <div className="relative">
              <input
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                type={showPassword ? "text" : "password"}
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter password (min 6 characters)"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-600 transition-colors"
              >
                {showPassword ? <Icon name="eyeOff" size={20} /> : <Icon name="eye" size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-600 text-sm mt-2">
                {String(errors.password.message)}
              </p>
            )}
            {!errors.password && (
              <p className="text-xs text-gray-500 mt-1" aria-live="polite">Use 6+ characters.</p>
            )}
            {/* Password strength meter */}
            {passwordValue && (
              <div className="mt-2" aria-live="polite">
                <div
                  className="h-2 bg-gray-200 rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={strength}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={`h-2 ${strengthBarColor} rounded-full transition-all duration-300 ease-out`}
                    style={{ width: `${strength}%` }}
                  />
                </div>
                <p className={`mt-1 text-xs ${strengthTextColor}`}>Strength: {strengthLabel}</p>
              </div>
            )}
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

        {/* Social login */}
        <div className="flex flex-col gap-3">
          <GoogleLoginButton />
        </div>

        {/* Auth switch */}
        <p className="text-center mt-8 text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/auth/login"
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
