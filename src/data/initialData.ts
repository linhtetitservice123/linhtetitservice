import { Product, StoreSettings, Category, Order, Review } from '../types';

export const initialSettings: StoreSettings = {
  shopName: "Lin Htet IT Service",
  tagline: "Your Trusted Digital & IT Solutions Partner",
  phone: "09-789654321",
  email: "contact@linhtet-it.com",
  address: "Yangon, Myanmar",
  telegramUsername: "linhtet_itservice",
  telegramBotToken: "",
  telegramChatId: "",
  telegramChannelId: "",
  whatsappNumber: "959789654321",
  adminPasscode: "admin123",
  currency: "MMK",
  exchangeRateUsdToMmk: 4800,
  autoNotifyTelegram: true,
  autoPostProductsToTelegram: true,
  autoNotifyWhatsapp: true,
  paymentAccounts: [
    {
      id: "kpay",
      name: "KBZPay (KPay)",
      accountName: "LIN HTET",
      accountNumber: "09789654321",
      qrCode: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=80",
      note: "ကျေးဇူးပြု၍ Transaction ID (သို့) Slip ပေးပို့ပါ"
    },
    {
      id: "wavepay",
      name: "WavePay",
      accountName: "LIN HTET",
      accountNumber: "09789654321",
      qrCode: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=80",
      note: "WavePay Transfer ဖြင့် ငွေလွှဲနိုင်ပါသည်"
    },
    {
      id: "kbzbank",
      name: "KBZ Bank Special Account",
      accountName: "U LIN HTET",
      accountNumber: "0123-4567-8901-2345",
      qrCode: "",
      note: "Mobile Banking မှ တဆင့် လွှဲနိုင်ပါသည်"
    },
    {
      id: "ayabank",
      name: "AYA Pay / Bank",
      accountName: "LIN HTET",
      accountNumber: "200-1122-3344",
      qrCode: "",
      note: "AYA iBanking / AYA Pay"
    },
    {
      id: "usdt",
      name: "USDT (TRC20 / Binance Pay)",
      accountName: "LinHtet_Crypto",
      accountNumber: "TYDnyxyzTrc20AddressExampleLinHtet99",
      qrCode: "",
      note: "Crypto USDT TRC20 transfer accepted"
    }
  ]
};

export const initialCategories: Category[] = [
  { id: "all", name: "All Products", nameMm: "အားလုံး" },
  { id: "software_keys", name: "Software Licenses", nameMm: "ဆော့ဖ်ဝဲလ်လိုင်စင်များ" },
  { id: "subscriptions", name: "Subscriptions", nameMm: "အကောင့် & ဝန်ဆောင်မှု" },
  { id: "ai_tools", name: "AI & Productivity", nameMm: "AI နှင့် အဆင့်မြင့်တူးလ်များ" },
  { id: "vpn_security", name: "VPN & Security", nameMm: "VPN နှင့် လုံခြုံရေး" },
  { id: "dev_assets", name: "Source Code & Scripts", nameMm: "Source Code & Scripts" },
  { id: "gaming", name: "Gaming & Credits", nameMm: "ဂိမ်းနှင့် Wallet Cards" }
];

export const initialProducts: Product[] = [
  {
    id: "prod-1",
    title: "Windows 11 Pro Genuine Retail License",
    titleMm: "Windows 11 Pro မူရင်း Retail License Key (တစ်သက်တာသုံး)",
    category: "software_keys",
    price: 28000,
    priceUsd: 6,
    badge: "Best Seller",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    description: "Official 25-digit genuine retail license key for Windows 11 Pro 64-bit. Lifetime activation, multi-language support, direct updates from Microsoft.",
    deliveryType: "instant_key",
    stockStatus: "in_stock",
    availableKeys: [
      "W11P-LHT-8821-VK99-ABCD",
      "W11P-LHT-9932-NM77-EFGH",
      "W11P-LHT-1102-QP44-IJKL"
    ],
    features: [
      "Official Microsoft Activation",
      "Lifetime Validity (One PC)",
      "Upgrade from Win 11 Home supported",
      "BitLocker & Remote Desktop included",
      "Instant Email & Telegram Delivery"
    ],
    instructions: "Settings > System > Activation > Change product key ထဲတွင် ထည့်သွင်း အသုံးပြုနိုင်ပါသည်။"
  },
  {
    id: "prod-2",
    title: "Microsoft Office 365 Pro Plus (5 Devices)",
    titleMm: "Microsoft 365 Pro Plus (၅ လုံးသုံး - ၁ နှစ်စာ အကောင့်)",
    category: "software_keys",
    price: 45000,
    priceUsd: 9.5,
    badge: "Popular",
    image: "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&auto=format&fit=crop&q=80",
    description: "Word, Excel, PowerPoint, Outlook, OneNote with 1TB OneDrive Cloud Storage. Valid on 5 devices (Windows, Mac, Android, iOS).",
    deliveryType: "account_credentials",
    stockStatus: "in_stock",
    availableKeys: [
      "User: office_lh01@365lh.org | Pass: LinHtet#2026",
      "User: office_lh02@365lh.org | Pass: LinHtet#Office99"
    ],
    features: [
      "5 Devices Simultaneous Login",
      "1TB OneDrive High-Speed Cloud",
      "Latest Word, Excel & PowerPoint features",
      "1 Year Full Warranty Support"
    ],
    instructions: "portal.office.com တွင် ဝင်ရောက် sign-in ပြီး app download ပြုလုပ်နိုင်ပါသည်။"
  },
  {
    id: "prod-3",
    title: "Canva Pro 1-Year Private Mail Subscription",
    titleMm: "Canva Pro ၁ နှစ်စာ ပရိုအကောင့် (မိမိ Email ဖြင့်တိုက်ရိုက်)",
    category: "subscriptions",
    price: 25000,
    priceUsd: 5.5,
    badge: "Hot Deal",
    image: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800&auto=format&fit=crop&q=80",
    description: "Full access to 100M+ premium stock photos, videos, audio, graphics, background remover, brand kits, and unlimited resize.",
    deliveryType: "manual_delivery",
    stockStatus: "in_stock",
    availableKeys: [],
    features: [
      "Your Own Email Upgrade",
      "Magic Studio AI Features unlocked",
      "Premium Templates & Elements",
      "1TB Cloud Storage Included",
      "1 Year Replacement Warranty"
    ],
    instructions: "ဝယ်ယူပြီးနောက် သင့် Canva email ပေးပို့ပါက 5-15 မိနစ်အတွင်း Invite link ပို့ပေးပါမည်။"
  },
  {
    id: "prod-4",
    title: "ChatGPT Plus & Claude Pro Shared Access (1 Month)",
    titleMm: "ChatGPT Plus (GPT-4o) & Claude 3.5 Sonnet (၁ လစာ)",
    category: "ai_tools",
    price: 32000,
    priceUsd: 7,
    badge: "AI Trending",
    image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80",
    description: "Access latest OpenAI GPT-4o, DALL-E 3 image generation, Canvas, and Anthropic Claude 3.5 Sonnet coding intelligence.",
    deliveryType: "account_credentials",
    stockStatus: "in_stock",
    availableKeys: [
      "Acc: gptplus_lh10@linhtet.pro | Key: AiPro#99812",
      "Acc: gptplus_lh11@linhtet.pro | Key: AiPro#11294"
    ],
    features: [
      "Fast response & no strict rate limit",
      "Latest Vision & File Analysis",
      "Code Generation & Writing Assistant",
      "Direct Web Login"
    ],
    instructions: "ပေးပို့သော Login အချက်အလက်ဖြင့် တိုက်ရိုက် Login ဝင်ရောက်အသုံးပြုပါ။"
  },
  {
    id: "prod-5",
    title: "ExpressVPN Premium High-Speed (1 Month / 1 Year)",
    titleMm: "ExpressVPN မြန်နှုန်းမြင့် Premium လိုင်စင် (လုံခြုံစိတ်ချရ)",
    category: "vpn_security",
    price: 18000,
    priceUsd: 4,
    badge: "High Speed",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
    description: "Ultra-fast servers in 105+ countries. Military-grade encryption, Lightway protocol, bypass geo-restrictions and ISP blockages seamlessly.",
    deliveryType: "instant_key",
    stockStatus: "in_stock",
    availableKeys: [
      "EVPN-LH-CODE-9821-XMAQ",
      "EVPN-LH-CODE-4412-ZKLW"
    ],
    features: [
      "Ultra Fast Singapore & US Servers",
      "Bypass all blocked sites & games",
      "No activity & connection logs",
      "Multi-platform (PC, Android, iOS)"
    ],
    instructions: "ExpressVPN app ထဲတွင် Activation Code ထည့်ပြီး တန်းသုံးနိုင်ပါသည်။"
  },
  {
    id: "prod-6",
    title: "Telegram Premium 1-Year Gift Code",
    titleMm: "Telegram Premium ၁ နှစ်စာ တရားဝင် Gift Code",
    category: "subscriptions",
    price: 78000,
    priceUsd: 16.5,
    badge: "Official",
    image: "https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=800&auto=format&fit=crop&q=80",
    description: "Double limits, 4GB file uploads, faster download speed, voice-to-text conversion, premium stickers, badge on profile and animated emojis.",
    deliveryType: "instant_key",
    stockStatus: "in_stock",
    availableKeys: [
      "https://t.me/giftcode/LH_TGPREM_1YR_9941",
      "https://t.me/giftcode/LH_TGPREM_1YR_8832"
    ],
    features: [
      "Official Telegram Gift Link",
      "4 GB Uploads & Doubled limits",
      "Voice-to-Text Transcription",
      "Exclusive Star & Premium Badge"
    ],
    instructions: "Telegram Gift link ကို နှိပ်ပြီး Claim ပြုလုပ်လိုက်ပါက မိမိ Telegram account ပေါ်တွင် တန်းရောက်ပါမည်။"
  },
  {
    id: "prod-7",
    title: "Full-Stack E-Commerce Source Code & Deployment Pack",
    titleMm: "Full-Stack E-Commerce Website Source Code (React + Node.js)",
    category: "dev_assets",
    price: 120000,
    priceUsd: 25,
    badge: "Developer",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    description: "Complete production-ready e-commerce web platform code with Admin Dashboard, Order notifications, Payment Gateway integration, and setup video guide.",
    deliveryType: "download_link",
    stockStatus: "in_stock",
    availableKeys: [
      "https://download.linhtet-it.com/source/LH_Fullstack_Ecommerce_v2.4_bundle.zip?token=lh99x"
    ],
    features: [
      "Clean TypeScript & React Code",
      "Tailwind CSS Modern UI",
      "Express REST APIs & SQLite/JSON DB",
      "Step-by-step Installation Video"
    ],
    instructions: "Download link မှ Zip ဖိုင်ဒေါင်းလုပ်ဆွဲပြီး README.md အတိုင်း run နိုင်ပါသည်။"
  },
  {
    id: "prod-8",
    title: "Steam Wallet $10 / $20 Global Code",
    titleMm: "Steam Wallet Card Code (ဂိမ်းဝယ်ရန် Global Code)",
    category: "gaming",
    price: 52000,
    priceUsd: 11,
    badge: "Instant",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80",
    description: "Instant Steam digital gift card code. Redeemable on any Steam region, funds added immediately to buy CS2 skins, Dota 2, GTA, Black Myth: Wukong and more.",
    deliveryType: "instant_key",
    stockStatus: "in_stock",
    availableKeys: [
      "STEAM-LH-9901-XK92-8871",
      "STEAM-LH-3341-LL89-4450"
    ],
    features: [
      "100% Genuine Digital Code",
      "Global Region Compatible",
      "Immediate Delivery",
      "Guaranteed Zero-Ban"
    ],
    instructions: "Steam app > Games > Redeem a Steam Wallet Code တွင် ထည့်သွင်းနိုင်ပါသည်။"
  }
];

export const initialOrders: Order[] = [
  {
    id: "LH-84920",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    customerName: "Aung Kyaw Thu",
    customerPhone: "09971234567",
    customerEmail: "aungkyaw@gmail.com",
    customerTelegram: "@aungkyaw_dev",
    customerWhatsapp: "09971234567",
    customerNote: "Windows 11 key အမြန်လိုချင်ပါတယ်ခင်ဗျာ",
    items: [
      {
        productId: "prod-1",
        title: "Windows 11 Pro Genuine Retail License",
        price: 28000,
        quantity: 1,
        deliveryType: "instant_key"
      }
    ],
    totalAmount: 28000,
    paymentMethod: "KBZPay (KPay)",
    paymentRef: "KPay-88392019",
    paymentSlipUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
    status: "delivered",
    deliveredKeys: ["W11P-LHT-8821-VK99-ABCD"],
    adminNote: "Delivered via Telegram & email automatically."
  },
  {
    id: "LH-84921",
    createdAt: new Date(Date.now() - 3600000 * 0.5).toISOString(),
    customerName: "Daw Nilar Win",
    customerPhone: "09450098765",
    customerEmail: "nilar.win@outlook.com",
    customerTelegram: "@nilar_design",
    customerWhatsapp: "09450098765",
    customerNote: "Canva Pro ၁ နှစ်စာ အတွက်ပါ",
    items: [
      {
        productId: "prod-3",
        title: "Canva Pro 1-Year Private Mail Subscription",
        price: 25000,
        quantity: 1,
        deliveryType: "manual_delivery"
      }
    ],
    totalAmount: 25000,
    paymentMethod: "WavePay",
    paymentRef: "WAVE-9920104",
    paymentSlipUrl: "",
    status: "pending",
    deliveredKeys: [],
    adminNote: "Awaiting payment verification"
  }
];

export const initialReviews: Review[] = [
  {
    id: "rev-1",
    productId: "prod-1",
    productTitle: "Windows 11 Pro Genuine Retail License",
    customerName: "Aung Myo Thu",
    rating: 5,
    comment: "Windows 11 Pro Retail Key ဝယ်ပြီး ၅ မိနစ်တောင်မကြာဘူး Telegram မှာ တန်းရောက်လာတယ်။ Activation တန်းဖြစ်ပါတယ်၊ အဆင်ပြေလွန်းလို့ ကျေးဇူးပါ Lin Htet IT Service!",
    commentMm: "Windows 11 Pro Retail Key ဝယ်ပြီး ၅ မိနစ်တောင်မကြာဘူး Telegram မှာ တန်းရောက်လာတယ်။ Activation တန်းဖြစ်ပါတယ်၊ အဆင်ပြေလွန်းလို့ ကျေးဇူးပါ Lin Htet IT Service!",
    verifiedPurchase: true,
    likes: 18,
    createdAt: new Date(Date.now() - 3600000 * 24 * 1.5).toISOString()
  },
  {
    id: "rev-2",
    productId: "prod-3",
    productTitle: "Canva Pro 1-Year Private Mail Subscription",
    customerName: "Ma Hnin Ei Phyu",
    rating: 5,
    comment: "Canva Pro ကို ကိုယ်ပိုင် email နဲ့ ချက်ချင်း upgrade လုပ်ပေးတယ်။ Magic Studio နဲ့ AI tools တွေ အကုန်သုံးလို့ရတယ်။ စျေးလည်းအရမ်းတန်တယ်၊ Support ကလည်း မေးတာနဲ့ ချက်ချင်းပြန်ဖြေပေးပါတယ် ❤️",
    commentMm: "Canva Pro ကို ကိုယ်ပိုင် email နဲ့ ချက်ချင်း upgrade လုပ်ပေးတယ်။ Magic Studio နဲ့ AI tools တွေ အကုန်သုံးလို့ရတယ်။ စျေးလည်းအရမ်းတန်တယ်၊ Support ကလည်း မေးတာနဲ့ ချက်ချင်းပြန်ဖြေပေးပါတယ် ❤️",
    verifiedPurchase: true,
    likes: 14,
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  },
  {
    id: "rev-3",
    productId: "prod-2",
    productTitle: "Microsoft Office 365 Pro Plus (5 Devices)",
    customerName: "Ko Kyaw Swar (Freelancer)",
    rating: 5,
    comment: "Office 365 Pro Plus 5 Devices အကောင့် ဝယ်သုံးတာ Mac ရော PC ရော အကုန် sign in ရတယ်။ 1TB OneDrive ပါတော့ ဓာတ်ပုံနဲ့ ဒေတာ သိမ်းရတာအရမ်းအဆင်ပြေတယ်။ စိတ်ချရတဲ့ဆိုင်ပါ!",
    commentMm: "Office 365 Pro Plus 5 Devices အကောင့် ဝယ်သုံးတာ Mac ရော PC ရော အကုန် sign in ရတယ်။ 1TB OneDrive ပါတော့ ဓာတ်ပုံနဲ့ ဒေတာ သိမ်းရတာအရမ်းအဆင်ပြေတယ်။ စိတ်ချရတဲ့ဆိုင်ပါ!",
    verifiedPurchase: true,
    likes: 11,
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
  },
  {
    id: "rev-4",
    productId: "prod-4",
    productTitle: "ChatGPT Plus & Claude Pro Shared Access (1 Month)",
    customerName: "Thuta Bo Bo",
    rating: 5,
    comment: "Claude 3.5 Sonnet နဲ့ GPT-4o သုံးရတာ တကယ်လန်းတယ်။ Coding ရေးတဲ့သူတွေအတွက် မရှိမဖြစ်ပါပဲ။ KPay နဲ့ ငွေလွှဲပြီးတာနဲ့ Login အချက်အလက် တန်းရပါတယ်!",
    commentMm: "Claude 3.5 Sonnet နဲ့ GPT-4o သုံးရတာ တကယ်လန်းတယ်။ Coding ရေးတဲ့သူတွေအတွက် မရှိမဖြစ်ပါပဲ။ KPay နဲ့ ငွေလွှဲပြီးတာနဲ့ Login အချက်အလက် တန်းရပါတယ်!",
    verifiedPurchase: true,
    likes: 9,
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString()
  },
  {
    id: "rev-5",
    productId: "prod-5",
    productTitle: "ExpressVPN Premium High-Speed (1 Month / 1 Year)",
    customerName: "Min Khant Zaw",
    rating: 5,
    comment: "ExpressVPN activation code တန်းရပြီး ချိတ်သုံးရတာ အဆင်ပြေတယ်။ Singapore server ping ကောင်းပြီး လိုင်းမကျတော့ စိတ်အေးလက်အေး ဂိမ်းဆော့လို့ရတယ်။",
    commentMm: "ExpressVPN activation code တန်းရပြီး ချိတ်သုံးရတာ အဆင်ပြေတယ်။ Singapore server ping ကောင်းပြီး လိုင်းမကျတော့ စိတ်အေးလက်အေး ဂိမ်းဆော့လို့ရတယ်။",
    verifiedPurchase: true,
    likes: 7,
    createdAt: new Date(Date.now() - 3600000 * 24 * 9).toISOString()
  },
  {
    id: "rev-6",
    productId: "prod-6",
    productTitle: "Telegram Premium 1-Year Gift Code",
    customerName: "Daw Su Mon",
    rating: 5,
    comment: "Telegram Premium gift link လေး click နှိပ်လိုက်တာနဲ့ မိမိ account မှာ Star badge တန်းတက်လာတယ်။ မြန်ဆန်ပြီး ယုံကြည်စိတ်ချရတဲ့ ဝန်ဆောင်မှုပါ။ Recommend ပေးပါတယ်!",
    commentMm: "Telegram Premium gift link လေး click နှိပ်လိုက်တာနဲ့ မိမိ account မှာ Star badge တန်းတက်လာတယ်။ မြန်ဆန်ပြီး ယုံကြည်စိတ်ချရတဲ့ ဝန်ဆောင်မှုပါ။ Recommend ပေးပါတယ်!",
    verifiedPurchase: true,
    likes: 16,
    createdAt: new Date(Date.now() - 3600000 * 24 * 12).toISOString()
  },
  {
    id: "rev-7",
    productId: "prod-7",
    productTitle: "Full-Stack E-Commerce Source Code & Deployment Pack",
    customerName: "Nay Lin Oo (Developer)",
    rating: 4,
    comment: "Source code တည်ဆောက်ပုံ သန့်ရှင်းပြီး TypeScript, Tailwind CSS, Express API တွေ စနစ်တကျ ရေးထားတာ တွေ့ရတယ်။ Documentation လည်း ပြည့်စုံပါတယ်!",
    commentMm: "Source code တည်ဆောက်ပုံ သန့်ရှင်းပြီး TypeScript, Tailwind CSS, Express API တွေ စနစ်တကျ ရေးထားတာ တွေ့ရတယ်။ Documentation လည်း ပြည့်စုံပါတယ်!",
    verifiedPurchase: true,
    likes: 8,
    createdAt: new Date(Date.now() - 3600000 * 24 * 15).toISOString()
  }
];
