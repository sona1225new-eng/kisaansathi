import React, { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { FiArrowRight, FiArrowLeft, FiCheck, FiEye, FiEyeOff, FiLock, FiMail, FiUser } from 'react-icons/fi';
import { useAuthContext } from '../context/AuthContext';
import { authService } from '../api/services';

function Field({ icon: Icon, type = 'text', label, ...props }) { const [show, setShow] = useState(false); const isPassword = type === 'password'; return <label className="auth-field"><span>{label}</span><div><Icon /> <input type={isPassword && show ? 'text' : type} {...props} />{isPassword && <button type="button" onClick={() => setShow(!show)}>{show ? <FiEyeOff /> : <FiEye />}</button>}</div></label>; }
function Shell({ children, title, subtitle }) { return <div className="auth-page"><Link className="auth-brand" to="/"><span>🌾</span> Kisaan Saathi</Link><div className="auth-art"><p>Smarter farming starts with a single, simple step.</p><div className="auth-art-card"><span>☀️</span><div><small>Your farming brief</small><strong>Made for today.</strong></div></div></div><main className="auth-panel"><Link to="/" className="back"><FiArrowLeft /> Back to home</Link><div className="auth-form"><p className="eyebrow">WELCOME TO KISAAN SAATHI</p><h1>{title}</h1><p className="auth-subtitle">{subtitle}</p>{children}</div></main></div>; }

export function LoginPage() {
  const { login, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '', remember: true });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUnverified, setIsUnverified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [resendError, setResendError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setResendSuccess('');
    setResendError('');
    setIsUnverified(false);
    setLoading(true);
    try {
      await login(form);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      const errMsg = err?.response?.data?.message || 'Unable to sign in. Please try again.';
      setError(errMsg);
      if (err?.response?.status === 403 || errMsg.toLowerCase().includes('verify')) {
        setIsUnverified(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!form.email || resendLoading || cooldown > 0) return;
    setResendLoading(true);
    setResendSuccess('');
    setResendError('');
    try {
      const res = await authService.resendVerification({ email: form.email });
      setResendSuccess(
        res.data?.data?.message || res.data?.message || 'Verification email sent! Check your inbox.'
      );
      setCooldown(60);
    } catch (err) {
      setResendError(err?.response?.data?.message || 'Failed to send email, try again');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Shell title="Welcome back." subtitle="Sign in to continue caring for your farm.">
      <form onSubmit={submit}>
        <Field
          icon={FiMail}
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Field
          icon={FiLock}
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <div className="auth-options">
          <label>
            <input
              type="checkbox"
              checked={form.remember}
              onChange={(e) => setForm({ ...form, remember: e.target.checked })}
            />{' '}
            Remember me
          </label>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>

        {error && (
          <div className="form-error" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span>{error}</span>
            {isUnverified && (
              <div style={{ marginTop: '2px' }}>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendLoading || cooldown > 0}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#176b47',
                    fontWeight: '700',
                    fontSize: '12px',
                    textDecoration: 'underline',
                    cursor: resendLoading || cooldown > 0 ? 'not-allowed' : 'pointer',
                    opacity: resendLoading || cooldown > 0 ? 0.7 : 1,
                  }}
                >
                  {resendLoading
                    ? 'Sending...'
                    : cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : 'Resend verification email'}
                </button>
              </div>
            )}
          </div>
        )}

        {resendSuccess && <p className="form-success">🌾 {resendSuccess}</p>}
        {resendError && <p className="form-error">{resendError}</p>}

        <button className="auth-submit" disabled={loading}>
          {loading ? 'Signing in…' : <>Login <FiArrowRight /></>}
        </button>
      </form>
      <p className="auth-switch">
        New to Kisaan Saathi? <Link to="/register">Create your account</Link>
      </p>
    </Shell>
  );
}

export function RegisterPage() {
  const { register, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', location: '', password: '' });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    try {
      const data = await register(form);
      if (data?.token) {
        navigate('/dashboard', { replace: true });
      } else {
        setSuccessMessage(
          data?.message || 'Registration successful! Please check your email to verify your account.'
        );
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to create your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell title="Start growing smarter." subtitle="Create your free account in less than a minute.">
      {successMessage ? (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <p className="form-success" style={{ marginBottom: '20px', lineHeight: '1.5' }}>
            🌾 {successMessage}
          </p>
          <Link to="/login" className="auth-submit" style={{ display: 'inline-flex', textDecoration: 'none' }}>
            Go to Login <FiArrowRight />
          </Link>
        </div>
      ) : (
        <form onSubmit={submit}>
          <Field icon={FiUser} label="Your name" placeholder="e.g. Ramesh Kumar" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <Field icon={FiMail} label="Email address" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <Field icon={FiUser} label="Farm location" placeholder="Village, district or state" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          <Field icon={FiLock} label="Create password" type="password" minLength="6" placeholder="At least 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          {error && <p className="form-error">{error}</p>}
          <button className="auth-submit" disabled={loading}>
            {loading ? 'Creating account…' : <>Create account <FiArrowRight /></>}
          </button>
        </form>
      )}
      <p className="terms"><FiCheck /> By continuing, you agree to receive useful farming updates.</p>
      <p className="auth-switch">Already a member? <Link to="/login">Login</Link></p>
    </Shell>
  );
}

export function ForgotPasswordPage() { const [email, setEmail] = useState(''); const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false); const submit = async e => { e.preventDefault(); setLoading(true); setError(''); try { const { data } = await authService.forgotPassword({ email }); setMessage(data.data.resetToken ? `Development reset token: ${data.data.resetToken}` : 'If an account exists, reset instructions have been sent.'); } catch (err) { setError(err?.response?.data?.message || 'Unable to send reset instructions.'); } finally { setLoading(false); } }; return <Shell title="Reset your password." subtitle="Enter your email and we’ll help you get back in."><form onSubmit={submit}><Field icon={FiMail} label="Email address" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />{error && <p className="form-error">{error}</p>}{message && <p className="form-success">{message}</p>}<button className="auth-submit" disabled={loading}>{loading ? 'Sending…' : <>Send reset instructions <FiArrowRight /></>}</button></form><p className="auth-switch"><Link to="/login">Back to login</Link></p></Shell>; }

export function ResetPasswordPage() { const [params] = useSearchParams(); const navigate = useNavigate(); const [token, setToken] = useState(params.get('token') || ''); const [password, setPassword] = useState(''); const [message, setMessage] = useState(''); const [error, setError] = useState(''); const submit = async e => { e.preventDefault(); setError(''); try { await authService.resetPassword({ token, password }); setMessage('Password updated. Redirecting to login…'); setTimeout(() => navigate('/login'), 1200); } catch (err) { setError(err?.response?.data?.message || 'Unable to reset password.'); } }; return <Shell title="Choose a new password." subtitle="Use a strong password you don’t use elsewhere."><form onSubmit={submit}><Field icon={FiLock} label="Reset token" placeholder="Paste your reset token" value={token} onChange={e => setToken(e.target.value)} required /><Field icon={FiLock} label="New password" type="password" minLength="6" placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />{error && <p className="form-error">{error}</p>}{message && <p className="form-success">{message}</p>}<button className="auth-submit">Update password <FiArrowRight /></button></form></Shell>; }

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState(token ? 'loading' : 'missing');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;
    authService.verifyEmail(token)
      .then((res) => {
        setStatus('success');
        setMessage(res.data?.data?.message || res.data?.message || 'Email verified successfully! You can now log in.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err?.response?.data?.message || 'Verification link is invalid or has expired.');
      });
  }, [token]);

  return (
    <Shell
      title={status === 'success' ? 'Email verified!' : 'Verify your email'}
      subtitle={status === 'success' ? 'Your account is now active.' : 'Activating your KisaanSaathi account.'}
    >
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        {status === 'loading' && <p>Verifying your email address, please wait…</p>}
        {status === 'missing' && <p className="form-error">No verification token found in URL.</p>}
        {status === 'error' && <p className="form-error">{message}</p>}
        {status === 'success' && <p className="form-success">🌾 {message}</p>}
        <div style={{ marginTop: '24px' }}>
          <Link to="/login" className="auth-submit" style={{ display: 'inline-flex', textDecoration: 'none' }}>
            Go to Login <FiArrowRight />
          </Link>
        </div>
      </div>
    </Shell>
  );
}

