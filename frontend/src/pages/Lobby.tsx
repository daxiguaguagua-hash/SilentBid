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
            transition={{ duration: 0.5 }}
            className="font-display text-6xl md:text-8xl font-bold text-on-surface mb-6 tracking-tighter"
          >
            {t("lobby.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-on-surface-variant text-lg font-sans leading-relaxed"
          >
            {t("lobby.description")}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em] opacity-60"
        >
          <button className="text-secondary opacity-100 underline decoration-secondary/40 underline-offset-8">{t("lobby.filterActive")}</button>
          <button className="hover:opacity-100 transition-opacity">{t("lobby.filterResolved")}</button>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          whileHover={{ y: -4 }}
          className="group"
        >
          <div className="relative aspect-[3/4] overflow-hidden bg-surface-container mb-6 shadow-inner">
            <div className="w-full h-full bg-gradient-to-br from-primary/5 to-tertiary/10 flex items-center justify-center">
              <Lock className="w-16 h-16 text-primary/20 transition-all duration-700 group-hover:text-secondary/40 group-hover:scale-110" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-6 left-6 text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface">
              {t("lobby.card.badge")}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <h3 className="font-display text-2xl font-bold text-on-surface tracking-tight italic">
                {t("lobby.card.title")}
              </h3>
              <span className="font-sans text-[9px] font-bold uppercase tracking-widest text-secondary/60">
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
                className="group/link px-6 py-2 border border-black/10 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-300 rounded-sm inline-flex items-center gap-2"
              >
                {t("lobby.card.viewDetails")}
                <span className="inline-block transition-transform duration-300 group-hover/link:translate-x-1">&rarr;</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-32 p-12 bg-secondary text-on-secondary rounded-sm flex flex-col md:flex-row items-center justify-between gap-12"
      >
        <div className="max-w-xl">
          <h4 className="font-display text-3xl font-bold mb-4 tracking-tight">{t("lobby.banner.title")}</h4>
          <p className="opacity-80 text-sm leading-relaxed font-sans">{t("lobby.banner.description")}</p>
        </div>
        <Link to="/auction/live" className="group whitespace-nowrap px-10 py-4 border border-on-secondary/20 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-on-secondary hover:text-secondary transition-all duration-300 rounded-sm shrink-0 inline-flex items-center gap-2">
          {t("lobby.banner.cta")}
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
        </Link>
      </motion.div>
    </div>
  );
}
