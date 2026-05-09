import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useSilentBid } from '../hooks/useSilentBid';
import { useI18n } from '../i18n';

const STATUS_KEY: Record<string, string> = {
  Active: 'auction.status.active',
  Closed: 'auction.status.closed',
  Expired: 'auction.status.expired',
};

function buildAlchemyTxLink(txHash: string): string {
  const params = new URLSearchParams({
    network: 'ETH_SEPOLIA',
    method: 'eth_getTransactionByHash',
    'body.id': '1',
    'body.jsonrpc': '2.0',
    'body.method': 'eth_getTransactionByHash',
  });
  params.set('body.params[0]', txHash);
  return `https://sandbox.alchemy.com/?${params.toString()}`;
}

function translateStatus(
  raw: string,
  t: (k: string, p?: Record<string, string | number>) => string,
): string {
  if (!raw) return t('status.ready');
  if (raw.startsWith('FHEVM: wallet provider unavailable'))
    return t('status.fhevmUnavailable');
  if (raw.startsWith('Loading FHEVM SDK')) return t('status.loadingSDK');
  if (raw.startsWith('FHEVM ready')) return t('status.fhevmReady');
  if (raw.startsWith('Encrypting bid')) return t('status.encrypting');
  if (raw.startsWith('Waiting for wallet confirmation'))
    return t('status.waitingWallet');
  if (raw.startsWith('Encrypted bid submitted:'))
    return t('status.bidSubmitted', { hash: raw.split(': ')[1] || '' });
  if (raw.startsWith('Trivial bid submitted:'))
    return t('status.trivialSubmitted', { hash: raw.split(': ')[1] || '' });
  if (raw.startsWith('End auction submitted:'))
    return t('status.endSubmitted', { hash: raw.split(': ')[1] || '' });
  if (raw.startsWith('Auction restarted:'))
    return t('status.restarted', { hash: raw.split(': ')[1] || '' });
  if (raw.startsWith('Error:'))
    return t('status.error', { message: raw.slice(7) });
  return raw;
}

const stagger = (i: number) => ({ duration: 0.4, delay: i * 0.08 });

export default function AuctionDetail() {
  const [searchParams] = useSearchParams();
  const previewCard = searchParams.get('card'); // "upcoming" | "resolved" | null
  const isPreview = previewCard === 'upcoming' || previewCard === 'resolved';
  const {
    isConnected,
    connect,
    instance,
    fhevmLabel,
    bidCount,
    ended,
    isActive,
    isOwner,
    bidAmount,
    setBidAmount,
    isBidAmountValid,
    statusLabel,
    status,
    shortContract,
    longContract,
    latestWalletTxHash,
    events,
    handleBid,
    handleBidTrivial,
    handleEndAuction,
    handleRestartAuction,
    txHash,
    isPending,
    ENABLE_TEST,
  } = useSilentBid();
  const { t } = useI18n();
  const [inputFocused, setInputFocused] = useState(false);
  const [copiedField, setCopiedField] = useState<'contract' | 'walletTx' | null>(
    null,
  );

  const UINT32_MAX = 2 ** 32 - 1;
  const canBid =
    isConnected && instance && isBidAmountValid && !ended && isActive;

  // Reset focus state when bid panel changes
  useEffect(() => {
    setInputFocused(false);
  }, [isConnected]);

  const copyWithFeedback = async (
    value: string,
    field: 'contract' | 'walletTx',
  ) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const sidebarItems = [
    { label: t('auction.meta.typeLabel'), val: t('auction.meta.typeValue') },
    { label: t('auction.meta.unitLabel'), val: t('auction.meta.unitValue') },
    {
      label: t('auction.meta.securityLabel'),
      val: t('auction.meta.securityValue'),
      accent: true,
    },
    {
      label: t('auction.meta.networkLabel'),
      val: t('auction.meta.networkValue'),
    },
  ];

  if (isPreview) {
    const isUpcoming = previewCard === 'upcoming';
    const dotColor = isUpcoming ? 'bg-amber-400' : 'bg-slate-400';
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 md:px-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-surface-container border border-black/10 rounded-full text-[9px] font-bold uppercase tracking-[0.3em] mb-8">
            {isUpcoming
              ? t('lobby.previewUpcoming.badge')
              : t('lobby.previewResolved.badge')}
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tighter mb-6">
            {isUpcoming
              ? t('lobby.previewUpcoming.title')
              : t('lobby.previewResolved.title')}
          </h1>
          <p className="text-on-surface-variant text-lg max-w-lg mx-auto mb-12 leading-relaxed font-sans">
            {isUpcoming
              ? t('lobby.previewUpcoming.description')
              : t('lobby.previewResolved.description')}
          </p>
          <div className="flex items-center justify-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
            <span className="flex items-center gap-2">
              <span
                className={'w-2 h-2 rounded-full inline-block ' + dotColor}
              />
              {isUpcoming
                ? t('lobby.previewUpcoming.status')
                : t('lobby.previewResolved.status')}
            </span>
            <span>{t('lobby.previewZama')}</span>
            <span>{t('lobby.previewSepolia')}</span>
          </div>
          <Link
            to="/lobby"
            className="inline-block mt-16 px-10 py-3 border border-black/10 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-300 rounded-sm"
          >
            {t('lobby.previewBack')}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:px-10">
      {/* Breadcrumb & Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-16 border-b border-black/10 pb-12"
      >
        <div className="flex items-center gap-4 text-on-surface-variant font-sans text-[9px] font-bold uppercase tracking-[0.3em] mb-6 opacity-40">
          <Link to="/lobby" className="hover:text-secondary transition-colors">
            {t('auction.breadcrumb.archive')}
          </Link>
          <div className="w-1 h-1 bg-secondary rounded-full" />
          <span className="text-on-surface">
            {t('auction.breadcrumb.current')}
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="max-w-3xl">
            <h1 className="font-display text-6xl md:text-8xl font-bold text-on-surface mb-6 tracking-tighter leading-none">
              {t('auction.title')}
            </h1>
            <p className="text-on-surface-variant font-sans text-lg leading-relaxed opacity-80">
              {t('auction.description')}
              <span className="italic font-display text-secondary mx-1">
                {t('auction.descriptionHighlight')}
              </span>
            </p>
          </div>
          <div className="flex flex-col items-end shrink-0 border-l border-black/10 pl-8 pb-1">
            <span className="font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-2 opacity-40">
              {t('auction.contract.label')}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-display italic text-lg text-secondary">
                {shortContract}
              </span>
              <button
                onClick={() => copyWithFeedback(longContract, 'contract')}
                className="text-[9px] font-bold uppercase tracking-[0.2em] text-secondary/60 hover:text-secondary transition-colors"
              >
                {copiedField === 'contract'
                  ? t('auction.contract.copied')
                  : t('auction.contract.copy')}
              </button>
            </div>
            <a
              href={`https://sepolia.etherscan.io/address/${longContract}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] font-bold text-secondary/60 hover:text-secondary transition-colors uppercase tracking-[0.15em] mt-2 hover:underline underline-offset-2"
            >
              {t('auction.contract.viewOnChain')} &rarr;
            </a>
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Bidding Terminal (Left/Main) */}
        <div className="lg:col-span-8 space-y-16">
          {!isConnected ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="editorial-card p-12 relative overflow-hidden text-center"
            >
              <div className="absolute inset-0 noise-texture pointer-events-none" />
              <h2 className="font-display text-2xl font-bold italic mb-6">
                {t('auction.connectPrompt.title')}
              </h2>
              <p className="text-on-surface-variant mb-8">
                {t('auction.connectPrompt.subtitle')}
              </p>
              <button
                onClick={() => connect()}
                className="group px-12 py-4 bg-primary text-on-primary font-sans text-[11px] font-bold uppercase tracking-widest rounded-sm hover:scale-[0.98] transition-all duration-300 inline-flex items-center gap-2"
              >
                {t('auction.connectPrompt.cta')}
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                  &rarr;
                </span>
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={cn(
                'editorial-card p-12 relative overflow-hidden transition-shadow duration-500',
                inputFocused && 'shadow-lg border-secondary/20',
              )}
            >
              <div className="absolute inset-0 noise-texture pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-baseline justify-between mb-12 pb-8 border-b border-black/5 gap-4">
                <div className="flex items-baseline gap-4">
                  <h3 className="font-display text-2xl font-bold text-on-surface italic tracking-tight">
                    {t('auction.terminal.title')}
                  </h3>
                  <span
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm transition-colors duration-300',
                      ended
                        ? 'bg-black/5 text-on-surface-variant'
                        : 'bg-secondary/10 text-secondary',
                    )}
                  >
                    {t(STATUS_KEY[statusLabel] || 'auction.status.active')}
                  </span>
                </div>
                <div className="text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-40">
                  {t('auction.terminal.fhevmStatus')} {fhevmLabel}
                </div>
              </div>

              {/* Bid Input Section */}
              <div className="space-y-12">
                <div className="group">
                  <label
                    className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant block mb-6 opacity-60"
                    htmlFor="bid-amount"
                  >
                    {t('auction.form.bidAmount')}
                    <span className="ml-2 opacity-40">
                      {t('auction.form.unit')}
                    </span>
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
                      onFocus={() => setInputFocused(true)}
                      onBlur={() => setInputFocused(false)}
                      className={cn(
                        'w-full bg-transparent border-b-2 pb-4 font-display text-6xl text-on-surface focus:outline-none transition-all duration-300 placeholder:opacity-10',
                        inputFocused
                          ? 'border-secondary'
                          : 'border-black/20 hover:border-black/30',
                      )}
                      placeholder="000"
                    />
                    <div
                      className="absolute right-0 bottom-4 font-display text-2xl italic text-on-surface-variant tracking-tighter transition-opacity duration-300"
                      style={{ opacity: inputFocused ? 0.6 : 0.3 }}
                    >
                      Credits
                    </div>
                  </div>
                  {!isBidAmountValid && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[#a13d3d] text-xs mt-3"
                    >
                      {t('auction.form.error', { max: UINT32_MAX })}
                    </motion.div>
                  )}
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center pt-8">
                  <motion.button
                    onClick={handleBid}
                    disabled={!canBid || isPending}
                    whileHover={canBid && !isPending ? { scale: 1.01 } : {}}
                    whileTap={canBid && !isPending ? { scale: 0.98 } : {}}
                    className={cn(
                      'flex-grow h-16 font-sans text-xs font-bold uppercase tracking-[0.3em] transition-all duration-300 rounded-sm relative overflow-hidden',
                      canBid && !isPending
                        ? 'bg-primary text-on-primary hover:bg-secondary shadow-sm hover:shadow-md'
                        : 'bg-on-surface/20 text-on-surface-variant cursor-not-allowed',
                    )}
                  >
                    <span className="relative z-10">
                      {isPending
                        ? t('auction.form.confirming')
                        : t('auction.form.submit')}
                    </span>
                    {canBid && !isPending && (
                      <div className="absolute inset-0 bg-secondary opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    )}
                  </motion.button>
                  <p className="text-[10px] text-on-surface-variant font-sans max-w-[200px] leading-relaxed opacity-60 italic">
                    * {t('auction.form.notice')}
                  </p>
                </div>
              </div>

              <p className="text-on-surface-variant text-xs mt-8 min-h-[18px]">
                {translateStatus(status, t)}
              </p>
            </motion.div>
          )}

          {/* Activity Log */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="flex items-baseline justify-between border-b border-black/10 pb-4">
              <h3 className="font-display text-2xl font-bold italic tracking-tight">
                {t('auction.activity.title')}
              </h3>
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">
                {t('auction.activity.stream')}
              </span>
            </div>

            {events.length === 0 ? (
              <div className="py-8 border-b border-black/5 text-sm text-on-surface-variant font-sans opacity-60 italic">
                {t('auction.activity.empty')}
              </div>
            ) : (
              <div className="space-y-0 text-sm">
                {events.map((event, idx) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="grid grid-cols-3 py-6 border-b border-black/5 items-center font-sans tracking-tight"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full" />
                      <span className="font-bold">
                        {`Bid from ${event.bidder.slice(0, 8)}...`}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-secondary/60">
                        {t('auction.activity.sealed')}
                      </span>
                    </div>
                    <a
                      href={
                        event.txHash
                          ? `https://sepolia.etherscan.io/tx/${event.txHash}`
                          : undefined
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-right opacity-40 italic hover:opacity-70 transition-opacity"
                    >
                      {t('auction.activity.recent')}
                    </a>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Developer Controls */}
          {isConnected && ENABLE_TEST && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="p-8 bg-black/[0.03] border border-black/10 rounded-sm"
            >
              <div className="flex items-center justify-between gap-8 flex-wrap">
                <div>
                  <h2 className="font-display text-xl font-bold mb-1">
                    {t('auction.dev.title')}
                  </h2>
                  <p className="text-on-surface-variant text-xs">
                    {t('auction.dev.description')}
                  </p>
                </div>
                <div className="flex gap-4 flex-wrap">
                  <button
                    onClick={handleBidTrivial}
                    disabled={isPending || !isBidAmountValid}
                    className="px-6 py-2 border border-black/10 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-300 rounded-sm disabled:opacity-30"
                  >
                    {t('auction.dev.debugBid')}
                  </button>
                  {isOwner && !ended && (
                    <button
                      onClick={handleEndAuction}
                      disabled={isPending}
                      className="px-6 py-2 bg-[#a13d3d] text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:opacity-80 transition-all duration-300 rounded-sm disabled:opacity-30"
                    >
                      {t('auction.dev.endAuction')}
                    </button>
                  )}
                  {isOwner && ended && (
                    <button
                      onClick={handleRestartAuction}
                      disabled={isPending}
                      className="px-6 py-2 bg-secondary text-on-secondary text-[10px] font-bold uppercase tracking-[0.2em] hover:opacity-80 transition-all duration-300 rounded-sm disabled:opacity-30"
                    >
                      {t('auction.dev.restartAuction')}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Auction Metadata (Right Sidebar) */}
        <div className="lg:col-span-4 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="editorial-card aspect-[4/5] overflow-hidden group"
          >
            <div className="w-full h-full bg-gradient-to-br from-secondary/5 to-tertiary/10 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="text-center relative z-10">
                <div className="font-display text-6xl font-bold italic tracking-tighter mb-4 text-secondary/20 transition-all duration-700 group-hover:text-secondary/30 group-hover:scale-110">
                  SB
                </div>
                <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-secondary/40">
                  SilentBid
                </div>
              </div>
            </div>
          </motion.div>

          <div className="space-y-12 pt-8 border-t border-black/10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={stagger(0)}
              className="grid grid-cols-2 gap-12"
            >
              <div className="space-y-2">
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">
                  {t('auction.meta.auction')}
                </span>
                <div className="font-display text-4xl italic tracking-tighter">
                  {t(STATUS_KEY[statusLabel] || 'auction.status.active')}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">
                  {t('auction.meta.sealedBids')}
                </span>
                <div className="font-display text-4xl italic tracking-tighter">
                  {bidCount}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={stagger(1)}
              className="space-y-6"
            >
              {sidebarItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between font-sans text-[11px] font-semibold border-b border-black/5 pb-3 py-1"
                >
                  <span className="uppercase tracking-[0.1em] opacity-50 font-bold text-[9px]">
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      item.accent
                        ? 'text-secondary font-bold'
                        : 'text-on-surface',
                    )}
                  >
                    {item.val}
                  </span>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={stagger(2)}
              className="space-y-4"
            >
              <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">
                {t('auction.evidence.title')}
              </h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs items-center">
                    <span className="opacity-50">
                      {t('auction.evidence.contract')}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold tabular-nums">
                        {shortContract}
                      </span>
                      <button
                        onClick={() => copyWithFeedback(longContract, 'contract')}
                        className="text-[9px] font-bold uppercase tracking-[0.1em] text-secondary/60 hover:text-secondary transition-colors"
                      >
                        {copiedField === 'contract'
                          ? t('auction.contract.copied')
                          : t('auction.contract.copy')}
                      </button>
                    </div>
                  </div>
                  <a
                    href={`https://sepolia.etherscan.io/address/${longContract}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] font-bold text-secondary/60 hover:text-secondary transition-colors uppercase tracking-[0.15em] hover:underline underline-offset-2"
                  >
                    {t('auction.contract.viewOnChain')} &rarr;
                  </a>
                </div>
                <div>
                  <div className="flex justify-between text-xs items-center">
                    <span className="opacity-50">
                      {t('auction.evidence.latestWalletTx')}
                    </span>
                    {latestWalletTxHash ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold tabular-nums">
                          {latestWalletTxHash.slice(0, 6)}...
                          {latestWalletTxHash.slice(-4)}
                        </span>
                        <button
                          onClick={() =>
                            copyWithFeedback(latestWalletTxHash, 'walletTx')
                          }
                          className="text-[9px] font-bold uppercase tracking-[0.1em] text-secondary/60 hover:text-secondary transition-colors"
                        >
                          {copiedField === 'walletTx'
                            ? t('auction.contract.copied')
                            : t('auction.contract.copy')}
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] opacity-40 italic">
                        {t('auction.evidence.noWalletTx')}
                      </span>
                    )}
                  </div>
                  {latestWalletTxHash && (
                    <a
                      href={buildAlchemyTxLink(latestWalletTxHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] font-bold text-secondary/60 hover:text-secondary transition-colors uppercase tracking-[0.15em] hover:underline underline-offset-2"
                    >
                      {t('auction.evidence.viewOnAlchemy')} &rarr;
                    </a>
                  )}
                </div>
                {txHash && txHash !== latestWalletTxHash && (
                  <div>
                    <div className="flex justify-between text-xs items-center">
                      <span className="opacity-50">
                        {t('auction.evidence.latestTx')}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold tabular-nums">
                          {txHash.slice(0, 6)}...{txHash.slice(-4)}
                        </span>
                        <button
                          onClick={() => copyWithFeedback(txHash, 'walletTx')}
                          className="text-[9px] font-bold uppercase tracking-[0.1em] text-secondary/60 hover:text-secondary transition-colors"
                        >
                          {copiedField === 'walletTx'
                            ? t('auction.contract.copied')
                            : t('auction.contract.copy')}
                        </button>
                      </div>
                    </div>
                    <a
                      href={buildAlchemyTxLink(txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] font-bold text-secondary/60 hover:text-secondary transition-colors uppercase tracking-[0.15em] hover:underline underline-offset-2"
                    >
                      {t('auction.evidence.viewOnAlchemy')} &rarr;
                    </a>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={stagger(3)}
              className="space-y-4"
            >
              <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">
                {t('auction.rules.title')}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="block font-bold mb-1">
                    {t('auction.rules.visible')}
                  </span>
                  <p className="opacity-60">{t('auction.rules.visibleDesc')}</p>
                </div>
                <div>
                  <span className="block font-bold mb-1">
                    {t('auction.rules.hidden')}
                  </span>
                  <p className="opacity-60">{t('auction.rules.hiddenDesc')}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
