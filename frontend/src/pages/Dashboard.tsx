import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useConnection } from 'wagmi';
import { useI18n } from '../i18n';

const stagger = (i: number) => ({ duration: 0.4, delay: i * 0.1 });

export default function Dashboard() {
  const { address, isConnected } = useConnection();
  const { t } = useI18n();

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 md:px-10 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-display text-6xl font-bold tracking-tighter mb-6"
        >
          {t("dashboard.titleLine1")} {t("dashboard.titleLine2")}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-on-surface-variant text-lg mb-12"
        >
          {t("dashboard.disconnected")}
        </motion.p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 md:px-10">
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-20 border-b border-black/10 pb-12 flex flex-col md:flex-row justify-between items-baseline gap-8"
      >
        <div className="max-w-xl">
          <h1 className="font-display text-6xl md:text-8xl font-bold tracking-tighter mb-6">{t("dashboard.titleLine1")}<br/>{t("dashboard.titleLine2")}</h1>
          <p className="text-on-surface-variant font-sans text-lg opacity-80 leading-relaxed italic">
            {t("dashboard.description")}
          </p>
        </div>
        <Link to="/auction/live" className="group px-8 py-3 bg-secondary text-on-secondary text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm hover:opacity-90 transition-all duration-300 inline-flex items-center gap-2">
          {t("dashboard.openAuction")}
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
        </Link>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-10">
          <div className="flex items-baseline justify-between border-b border-black/10 pb-4">
            <h2 className="font-display text-3xl font-bold italic tracking-tight">{t("dashboard.wallet.title")}</h2>
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-secondary/60 italic">{t("dashboard.wallet.network")}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={stagger(0)}
              className="editorial-card p-8 group"
            >
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">{t("dashboard.wallet.connectedAddress")}</span>
              <div className="font-display text-xl italic mt-2">{shortAddress}</div>
              <div className="text-[9px] text-on-surface-variant mt-4 break-all opacity-60">{address}</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={stagger(1)}
              className="editorial-card p-8 group"
            >
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">{t("dashboard.wallet.networkLabel")}</span>
              <div className="font-display text-xl italic mt-2 text-secondary">{t("dashboard.wallet.network")}</div>
              <div className="text-[9px] text-on-surface-variant mt-4 opacity-60">{t("dashboard.wallet.relayerInfo")}</div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-4 space-y-12"
        >
          <div className="editorial-card p-10 bg-surface-container relative overflow-hidden group">
            <div className="absolute inset-0 noise-texture pointer-events-none opacity-20" />
            <div className="relative z-10">
              <div className="flex items-center gap-6 mb-12">
                <div className="w-16 h-16 bg-secondary flex items-center justify-center text-on-secondary font-display italic text-2xl transition-transform duration-500 group-hover:scale-105">
                  {shortAddress.slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold italic">{t("dashboard.profile.name")}</h3>
                  <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-secondary/60 italic mt-1">{t("dashboard.profile.label")}</div>
                </div>
              </div>

              <Link
                to="/auction/live"
                className="group/link block w-full text-center py-4 border border-black/10 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all duration-300"
              >
                {t("dashboard.profile.cta")}
              </Link>
            </div>
          </div>

          <div className="p-8 border border-black/10 rounded-sm italic font-sans text-sm opacity-60 leading-relaxed hover:opacity-80 transition-opacity duration-500">
            {t("dashboard.quote")}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
