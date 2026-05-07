import { motion } from 'motion/react';
import { Shield, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAccount, useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { useI18n } from '../i18n';

const stagger = (i: number) => ({ duration: 0.5, delay: i * 0.1 });

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
              <span className="inline-block font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-secondary">
                {t("home.eyebrow")}
              </span>
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
                <Link to="/auction/live" className="group mt-4 md:mt-0 px-12 py-4 bg-primary text-on-primary font-sans text-[11px] font-bold uppercase tracking-widest rounded-sm hover:scale-[0.98] transition-all duration-300">
                  <span className="inline-flex items-center gap-2">
                    {t("home.hero.enterAuction")}
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                  </span>
                </Link>
              ) : (
                <button onClick={() => connect({ connector: injected() })} className="group mt-4 md:mt-0 px-12 py-4 bg-primary text-on-primary font-sans text-[11px] font-bold uppercase tracking-widest rounded-sm hover:scale-[0.98] transition-all duration-300">
                  <span className="inline-flex items-center gap-2">
                    {t("home.hero.connectWallet")}
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                  </span>
                </button>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="md:col-span-4 border-l border-black/10 pl-10 hidden md:block"
          >
            <div className="mb-12">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6 opacity-40">{t("home.exhibition.label")}</div>
              <div className="space-y-8">
                <div className="flex gap-4 items-start group cursor-default">
                  <div className="w-16 h-20 bg-secondary/5 flex-shrink-0 flex items-center justify-center transition-colors duration-500 group-hover:bg-secondary/10">
                    <Lock className="w-5 h-5 text-secondary/30 transition-all duration-500 group-hover:text-secondary/50 group-hover:scale-110" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl leading-tight mb-2">{t("home.exhibition.cryptoTitle")}</h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-50 italic">{t("home.exhibition.cryptoLabel")}</span>
                  </div>
                </div>
                <div className="flex gap-4 items-start border-t border-black/5 pt-8 group cursor-default">
                  <div className="w-16 h-20 bg-secondary/5 flex-shrink-0 flex items-center justify-center transition-colors duration-500 group-hover:bg-secondary/10">
                    <Shield className="w-5 h-5 text-secondary/30 transition-all duration-500 group-hover:text-secondary/50 group-hover:scale-110" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl leading-tight mb-2">{t("home.exhibition.archTitle")}</h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-50 italic">{t("home.exhibition.archLabel")}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { label: t("home.metrics.auction"), value: t("home.metrics.auctionValue"), desc: t("home.metrics.auctionDesc") },
            { label: t("home.metrics.sealedBids"), value: t("home.metrics.sealedBidsValue"), desc: t("home.metrics.sealedBidsDesc") },
            { label: t("home.metrics.fhevm"), value: t("home.metrics.fhevmValue"), desc: t("home.metrics.fhevmDesc") },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={stagger(i)}
              className="editorial-card p-10 group"
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 mb-8 border-b border-black/5 pb-4">{item.label}</div>
              <div className="font-display text-5xl font-bold tracking-tighter">{item.value}</div>
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-secondary/60 italic mt-4">{item.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer Info Section */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-6 py-12 border-t border-black/10 md:px-10 flex flex-col md:flex-row justify-between items-center text-[9px] font-bold uppercase tracking-[0.2em] opacity-30 gap-6"
      >
        <div>{t("home.footer.copyright")}</div>
        <div>{t("home.footer.network")}</div>
        <div>{t("home.footer.privacy")}</div>
      </motion.footer>
    </div>
  );
}
