import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { loginStart, loginSuccess, loginFailure } from '../../store/authSlice';
import api from '../../services/api';

const Login = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [authBusy, setAuthBusy] = useState(false);

  const onSubmit = async (data) => {
    try {
      dispatch(loginStart());
      const response = await api.post('/auth/login', {
        usernameOrEmail: data.username,
        password: data.password
      });

      const { accessToken, user } = response.data;
      
      dispatch(loginSuccess({ token: accessToken, user }));
      toast.success('Login successful!');
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Invalid credentials';
      dispatch(loginFailure(errorMessage));
      toast.error(errorMessage);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8">
      {/* Left side image */}
      <div className="hidden pt-8 xl:block w-1/2 flex-shrink-0">
        <div 
          className="h-[580px] w-full max-w-[500px] bg-contain bg-no-repeat bg-center"
          style={{
            backgroundImage: "url('/images/illustrations/auth-container-image.png')"
          }}
        ></div>
      </div>
      
      {/* Right side auth box */}
      <div className="w-full xl:w-1/2 max-w-md mx-auto pt-8 lg:pt-12 xl:mx-0 xl:ml-8">
        {/* Title */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2E2E2E] mb-4 sm:mb-8">Welcome back, Nomad.</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-[#ccc] text-[#353535] border border-[#aaa] p-3 mx-auto mb-4 max-w-sm rounded-lg text-center font-bold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
          <div className="w-full">
            <input
              {...register('username', { 
                required: 'Username or Email is required'
              })}
              type="text"
              className="w-full p-3 border border-[#aaa] rounded-lg text-base transition-all duration-300 focus:outline-none focus:border-[#4a90e2] focus:shadow-[0_0_5px_rgba(74,144,226,0.4)]"
              placeholder="Username or Email"
            />
            {errors.username && (
              <p className="text-red-600 text-sm mt-1">{errors.username.message}</p>
            )}
          </div>

          <div className="w-full">
            <input
              {...register('password', { 
                required: 'Password is required'
              })}
              type="password"
              className="w-full p-3 border border-[#aaa] rounded-lg text-base transition-all duration-300 focus:outline-none focus:border-[#4a90e2] focus:shadow-[0_0_5px_rgba(74,144,226,0.4)]"
              placeholder="Enter Password"
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || authBusy}
            className="w-full p-3 bg-[#4FB286] text-white border-none rounded-lg text-lg sm:text-xl font-medium cursor-pointer transition-colors duration-300 hover:bg-[#3F9470] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading || authBusy ? 'Logging in...' : 'Login'}
          </button>
        </form>


        {/* Separator */}
        <div className="flex items-center text-center my-6 sm:my-8 text-[#888] text-sm">
          <div className="flex-1 border-b border-[#ccc] mr-3"></div>
          <span className="px-2">OR CONTINUE WITH</span>
          <div className="flex-1 border-b border-[#ccc] ml-3"></div>
        </div>

        {/* Third Party Login */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            disabled={authBusy || loading}
            onClick={() => { if (!(authBusy || loading)) toast('Facebook login coming soon'); }}
            className="flex-1 p-3 text-center font-medium text-sm rounded-md transition-all duration-200 bg-[#1877f2] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div 
              className="w-5 h-5 bg-contain bg-no-repeat mr-2 flex-shrink-0"
              style={{
                backgroundImage: "url('/images/icon/facebook-icon-white.png')"
              }}
            ></div>
            <span className="hidden sm:inline">Login with Facebook</span>
            <span className="sm:hidden">Facebook</span>
          </button>
          <button
            type="button"
            disabled={authBusy || loading}
            onClick={async () => {
              if (authBusy || loading) return;
              const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
              if (!window.google || !clientId) {
                toast.error('Google Sign-In not configured');
                return;
              }
              setAuthBusy(true);
              try {
                const codeClient = window.google.accounts.oauth2.initCodeClient({
                  client_id: clientId,
                  scope: 'openid email profile',
                  ux_mode: 'popup',
                  callback: async (response) => {
                    try {
                      if (!response?.code) {
                        const errMsg = response?.error === 'access_denied' || response?.error === 'user_cancelled'
                          ? 'Login cancelled'
                          : 'No authorization code';
                        throw new Error(errMsg);
                      }
                      dispatch(loginStart());
                      const { data } = await api.post('/auth/google-code', { code: response.code });
                      const { user, accessToken } = data;
                      dispatch(loginSuccess({ token: accessToken, user }));
                      toast.success('Logged in with Google');
                    } catch (err) {
                      const msg = err.message || 'Google login failed';
                      dispatch(loginFailure(msg));
                      toast.error(msg);
                    } finally {
                      popupOpen = false;
                      window.removeEventListener('focus', onFocus);
                      setAuthBusy(false);
                    }
                  },
                });
                let popupOpen = true;
                const onFocus = () => {
                  if (popupOpen) {
                    popupOpen = false;
                    window.removeEventListener('focus', onFocus);
                    setAuthBusy(false);
                  }
                };
                window.addEventListener('focus', onFocus);
                codeClient.requestCode();
              } catch {
                setAuthBusy(false);
              }
            }}
            className="flex-1 p-3 text-center font-medium text-sm rounded-md transition-all duration-200 bg-white text-[#444] border border-[#ccc] hover:bg-[#f0f0f0] hover:-translate-y-0.5 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div 
              className="w-5 h-5 bg-contain bg-no-repeat mr-2 flex-shrink-0"
              style={{
                backgroundImage: "url('/images/icon/google-icon.png')"
              }}
            ></div>
            <span className="hidden sm:inline">Login with Google</span>
            <span className="sm:hidden">Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;