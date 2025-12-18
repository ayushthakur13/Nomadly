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
    <div className="w-full max-w-6xl mx-auto flex min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8">
      <div className="hidden pt-8 xl:block w-1/2 flex-shrink-0">
        <div
          className="h-[580px] w-full max-w-[500px] bg-contain bg-no-repeat bg-center"
          style={{
            backgroundImage:
              "url('/images/illustrations/auth-container-image.png')",
          }}
        ></div>
      </div>

      <div className="w-full xl:w-1/2 max-w-md mx-auto pt-8 lg:pt-12 xl:mx-0 xl:ml-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2E2E2E] mb-4 sm:mb-8">
            Welcome back, Nomad.
          </h1>
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
              className="w-full p-3 border border-[#aaa] rounded-lg text-base transition-all duration-300 focus:outline-none focus:border-[#4a90e2] focus:shadow-[0_0_5px_rgba(74,144,226,0.4)]"
              placeholder="Username or Email"
            />
            {errors.username && (
              <p className="text-red-600 text-sm mt-1">
                {String(errors.username.message)}
              </p>
            )}
          </div>

          <div className="w-full">
            <div className="relative">
              <input
                {...register("password", {
                  required: "Password is required",
                })}
                type={showPassword ? "text" : "password"}
                className="w-full p-3 pr-10 border border-[#aaa] rounded-lg text-base transition-all duration-300 focus:outline-none focus:border-[#4a90e2] focus:shadow-[0_0_5px_rgba(74,144,226,0.4)]"
                placeholder="Enter Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#4FB286] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">
                {String(errors.password.message)}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-[#4FB286] text-white border-none rounded-lg text-lg sm:text-xl font-medium cursor-pointer transition-colors duration-300 hover:bg-[#3F9470] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
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
