/** Join conditional class names without pulling in a dependency. */
export function cn(...parts) {
  return parts.flat(Infinity).filter(Boolean).join(' ');
}
