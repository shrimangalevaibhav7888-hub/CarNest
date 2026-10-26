"use client";

import React, { useState } from 'react';
import { useCareNest } from '../../context/CareNestContext';
import { UserRole } from '../../types';
import { authService } from '../../services/authService';
import {
  Heart,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const AuthView: React.FC = () => {
  const { activeView, setActiveView, realLogin, realRegister, addToast } = useCareNest();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>(
    activeView === 'REGISTER' ? 'REGISTER' : activeView === 'FORGOT_PASSWORD' ? 'FORGOT' : 'LOGIN'
  );

  React.useEffect(() => {
    if (activeView === 'REGISTER') setMode('REGISTER');
    else if (activeView === 'LOGIN') setMode('LOGIN');
    else if (activeView === 'FORGOT_PASSWORD') setMode('FORGOT');
  }, [activeView]);

  // Form inputs
  const [selectedRole, setSelectedRole] = useState<'ELDERLY' | 'FAMILY' | 'CAREGIVER'>('ELDERLY');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Password visibility toggle
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Elderly profile fields
  const [age, setAge] = useState('72');
  const [gender, setGender] = useState('Female');
  const [address, setAddress] = useState('45 Lotus Park, Bangalore');
  const [emergencyContactName, setEmergencyContactName] = useState('Vikram Sharma');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('+91 98765 43210');
  const [emergencyContactRelation, setEmergencyContactRelation] = useState('Son');
  const [medicalNotes, setMedicalNotes] = useState('Hypertension, daily mobility assistance');

  // Family profile fields
  const [relationship, setRelationship] = useState('Daughter');
  const [linkedElderlyEmail, setLinkedElderlyEmail] = useState('');

  // Caregiver profile fields
  const [experience, setExperience] = useState('4');
  const [skills, setSkills] = useState('Geriatric Nursing, Vitals Monitoring, Medication Support');
  const [availability, setAvailability] = useState('Full-time');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Form Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    if (mode !== 'FORGOT' && (!password || password.length < 8)) {
      setErrorMessage('Password must be at least 8 characters long for account security.');
      return;
    }

    if (mode === 'REGISTER') {
      if (!fullName.trim()) {
        setErrorMessage('Full name is required.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please ensure both passwords match.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (mode === 'LOGIN') {
        const success = await realLogin(email.trim(), password, rememberMe);
        if (!success) {
          setErrorMessage('Invalid email or password. Please verify your credentials.');
        }
      } else if (mode === 'REGISTER') {
        const skillsList = skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

        const success = await realRegister({
          email: email.trim(),
          password,
          confirm_password: confirmPassword,
          full_name: fullName.trim(),
          role: selectedRole,
          phone: phone.trim() || undefined,
          age: selectedRole === 'ELDERLY' ? parseInt(age, 10) || 70 : undefined,
          gender: selectedRole === 'ELDERLY' ? gender : undefined,
          address: selectedRole === 'ELDERLY' ? address.trim() : undefined,
          emergency_contact_name: selectedRole === 'ELDERLY' ? emergencyContactName.trim() : undefined,
          emergency_contact_phone: selectedRole === 'ELDERLY' ? emergencyContactPhone.trim() : undefined,
          emergency_contact_relation: selectedRole === 'ELDERLY' ? emergencyContactRelation.trim() : undefined,
          medical_notes: selectedRole === 'ELDERLY' ? medicalNotes.trim() : undefined,
          care_requirements:
            selectedRole === 'ELDERLY'
              ? ['Daily blood pressure check', 'Medication reminder', 'Mobility support']
              : undefined,
          relationship: selectedRole === 'FAMILY' ? relationship.trim() : undefined,
          linked_elderly_email: selectedRole === 'FAMILY' && linkedElderlyEmail.trim() ? linkedElderlyEmail.trim() : undefined,
          experience_years: selectedRole === 'CAREGIVER' ? parseInt(experience, 10) || 2 : undefined,
          skills: selectedRole === 'CAREGIVER' ? skillsList : undefined,
          availability: selectedRole === 'CAREGIVER' ? availability : undefined,
        });

        if (!success) {
          setErrorMessage('Registration could not be completed. The email may already be in use.');
        }
      } else {
        // Forgot password
        const res = await authService.forgotPassword(email.trim());
        setSuccessMessage(res.message);
        addToast('Password Recovery Dispatched', res.message, 'info');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft-xl overflow-hidden">
        {/* Banner Header with CareNest Purple Gradient */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-800 text-white p-7 text-center space-y-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white mx-auto shadow-inner">
            <Heart className="h-7 w-7 fill-white text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
            {mode === 'LOGIN' ? 'Welcome Back to CareNest' : mode === 'REGISTER' ? 'Create Your Account' : 'Reset Password'}
          </h1>
          <p className="text-xs text-indigo-200 max-w-sm mx-auto">
            {mode === 'LOGIN'
              ? 'Sign in to access your personalized care dashboard & records.'
              : mode === 'REGISTER'
              ? 'Join CareNest to connect elderly patients, family members, and verified nurses.'
              : 'Enter your registered email address to receive password reset instructions.'}
          </p>
        </div>

        {/* Tab Switcher */}
        {mode !== 'FORGOT' && (
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('LOGIN');
                setActiveView('LOGIN');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2.5 rounded-2xl transition flex items-center justify-center gap-1.5 ${
                mode === 'LOGIN'
                  ? 'bg-white text-indigo-950 shadow-sm border border-slate-200/60 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('REGISTER');
                setActiveView('REGISTER');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2.5 rounded-2xl transition flex items-center justify-center gap-1.5 ${
                mode === 'REGISTER'
                  ? 'bg-white text-indigo-950 shadow-sm border border-slate-200/60 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Register New Account</span>
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleAuthSubmit} className="p-6 sm:p-8 space-y-5 text-xs">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs font-medium leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* Role selector on Register (Administrator strictly excluded from public registration) */}
          {mode === 'REGISTER' && (
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block text-xs">
                Select Your Account Type <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  {
                    role: 'ELDERLY' as const,
                    title: 'Elderly Patient',
                    icon: '👴',
                    desc: 'Senior home care & medicines',
                  },
                  {
                    role: 'FAMILY' as const,
                    title: 'Family Member',
                    icon: '👨‍👩‍👧',
                    desc: 'Care updates & monitoring',
                  },
                  {
                    role: 'CAREGIVER' as const,
                    title: 'Caregiver / Nurse',
                    icon: '🩺',
                    desc: 'Subject to verification',
                  },
                ].map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => setSelectedRole(item.role)}
                    className={`p-3 rounded-2xl border text-left transition ${
                      selectedRole === item.role
                        ? 'bg-indigo-50/90 border-indigo-600 text-indigo-950 shadow-sm ring-1 ring-indigo-600'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xl mb-1">{item.icon}</div>
                    <div className="font-bold text-xs leading-tight">{item.title}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                🛡️ Platform administrator accounts are provisioned via secure operations and cannot be created through public registration.
              </p>
            </div>
          )}

          {/* Full Name & Phone for Register */}
          {mode === 'REGISTER' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Mobile Phone Number</label>
                <div className="relative">
                  <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Email Address */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-xs"
              />
            </div>
          </div>

          {/* Password with Show/Hide Toggle */}
          {mode !== 'FORGOT' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-800">
                  Password <span className="text-rose-500">*</span>
                </label>
                {mode === 'LOGIN' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('FORGOT');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-indigo-600 hover:underline font-bold text-[11px]"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (min 6 characters)"
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Confirm Password on Register */}
          {mode === 'REGISTER' && (
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password to confirm"
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Remember Me Checkbox on Log In */}
          {mode === 'LOGIN' && (
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="font-semibold text-xs">Remember my session securely</span>
              </label>
            </div>
          )}

          {/* Role-Specific Onboarding Information on Register */}
          {mode === 'REGISTER' && selectedRole === 'ELDERLY' && (
            <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-200/80 space-y-3">
              <span className="font-bold text-orange-900 block text-xs">Elderly Profile Details</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Home Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="e.g. Vikram Sharma"
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Medical Conditions & Notes</label>
                <input
                  type="text"
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  placeholder="e.g. Hypertension, Diabetes, Knee replacement"
                  className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs"
                />
              </div>
            </div>
          )}

          {mode === 'REGISTER' && selectedRole === 'FAMILY' && (
            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-200/80 space-y-3">
              <span className="font-bold text-indigo-900 block text-xs">Family Connection</span>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Relationship to Senior</label>
                <input
                  type="text"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="e.g. Son, Daughter, Grandchild, Guardian"
                  className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Elderly Patient's Registered Email (Optional)</label>
                <input
                  type="email"
                  value={linkedElderlyEmail}
                  onChange={(e) => setLinkedElderlyEmail(e.target.value)}
                  placeholder="senior@carenest.ai (or link later from dashboard)"
                  className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Connecting to an elderly family member requires mutual authorization. You can also link from your portal anytime.
                </p>
              </div>
            </div>
          )}

          {mode === 'REGISTER' && selectedRole === 'CAREGIVER' && (
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-3">
              <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Caregiver Verification Process</span>
              </div>
              <p className="text-[11px] text-slate-600">
                To guarantee senior patient safety, newly registered caregivers enter a <strong>Pending Verification</strong> status until nursing credentials, background checks, and certifications are approved by CareNest Operations.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Years Experience</label>
                  <input
                    type="number"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Availability</label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Night Shifts">Night Shifts</option>
                    <option value="On-demand">On-demand</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Certifications & Clinical Skills</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. GDA, Vital Monitoring, Wound Dressing, CPR"
                  className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white font-bold text-sm shadow-[0_6px_20px_-2px_rgba(79,70,229,0.5)] transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Processing secure request...</span>
              </>
            ) : mode === 'LOGIN' ? (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </>
            ) : mode === 'REGISTER' ? (
              <>
                <span>Register Account</span>
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <span>Send Password Reset Link</span>
            )}
          </button>

          {/* Forgot password return link */}
          {mode === 'FORGOT' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('LOGIN');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-xs text-indigo-600 hover:underline font-bold"
              >
                Back to Sign In
              </button>
            </div>
          )}

          {/* Demo Sandbox Quick Fast-Track Credentials */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                <span>Seeded Demo Credentials</span>
              </span>
              <span className="text-slate-400">Password: Password123!</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => {
                  setEmail('patient@carenest.ai');
                  setPassword('Password123!');
                  setMode('LOGIN');
                }}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-left truncate text-slate-700"
              >
                👴 Eleanor (Patient)
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('family@carenest.ai');
                  setPassword('Password123!');
                  setMode('LOGIN');
                }}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-left truncate text-slate-700"
              >
                👨‍👩‍👧 Sarah (Family)
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('caregiver@carenest.ai');
                  setPassword('Password123!');
                  setMode('LOGIN');
                }}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-left truncate text-slate-700"
              >
                🩺 David (Caregiver)
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@carenest.ai');
                  setPassword('Password123!');
                  setMode('LOGIN');
                }}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-left truncate text-slate-700"
              >
                🛡️ Alex (Admin)
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
