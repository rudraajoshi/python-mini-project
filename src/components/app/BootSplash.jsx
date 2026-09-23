import Logo from './Logo.jsx';

export default function BootSplash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <div className="flex flex-col items-center gap-3">
        <Logo size={26} />
        <div className="h-0.5 w-24 overflow-hidden rounded-full bg-line">
          <div className="h-full w-1/3 animate-indeterminate rounded-full bg-accent" />
        </div>
      </div>
    </div>
  );
}
