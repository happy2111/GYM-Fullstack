import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Eye, EyeOff, Mail, Lock, User, Calendar } from 'lucide-react';
import authStore from '../store/authStore';

const Register = observer(() => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    dateOfBirth: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }


    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }



    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await authStore.register(formData);
      navigate('/');
    } catch (error) {
      setErrors({
        general: error.response?.data?.message || 'Registration failed'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">Join us today</p>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-md">
            <p className="text-red-400 text-sm">{errors.general}</p>
          </div>
        )}



        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-600'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-600'
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className={`w-full pl-10 pr-12 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/*<div>*/}
          {/*  <label className="block text-sm font-medium text-white mb-2">*/}
          {/*    Confirm Password*/}
          {/*  </label>*/}
          {/*  <div className="relative">*/}
          {/*    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />*/}
          {/*    <input*/}
          {/*      type={showConfirmPassword ? 'text' : 'password'}*/}
          {/*      name="confirmPassword"*/}
          {/*      value={formData.confirmPassword}*/}
          {/*      onChange={handleChange}*/}
          {/*      placeholder="Confirm your password"*/}
          {/*      className={`w-full pl-10 pr-12 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 ${*/}
          {/*        errors.confirmPassword ? 'border-red-500' : 'border-gray-600'*/}
          {/*      }`}*/}
          {/*    />*/}
          {/*    <button*/}
          {/*      type="button"*/}
          {/*      onClick={() => setShowConfirmPassword(!showConfirmPassword)}*/}
          {/*      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"*/}
          {/*    >*/}
          {/*      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}*/}
          {/*    </button>*/}
          {/*  </div>*/}
          {/*  {errors.confirmPassword && (*/}
          {/*    <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>*/}
          {/*  )}*/}
          {/*</div>*/}

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Date of Birth
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.dateOfBirth ? 'border-red-500' : 'border-gray-600'
                }`}
              />
            </div>
            {errors.dateOfBirth && (
              <p className="text-red-400 text-sm mt-1">{errors.dateOfBirth}</p>
            )}
          </div>

          {/*<div>*/}
          {/*  <label className="block text-sm font-medium text-white mb-2">*/}
          {/*    Sex*/}
          {/*  </label>*/}
          {/*  <div className="relative">*/}
          {/*    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />*/}
          {/*    <select*/}
          {/*      name="sex"*/}
          {/*      value={formData.sex}*/}
          {/*      onChange={handleChange}*/}
          {/*      className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none ${*/}
          {/*        errors.sex ? 'border-red-500' : 'border-gray-600'*/}
          {/*      }`}*/}
          {/*    >*/}
          {/*      <option value="">Select your sex</option>*/}
          {/*      <option value="male">Male</option>*/}
          {/*      <option value="female">Female</option>*/}
          {/*      <option value="other">Other</option>*/}
          {/*      <option value="prefer-not-to-say">Prefer not to say</option>*/}
          {/*    </select>*/}
          {/*  </div>*/}
          {/*  {errors.sex && (*/}
          {/*    <p className="text-red-400 text-sm mt-1">{errors.sex}</p>*/}
          {/*  )}*/}
          {/*</div>*/}

          <button
            onClick={handleSubmit}
            disabled={authStore.isLoading}
            className="w-full py-3 px-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {authStore.isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-red-400 hover:text-red-300 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
});

export default Register;