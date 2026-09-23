/** Stacked-layers mark: pages accumulating into one memory. */
export default function Logo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" fill="#171717" />
      <path d="M8 9.5h8" stroke="#F8F9FB" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 12.5h8" stroke="#4F6DF5" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 15.5h4.5" stroke="#F8F9FB" strokeWidth="1.6" strokeLinecap="round" opacity="0.62" />
    </svg>
  );
}
