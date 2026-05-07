import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useSilentBid } from '../hooks/useSilentBid';
import { useI18n } from '../i18n';

const STATUS_KEY: Record<string, string> = {
  Active: "auction.status.active",
  Closed: "auction.status.closed",
  Expired: "auction.status.expired",
};

function translateStatus(raw: string, t: (k: string, p?: Record<string, string | number>) => string): string {
  if (!raw) return t("status.ready");
  if (raw.startsWith("FHEVM: wallet provider unavailable")) return t("status.fhevmUnavailable");
  if (raw.startsWith("Loading FHEVM SDK")) return t("status.loadingSDK");
  if (raw.startsWith("FHEVM ready")) return t("status.fhevmReady");
  if (raw.startsWith("Encrypting bid")) return t("status.encrypting");
  if (raw.startsWith("Waiting for wallet confirmation")) return t("status.waitingWallet");
  if (raw.startsWith("Encrypted bid submitted:")) return t("status.bidSubmitted", { hash: raw.split(": ")[1] || "" });
  if (raw.startsWith("Trivial bid submitted:")) return t("status.trivialSubmitted", { hash: raw.split(": ")[1] || "" });
  if (raw.startsWith("End auction submitted:")) return t("status.endSubmitted", { hash: raw.split(": ")[1] || "" });
  if (raw.startsWith("Error:")) return t("status.error", { message: raw.slice(7) });
  return raw;
}

export default function AuctionDetail() {
  const {
    isConnected, connect,
    instance, fhevmLabel,
    bidCount, ended, isActive, isOwner,
    bidAmount, setBidAmount, isBidAmountValid,
    statusLabel, status, shortContract, events,
    handleBid, handleBidTrivial, handleEndAuction,
    txHash, isPending,
  } = useSilentBid();
  const { t } = useI18n();

  const UINT32_MAX = 2 ** 32 - 1;
  const canBid = isConnected && instance && isBidAmountValid && !ended && isActive;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:px-10">
      {/* Breadcrumb & Header */}
      <div className="mb-16 border-b border-black/10 pb-12">
        <div className="flex items-center gap-4 text-on-surface-variant font-sans text-[9px] font-bold uppercase tracking-[0.3em] mb-6 opacity-40">
          <Link to="/lobby" className="hover:text-primary transition-colors">{t("auction.breadcrumb.archive")}</Link>
          <div className="w-1 h-1 bg-black rounded-full" />
          <span className="text-on-surface">{t("auction.breadcrumb.current")}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="max-w-3xl">
            <h1 className="font-display text-6xl md:text-8xl font-bold text-on-surface mb-6 tracking-tighter leading-none">{t("auction.title")}</h1>
            <p className="text-on-surface-variant font-sans text-lg leading-relaxed opacity-80">
              {t("auction.description")}
              <span className="italic font-display text-primary mx-1">{t("auction.descriptionHighlight")}</span>
            </p>
          </div>
          <div className="flex flex-col items-end shrink-0 border-l border-black/10 pl-8 pb-1">
            <span className="font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-2 opacity-40">{t("auction.contract.label")}</span>
            <span className="font-display italic text-lg text-primary">
              {shortContract}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Bidding Terminal (Left/Main) */}
        <div className="lg:col-span-8 space-y-16">
          {!isConnected ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="editorial-card p-12 relative overflow-hidden text-center"
            >
              <div className="absolute inset-0 noise-texture pointer-events-none" />
              <h2 className="font-display text-2xl font-bold italic mb-6">{t("auction.connectPrompt.title")}</h2>
              <p className="text-on-surface-variant mb-8">{t("auction.connectPrompt.subtitle")}</p>
              <button
                onClick={() => connect()}
                className="px-12 py-4 bg-primary text-on-primary font-sans text-[11px] font-bold uppercase tracking-widest rounded-sm hover:scale-[0.98] transition-all"
              >
                {t("auction.connectPrompt.cta")}
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="editorial-card p-12 relative overflow-hidden"
            >
              <div className="absolute inset-0 noise-texture pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-baseline justify-between mb-12 pb-8 border-b border-black/5 gap-4">
                <div className="flex items-baseline gap-4">
                  <h3 className="font-display text-2xl font-bold text-on-surface italic tracking-tight">{t("auction.terminal.title")}</h3>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm",
                    ended ? "bg-black/5 text-on-surface-variant" : "bg-tertiary/10 text-tertiary"
                  )}>
                    {t(STATUS_KEY[statusLabel] || "auction.status.active")}
                  </span>
                </div>
                <div className="text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-40">{t("auction.terminal.fhevmStatus")} {fhevmLabel}</div>
              </div>

              {/* Bid Input Section */}
              <div className="space-y-12">
                <div className="group">
                  <label className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant block mb-6 opacity-60" htmlFor="bid-amount">
                    {t("auction.form.bidAmount")}
                    <span className="ml-2 opacity-40">{t("auction.form.unit")}</span>
                  </label>
                  <div className="relative">
                    <input
                      id="bid-amount"
                      type="number"
                      min="1"
                      max={UINT32_MAX}
                      step="1"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="w-full bg-transparent border-b border-black/20 pb-4 font-display text-6xl text-on-surface focus:outline-none focus:border-tertiary transition-all placeholder:opacity-10"
                      placeholder="000"
                    />
                    <div className="absolute right-0 bottom-4 font-display text-2xl italic text-on-surface-variant tracking-tighter">
                      Credits
                    </div>
                  </div>
                  {!isBidAmountValid && (
                    <div className="text-[#a13d3d] text-xs mt-3">{t("auction.form.error", { max: UINT32_MAX })}</div>
                  )}
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center pt-8">
                  <button
                    onClick={handleBid}
                    disabled={!canBid || isPending}
                    className={cn(
                      "flex-grow h-16 font-sans text-xs font-bold uppercase tracking-[0.3em] transition-all rounded-sm",
                      canBid && !isPending
                        ? "bg-primary text-on-primary hover:brightness-110 active:scale-[0.98]"
                        : "bg-on-surface/20 text-on-surface-variant cursor-not-allowed"
                    )}
                  >
                    {isPending ? t("auction.form.confirming") : t("auction.form.submit")}
                  </button>
                  <p className="text-[10px] text-on-surface-variant font-sans max-w-[200px] leading-relaxed opacity-60 italic">
                    * {t("auction.form.notice")}
                  </p>
                </div>
              </div>

              <p className="text-on-surface-variant text-xs mt-8 min-h-[18px]">{translateStatus(status, t)}</p>
            </motion.div>
          )}

          {/* Activity Log */}
          {events.length > 0 && (
            <div className="space-y-8">
              <div className="flex items-baseline justify-between border-b border-black/10 pb-4">
                <h3 className="font-display text-2xl font-bold italic tracking-tight">{t("auction.activity.title")}</h3>
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">{t("auction.activity.stream")}</span>
              </div>

              <div className="space-y-0 text-sm">
                {events.map((event, idx) => (
                  <div key={idx} className="grid grid-cols-3 py-6 border-b border-black/5 items-center font-sans tracking-tight">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-1.5 bg-tertiary rounded-full" />
                      <span className="font-bold">{event}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40">{t("auction.activity.sealed")}</span>
                    </div>
                    <div className="text-right opacity-40 italic">{t("auction.activity.recent")}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Developer Controls */}
          {isConnected && (
            <div className="p-8 bg-black/5 border border-black/10 rounded-sm">
              <div className="flex items-center justify-between gap-8 flex-wrap">
                <div>
                  <h2 className="font-display text-xl font-bold mb-1">{t("auction.dev.title")}</h2>
                  <p className="text-on-surface-variant text-xs">{t("auction.dev.description")}</p>
                </div>
                <div className="flex gap-4 flex-wrap">
                  <button
                    onClick={handleBidTrivial}
                    disabled={isPending || !isBidAmountValid}
                    className="px-6 py-2 border border-black/10 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all rounded-sm disabled:opacity-30"
                  >
                    {t("auction.dev.debugBid")}
                  </button>
                  {isOwner && !ended && (
                    <button
                      onClick={handleEndAuction}
                      disabled={isPending}
                      className="px-6 py-2 bg-[#a13d3d] text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:opacity-80 transition-all rounded-sm disabled:opacity-30"
                    >
                      {t("auction.dev.endAuction")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Auction Metadata (Right Sidebar) */}
        <div className="lg:col-span-4 space-y-12">
          <div className="editorial-card aspect-[4/5] overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-primary/5 to-tertiary/10 flex items-center justify-center">
              <div className="text-center">
                <div className="font-display text-6xl font-bold italic tracking-tighter mb-4 opacity-20">SB</div>
                <div className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">SilentBid</div>
              </div>
            </div>
          </div>

          <div className="space-y-12 pt-8 border-t border-black/10">
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-2">
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">{t("auction.meta.auction")}</span>
                <div className="font-display text-4xl italic tracking-tighter">{t(STATUS_KEY[statusLabel] || "auction.status.active")}</div>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">{t("auction.meta.sealedBids")}</span>
                <div className="font-display text-4xl italic tracking-tighter">{bidCount}</div>
              </div>
            </div>

            <div className="space-y-6">
              {[
                { label: t("auction.meta.typeLabel"), val: t("auction.meta.typeValue") },
                { label: t("auction.meta.unitLabel"), val: t("auction.meta.unitValue") },
                { label: t("auction.meta.securityLabel"), val: t("auction.meta.securityValue"), accent: true },
                { label: t("auction.meta.networkLabel"), val: t("auction.meta.networkValue") },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between font-sans text-[11px] font-semibold border-b border-black/5 pb-3 py-1">
                  <span className="uppercase tracking-[0.1em] opacity-50 font-bold text-[9px]">{item.label}</span>
                  <span className={cn(item.accent ? "text-tertiary" : "text-on-surface")}>
                    {item.val}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">{t("auction.evidence.title")}</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="opacity-50">{t("auction.evidence.contract")}</span>
                  <span className="font-bold tabular-nums">{shortContract}</span>
                </div>
                {txHash && (
                  <div className="flex justify-between text-xs">
                    <span className="opacity-50">{t("auction.evidence.latestTx")}</span>
                    <span className="font-bold tabular-nums">{txHash.slice(0, 18)}...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">{t("auction.rules.title")}</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="block font-bold mb-1">{t("auction.rules.visible")}</span>
                  <p className="opacity-60">{t("auction.rules.visibleDesc")}</p>
                </div>
                <div>
                  <span className="block font-bold mb-1">{t("auction.rules.hidden")}</span>
                  <p className="opacity-60">{t("auction.rules.hiddenDesc")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
