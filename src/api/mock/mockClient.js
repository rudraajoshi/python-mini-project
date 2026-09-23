/** Small helpers so mock services behave like a network: latency + failures. */
export function delay(ms = 420) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function respond(value, ms) {
  await delay(ms);
  return typeof value === 'function' ? value() : structuredClone(value);
}

export function fail(message, status = 400) {
  const error = new Error(message);
  error.isNormalized = true;
  error.status = status;
  error.fields = {};
  return error;
}

export function paginate(items, { page = 1, pageSize = 50 } = {}) {
  const start = (page - 1) * pageSize;
  return { results: items.slice(start, start + pageSize), count: items.length };
}
