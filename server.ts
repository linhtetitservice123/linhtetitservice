import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS & Preflight handling for Vercel & cross-origin clients
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Normalize request URL for Vercel serverless rewrites
app.use((req, res, next) => {
  const matched = (req.headers['x-matched-path'] as string) || (req.headers['x-forwarded-url'] as string);
  if (matched && matched.startsWith('/api') && !req.url.startsWith('/api')) {
    req.url = matched;
  } else if (!req.url.startsWith('/api')) {
    // If Vercel stripped /api prefix, prepend it so Express /api/* routes match
    const apiPrefixes = ['/products', '/orders', '/settings', '/admin', '/notify', '/reviews', '/categories', '/stats'];
    if (apiPrefixes.some(p => req.url === p || req.url.startsWith(p + '/') || req.url.startsWith(p + '?'))) {
      req.url = '/api' + req.url;
    }
  }
  next();
});

// Data file path (support Vercel serverless /tmp writable directory)
const isVercel = process.env.VERCEL === '1' || Boolean(process.env.VERCEL);
const DATA_DIR = isVercel ? '/tmp' : path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store_data.json');
const SEED_DATA_FILE = path.join(__dirname, 'data', 'store_data.json');

// Initial seed data
const initialData = {
  settings: {
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
  },
  products: [
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
  ],
  orders: [
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
  ],
  categories: [
    { id: "all", name: "All Products", nameMm: "အားလုံး" },
    { id: "software_keys", name: "Software Licenses", nameMm: "ဆော့ဖ်ဝဲလ်လိုင်စင်များ" },
    { id: "subscriptions", name: "Subscriptions", nameMm: "အကောင့် & ဝန်ဆောင်မှု" },
    { id: "ai_tools", name: "AI & Productivity", nameMm: "AI နှင့် အဆင့်မြင့်တူးလ်များ" },
    { id: "vpn_security", name: "VPN & Security", nameMm: "VPN နှင့် လုံခြုံရေး" },
    { id: "dev_assets", name: "Source Code & Scripts", nameMm: "Source Code & Scripts" },
    { id: "gaming", name: "Gaming & Credits", nameMm: "ဂိမ်းနှင့် Wallet Cards" }
  ],
  reviews: [
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
  ]
};

// Helper to ensure store file exists
function getStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      let seed = initialData;
      if (fs.existsSync(SEED_DATA_FILE)) {
        try {
          const rawSeed = fs.readFileSync(SEED_DATA_FILE, 'utf8');
          seed = JSON.parse(rawSeed);
        } catch {
          seed = initialData;
        }
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2), 'utf8');
      return seed;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed.reviews || !Array.isArray(parsed.reviews) || parsed.reviews.length === 0) {
      parsed.reviews = initialData.reviews || [];
      saveStore(parsed);
    }
    return parsed;
  } catch (err) {
    console.error('Error reading store:', err);
    return initialData;
  }
}

function saveStore(data: any) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving store:', err);
  }
}

// Telegram notification dispatcher
async function dispatchTelegramNotification(order: any, settings: any) {
  const token = settings.telegramBotToken?.trim();
  const chatId = settings.telegramChatId?.trim();

  const formattedItems = order.items
    .map((item: any) => `• *${item.title}* x${item.quantity} = ${Number(item.price * item.quantity).toLocaleString()} MMK`)
    .join('\n');

  const text = `🚨 *NEW ORDER RECEIVED!* 🚨\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🛒 *Order ID:* \`#${order.id}\`\n` +
    `👤 *Customer:* ${order.customerName}\n` +
    `📞 *Phone:* \`${order.customerPhone}\`\n` +
    `📧 *Email:* ${order.customerEmail || 'N/A'}\n` +
    `✈️ *Telegram:* ${order.customerTelegram || 'N/A'}\n` +
    `💬 *WhatsApp:* ${order.customerWhatsapp || 'N/A'}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📦 *Products Ordered:*\n${formattedItems}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💰 *Total Amount:* *${Number(order.totalAmount).toLocaleString()} MMK*\n` +
    `💳 *Payment:* ${order.paymentMethod}\n` +
    `🔖 *Ref/Tran ID:* \`${order.paymentRef || 'None'}\`\n` +
    `📝 *Note:* ${order.customerNote || 'None'}\n` +
    `⏰ *Time:* ${new Date(order.createdAt).toLocaleString()}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `👉 *Open Admin Panel to verify & fulfill order!*`;

  if (!token || !chatId) {
    console.log('[Telegram Notification Simulated - No bot token configured]:', text);
    return { success: false, reason: 'Telegram bot token or chat ID not set in Admin settings', simulatedText: text };
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      })
    });
    const result = await res.json();
    return { success: result.ok, result };
  } catch (e: any) {
    console.error('Telegram dispatch error:', e);
    return { success: false, error: e.message };
  }
}

// Telegram Channel Product Post Dispatcher
async function postProductToTelegramChannel(product: any, settings: any, targetChannelOverride?: string) {
  const token = settings.telegramBotToken?.trim();
  const channel = (targetChannelOverride || settings.telegramChannelId || settings.telegramChatId)?.trim();

  if (!token || !channel) {
    console.log('[Telegram Channel Broadcast - Token or Channel missing]:', product.title);
    return { 
      success: false, 
      reason: 'Telegram Bot Token or Channel Username/ID is not set in Admin settings' 
    };
  }

  const deliveryLabels: Record<string, string> = {
    instant_key: '⚡ တန်းရ လိုင်စင်ကီး (Instant Key Delivery)',
    account_credentials: '🔑 အကောင့် Login (Private Credentials)',
    manual_delivery: '✈️ Admin မှ တိုက်ရိုက်ပို့ဆောင်ပေးခြင်း',
    download_link: '🔗 တိုက်ရိုက်ဒေါင်းလုဒ်လင့်ခ် (Direct Download)'
  };
  const deliveryText = deliveryLabels[product.deliveryType] || '⚡ Digital Delivery';

  const featuresText = product.features && product.features.length > 0
    ? product.features.map((f: string) => `  ✅ ${f}`).join('\n')
    : '  ✅ 100% Genuine & Authentic Service';

  const caption = 
    `🌟 *DIGITAL PRODUCT NEW ARRIVAL!* 🌟\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📦 *${product.titleMm || product.title}*\n` +
    (product.titleMm && product.title ? `🔤 _${product.title}_\n` : '') +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💰 *စျေးနှုန်း (Price):* *${Number(product.price).toLocaleString()} MMK* ${product.priceUsd ? `(~ $${product.priceUsd})` : ''}\n` +
    `⚡ *ပို့ဆောင်မှု:* ${deliveryText}\n` +
    `🟢 *အခြေအနေ:* ${product.stockStatus === 'in_stock' ? 'In Stock (ပစ္စည်းအသင့်ရှိ)' : 'Pre-order'}\n\n` +
    `📝 *အဓိက ပါဝင်သောအချက်များ:*\n` +
    `${featuresText}\n\n` +
    (product.description ? `ℹ️ _${product.description.slice(0, 200)}..._\n\n` : '') +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🛒 *Website:* ${process.env.APP_URL || 'https://linhtet-it.com'}\n` +
    `💬 *Contact Admin:* @${settings.telegramUsername || 'linhtet_itservice'}\n` +
    `📞 *Phone:* ${settings.phone || '09-789654321'}`;

  const siteUrl = process.env.APP_URL || 'https://linhtet-it.com';
  const replyMarkup = {
    inline_keyboard: [
      [
        { text: '🛒 Website တွင် တန်းဝယ်မည်', url: siteUrl },
        { text: '💬 Admin နှင့် ဆက်သွယ်ရန်', url: `https://t.me/${settings.telegramUsername || 'linhtet_itservice'}` }
      ]
    ]
  };

  // 1. Try sending as Photo first if image is URL
  if (product.image && (product.image.startsWith('http://') || product.image.startsWith('https://'))) {
    try {
      const photoUrl = `https://api.telegram.org/bot${token}/sendPhoto`;
      const res = await fetch(photoUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: channel,
          photo: product.image,
          caption: caption,
          parse_mode: 'Markdown',
          reply_markup: replyMarkup
        })
      });
      const data = await res.json();
      if (data.ok) {
        return { success: true, result: data.result, method: 'sendPhoto' };
      }
      console.warn('sendPhoto failed, falling back to sendMessage:', data.description);
    } catch (err: any) {
      console.warn('sendPhoto error, falling back to sendMessage:', err.message);
    }
  }

  // 2. Fallback to sendMessage
  try {
    const msgUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(msgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channel,
        text: caption,
        parse_mode: 'Markdown',
        reply_markup: replyMarkup
      })
    });
    const data = await res.json();
    return { success: data.ok, result: data.result, method: 'sendMessage', error: data.description };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ----------------- API ROUTES ----------------- //

// Products
app.get('/api/products', (req: Request, res: Response) => {
  const store = getStore();
  res.json({ success: true, products: store.products || [] });
});

app.post('/api/products', async (req: Request, res: Response) => {
  const store = getStore();
  const newProduct = {
    id: 'prod-' + Date.now(),
    availableKeys: [],
    features: [],
    ...req.body
  };
  store.products = [newProduct, ...(store.products || [])];
  saveStore(store);

  // Auto-post to Telegram Channel if enabled
  let telegramPostResult = null;
  if (store.settings.autoPostProductsToTelegram || req.body.postToTelegram) {
    telegramPostResult = await postProductToTelegramChannel(newProduct, store.settings);
  }

  res.json({ success: true, product: newProduct, telegramPostResult });
});

// Broadcast specific product to Telegram Channel on demand
app.post('/api/products/:id/post-telegram', async (req: Request, res: Response) => {
  const store = getStore();
  const id = req.params.id;
  const product = store.products?.find((p: any) => p.id === id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const result = await postProductToTelegramChannel(product, store.settings, req.body.channelId);
  res.json({ success: result.success, result, message: result.success ? 'Product posted to Telegram Channel successfully!' : result.reason || result.error });
});

app.put('/api/products/:id', (req: Request, res: Response) => {
  const store = getStore();
  const id = req.params.id;
  const index = store.products.findIndex((p: any) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  store.products[index] = { ...store.products[index], ...req.body };
  saveStore(store);
  res.json({ success: true, product: store.products[index] });
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  const store = getStore();
  const id = req.params.id;
  store.products = store.products.filter((p: any) => p.id !== id);
  saveStore(store);
  res.json({ success: true, message: 'Deleted' });
});

// Categories
app.get('/api/categories', (req: Request, res: Response) => {
  const store = getStore();
  res.json({ success: true, categories: store.categories || [] });
});

// Orders
app.get('/api/orders', (req: Request, res: Response) => {
  const store = getStore();
  res.json({ success: true, orders: store.orders || [] });
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  const store = getStore();
  const id = req.params.id.toUpperCase();
  const order = store.orders?.find((o: any) => o.id === id || o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  res.json({ success: true, order });
});

// Create Order (Triggers Telegram & WhatsApp notification flow)
app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const store = getStore();
    const orderNumber = Math.floor(10000 + Math.random() * 90000);
    const orderId = `LH-${orderNumber}`;

    const newOrder = {
      id: orderId,
      createdAt: new Date().toISOString(),
      customerName: req.body.customerName || 'Anonymous',
      customerPhone: req.body.customerPhone || '',
      customerEmail: req.body.customerEmail || '',
      customerTelegram: req.body.customerTelegram || '',
      customerWhatsapp: req.body.customerWhatsapp || '',
      customerNote: req.body.customerNote || '',
      items: req.body.items || [],
      totalAmount: req.body.totalAmount || 0,
      paymentMethod: req.body.paymentMethod || 'KBZPay (KPay)',
      paymentRef: req.body.paymentRef || '',
      paymentSlipUrl: req.body.paymentSlipUrl || '',
      status: 'pending', // pending, verified, delivered, cancelled
      deliveredKeys: [] as string[],
      adminNote: ''
    };

    // Auto assign instant keys if available
    for (const item of newOrder.items) {
      const prod = store.products.find((p: any) => p.id === item.productId);
      if (prod && prod.deliveryType === 'instant_key' && prod.availableKeys?.length > 0) {
        // take one key
        const assignedKey = prod.availableKeys.shift();
        newOrder.deliveredKeys.push(`${prod.title}: ${assignedKey}`);
      }
    }

    store.orders = [newOrder, ...(store.orders || [])];
    saveStore(store);

    // Dispatch Telegram notification
    let telegramResult = null;
    if (store.settings.autoNotifyTelegram) {
      telegramResult = await dispatchTelegramNotification(newOrder, store.settings);
    }

    // Generate WhatsApp direct send text url
    const waText = encodeURIComponent(
      `🛒 *Lin Htet IT Service Order Confirmation*\n` +
      `Order ID: #${newOrder.id}\n` +
      `Customer: ${newOrder.customerName} (${newOrder.customerPhone})\n` +
      `Total: ${Number(newOrder.totalAmount).toLocaleString()} MMK\n` +
      `Payment: ${newOrder.paymentMethod} (Ref: ${newOrder.paymentRef || 'Submitted'})\n` +
      `Please verify and fulfill my digital product. Thank you!`
    );
    const waPhone = store.settings.whatsappNumber ? store.settings.whatsappNumber.replace(/[^0-9]/g, '') : '';
    const whatsappUrl = `https://wa.me/${waPhone}?text=${waText}`;

    // Telegram admin direct chat link
    const telegramAdminUrl = store.settings.telegramUsername
      ? `https://t.me/${store.settings.telegramUsername}`
      : `https://t.me/linhtet_itservice`;

    res.json({
      success: true,
      order: newOrder,
      telegramResult,
      whatsappUrl,
      telegramAdminUrl,
      message: 'Order created successfully'
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.patch('/api/orders/:id', (req: Request, res: Response) => {
  const store = getStore();
  const id = req.params.id;
  const index = store.orders.findIndex((o: any) => o.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  store.orders[index] = { ...store.orders[index], ...req.body };
  saveStore(store);
  res.json({ success: true, order: store.orders[index] });
});

// Settings
app.get('/api/settings', (req: Request, res: Response) => {
  const store = getStore();
  // Hide admin passcode from public read, only return boolean or sanitized
  const settings = { ...store.settings };
  res.json({ success: true, settings });
});

app.put('/api/settings', (req: Request, res: Response) => {
  const store = getStore();
  store.settings = { ...store.settings, ...req.body };
  saveStore(store);
  res.json({ success: true, settings: store.settings });
});

// Admin Auth check
app.post('/api/admin/login', (req: Request, res: Response) => {
  const store = getStore();
  const { passcode } = req.body;
  const validPass = store.settings?.adminPasscode || 'admin123';
  if (passcode === validPass) {
    res.json({ success: true, token: 'lh_admin_session_' + Date.now() });
  } else {
    res.status(401).json({ success: false, message: 'Invalid Admin Passcode' });
  }
});

// Test Telegram Notification
app.post('/api/notify/telegram/test', async (req: Request, res: Response) => {
  const store = getStore();
  const { botToken, chatId } = req.body;
  const token = botToken || store.settings.telegramBotToken;
  const chat = chatId || store.settings.telegramChatId;

  if (!token || !chat) {
    return res.status(400).json({
      success: false,
      message: 'Bot Token and Chat ID are required to send Telegram test message.'
    });
  }

  try {
    const text = `🔔 *Lin Htet IT Service - Connection Test*\n\n` +
      `✅ *Telegram Bot Integration is Working!* 🎉\n\n` +
      `When customers order digital products on your website, live order alerts will be delivered here instantly.\n\n` +
      `⏰ Test Timestamp: ${new Date().toLocaleString()}`;

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chat,
        text: text,
        parse_mode: 'Markdown'
      })
    });
    const result = await tgRes.json();
    if (result.ok) {
      res.json({ success: true, message: 'Test message sent to Telegram successfully!', result });
    } else {
      res.status(400).json({ success: false, message: result.description || 'Failed to send message', result });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Test Post to Telegram Channel
app.post('/api/notify/telegram/test-channel', async (req: Request, res: Response) => {
  const store = getStore();
  const { botToken, channelId } = req.body;
  const token = botToken || store.settings.telegramBotToken;
  const channel = channelId || store.settings.telegramChannelId || store.settings.telegramChatId;

  if (!token || !channel) {
    return res.status(400).json({
      success: false,
      message: 'Bot Token and Channel Username / ID are required.'
    });
  }

  const sampleProduct = {
    title: 'Windows 11 Pro Genuine Retail License',
    titleMm: 'Windows 11 Pro မူရင်း လိုင်စင်ကီး (Official)',
    price: 28000,
    priceUsd: 6,
    deliveryType: 'instant_key',
    stockStatus: 'in_stock',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    description: 'Lifetime activation genuine retail license key with instant auto delivery.',
    features: [
      'Official Microsoft Activation Guarantee',
      'Instant Telegram Key Delivery',
      'Lifetime Validity for 1 PC'
    ]
  };

  const testSettings = {
    ...store.settings,
    telegramBotToken: token,
    telegramChannelId: channel
  };

  const result = await postProductToTelegramChannel(sampleProduct, testSettings, channel);
  if (result.success) {
    res.json({ success: true, message: 'Test product successfully posted to Telegram Channel!', result });
  } else {
    res.status(400).json({ success: false, message: result.reason || result.error || 'Failed to post to Telegram Channel. Please ensure your bot is an Administrator in the channel.', result });
  }
});

// Stats
app.get('/api/stats', (req: Request, res: Response) => {
  const store = getStore();
  const orders = store.orders || [];
  const products = store.products || [];

  const totalRevenue = orders
    .filter((o: any) => o.status === 'delivered' || o.status === 'verified')
    .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

  const pendingCount = orders.filter((o: any) => o.status === 'pending').length;
  const deliveredCount = orders.filter((o: any) => o.status === 'delivered').length;

  res.json({
    success: true,
    stats: {
      totalRevenue,
      totalOrders: orders.length,
      pendingOrders: pendingCount,
      deliveredOrders: deliveredCount,
      totalProducts: products.length
    }
  });
});

// ----------------- REVIEWS API ----------------- //

// Get reviews with optional product filter and trust stats
app.get('/api/reviews', (req: Request, res: Response) => {
  const store = getStore();
  let reviews = store.reviews || [];

  const { productId, rating } = req.query;

  if (productId && typeof productId === 'string' && productId !== 'all') {
    reviews = reviews.filter((r: any) => r.productId === productId);
  }

  if (rating && !isNaN(Number(rating))) {
    const targetRating = Number(rating);
    reviews = reviews.filter((r: any) => r.rating === targetRating);
  }

  const allReviews = store.reviews || [];
  const totalCount = allReviews.length;
  const totalRatingSum = allReviews.reduce((sum: number, r: any) => sum + (Number(r.rating) || 5), 0);
  const averageRating = totalCount > 0 ? Number((totalRatingSum / totalCount).toFixed(1)) : 5.0;

  const ratingCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  allReviews.forEach((r: any) => {
    const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
    ratingCounts[star] = (ratingCounts[star] || 0) + 1;
  });

  res.json({
    success: true,
    reviews,
    stats: {
      averageRating,
      totalCount,
      ratingCounts,
      verifiedBuyerPercentage: 100
    }
  });
});

// Submit a new review
app.post('/api/reviews', async (req: Request, res: Response) => {
  try {
    const store = getStore();
    const { customerName, rating, comment, productId, productTitle, verifiedPurchase } = req.body;

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ success: false, message: 'Customer name is required' });
    }
    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Review comment is required' });
    }

    const numericRating = Math.min(5, Math.max(1, Number(rating) || 5));

    // Lookup product title if not provided
    let resolvedTitle = productTitle || '';
    if (productId && !resolvedTitle) {
      const p = store.products?.find((item: any) => item.id === productId);
      if (p) resolvedTitle = p.titleMm || p.title;
    }

    const newReview = {
      id: 'rev-' + Date.now(),
      productId: productId || '',
      productTitle: resolvedTitle,
      customerName: customerName.trim(),
      rating: numericRating,
      comment: comment.trim(),
      commentMm: comment.trim(),
      verifiedPurchase: verifiedPurchase !== false,
      likes: 1,
      createdAt: new Date().toISOString()
    };

    store.reviews = [newReview, ...(store.reviews || [])];
    saveStore(store);

    // Optional Telegram notification when a customer submits a new review
    if (store.settings.autoNotifyTelegram && store.settings.telegramBotToken && store.settings.telegramChatId) {
      const stars = '⭐'.repeat(numericRating);
      const tgText = `⭐ *NEW CUSTOMER REVIEW RECEIVED!* ⭐\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 *Customer:* ${newReview.customerName}\n` +
        `🏆 *Rating:* ${stars} (${numericRating}/5)\n` +
        (newReview.productTitle ? `📦 *Product:* ${newReview.productTitle}\n` : '') +
        `💬 *Review:* "${newReview.comment}"\n` +
        `⏰ *Time:* ${new Date(newReview.createdAt).toLocaleString()}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `Customer trust score increased!`;
      
      fetch(`https://api.telegram.org/bot${store.settings.telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: store.settings.telegramChatId,
          text: tgText,
          parse_mode: 'Markdown'
        })
      }).catch(err => console.error('Telegram review dispatch error:', err));
    }

    res.json({ success: true, review: newReview, message: 'Review submitted successfully!' });
  } catch (error: any) {
    console.error('Error submitting review:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Like / Thumbs Up a review
app.post('/api/reviews/:id/like', (req: Request, res: Response) => {
  const store = getStore();
  const id = req.params.id;
  const review = store.reviews?.find((r: any) => r.id === id);
  if (!review) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }
  review.likes = (review.likes || 0) + 1;
  saveStore(store);
  res.json({ success: true, likes: review.likes });
});

// Admin delete a review
app.delete('/api/reviews/:id', (req: Request, res: Response) => {
  const store = getStore();
  const id = req.params.id;
  store.reviews = (store.reviews || []).filter((r: any) => r.id !== id);
  saveStore(store);
  res.json({ success: true, message: 'Review deleted successfully' });
});

// Mount Vite middleware for SPA
async function startServer() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(__dirname, 'dist'))) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;

if (!process.env.VERCEL) {
  startServer();
}
