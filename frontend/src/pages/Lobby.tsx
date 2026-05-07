import { motion } from 'motion/react';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

export default function Lobby() {
  const { t } = useI18n();

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 md:px-10">
      <header className="mb-16 flex flex-col md:flex-row md:items-baseline justify-between gap-8 border-b border-black/10 pb-12">
        <div className="max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-display text-6xl md:text-8xl font-bold text-on-surface mb-6 tracking-tighter"
          >
            {t("lobby.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-on-surface-variant text-lg font-sans leading-relaxed"
          >
            {t("lobby.description")}
          </motion.p>
        </div>

        <div className="flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
          <button className="text-primary opacity-100 underline decoration-tertiary underline-offset-8">{t("lobby.filterActive")}</button>
          <button className="hover:opacity-100 transition-opacity">{t("lobby.filterResolved")}</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="group"
        >
          <div className="relative aspect-[3/4] overflow-hidden bg-surface-container mb-6 shadow-inner">
            <div className="w-full h-full bg-gradient-to-br from-primary/5 to-tertiary/10 flex items-center justify-center">
              <Lock className="w-16 h-16 text-primary/20" />
            </div>
            <div className="absolute top-6 left-6 text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface">
              {t("lobby.card.badge")}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <h3 className="font-display text-2xl font-bold text-on-surface tracking-tight italic">
                {t("lobby.card.title")}
              </h3>
              <span className="font-sans text-[9px] font-bold uppercase tracking-widest text-on-surface-variant opacity-40">
                {t("lobby.card.subtitle")}
              </span>
            </div>

            <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-2 font-sans opacity-80">{t("lobby.card.description")}</p>

            <div className="pt-4 flex items-center justify-between border-t border-black/5">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-40 mb-1">{t("lobby.card.statusLabel")}</span>
                <span className="font-display text-lg italic">{t("lobby.card.statusValue")}</span>
              </div>
              <Link
                to="/auction/live"
                className="px-6 py-2 border border-black/10 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all rounded-sm"
              >
                {t("lobby.card.viewDetails")}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mt-32 p-12 bg-primary text-on-primary rounded-sm flex flex-col md:flex-row items-center justify-between gap-12"
      >
        <div className="max-w-xl">
          <h4 className="font-display text-3xl font-bold mb-4 tracking-tight">{t("lobby.banner.title")}</h4>
          <p className="opacity-70 text-sm leading-relaxed font-sans">{t("lobby.banner.description")}</p>
        </div>
        <Link to="/auction/live" className="whitespace-nowrap px-10 py-4 border border-on-primary/20 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-on-primary hover:text-primary transition-all rounded-sm shrink-0">
          {t("lobby.banner.cta")}
        </Link>
      </motion.div>
    </div>
  );
}
