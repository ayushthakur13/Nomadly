import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { loginStart, loginSuccess, loginFailure } from "../../store/authSlice";
import api from "../../services/api";
import GoogleLoginButton from "../../components/auth/GoogleLoginButton";

const Login = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: any) => state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: any) => {
    try {
      dispatch(loginStart());

      const sanitizedUsername = data.username?.trim();
      const sanitizedPassword = data.password?.trim();

      if (!sanitizedUsername || !sanitizedPassword) {
        throw new Error("Please provide valid credentials");
      }

      const response = await api.post("/auth/login", {
        usernameOrEmail: sanitizedUsername,
        password: sanitizedPassword,
      });

      const { accessToken, user, csrfToken } = response.data.data;

      if (csrfToken) {
        const { setCsrfToken } = await import("../../utils/auth");
        setCsrfToken(csrfToken);
      }

      dispatch(loginSuccess({ token: accessToken, user }));
      toast.success("Login successful!");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Invalid credentials";
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
            Welcome back
          </h1>
          <p className="text-sm text-gray-500">Sign in to continue planning your trips</p>
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
                required: "Username or Email is required",
              })}
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Username or Email"
            />
            {errors.username && (
              <p className="text-red-600 text-sm mt-2">
                {String(errors.username.message)}
              </p>
            )}
            {!errors.username && (
              <p className="text-xs text-gray-500 mt-1" aria-live="polite">Use your Nomadly username or registered email.</p>
            )}
          </div>

          <div className="w-full">
            <div className="relative">
              <input
                {...register("password", {
                  required: "Password is required",
                })}
                type={showPassword ? "text" : "password"}
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
            <div className="text-right mt-2">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toast.error("Password reset feature coming soon");
                }}
                className="text-sm text-gray-600 hover:text-emerald-600 transition-colors"
              >
                Forgot password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full p-3 bg-emerald-600 text-white border-none rounded-lg text-lg sm:text-xl font-medium cursor-pointer transition-colors duration-200 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Your data is private and secure.
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
          Don’t have an account?{" "}
          <Link
            to="/auth/signup"
            className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
