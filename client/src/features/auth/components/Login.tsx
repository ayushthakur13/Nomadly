import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useLogin, useAuth } from "../hooks";
import { TOAST_MESSAGES } from "../../../constants/toastMessages";
import { validateLoginCredentials } from "../validators/authValidators";
import { AUTH_ROUTES } from "../constants/authConstants";
import GoogleLoginButton from "./GoogleLoginButton";
import AuthFormField from "./AuthFormField";
import PasswordInput from "./PasswordInput";
import AuthLoadingOverlay from "./AuthLoadingOverlay";
import AuthErrorAlert from "./AuthErrorAlert";
import type { LoginCredentials } from "../types/auth.types";

const Login = () => {
  const { login } = useLogin();
  const { loading, error } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();

  const onSubmit = async (data: LoginCredentials) => {
    const validation = validateLoginCredentials(data.usernameOrEmail, data.password);
    
    if (!validation.isValid) {
      toast.error(validation.error || "Please provide valid credentials");
      return;
    }

    try {
      await login({
        usernameOrEmail: data.usernameOrEmail.trim(),
        password: data.password.trim(),
      });
      
      toast.success(TOAST_MESSAGES.AUTH.LOGIN_SUCCESS);
    } catch (error) {
      toast.error(typeof error === 'string' ? error : "Invalid credentials");
    }
  };

  return (
    <div className="w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 relative">
      <AuthLoadingOverlay isLoading={loading} />
      
      <div className="w-full max-w-md">
        <div className="text-center mb-5 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back
          </h1>
          <p className="text-sm text-gray-500">Sign in to continue planning your trips</p>
        </div>

        <AuthErrorAlert error={error} />

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
          <AuthFormField
            {...register("usernameOrEmail", {
              required: "Username or Email is required",
            })}
            type="text"
            placeholder="Username or Email"
            error={errors.usernameOrEmail?.message}
            helperText="Use your Nomadly username or registered email."
          />

          <PasswordInput
            {...register("password", {
              required: "Password is required",
            })}
            placeholder="Enter Password"
            error={errors.password?.message}
            helperText="Use 6+ characters."
          />

          <div className="text-right -mt-2">
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

        <div className="flex flex-col gap-3">
          <GoogleLoginButton />
        </div>

        <p className="text-center mt-8 text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link
            to={AUTH_ROUTES.SIGNUP}
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
