import {useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {Eye, EyeOff, Mail, Lock, X, User,Calendar} from 'lucide-react';
import authStore from '../store/authStore';
import toast from "react-hot-toast";
import ProgressBar from "../components/ProgressBar";
import {Link} from 'react-router-dom';

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "",
    dateOfBirth: "",
  })
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false)
  const [modalStep, setModalStep] = useState(1); // 1 for password, 2 for personal info
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const validateDateOfBirth = (date) => {
    if (!date) return false;
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 13 && age <= 120;
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
      if (!form.email.trim()) {
        setErrors({email: 'Email is required'});
        toast.error('Please enter your email address', 'error');
        return;
      }
      const res = await authStore.checkEmail(form.email)
      if (res && res.exists) {
        toast.error("An account with this email already exists")
        return
      } else {
        setIsChecked(true)
        toast.success("Email not exist")
      }
    } catch (e) {
      console.log(e)
      setErrors({
        ...errorss,
        global: e.response?.data?.message || 'Email checking failed'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation for personal info
    if (!form.dateOfBirth) {
      setErrors({dateOfBirth: 'Date of birth is required'});
      toast.error('Please enter your date of birth', 'errors');
      return;
    }

    if (!form.name) {
      setErrors({name: 'Name is required'});
      toast.error('Please enter your name', 'errors');
      return;
    }

    if (!validateDateOfBirth(form.dateOfBirth)) {
      setErrors({dateOfBirth: 'You must be at least 13 years old'});
      toast.error('You must be at least 13 years old', 'errors');
      return;
    }

    if (!form.gender) {
      setErrors({gender: 'Please select your gender'});
      toast.error('Please select your gender', 'errors');
      return;
    }

    setLoading(true);
    try {
      const {confirmPassword, ...formData} = form
      const res = await authStore.register(formData);
      if (res) {
        toast.success('Account created successfully! Welcome!', 'success');

        // Reset form and close modal after successful registration
        setTimeout(() => {
          setShowRegistrationModal(false);
          setIsChecked(false);
          setForm({
            name: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
            gender: "",
            dateOfBirth: "",
          })
          setModalStep(1);
        }, 1000);
      } else {
        toast.error('Registration completed, but response format unexpected', 'info');
      }
    } catch (errors) {
      console.log(errors);
      // handleServerErrors(errors);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordStep = (e) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation for password step
    if (!form.password.trim()) {
      setErrors({password: 'Password is required'});
      toast.error('Please enter a password', 'errors');
      return;
    }

    if (!validatePassword(form.password)) {
      setErrors({password: 'Password must be at least 6 characters'});
      toast.error('Password must be at least 6 characters', 'errors');
      return;
    }

    if (!form.confirmPassword.trim()) {
      setErrors({confirmPassword: 'Please confirm your password'});
      toast.error('Please confirm your password', 'errors');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrors({confirmPassword: 'Passwords do not match'});
      toast.error('Passwords do not match', 'errors');
      return;
    }

    setModalStep(2);
    toast.success('Please provide your personal information', 'info');
  };

  const handleBackStep = () => {
    if (modalStep === 2) {
      setModalStep(1);
      setErrors(prevErrors => {
        const newErrors = {...prevErrors};
        delete newErrors.dateOfBirth;
        delete newErrors.gender;
        return newErrors;
      });
    }
  };

  const handleModalClose = () => {
    setShowRegistrationModal(false);
    setIsChecked(false)
    setForm({
      name: "",
      email: form.email,
      phone: "",
      password: "",
      confirmPassword: "",
      gender: "",
      dateOfBirth: "",
    })
    setModalStep(1);
    setErrors(prevErrors => {
      const newErrors = {...prevErrors};
      delete newErrors.password;
      delete newErrors.confirmPassword;
      delete newErrors.dateOfBirth;
      delete newErrors.gender;
      return newErrors;
    });
  };

  useEffect(() => {
    if (isChecked) {
      setIsChecked(false)
      setForm({
        email: form.email,
        name: "",
        phone: "",
        password: "",
        confirmPassword: "",
        gender: "",
        dateOfBirth: "",
      })
    }
  }, [form.email])

  return (
    <section className={"min-h-screen flex items-center justify-center p-4"}>
      <div className={"w-full max-w-md p-8 rounded-2xl shadow-2xl bg-dark-12 border border-dark-15"}>
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{color: '#F2F2F2'}}
          >
            Create Account
          </h1>
          <p
            className="text-sm"
            style={{color: '#B3B3B2'}}
          >
            Join us today and get started
          </p>
        </div>

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
                  errors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-red-400'
                }`}
                style={{
                  backgroundColor: '#262626',
                  borderColor: errors.email ? '#ef4444' : '#404040',
                  color: '#F2F2F2'
                }}
                disabled={loading}
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <button
            type="button"
            onClick={isChecked ? handleRegister : handleContinue}
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
          style={{color: '#B3B3B2'}}
        >
          Already have an account?{' '}
          <Link
            to={"/login"}
            className="font-semibold hover:underline"
            style={{color: '#D65252'}}
          >
            Sign in
          </Link>
        </p>
      </div>


      {isChecked && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-40"
          style={{backgroundColor: 'rgba(15, 15, 15, 0.8)'}}
        >
          <div
            className="w-full max-w-md p-6 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{backgroundColor: '#1F1F1F', border: '1px solid #262626'}}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-xl font-bold"
                style={{color: '#F2F2F2'}}
              >
                Complete Registration
              </h2>
              <button
                onClick={handleModalClose}
                className="p-1 rounded hover:bg-gray-700"
                style={{color: '#B3B3B2'}}
              >
                <X size={20} />
              </button>
            </div>

            <ProgressBar
              currentStep={modalStep}
              totalSteps={2}
            />

            {modalStep === 1 && (
              <div>
                <div className="mb-4">
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
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      className={`w-full pl-10 pr-12 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                        errors.password ? 'border-red-500 focus:ring-red-500' : 'focus:ring-red-400'
                      }`}
                      style={{
                        backgroundColor: '#262626',
                        borderColor: errors.password ? '#ef4444' : '#404040',
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
                  {errors.password && (
                    <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{color: '#F2F2F2'}}
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      size={20}
                      style={{color: '#B3B3B2'}}
                    />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name={"confirmPassword"}
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className={`w-full pl-10 pr-12 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                        errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'focus:ring-red-400'
                      }`}
                      style={{
                        backgroundColor: '#262626',
                        borderColor: errors.confirmPassword ? '#ef4444' : '#404040',
                        color: '#F2F2F2'
                      }}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      style={{color: '#B3B3B2'}}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> :
                        <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handlePasswordStep}
                  className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg"
                  style={{
                    backgroundColor: '#C33636',
                    color: '#FCFCFC',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#CC4343';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#C33636';
                  }}
                >
                  Next Step
                </button>
              </div>
            )}

            {modalStep === 2 && (
              <div>
                <div className="mb-4">
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      size={20}
                      style={{color: '#B3B3B2'}}
                    />
                    <input
                      type="text"
                      name={"name"}
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                        errors.name ? 'border-red-500 focus:ring-red-500' : 'focus:ring-red-400'
                      }`}
                      style={{
                        backgroundColor: '#262626',
                        borderColor: errors.email ? '#ef4444' : '#404040',
                        color: '#F2F2F2'
                      }}
                      disabled={loading}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{color: '#F2F2F2'}}
                  >
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      size={20}
                      style={{color: '#B3B3B2'}}
                    />
                    <input
                      type="date"
                      value={form.dateOfBirth}
                      name={"dateOfBirth"}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                        errors.dateOfBirth ? 'border-red-500 focus:ring-red-500' : 'focus:ring-red-400'
                      }`}
                      style={{
                        backgroundColor: '#262626',
                        borderColor: errors.dateOfBirth ? '#ef4444' : '#404040',
                        color: '#F2F2F2'
                      }}
                      disabled={loading}
                    />
                  </div>
                  {errors.dateOfBirth && (
                    <p className="text-red-400 text-sm mt-1">{errors.dateOfBirth}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{color: '#F2F2F2'}}
                  >
                    Gender
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      size={20}
                      style={{color: '#B3B3B2'}}
                    />
                    <select
                      name={"gender"}
                      value={form.gender}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 appearance-none ${
                        errors.gender ? 'border-red-500 focus:ring-red-500' : 'focus:ring-red-400'
                      }`}
                      style={{
                        backgroundColor: '#262626',
                        borderColor: errors.gender ? '#ef4444' : '#404040',
                        color: '#F2F2F2'
                      }}
                      disabled={loading}
                    >
                      <option
                        value=""
                        hidden
                      >Select your gender
                      </option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                  {errors.gender && (
                    <p className="text-red-400 text-sm mt-1">{errors.gender}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleBackStep}
                    className="flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 border hover:shadow-lg"
                    style={{
                      backgroundColor: 'transparent',
                      borderColor: '#404040',
                      color: '#F2F2F2',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#262626';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleRegister}
                    disabled={loading}
                    className="flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
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
                        Creating...
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default Register;