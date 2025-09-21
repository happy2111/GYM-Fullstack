import {useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {Eye, EyeOff, Mail, Lock} from 'lucide-react';
import authStore from '../store/authStore';
import toast from "react-hot-toast";
import {Link, useNavigate, Navigate} from 'react-router-dom';
import Helmet from "react-helmet";

const Login = observer(() => {
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
      setLoading(true);
      const response = await authStore.login(form);
      if (response.user.role !== "admin") {
        authStore.logout();
        toast.error("Access denied. Admins only.");
        return;
      }
      toast.success("Login successful");
      setForm({ email: "", password: "" });
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true }); // ✅ нормальный редирект
    } catch (err) {
      console.log(err);
      setError({
        ...error,
        global: err.response?.data?.message || "Login failed",
      });
    } finally {
      setLoading(false);
    }
  };

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
      <Helmet>
        <title>Bullfit | Login</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Helmet>
    <section className={"min-h-screen flex bg-dark-10 items-center justify-center p-4"}>
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
      </div>
    </section></>
  )
});

export default Login;