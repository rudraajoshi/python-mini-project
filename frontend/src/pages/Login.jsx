import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', remember: true });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  function validate() {
    const next = {};
    if (!form.email.trim()) next.email = 'Enter your email address.';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) next.email = 'That email address looks incomplete.';
    if (!form.password) next.password = 'Enter your password.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await login({ email: form.email, password: form.password });
      navigate(location.state?.from?.pathname ?? '/dashboard', { replace: true });
    } catch (error) {
      setErrors({ password: error.message });
      toast.error('Sign in failed', error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      <h1 className="text-section font-semibold tracking-[-0.02em] text-ink">Sign in</h1>
      <p className="mt-1.5 text-base text-muted">Pick up where you left off in your library.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          icon={Mail}
          placeholder="you@university.edu"
          value={form.email}
          error={errors.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          autoComplete="current-password"
          icon={Lock}
          placeholder="••••••••"
          value={form.password}
          error={errors.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          trailing={
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((s) => !s)}
              className="rounded p-1.5 text-faint transition-colors hover:text-ink"
            >
              {showPassword ? <EyeOff size={14} strokeWidth={1.9} /> : <Eye size={14} strokeWidth={1.9} />}
            </button>
          }
        />

        <div className="flex items-center justify-between pt-1">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={form.remember}
              onChange={(event) => setForm({ ...form, remember: event.target.checked })}
              className="h-3.5 w-3.5 rounded-sm border-line-strong text-accent focus:ring-accent/30"
            />
            Keep me signed in
          </label>
          <Link to="/register" className="rounded text-sm font-medium text-accent hover:underline">
            Create an account
          </Link>
        </div>

        <Button type="submit" variant="primary" size="lg" loading={submitting} className="w-full">
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-meta leading-relaxed text-faint">
        Demo mode is on: any email with a password of six or more characters signs you in.
      </p>
    </motion.div>
  );
}
