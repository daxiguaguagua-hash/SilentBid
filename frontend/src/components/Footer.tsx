import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full py-12 border-t border-outline-variant/10 bg-surface-container-lowest">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 max-w-7xl mx-auto md:px-10 items-center">
        <div className="flex flex-col gap-2">
          <div className="font-display text-xl font-bold text-primary">SilentBid</div>
          <p className="text-on-surface-variant font-sans text-sm">
            &copy; 2024 SilentBid. Powered by Zama FHEVM Invisible Security.
          </p>
        </div>
        <div className="flex flex-wrap md:justify-end gap-x-8 gap-y-4">
          {['Network Status', 'Security Audit', 'GitHub', 'Privacy Policy'].map((link) => (
            <Link
              key={link}
              to="#"
              className="text-on-surface-variant hover:text-secondary transition-colors font-sans text-xs font-bold uppercase tracking-widest"
            >
              {link}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
