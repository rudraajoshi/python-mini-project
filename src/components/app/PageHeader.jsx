export default function PageHeader({ title, subtitle, actions, children }) {
  return (
    <header className="mb-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-title font-semibold tracking-[-0.02em] text-ink">{title}</h1>
          {subtitle && <p className="mt-1.5 text-lg text-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {children}
    </header>
  );
}
