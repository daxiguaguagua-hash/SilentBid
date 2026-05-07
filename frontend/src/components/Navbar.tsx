import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export default function Navbar() {
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  const navItems = [
    { name: 'Archive', path: '/lobby' },
    { name: 'Dashboard', path: '/dashboard' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-sm border-b border-black/10">
      <nav className="flex justify-between items-baseline h-20 px-6 max-w-7xl mx-auto md:px-10">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-3xl font-bold tracking-tighter italic text-on-surface">SilentBid.</span>
        </Link>

        <div className="hidden md:flex items-center gap-12">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "relative font-sans text-[10px] font-bold uppercase tracking-[0.2em] transition-opacity py-1",
                location.pathname === item.path
                  ? "opacity-100 underline decoration-tertiary underline-offset-8"
                  : "opacity-40 hover:opacity-100"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {isConnected ? (
          <button
            onClick={() => disconnect()}
            className="border border-black/10 px-8 py-2.5 rounded-sm font-sans text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all active:scale-95"
          >
            {shortAddress}
          </button>
        ) : (
          <button
            onClick={() => connect({ connector: injected() })}
            className="border border-black/10 px-8 py-2.5 rounded-sm font-sans text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all active:scale-95"
          >
            Connect Wallet
          </button>
        )}
      </nav>
    </header>
  );
}
