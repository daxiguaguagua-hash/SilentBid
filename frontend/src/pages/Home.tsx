import { motion } from 'motion/react';
import { Shield, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAccount, useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { useI18n } from '../i18n';

export default function Home() {
  const { isConnected } = useAccount();
  const { connect } = useConnect();
  const { t } = useI18n();

  return (
    <div className="overflow-x-hidden pt-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-32 relative md:px-10 border-b border-black/5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-end">
          <div className="md:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <span className="font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-tertiary">{t("home.eyebrow")}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-7xl md:text-9xl font-bold leading-[0.85] tracking-tight mb-8 text-on-surface"
            >
              {t("home.hero.titleLine1")}<br/>{t("home.hero.titleLine2")}<br/>{t("home.hero.titleLine3")}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col md:flex-row gap-8 items-start"
            >
              <p className="font-sans text-base text-on-surface-variant max-w-sm leading-relaxed">
                {t("home.hero.subtitle")}
              </p>
              {isConnected ? (
                <Link to="/auction/live" className="mt-4 md:mt-0 px-12 py-4 bg-primary text-on-primary font-sans text-[11px] font-bold uppercase tracking-widest rounded-sm hover:scale-[0.98] transition-all">
                  {t("home.hero.enterAuction")}
                </Link>
              ) : (
                <button onClick={() => connect({ connector: injected() })} className="mt-4 md:mt-0 px-12 py-4 bg-primary text-on-primary font-sans text-[11px] font-bold uppercase tracking-widest rounded-sm hover:scale-[0.98] transition-all">
                  {t("home.hero.connectWallet")}
                </button>
              )}
            </motion.div>
          </div>

          <div className="md:col-span-4 border-l border-black/10 pl-10 hidden md:block">
            <div className="mb-12">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6 opacity-40">{t("home.exhibition.label")}</div>
              <div className="space-y-8">
                <div className="flex gap-4 items-start">
                  <div className="w-16 h-20 bg-primary/5 flex-shrink-0 flex items-center justify-center">
                    <Lock className="w-5 h-5 opacity-20" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl leading-tight mb-2">{t("home.exhibition.cryptoTitle")}</h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-50 italic">{t("home.exhibition.cryptoLabel")}</span>
                  </div>
                </div>
                <div className="flex gap-4 items-start border-t border-black/5 pt-8">
                  <div className="w-16 h-20 bg-secondary/5 flex-shrink-0 flex items-center justify-center">
                    <Shield className="w-5 h-5 opacity-20" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl leading-tight mb-2">{t("home.exhibition.archTitle")}</h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-50 italic">{t("home.exhibition.archLabel")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="editorial-card p-10">
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 mb-8 border-b border-black/5 pb-4">{t("home.metrics.auction")}</div>
            <div className="font-display text-5xl font-bold tracking-tighter">{t("home.metrics.auctionValue")}</div>
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40 italic mt-4">{t("home.metrics.auctionDesc")}</div>
          </div>
          <div className="editorial-card p-10">
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 mb-8 border-b border-black/5 pb-4">{t("home.metrics.sealedBids")}</div>
            <div className="font-display text-5xl font-bold tracking-tighter">{t("home.metrics.sealedBidsValue")}</div>
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40 italic mt-4">{t("home.metrics.sealedBidsDesc")}</div>
          </div>
          <div className="editorial-card p-10">
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 mb-8 border-b border-black/5 pb-4">{t("home.metrics.fhevm")}</div>
            <div className="font-display text-5xl font-bold tracking-tighter">{t("home.metrics.fhevmValue")}</div>
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40 italic mt-4">{t("home.metrics.fhevmDesc")}</div>
          </div>
        </div>
      </section>

      {/* Footer Info Section */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-black/10 md:px-10 flex flex-col md:flex-row justify-between items-center text-[9px] font-bold uppercase tracking-[0.2em] opacity-30 gap-6">
        <div>{t("home.footer.copyright")}</div>
        <div>{t("home.footer.network")}</div>
        <div>{t("home.footer.privacy")}</div>
      </footer>
    </div>
  );
}
