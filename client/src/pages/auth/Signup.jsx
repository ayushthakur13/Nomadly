import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { loginStart, loginSuccess, loginFailure } from '../../store/authSlice';
import api from '../../services/api';

const Signup = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [authBusy, setAuthBusy] = useState(false);

  const onSubmit = async (data) => {
    try {
      dispatch(loginStart());
      const response = await api.post('/auth/signup', {
        username: data.username,
        name: data.name,
        email: data.email,
        password: data.password
      });

      const { accessToken, user } = response.data;
      
      dispatch(loginSuccess({ token: accessToken, user }));
      toast.success('Account created successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Signup failed';
      dispatch(loginFailure(errorMessage));
      toast.error(errorMessage);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex">
      {/* Left side image */}
      <div className="hidden lg:block pt-16 w-1/2">
        <div 
          className="h-[580px] w-[500px] bg-contain bg-no-repeat ml-8"
          style={{
            backgroundImage: "url('/images/illustrations/auth-container-image.png')"
          }}
        ></div>
      </div>
      
      {/* Right side auth box */}
      <div className="w-full lg:w-1/2 max-w-md mx-auto pt-16 lg:mx-0 lg:mt-12">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div 
              className="w-8 h-8 bg-contain bg-no-repeat mr-2"
              style={{
                backgroundImage: "url('/images/icon/Nomadly_icon_white-removebg.png')"
              }}
            ></div>
            <span className="text-xl text-[#2E2E2E] font-medium">Nomadly</span>
          </div>
          <h1 className="text-3xl font-bold text-[#2E2E2E] mb-8">Start your next adventure with Nomadly.</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-[#ccc] text-[#353535] border border-[#aaa] p-3 mx-auto mb-4 max-w-sm rounded-lg text-center font-bold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 items-center">
          <input
            {...register('username', { 
              required: 'Username is required'
            })}
            type="text"
            className="w-4/5 p-3 border border-[#aaa] rounded-lg text-base transition-all duration-300 focus:outline-none focus:border-[#4a90e2] focus:shadow-[0_0_5px_rgba(74,144,226,0.4)]"
            placeholder="Enter username"
          />
          {errors.username && (
            <p className="text-red-600 text-sm w-4/5">{errors.username.message}</p>
          )}

          <input
            {...register('name', { 
              required: 'Full name is required'
            })}
            type="text"
            className="w-4/5 p-3 border border-[#aaa] rounded-lg text-base transition-all duration-300 focus:outline-none focus:border-[#4a90e2] focus:shadow-[0_0_5px_rgba(74,144,226,0.4)]"
            placeholder="Enter full name"
          />
          {errors.name && (
            <p className="text-red-600 text-sm w-4/5">{errors.name.message}</p>
          )}

          <input
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            type="email"
            className="w-4/5 p-3 border border-[#aaa] rounded-lg text-base transition-all duration-300 focus:outline-none focus:border-[#4a90e2] focus:shadow-[0_0_5px_rgba(74,144,226,0.4)]"
            placeholder="Enter email"
          />
          {errors.email && (
            <p className="text-red-600 text-sm w-4/5">{errors.email.message}</p>
          )}

          <input
            {...register('password', { 
              required: 'Password is required'
            })}
            type="password"
            className="w-4/5 p-3 border border-[#aaa] rounded-lg text-base transition-all duration-300 focus:outline-none focus:border-[#4a90e2] focus:shadow-[0_0_5px_rgba(74,144,226,0.4)]"
            placeholder="Enter password"
          />
          {errors.password && (
            <p className="text-red-600 text-sm w-4/5">{errors.password.message}</p>
          )}

          <button
            type="submit"
            disabled={loading || authBusy}
            className="w-4/5 p-2 bg-[#4FB286] text-white border-none rounded-lg text-xl cursor-pointer transition-colors duration-300 hover:bg-[#3F9470] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading || authBusy ? 'Creating account...' : 'Signup'}
          </button>
        </form>

        {/* Redirect */}
        <div className="text-center mt-4 text-base text-[#444]">
          Already an user?{' '}
          <Link 
            to="/auth/login" 
            className="font-bold text-[#4FB286] no-underline transition-colors duration-300 hover:text-[#3F9470]"
          >
            Login
          </Link>
        </div>

        {/* Separator */}
        <div className="flex items-center text-center my-8 text-[#888] text-sm">
          <div className="flex-1 border-b border-[#ccc] mr-3"></div>
          <span>OR CONTINUE WITH</span>
          <div className="flex-1 border-b border-[#ccc] ml-3"></div>
        </div>

        {/* Third Party Login */}
        <div className="flex gap-3 mt-9">
          <button
            type="button"
            disabled={authBusy || loading}
            onClick={() => { if (!(authBusy || loading)) toast('Facebook login coming soon'); }}
            className="w-1/2 p-3 text-center font-medium text-sm rounded-md transition-all duration-200 bg-[#1877f2] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div 
              className="w-5 h-5 bg-contain bg-no-repeat mr-2"
              style={{
                backgroundImage: "url('/images/icon/facebook-icon-white.png')"
              }}
            ></div>
            Login with Facebook
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
              } catch (e) {
                setAuthBusy(false);
              }
            }}
            className="w-1/2 p-3 text-center font-medium text-sm rounded-md transition-all duration-200 bg-white text-[#444] border border-[#ccc] hover:bg-[#f0f0f0] hover:-translate-y-0.5 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div 
              className="w-5 h-5 bg-contain bg-no-repeat mr-2"
              style={{
                backgroundImage: "url('/images/icon/google-icon.png')"
              }}
            ></div>
            Login with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;