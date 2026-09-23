import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, User } from 'lucide-react';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const strengthOf = (password) => {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) || /[^\w\s]/.test(password)) score += 1;
  return score;
};

const strengthLabels = ['Too short', 'Weak', 'Good', 'Strong'];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const strength = strengthOf(form.password);

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = 'Enter your name.';
    if (!form.email.trim()) next.email = 'Enter your email address.';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) next.email = 'That email address looks incomplete.';
    if (form.password.length < 8) next.password = 'Use at least 8 characters.';
    if (form.confirm !== form.password) next.confirm = 'Both passwords must match.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      toast.success('Account created', 'Upload your first document to start.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setErrors({ email: error.message });
      toast.error('Could not create account', error.message);
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
      <h1 className="text-section font-semibold tracking-[-0.02em] text-ink">Create your account</h1>
      <p className="mt-1.5 text-base text-muted">Start building a library you can actually search.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
        <Input
          label="Name"
          name="name"
          autoComplete="name"
          icon={User}
          placeholder="Rudra Mehta"
          value={form.name}
          error={errors.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />
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
        <div>
          <Input
            label="Password"
            type="password"
            name="password"
            autoComplete="new-password"
            icon={Lock}
            placeholder="At least 8 characters"
            value={form.password}
            error={errors.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
          {form.password && !errors.password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex flex-1 gap-1" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
                      i < strength ? 'bg-accent' : 'bg-line'
                    }`}
                  />
                ))}
              </div>
              <span className="text-2xs text-faint">{strengthLabels[strength]}</span>
            </div>
          )}
        </div>
        <Input
          label="Confirm password"
          type="password"
          name="confirm"
          autoComplete="new-password"
          icon={Lock}
          placeholder="Repeat your password"
          value={form.confirm}
          error={errors.confirm}
          onChange={(event) => setForm({ ...form, confirm: event.target.value })}
        />

        <Button type="submit" variant="primary" size="lg" loading={submitting} className="w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="rounded font-medium text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
