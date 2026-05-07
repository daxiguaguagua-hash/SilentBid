const en = {
  nav: {
    archive: "Archive",
    dashboard: "Dashboard",
    connectWallet: "Connect Wallet",
  },

  footer: {
    brand: "SilentBid",
    copyright: "© 2024 SilentBid. Powered by Zama FHEVM Invisible Security.",
    networkStatus: "Network Status",
    securityAudit: "Security Audit",
    github: "GitHub",
    privacyPolicy: "Privacy Policy",
  },

  home: {
    eyebrow: "Zama FHEVM sealed auction",
    hero: {
      titleLine1: "The",
      titleLine2: "Silence of",
      titleLine3: "the Bids",
      subtitle: "Private bids. Public settlement. No plaintext bid amounts on-chain.",
      connectWallet: "Connect Wallet",
      enterAuction: "Enter Auction",
    },
    exhibition: {
      label: "On-chain Privacy",
      cryptoTitle: "Mathematical Certainty",
      cryptoLabel: "Cryptography",
      archTitle: "Homomorphic Integrity",
      archLabel: "Architecture",
    },
    metrics: {
      auction: "Auction",
      auctionValue: "Sealed",
      auctionDesc: "FHEVM Protected",
      sealedBids: "Sealed bids",
      sealedBidsValue: "On-chain",
      sealedBidsDesc: "Encrypted at Rest",
      fhevm: "FHEVM",
      fhevmValue: "Ready",
      fhevmDesc: "Zama Network",
    },
    footer: {
      copyright: "© 2024 SilentBid",
      network: "Sepolia / Zama FHEVM",
      privacy: "Privacy Preserved",
    },
  },

  lobby: {
    title: "Archive.",
    description: "A privacy-preserving sealed-bid auction secured through Fully Homomorphic Encryption.",
    fheLabel: "Fully Homomorphic Encryption",
    filterActive: "Active",
    filterResolved: "Resolved",
        bidCount: "Bids: ",
    card: {
      badge: "Live Auction",
      title: "SilentBid Auction",
      subtitle: "On-chain",
      description: "Sealed-bid auction on Zama FHEVM. All bids encrypted before reaching the contract.",
      statusLabel: "Status",
      statusValue: "Active",
        statusResolved: "Ended",
      viewDetails: "View Details",
    },
    banner: {
      title: "Security Audit: Zama FHEVM",
      description: "All bids are processed on-chain using Zama's FHEVM. Encryption happens in the browser before the transaction leaves your wallet, ensuring zero-leakage throughout the auction lifecycle.",
      cta: "Enter Auction",
    },
  },

  auction: {
    breadcrumb: {
      archive: "Archive",
      current: "SilentBid Auction",
    },
    title: "SilentBid",
    description: "A fully homomorphic encrypted blind auction.",
    descriptionHighlight: "All bids are mathematically invisible",
    contract: {
      label: "Contract",
    },
    connectPrompt: {
      title: "Connect to enter the auction",
      subtitle: "Use a Sepolia wallet to place a private bid in BID Credits.",
      cta: "Connect Wallet",
    },
    terminal: {
      title: "Private Terminal",
      fhevmStatus: "Zama FHEVM",
    },
    form: {
      bidAmount: "Bid amount",
      unit: "BID Credits",
      error: "Use a whole number from 1 to {max} BID Credits.",
      submit: "Place Private Bid",
      confirming: "Confirming...",
      notice: "All inputs are locally encrypted within the secure browser execution environment.",
    },
    activity: {
      title: "Activity Log",
      stream: "Real-time Stream",
      sealed: "Sealed",
      recent: "Recent",
    },
    dev: {
      title: "Developer test controls",
      description: "Plain bids are only for debugging state refresh and contract wiring.",
      debugBid: "Debug Plain Bid",
      endAuction: "End Auction",
    },
    meta: {
      auction: "Auction",
      sealedBids: "Sealed bids",
      typeLabel: "Auction Type",
      typeValue: "Sealed-Bid (FHEVM)",
      unitLabel: "Bid Unit",
      unitValue: "BID Credits",
      securityLabel: "Security Grade",
      securityValue: "MAX (FHEVM)",
      networkLabel: "Network",
      networkValue: "Sepolia",
    },
    evidence: {
      title: "On-chain evidence",
      contract: "Contract",
      latestTx: "Latest tx",
    },
    rules: {
      title: "Sealed auction rules",
      visible: "Visible",
      visibleDesc: "Bid count, wallet transaction, contract address.",
      hidden: "Hidden",
      hiddenDesc: "Plaintext bid amounts and losing bid values.",
    },
    status: {
      active: "Active",
      closed: "Closed",
      expired: "Expired",
    },
  },

  dashboard: {
    titleLine1: "Archive",
    titleLine2: "Control.",
    description: "Monitoring cryptographic liquidity and settlement status across active FHEVM segments.",
    disconnected: "Connect your wallet to access the dashboard.",
    openAuction: "Open Auction",
    wallet: {
      title: "Wallet Status",
      network: "Sepolia",
      connectedAddress: "Connected Address",
      networkLabel: "Network",
      relayerInfo: "Zama FHEVM Relayer V2",
    },
    profile: {
      name: "Bidder",
      label: "Sepolia Wallet",
      cta: "Place Private Bid",
    },
    quote: "\"The archive remembers everything, even the things it was designed to forget. Silence is the only true encryption.\"",
  },

  status: {
    ready: "Ready for a private Sepolia bid.",
    fhevmUnavailable: "FHEVM: wallet provider unavailable",
    loadingSDK: "Loading FHEVM SDK...",
    fhevmReady: "FHEVM ready",
    encrypting: "Encrypting bid...",
    waitingWallet: "Waiting for wallet confirmation...",
    bidSubmitted: "Encrypted bid submitted: {hash}",
    trivialSubmitted: "Trivial bid submitted: {hash}",
    endSubmitted: "End auction submitted: {hash}",
    error: "Error: {message}",
  },
} as const;

export default en;

type DeepString<T> = T extends string ? string : { [K in keyof T]: DeepString<T[K]> };
export type Locale = DeepString<typeof en>;
