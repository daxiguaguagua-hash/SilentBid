import type { Locale } from "./en";

const zhCN: Locale = {
  nav: {
    archive: "拍卖列表",
    dashboard: "控制台",
    connectWallet: "连接钱包",
  },

  footer: {
    brand: "SilentBid",
    copyright: "© 2024 SilentBid. 基于 Zama FHEVM 不可见安全技术。",
    networkStatus: "网络状态",
    securityAudit: "安全审计",
    github: "GitHub",
    privacyPolicy: "隐私政策",
  },

  home: {
    eyebrow: "Zama FHEVM 密封拍卖",
    hero: {
      titleLine1: "沉默的",
      titleLine2: "出价",
      titleLine3: "",
      subtitle: "私密出价，公开结算。链上不出价明文。",
      connectWallet: "连接钱包",
      enterAuction: "进入拍卖",
    },
    exhibition: {
      label: "链上隐私",
      cryptoTitle: "数学确定性",
      cryptoLabel: "密码学",
      archTitle: "同态完整性",
      archLabel: "架构",
    },
    metrics: {
      auction: "拍卖",
      auctionValue: "密封中",
      auctionDesc: "FHEVM 保护",
      sealedBids: "密封出价",
      sealedBidsValue: "链上存证",
      sealedBidsDesc: "静态加密",
      fhevm: "FHEVM",
      fhevmValue: "就绪",
      fhevmDesc: "Zama 网络",
    },
    footer: {
      copyright: "© 2024 SilentBid",
      network: "Sepolia / Zama FHEVM",
      privacy: "隐私保护",
    },
  },

  lobby: {
    title: "档案库。",
    description: "通过全同态加密保护的密封竞价拍卖。",
    fheLabel: "全同态加密",
    filterActive: "进行中",
    filterResolved: "已结束",
        bidCount: "出价数: ",
    card: {
      badge: "实时拍卖",
      title: "SilentBid 拍卖",
      subtitle: "链上",
      description: "基于 Zama FHEVM 的密封竞价拍卖。所有出价在到达合约之前均已加密。",
      statusLabel: "状态",
      statusValue: "进行中",
        statusResolved: "已结束",
      viewDetails: "查看详情",
    },
    card2: {
      badge: "即将开始",
      title: "RWA 资产组合拍卖",
      subtitle: "Q3 上线",
      description: "代币化现实资产组合拍卖，面向机构的密封竞价系统，全程 FHE 隐私保护。",
      statusValue: "筹备中",
      viewDetails: "预览",
    },
    card3: {
      badge: "已结算",
      title: "DAO 财库拍卖",
      subtitle: "已完成",
      description: "去中心化拨款分配拍卖。通过 FHE 加密比较选出中标方案，竞标方案全程保密。",
      statusValue: "已定标",
      viewDetails: "回顾",
    },
    banner: {
      title: "安全审计：Zama FHEVM",
      description: "所有出价均通过 Zama FHEVM 在链上处理。加密在浏览器中完成，在交易离开钱包之前即完成，确保整个拍卖生命周期零泄露。",
      cta: "进入拍卖",
    },
  },

  auction: {
    breadcrumb: {
      archive: "档案库",
      current: "SilentBid 拍卖",
    },
    title: "SilentBid",
    description: "全同态加密盲拍。",
    descriptionHighlight: "所有出价在数学意义上不可见",
    contract: {
      label: "合约",
    },
    connectPrompt: {
      title: "连接钱包参与拍卖",
      subtitle: "使用 Sepolia 钱包以 BID Credits 提交私密出价。",
      cta: "连接钱包",
    },
    terminal: {
      title: "私密终端",
      fhevmStatus: "Zama FHEVM",
    },
    form: {
      bidAmount: "出价金额",
      unit: "BID Credits",
      error: "请输入 1 到 {max} 之间的整数 BID Credits。",
      submit: "提交密封出价",
      confirming: "确认中...",
      notice: "所有输入均在浏览器安全执行环境中本地加密。",
    },
    activity: {
      title: "活动日志",
      stream: "实时流",
      sealed: "已密封",
      recent: "最近",
    },
    dev: {
      title: "开发者测试控制",
      description: "明文出价仅用于调试状态刷新和合约连接。",
      debugBid: "调试明文出价",
      endAuction: "结束拍卖",
        restartAuction: "重启拍卖",
    },
    meta: {
      auction: "拍卖",
      sealedBids: "密封出价",
      typeLabel: "拍卖类型",
      typeValue: "密封竞价 (FHEVM)",
      unitLabel: "出价单位",
      unitValue: "BID Credits",
      securityLabel: "安全等级",
      securityValue: "最高 (FHEVM)",
      networkLabel: "网络",
      networkValue: "Sepolia",
    },
    evidence: {
      title: "链上证据",
      contract: "合约",
      latestTx: "最近交易",
    },
    rules: {
      title: "密封拍卖规则",
      visible: "公开",
      visibleDesc: "出价数量、钱包交易、合约地址。",
      hidden: "隐藏",
      hiddenDesc: "明文出价金额及未中标出价。",
    },
    status: {
      active: "进行中",
      closed: "已结束",
      expired: "已过期",
    },
  },

  dashboard: {
    titleLine1: "档案",
    titleLine2: "控制台。",
    description: "监控活跃 FHEVM 段的密码学流动性和结算状态。",
    disconnected: "连接钱包以访问控制台。",
    openAuction: "打开拍卖",
    wallet: {
      title: "钱包状态",
      network: "Sepolia",
      connectedAddress: "已连接地址",
      networkLabel: "网络",
      relayerInfo: "Zama FHEVM 中继器 V2",
    },
    profile: {
      name: "竞拍者",
      label: "Sepolia 钱包",
      cta: "提交密封出价",
    },
    quote: "\"档案记得一切，即使是它被设计要遗忘的事物。沉默是唯一真正的加密。\"",
  },

  status: {
    ready: "准备就绪，等待 Sepolia 私密出价。",
    fhevmUnavailable: "FHEVM: 钱包提供者不可用",
    loadingSDK: "正在加载 FHEVM SDK...",
    fhevmReady: "FHEVM 就绪",
    encrypting: "正在加密出价...",
    waitingWallet: "等待钱包确认...",
    bidSubmitted: "加密出价已提交: {hash}",
    trivialSubmitted: "明文出价已提交: {hash}",
    endSubmitted: "结束拍卖已提交: {hash}",
    restarted: "拍卖已重启: {hash}",
    error: "错误: {message}",
  },
};

export default zhCN;
