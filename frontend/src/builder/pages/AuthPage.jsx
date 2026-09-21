import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/builderApi';
import { Mail, Lock, User, Rocket, ArrowRight, Eye, EyeOff } from 'lucide-react';
import GlassSurface from '../../components/GlassSurface';

export default function AuthPage() {
  const [tab, setTab] = useState('login'); // 'login' | 'register' | 'forgot' | 'verify_otp' | 'reset_password'
  const [form, setForm] = useState({ email: '', password: '', name: '', otpCode: '', newPassword: '' });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login, register, verifyOtp, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (tab === 'login') {
        await login(form.email, form.password);
        navigate('/builder/dashboard');
      } else if (tab === 'register') {
        const res = await register(form.email, form.password, form.name);
        if (res?.requires_otp) {
          setTab('verify_otp');
          setSuccessMsg(`A 6-digit OTP has been sent to ${form.email}`);
        } else {
          navigate('/builder/dashboard');
        }
      } else if (tab === 'verify_otp') {
        await verifyOtp(form.email, form.otpCode);
        navigate('/builder/dashboard');
      } else if (tab === 'forgot') {
        const res = await authApi.forgotPassword(form.email);
        setTab('reset_password');
        setSuccessMsg(res.data?.message || 'Verification OTP sent to your email.');
      } else if (tab === 'reset_password') {
        const res = await authApi.resetPassword(form.email, form.otpCode, form.newPassword);
        setSuccessMsg(res.data?.message || 'Password reset successfully! Please log in.');
        setTab('login');
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      let msg = 'Something went wrong. Please try again.';
      if (typeof detail === 'string') {
        msg = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        msg = detail[0]?.msg || 'Validation error';
      } else if (!err.response) {
        msg = 'Backend server is offline or unreachable. Please start the server.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await authApi.resendOtp(form.email);
      setSuccessMsg(`A new 6-digit OTP code has been sent to ${form.email}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await demoLogin();
      navigate('/builder/dashboard');
    } catch (err) {
      const detail = err.response?.data?.detail;
      let msg = 'Could not start demo session. Please try again.';
      if (typeof detail === 'string') {
        msg = detail;
      } else if (!err.response) {
        msg = 'Backend server is offline or unreachable. Please try again later.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Outfit', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background gradient orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '15%', left: '20%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.06), transparent)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(15,118,110,0.04), transparent)', filter: 'blur(60px)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%', maxWidth: 460,
          background: 'var(--bg-secondary)',
          backdropFilter: 'blur(24px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 24,
          padding: '44px 36px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src="/logo.png" alt="MSR Tech Hub Logo" style={{ height: 56, width: 'auto', objectFit: 'contain', margin: '0 auto 10px', display: 'block' }} />
          <h1 style={{ color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            MSR TECH HUB
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            MSR Tech Hub Website Builder & Management
          </p>
        </div>

        {/* Demo CTA */}
        {tab !== 'verify_otp' && tab !== 'reset_password' && (
          <>
            <motion.button
              onClick={handleDemo}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%', padding: '13px', marginBottom: 16,
                background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-active))',
                border: 'none', borderRadius: 12, cursor: 'pointer',
                color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: '0 8px 24px var(--brand-hover)',
              }}
            >
              <Rocket size={18} />
              {loading ? 'Starting...' : 'Try Demo — No signup needed'}
            </motion.button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>or sign in</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
            </div>
          </>
        )}

        {/* Tabs */}
        {(tab === 'login' || tab === 'register') && (
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-overlay)', borderRadius: 10, padding: 4 }}>
            {['login', 'register'].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); setSuccessMsg(''); }}
                style={{
                  flex: 1, padding: '9px', border: 'none', borderRadius: 8, cursor: 'pointer',
                  fontFamily: 'inherit', fontWeight: 600, fontSize: '0.875rem', transition: 'all .2s',
                  background: tab === t ? 'var(--brand-hover)' : 'transparent',
                  color: tab === t ? 'var(--brand-primary)' : 'var(--text-muted)',
                }}
              >
                {t === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>
        )}

        {/* OTP Verification Header */}
        {tab === 'verify_otp' && (
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <h2 style={{ color: 'var(--brand-primary)', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 6px' }}>
              🛡️ Enter Verification OTP
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Enter the 6-digit code sent to <strong style={{ color: 'var(--text-primary)' }}>{form.email}</strong>
            </p>
          </div>
        )}

        {/* Reset Password Header */}
        {tab === 'reset_password' && (
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <h2 style={{ color: 'var(--brand-primary)', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 6px' }}>
              🔑 Reset Password OTP
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Enter the OTP code sent to <strong style={{ color: 'var(--text-primary)' }}>{form.email}</strong> and set a new password.
            </p>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.form
            key={tab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit}
          >
            {tab === 'register' && (
              <div style={inputWrapStyle}>
                <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input name="name" type="text" placeholder="Your Name" value={form.name} onChange={handleChange} required style={inputStyle} />
              </div>
            )}

            {(tab === 'login' || tab === 'register' || tab === 'forgot') && (
              <div style={inputWrapStyle}>
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input name="email" type="email" placeholder="Email address" value={form.email} onChange={handleChange} required style={inputStyle} />
              </div>
            )}

            {(tab === 'login' || tab === 'register') && (
              <div style={inputWrapStyle}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input name="password" type={showPass ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={handleChange} required style={inputStyle} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  {showPass ? <EyeOff size={16} color="var(--text-muted)" /> : <Eye size={16} color="var(--text-muted)" />}
                </button>
              </div>
            )}

            {/* OTP Code Input */}
            {(tab === 'verify_otp' || tab === 'reset_password') && (
              <div style={inputWrapStyle}>
                <input
                  name="otpCode"
                  type="text"
                  maxLength={6}
                  placeholder="6-Digit OTP Code"
                  value={form.otpCode}
                  onChange={handleChange}
                  required
                  style={{
                    ...inputStyle,
                    textAlign: 'center',
                    fontSize: '1.4rem',
                    letterSpacing: '8px',
                    fontWeight: 700,
                    color: 'var(--brand-primary)',
                    paddingLeft: 14
                  }}
                />
              </div>
            )}

            {/* New Password for Reset Password flow */}
            {tab === 'reset_password' && (
              <div style={inputWrapStyle}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input name="newPassword" type={showPass ? 'text' : 'password'} placeholder="New Password" value={form.newPassword} onChange={handleChange} required style={inputStyle} />
              </div>
            )}

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
                background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 8, padding: '10px 14px', marginBottom: 14,
                color: '#dc2626', fontSize: '0.85rem', textAlign: 'center'
              }}>
                {error}
              </motion.div>
            )}

            {successMsg && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
                background: 'var(--brand-hover)', border: '1px solid var(--brand-primary)',
                borderRadius: 8, padding: '10px 14px', marginBottom: 14,
                color: 'var(--brand-primary)', fontSize: '0.85rem', textAlign: 'center', fontWeight: 600
              }}>
                {successMsg}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              style={{
                width: '100%', padding: '13px', marginTop: 4,
                background: loading ? 'var(--bg-overlay)' : 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer',
                color: 'var(--bg-primary)', fontWeight: 600, fontSize: '0.95rem', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all .2s',
              }}
            >
              {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : tab === 'register' ? 'Send OTP Code' : tab === 'verify_otp' ? 'Verify OTP & Continue' : tab === 'forgot' ? 'Send Reset OTP' : 'Reset Password'}
              {!loading && <ArrowRight size={16} />}
            </motion.button>

            {tab === 'verify_otp' && (
              <div style={{ textAlign: 'center', marginTop: 14 }}>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'inherit' }}
                >
                  Didn't receive code? Resend OTP
                </button>
              </div>
            )}

            {tab === 'login' && (
              <button
                type="button"
                onClick={() => { setTab('forgot'); setError(''); setSuccessMsg(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', display: 'block', margin: '12px auto 0', fontFamily: 'inherit' }}
              >
                Forgot password?
              </button>
            )}

            {(tab === 'forgot' || tab === 'verify_otp' || tab === 'reset_password') && (
              <button
                type="button"
                onClick={() => { setTab('login'); setError(''); setSuccessMsg(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', display: 'block', margin: '14px auto 0', fontFamily: 'inherit' }}
              >
                &larr; Back to Sign In
              </button>
            )}
          </motion.form>
        </AnimatePresence>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 24 }}>
          By signing up, you agree to our Terms & Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}

const inputWrapStyle = {
  position: 'relative',
  marginBottom: 12,
};

const inputStyle = {
  width: '100%', padding: '12px 16px 12px 42px',
  background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)',
  borderRadius: 10, color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: "'Outfit', sans-serif",
  outline: 'none', boxSizing: 'border-box', display: 'block',
  transition: 'border-color .2s',
};
