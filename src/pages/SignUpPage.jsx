import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import ShowcaseGrid from '../components/ShowcaseGrid';
import '../styles/login.css';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: 'susan@example.com',
    phone: '',
    gender: '',
    password: 'password123',
    confirmPassword: ''
  });

  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      navigate('/');
    }, 600);
  };

  const handleGoogleSignUp = () => {
    setGoogleSubmitting(true);
    setTimeout(() => {
      navigate('/');
    }, 600);
  };

  return (
    <div className="login-container">
      {/* Left Showcase Panel */}
      <ShowcaseGrid />

      {/* Right Sign Up Panel */}
      <div className="login-form-container signup-card-container">
        <div className="login-card">
          <div className="login-card-header">
            <img src="/hrat_nhrc_logo.png" alt="HRAT Logo" className="login-card-logo" />
            <h2>Sign Up</h2>
            <p>Create your account to submit and track complaints</p>
          </div>

          {/* Social Sign-up */}
          <button
            type="button"
            className="btn-google"
            onClick={handleGoogleSignUp}
            disabled={googleSubmitting}
          >
            <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {googleSubmitting ? 'Authenticating with Google...' : 'Sign up with Google'}
          </button>

          <div className="divider">or</div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="form-grid-2col">
            {/* Row 1: First Name & Last Name */}
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                First Name <span className="req">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                className="form-input"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
                autoComplete="given-name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                Last Name <span className="req">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                className="form-input"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
                autoComplete="family-name"
              />
            </div>

            {/* Row 2: Email & Phone Number */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email <span className="req">*</span>
              </label>
              <input
                type="email"
                id="email"
                className="form-input input-blue"
                placeholder="susan@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Phone Number <span className="req">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                className="form-input"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
                autoComplete="tel"
              />
            </div>

            {/* Row 3: Gender (Full width on its own line) */}
            <div className="form-group full-width">
              <label htmlFor="gender" className="form-label">
                Gender <span className="req">*</span>
              </label>
              <select
                id="gender"
                className="form-select"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="" disabled>-- Select Gender --</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="rather_not_say">I'd rather not say</option>
              </select>
            </div>

            {/* Row 4: Password & Confirm Password */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password <span className="req">*</span>
              </label>
              <div className="password-wrapper">
                <input
                  type={showPassword1 ? 'text' : 'password'}
                  id="password"
                  className="form-input input-blue"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword1(!showPassword1)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword1 ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password <span className="req">*</span>
              </label>
              <div className="password-wrapper">
                <input
                  type={showPassword2 ? 'text' : 'password'}
                  id="confirmPassword"
                  className="form-input"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword2(!showPassword2)}
                  aria-label="Toggle confirm password visibility"
                >
                  {showPassword2 ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="full-width">
              <button type="submit" className="btn-submit-slate" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>

          <div className="login-card-footer">
            <p>
              Already have an Account?{' '}
              <Link to="/login" className="signup-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
