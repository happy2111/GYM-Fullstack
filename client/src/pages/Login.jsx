import {useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {Eye, EyeOff, Mail, Lock} from 'lucide-react';
import authStore from '../store/authStore';
import toast from "react-hot-toast";
import {Link, useNavigate} from 'react-router-dom';

import { useLocation } from "react-router-dom";
import PageHelmet from "@/components/PageHelmet";
import meta from "../meta.js";
import TelegramLoginButton from "@/components/TelegramLoginButton.jsx";

const Login = observer(() => {
  const { pathname } = useLocation();
  const [form, setForm] = useState({
    email: "",
    password: ""
  })
  const [error, setError] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isChecked, setIsChecked] = useState(false)
  const navigate = useNavigate();
  const handleSubmit = async () => {
    try {
      setLoading(true)
      const res = await authStore.login(form)
      toast.success("Login successful")
      setForm({
        email: "",
        password: ""
      })
      navigate('/profile')
    } catch (err) {
      console.log(err)
      setError({
        ...error,
        global: err.response?.data?.message || 'Login failed'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const {name, value} = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContinue = async () => {
    try {
      setLoading(true)
      const res = await authStore.checkEmail(form.email)
      if (!res.exists) {
        toast.error("Email does not exist")
        return
      }
      setIsChecked(true)
      toast.success("Email exist")
    } catch (e) {
      console.log(e)
      setError({
        ...error,
        global: e.response?.data?.message || 'Email checking failed'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isChecked) {
      setIsChecked(false)
      setForm({
        email: form.email,
        password: ""
      })
    }
  }, [form.email])

  return (
    <>
      <PageHelmet {...meta[pathname]} />
      <section className={"min-h-screen flex items-center justify-center p-4"}>
        <div className={"w-full max-w-md p-8 rounded-2xl shadow-2xl bg-dark-12 border border-dark-15"}>
          <div className="text-center mb-8">
            <h1
              className="text-3xl font-bold mb-2"
              style={{color: '#F2F2F2'}}
            >
              Welcome Back
            </h1>
            <p
              className="text-sm"
              style={{color: '#B3B3B2'}}
            >
              Sign in to your account to continue
            </p>
          </div>

          <TelegramLoginButton/>

          <button
            className="w-full mb-6 bg-dark-15 text-gray-95 border-dark-25  px-4 py-3 rounded-lg border transition-all duration-200 flex items-center justify-center gap-3 hover:shadow-md"
            onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE || 'http://localhost:3000'}/auth/google`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>


          {/* Divider */}
          <div className="flex items-center mb-6">
            <div
              className="flex-1 h-px  bg-dark-25"
            ></div>
            <span
              className="px-4 text-sm"
              style={{color: '#B3B3B2'}}
            >
            or
          </span>
            <div
              className="flex-1 h-px bg-dark-25"
            ></div>
          </div>


          {/*forms*/}
          <div className={"relative"}>
            {/*Email*/}
            <div className="mb-6 z-40 relative">
              <label
                className="block text-sm font-medium mb-2 text-gray-95"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 text-gray-70 top-1/2 transform -translate-y-1/2"
                  size={20}
                />
                <input
                  type="email"
                  name={"email"}
                  value={form.email}
                  onChange={handleChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleContinue()}
                  placeholder="Enter your email"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                    error.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-red-400'
                  }`}
                  style={{
                    backgroundColor: '#262626',
                    borderColor: error.email ? '#ef4444' : '#404040',
                    color: '#F2F2F2'
                  }}
                  disabled={loading}
                />
              </div>
              {error.email && (
                <p className="text-red-400 text-sm mt-1">{error.email}</p>
              )}
            </div>

            <div
              className="mb-6 z-10 duration-500 transition-all"
              style={{
                visibility: `${isChecked ? 'visible' : 'hidden'}`,
                position: `${isChecked ? 'relative' : 'absolute'}`,
                transform: `${isChecked ? 'translateY(0)' : 'translateY(-100%)'}`,
                opacity: `${isChecked ? '1' : '0'}`,
              }}
            >
              <label
                className="block text-sm font-medium mb-2"
                style={{color: '#F2F2F2'}}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                  size={20}
                  style={{color: '#B3B3B2'}}
                />
                <input
                  name={"password"}
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                    error.password ? 'border-red-500 focus:ring-red-500' : 'focus:ring-red-400'
                  }`}
                  style={{
                    backgroundColor: '#262626',
                    borderColor: error.password ? '#ef4444' : '#404040',
                    color: '#F2F2F2'
                  }}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  style={{color: '#B3B3B2'}}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {error.password && (
                <p className="text-red-400 text-sm mt-1">{error.password}</p>
              )}
            </div>


            <button
              type="button"
              onClick={isChecked ? handleSubmit : handleContinue}
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
              style={{
                backgroundColor: '#C33636',
                color: '#FCFCFC',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#CC4343';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#C33636';
                }
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing In...
                </div>
              ) : (
                `${isChecked ? 'Sign In' : 'Continue'} ${isChecked ? '' : 'with Email'}`
              )}
            </button>
          </div>

          <p
            className="text-center text-sm mt-6"
            style={{ color: '#B3B3B2' }}
          >
            Don't have an account?{' '}
            <Link to="/register"
                  className="font-semibold hover:underline"
                  style={{ color: '#D65252' }}
            >
              Sign up
            </Link>
          </p>

        </div>
      </section>
    </>
  )
});

export default Login;