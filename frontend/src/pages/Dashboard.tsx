import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useI18n } from '../i18n';

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { t } = useI18n();

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 md:px-10 text-center">
        <h1 className="font-display text-6xl font-bold tracking-tighter mb-6">{t("dashboard.titleLine1")} {t("dashboard.titleLine2")}</h1>
        <p className="text-on-surface-variant text-lg mb-12">{t("dashboard.disconnected")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 md:px-10">
      <header className="mb-20 border-b border-black/10 pb-12 flex flex-col md:flex-row justify-between items-baseline gap-8">
        <div className="max-w-xl">
          <h1 className="font-display text-6xl md:text-8xl font-bold tracking-tighter mb-6">{t("dashboard.titleLine1")}<br/>{t("dashboard.titleLine2")}</h1>
          <p className="text-on-surface-variant font-sans text-lg opacity-80 leading-relaxed italic">
            {t("dashboard.description")}
          </p>
        </div>
        <Link to="/auction/live" className="px-8 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm hover:opacity-80 transition-opacity">
          {t("dashboard.openAuction")}
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-10">
          <div className="flex items-baseline justify-between border-b border-black/10 pb-4">
            <h2 className="font-display text-3xl font-bold italic tracking-tight">{t("dashboard.wallet.title")}</h2>
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-40 italic">{t("dashboard.wallet.network")}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="editorial-card p-8">
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">{t("dashboard.wallet.connectedAddress")}</span>
              <div className="font-display text-xl italic mt-2">{shortAddress}</div>
              <div className="text-[9px] text-on-surface-variant mt-4 break-all opacity-60">{address}</div>
            </div>
            <div className="editorial-card p-8">
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">{t("dashboard.wallet.networkLabel")}</span>
              <div className="font-display text-xl italic mt-2">{t("dashboard.wallet.network")}</div>
              <div className="text-[9px] text-on-surface-variant mt-4 opacity-60">{t("dashboard.wallet.relayerInfo")}</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-12">
          <div className="editorial-card p-10 bg-surface-container relative overflow-hidden">
            <div className="absolute inset-0 noise-texture pointer-events-none opacity-20" />
            <div className="relative z-10">
              <div className="flex items-center gap-6 mb-12">
                <div className="w-16 h-16 bg-black flex items-center justify-center text-white font-display italic text-2xl">
                  {shortAddress.slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold italic">{t("dashboard.profile.name")}</h3>
                  <div className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40 italic mt-1">{t("dashboard.profile.label")}</div>
                </div>
              </div>

              <Link
                to="/auction/live"
                className="block w-full text-center py-4 border border-black/10 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all"
              >
                {t("dashboard.profile.cta")}
              </Link>
            </div>
          </div>

          <div className="p-8 border border-black/10 rounded-sm italic font-sans text-sm opacity-60 leading-relaxed">
            {t("dashboard.quote")}
          </div>
        </div>
      </div>
    </div>
  );
}
