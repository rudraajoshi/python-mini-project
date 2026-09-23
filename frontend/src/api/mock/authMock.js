import { respond, fail, delay } from './mockClient.js';
import { user } from './data.js';

const session = { access: 'mock.access.token', refresh: 'mock.refresh.token' };

export async function login({ email, password }) {
  await delay(500);
  if (!email || !password) throw fail('Enter your email and password.', 400);
  if (password.length < 6) throw fail('Those credentials do not match an account.', 401);
  return { user: { ...user, email }, ...session };
}

export async function register({ name, email }) {
  await delay(600);
  if (email?.endsWith('@taken.com')) throw fail('An account already uses this email.', 409);
  return { user: { ...user, name: name || user.name, email }, ...session };
}

export async function me() {
  return respond(user, 220);
}
