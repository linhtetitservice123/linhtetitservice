import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Unlock, 
  Send, 
  MessageSquare, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Save, 
  CreditCard, 
  Key, 
  RefreshCw, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Package,
  Sliders,
  DollarSign,
  Copy,
  Check,
  Star
} from 'lucide-react';
import { Order, Product, StoreSettings, Language, DeliveryType, StockStatus, Review } from '../types';
import { translations } from '../translations';
import { 
  checkAdminPasscode, 
  setAdminSession, 
  isLocalAdminAuthenticated, 
  getLocalOrders, 
  saveLocalOrders, 
  getLocalReviews, 
  saveLocalReviews, 
  getLocalProducts, 
  saveLocalProducts, 
  saveLocalSettings 
} from '../lib/storeService';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  settings: StoreSettings;
  onUpdateSettings: (newSettings: StoreSettings) => void;
  products: Product[];
  onRefreshProducts: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  lang,
  settings,
  onUpdateSettings,
  products,
  onRefreshProducts
}) => {
  const t = translations[lang];

  // Auth State (auto-resumes session if previously authenticated)
  const [isAuthenticated, setIsAuthenticated] = useState(() => isLocalAdminAuthenticated());
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'reviews' | 'telegram' | 'payments'>('orders');

  // Reviews State
  const [adminReviews, setAdminReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'delivered' | 'cancelled'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deliveryInputKey, setDeliveryInputKey] = useState('');

  // Products Modal & State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    title: '',
    titleMm: '',
    category: 'software_keys',
    price: 25000,
    priceUsd: 6,
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    description: '',
    deliveryType: 'instant_key' as DeliveryType,
    stockStatus: 'in_stock' as StockStatus,
    keysText: '',
    featuresText: '',
    instructions: '',
    postToTelegram: true
  });

  // Telegram & WhatsApp Test State
  const [tgToken, setTgToken] = useState(settings.telegramBotToken || '');
  const [tgChatId, setTgChatId] = useState(settings.telegramChatId || '');
  const [tgChannelId, setTgChannelId] = useState(settings.telegramChannelId || '');
  const [autoPostProducts, setAutoPostProducts] = useState(settings.autoPostProductsToTelegram ?? true);
  const [waNumber, setWaNumber] = useState(settings.whatsappNumber || '');
  const [tgTesting, setTgTesting] = useState(false);
  const [tgTestResult, setTgTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [tgChannelTesting, setTgChannelTesting] = useState(false);
  const [tgChannelTestResult, setTgChannelTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [broadcastingId, setBroadcastingId] = useState<string | null>(null);
  const [broadcastToast, setBroadcastToast] = useState<{ success: boolean; message: string } | null>(null);

  // Settings State
  const [localSettings, setLocalSettings] = useState<StoreSettings>(settings);
  const [saveSettingsSuccess, setSaveSettingsSuccess] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0
  });

  useEffect(() => {
    setLocalSettings(settings);
    setTgToken(settings.telegramBotToken || '');
    setTgChatId(settings.telegramChatId || '');
    setTgChannelId(settings.telegramChannelId || '');
    setAutoPostProducts(settings.autoPostProductsToTelegram ?? true);
    setWaNumber(settings.whatsappNumber || '');
  }, [settings]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    let loadedOrders: Order[] | null = null;
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const data = await res.json();
          if (data.success && Array.isArray(data.orders)) {
            loadedOrders = data.orders;
            if (loadedOrders) {
              saveLocalOrders(loadedOrders);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Orders API not reached, loading local storage:', err);
    }

    const currentOrders = loadedOrders || getLocalOrders();
    setOrders(currentOrders);

    // Stats
    try {
      const statsRes = await fetch('/api/stats');
      if (statsRes.ok) {
        const ct = statsRes.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const statsData = await statsRes.json();
          if (statsData.success && statsData.stats) {
            setStats(statsData.stats);
            setLoadingOrders(false);
            return;
          }
        }
      }
    } catch {
      // calculate local stats fallback
    }

    const totalRev = currentOrders
      .filter(o => o.status === 'delivered' || o.status === 'verified')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    setStats({
      totalRevenue: totalRev,
      totalOrders: currentOrders.length,
      pendingOrders: currentOrders.filter(o => o.status === 'pending').length,
      deliveredOrders: currentOrders.filter(o => o.status === 'delivered').length
    });
    setLoadingOrders(false);
  };

  const fetchAdminReviews = async () => {
    try {
      setLoadingReviews(true);
      let loaded: Review[] | null = null;
      try {
        const res = await fetch('/api/reviews');
        if (res.ok) {
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const data = await res.json();
            if (data.success && Array.isArray(data.reviews)) {
              loaded = data.reviews;
              if (loaded) {
                saveLocalReviews(loaded);
              }
            }
          }
        }
      } catch (e) {
        console.warn('Reviews API not reached, loading local reviews:', e);
      }
      setAdminReviews(loaded || getLocalReviews());
    } catch (err) {
      console.error(err);
      setAdminReviews(getLocalReviews());
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm(lang === 'my' ? 'ဤသုံးသပ်ချက်ကို အမှန်တကယ် ဖျက်လိုပါသလား?' : 'Delete this review?')) return;
    try {
      fetch(`/api/reviews/${id}`, { method: 'DELETE' }).catch(() => {});
      const updated = adminReviews.filter(r => r.id !== id);
      setAdminReviews(updated);
      saveLocalReviews(updated);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      fetchAdminReviews();
    }
  }, [isAuthenticated]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    // If blank, automatically use default passcode admin123
    const trimmed = passcode.trim() || 'admin123';

    // Try backend API first
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: trimmed })
      });
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          setIsAuthenticated(true);
          setAdminSession(true);
          return;
        } else {
          setLoginError(data.message || 'Incorrect passcode');
          return;
        }
      }
    } catch (e) {
      console.warn('API login not reachable (e.g. Vercel static), using secure client-side verification:', e);
    }

    // Direct Passcode Fallback for Vercel Static, cold-start, or offline
    if (checkAdminPasscode(trimmed, settings)) {
      setIsAuthenticated(true);
      setAdminSession(true);
    } else {
      setLoginError(lang === 'my' ? 'Admin Passcode မှားယွင်းနေပါသည် (Default: admin123)' : 'Incorrect passcode (Default: admin123)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminSession(false);
    setPasscode('');
  };

  // Quick Demo Access
  const handleQuickDemo = () => {
    setIsAuthenticated(true);
    setAdminSession(true);
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string, keyToAdd?: string) => {
    try {
      const payload: any = { status };
      const targetOrder = orders.find(o => o.id === orderId);
      if (keyToAdd && targetOrder) {
        payload.deliveredKeys = [...(targetOrder.deliveredKeys || []), keyToAdd];
      }

      try {
        await fetch(`/api/orders/${orderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (e) {
        console.warn('Order patch API not reached, updating locally:', e);
      }

      const updated = orders.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            status: status as any,
            deliveredKeys: payload.deliveredKeys || o.deliveredKeys
          };
        }
        return o;
      });
      setOrders(updated);
      saveLocalOrders(updated);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated.find(o => o.id === orderId) || null);
      }
      setDeliveryInputKey('');
    } catch (err) {
      console.error(err);
    }
  };

  // Telegram Test
  const handleTestTelegram = async () => {
    setTgTesting(true);
    setTgTestResult(null);
    try {
      const res = await fetch('/api/notify/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken: tgToken, chatId: tgChatId })
      });
      const data = await res.json();
      setTgTestResult({
        success: data.success,
        message: data.message || (data.success ? 'Success! Telegram notification received.' : 'Failed to send')
      });
    } catch (err: any) {
      setTgTestResult({
        success: false,
        message: err.message || 'Telegram test error'
      });
    } finally {
      setTgTesting(false);
    }
  };

  // Telegram Channel Post Test
  const handleTestTelegramChannel = async () => {
    setTgChannelTesting(true);
    setTgChannelTestResult(null);
    try {
      const res = await fetch('/api/notify/telegram/test-channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken: tgToken, channelId: tgChannelId })
      });
      const data = await res.json();
      setTgChannelTestResult({
        success: data.success,
        message: data.message || (data.success ? 'Success! Test product posted to Telegram Channel.' : 'Failed to post')
      });
    } catch (err: any) {
      setTgChannelTestResult({
        success: false,
        message: err.message || 'Telegram Channel test error'
      });
    } finally {
      setTgChannelTesting(false);
    }
  };

  // Broadcast Product to Telegram Channel
  const handleBroadcastProduct = async (productId: string) => {
    setBroadcastingId(productId);
    try {
      const res = await fetch(`/api/products/${productId}/post-telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: tgChannelId })
      });
      const data = await res.json();
      if (data.success) {
        setBroadcastToast({
          success: true,
          message: lang === 'my' 
            ? '✅ Telegram Channel သို့ ပစ္စည်းအချက်အလက် ပို့စ်တင်ပြီးပါပြီ!' 
            : '✅ Product broadcasted to Telegram Channel successfully!'
        });
      } else {
        setBroadcastToast({
          success: false,
          message: data.message || 'Failed to post to Telegram Channel'
        });
      }
      setTimeout(() => setBroadcastToast(null), 4000);
    } catch (err: any) {
      setBroadcastToast({
        success: false,
        message: err.message || 'Network error'
      });
      setTimeout(() => setBroadcastToast(null), 4000);
    } finally {
      setBroadcastingId(null);
    }
  };

  // Save Settings
  const handleSaveSettings = async () => {
    const updated = {
      ...localSettings,
      telegramBotToken: tgToken,
      telegramChatId: tgChatId,
      telegramChannelId: tgChannelId,
      autoPostProductsToTelegram: autoPostProducts,
      whatsappNumber: waNumber
    };
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (err) {
      console.warn('Settings API not reached, saving locally:', err);
    }

    saveLocalSettings(updated);
    onUpdateSettings(updated);
    setSaveSettingsSuccess(true);
    setTimeout(() => setSaveSettingsSuccess(false), 3000);
  };

  // Product CRUD
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      title: '',
      titleMm: '',
      category: 'software_keys',
      price: 28000,
      priceUsd: 6,
      badge: 'New',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      description: '',
      deliveryType: 'instant_key',
      stockStatus: 'in_stock',
      keysText: '',
      featuresText: 'Genuine Official Activation\nLifetime Validity\nDirect Updates',
      instructions: 'Activation code will be sent to your Telegram.',
      postToTelegram: true
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      title: prod.title,
      titleMm: prod.titleMm || '',
      category: prod.category,
      price: prod.price,
      priceUsd: prod.priceUsd || 0,
      badge: prod.badge || '',
      image: prod.image,
      description: prod.description,
      deliveryType: prod.deliveryType,
      stockStatus: prod.stockStatus,
      keysText: prod.availableKeys?.join('\n') || '',
      featuresText: prod.features?.join('\n') || '',
      instructions: prod.instructions || '',
      postToTelegram: false
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const prodId = editingProduct ? editingProduct.id : 'prod-' + Date.now();
    const payload: Product = {
      id: prodId,
      title: productForm.title,
      titleMm: productForm.titleMm,
      category: productForm.category,
      price: Number(productForm.price),
      priceUsd: Number(productForm.priceUsd),
      badge: productForm.badge,
      image: productForm.image,
      description: productForm.description,
      deliveryType: productForm.deliveryType,
      stockStatus: productForm.stockStatus,
      availableKeys: productForm.keysText.split('\n').map(k => k.trim()).filter(Boolean),
      features: productForm.featuresText.split('\n').map(f => f.trim()).filter(Boolean),
      instructions: productForm.instructions
    };

    try {
      if (editingProduct) {
        await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, postToTelegram: productForm.postToTelegram })
        });
        const data = await res.json().catch(() => null);
        if (data?.telegramPostResult?.success) {
          setBroadcastToast({
            success: true,
            message: lang === 'my' 
              ? '✅ ပစ္စည်းအသစ် သိမ်းဆည်းပြီး Telegram Channel သို့ တန်းတင်ပြီးပါပြီ!' 
              : '✅ Product saved & broadcasted to Telegram Channel!'
          });
          setTimeout(() => setBroadcastToast(null), 4000);
        }
      }
    } catch (err) {
      console.warn('Product save API not reached, updating locally:', err);
    }

    const currentProds = getLocalProducts();
    let updatedProds: Product[];
    if (editingProduct) {
      updatedProds = currentProds.map(p => p.id === payload.id ? payload : p);
    } else {
      updatedProds = [payload, ...currentProds];
    }
    saveLocalProducts(updatedProds);
    setIsProductModalOpen(false);
    onRefreshProducts();
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm(lang === 'my' ? 'ဤပစ္စည်းကို အမှန်တကယ် ဖျက်လိုပါသလား?' : 'Are you sure you want to delete this digital product?')) return;
    try {
      fetch(`/api/products/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch (err) {
      console.error(err);
    }
    const currentProds = getLocalProducts();
    const updated = currentProds.filter(p => p.id !== id);
    saveLocalProducts(updated);
    onRefreshProducts();
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-[#E8DFD3] overflow-hidden my-4 relative flex flex-col h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#EDE4D9] flex items-center justify-between bg-[#3D2412] text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8B5A2B] text-white flex items-center justify-center font-black text-base border border-[#C68B59]/40">
              LH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg tracking-tight">
                  Lin Htet IT Service - Admin Backend
                </h2>
                <span className="text-[10px] bg-[#8B5A2B] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Admin Console
                </span>
              </div>
              <p className="text-xs text-[#CDB59E]">
                {lang === 'my' ? 'ဒစ်ဂျစ်တယ်ပစ္စည်းများ၊ အော်ဒါများနှင့် Telegram/WhatsApp ချိတ်ဆက်မှု ထိန်းချုပ်ခန်း' : 'Digital products, live orders & Telegram/WhatsApp management'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Vercel & Cloud Ready</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs bg-[#5C3618] hover:bg-[#72451E] px-3 py-1.5 rounded-lg text-[#F5ECE3] transition cursor-pointer font-bold"
                >
                  {t.logout}
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!isAuthenticated ? (
          /* Passcode Login View */
          <div className="flex-1 flex items-center justify-center p-6 bg-[#FAF8F5]">
            <div className="max-w-sm w-full bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DFD3] shadow-lg text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-[#F5ECE3] text-[#8B5A2B] mx-auto flex items-center justify-center">
                <Lock className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-black text-xl text-[#2D1F17]">
                  {t.adminLogin}
                </h3>
                <p className="text-xs text-[#7C6A5A] mt-1">
                  {lang === 'my' ? 'အက်ဒမင် စီမံခန့်ခွဲသူ လျှို့ဝှက်နံပါတ် ဖြည့်သွင်းပါ' : 'Enter Admin Passcode to access system'}
                </p>
              </div>

              {loginError && (
                <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-3">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Passcode (Default: admin123)"
                  className="w-full p-3 rounded-xl border border-[#D5C2B1] focus:border-[#8B5A2B] focus:outline-none text-center font-mono text-sm tracking-widest bg-[#FAF8F5]"
                />
                
                <div className="flex items-center justify-center gap-1.5 text-xs text-[#7C6A5A]">
                  <span>{lang === 'my' ? 'မူရင်းနံပါတ်:' : 'Default Passcode:'}</span>
                  <button
                    type="button"
                    onClick={() => { setPasscode('admin123'); }}
                    className="font-mono font-bold bg-[#F5ECE3] text-[#7C4A21] px-2 py-0.5 rounded-md border border-[#E2CEBD] hover:bg-[#EBDCCF] transition cursor-pointer"
                  >
                    admin123
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#8B5A2B] hover:bg-[#72451E] text-white font-bold text-sm transition shadow-sm cursor-pointer"
                >
                  {t.login}
                </button>
              </form>

              <div className="pt-2 border-t border-[#F0EBE3]">
                <button
                  type="button"
                  onClick={handleQuickDemo}
                  className="text-xs text-[#8B5A2B] hover:text-[#5C3618] font-bold underline cursor-pointer"
                >
                  {lang === 'my' ? '⚡ Demo စမ်းသပ်ရန် တိုက်ရိုက်ဝင်ရောက်မည် (One-Click)' : '⚡ Quick Demo 1-Click Access'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden bg-[#FAF8F5]">
            {/* Top Navigation Tabs */}
            <div className="bg-white border-b border-[#EDE4D9] px-4 sm:px-6 flex items-center justify-between shrink-0 overflow-x-auto">
              <div className="flex space-x-1 sm:space-x-3 py-2.5">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
                    activeTab === 'orders'
                      ? 'bg-[#8B5A2B] text-white shadow-xs'
                      : 'text-[#645347] hover:bg-[#F5ECE3]'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Orders ({orders.length})</span>
                  {orders.filter(o => o.status === 'pending').length > 0 && (
                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                      {orders.filter(o => o.status === 'pending').length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('products')}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
                    activeTab === 'products'
                      ? 'bg-[#8B5A2B] text-white shadow-xs'
                      : 'text-[#645347] hover:bg-[#F5ECE3]'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Digital Products ({products.length})</span>
                </button>

                <button
                  onClick={() => { setActiveTab('reviews'); fetchAdminReviews(); }}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
                    activeTab === 'reviews'
                      ? 'bg-[#8B5A2B] text-white shadow-xs'
                      : 'text-[#645347] hover:bg-[#F5ECE3]'
                  }`}
                >
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>Reviews ({adminReviews.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('telegram')}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
                    activeTab === 'telegram'
                      ? 'bg-[#8B5A2B] text-white shadow-xs'
                      : 'text-[#645347] hover:bg-[#F5ECE3]'
                  }`}
                >
                  <Send className="w-4 h-4 text-[#0088cc]" />
                  <span>Telegram & WhatsApp</span>
                  {settings.telegramBotToken ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('payments')}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
                    activeTab === 'payments'
                      ? 'bg-[#8B5A2B] text-white shadow-xs'
                      : 'text-[#645347] hover:bg-[#F5ECE3]'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Payments & Settings</span>
                </button>
              </div>

              <button
                onClick={fetchOrders}
                disabled={loadingOrders}
                className="p-2 text-[#7C6A5A] hover:text-[#2D1F17] transition"
                title="Refresh Data"
              >
                <RefreshCw className={`w-4 h-4 ${loadingOrders ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Tab 1: Orders */}
            {activeTab === 'orders' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
                {/* Stats Summary Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white p-3.5 rounded-2xl border border-[#EDE4D9] shadow-2xs">
                    <span className="text-[11px] text-[#7C6A5A] font-medium block">Total Revenue</span>
                    <span className="text-base sm:text-lg font-black text-[#7C4A21]">
                      {Number(stats.totalRevenue).toLocaleString()} MMK
                    </span>
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl border border-[#EDE4D9] shadow-2xs">
                    <span className="text-[11px] text-[#7C6A5A] font-medium block">Total Orders</span>
                    <span className="text-base sm:text-lg font-black text-[#2D1F17]">
                      {orders.length}
                    </span>
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl border border-[#EDE4D9] shadow-2xs">
                    <span className="text-[11px] text-amber-700 font-medium block">Pending Verification</span>
                    <span className="text-base sm:text-lg font-black text-amber-600">
                      {orders.filter(o => o.status === 'pending').length}
                    </span>
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl border border-[#EDE4D9] shadow-2xs">
                    <span className="text-[11px] text-emerald-700 font-medium block">Delivered Orders</span>
                    <span className="text-base sm:text-lg font-black text-emerald-600">
                      {orders.filter(o => o.status === 'delivered').length}
                    </span>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#7C6A5A] font-semibold">Filter:</span>
                  {(['all', 'pending', 'delivered', 'cancelled'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setOrderFilter(f)}
                      className={`text-xs px-3 py-1 rounded-full font-bold capitalize transition cursor-pointer ${
                        orderFilter === f
                          ? 'bg-[#3D2412] text-white'
                          : 'bg-white text-[#645347] border border-[#E3D6C8] hover:bg-[#F5ECE3]'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {/* Orders List */}
                <div className="space-y-3">
                  {orders
                    .filter(o => orderFilter === 'all' || o.status === orderFilter)
                    .map(order => (
                      <div
                        key={order.id}
                        className="bg-white rounded-2xl border border-[#EDE4D9] p-4 sm:p-5 shadow-xs hover:border-[#8B5A2B]/40 transition space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F2ECE4] pb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-sm font-black text-[#7C4A21] bg-[#FAF6F0] px-2.5 py-1 rounded-lg border border-[#EDE4D9]">
                              #{order.id}
                            </span>
                            <span className="text-xs text-[#7C6A5A]">
                              {new Date(order.createdAt).toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${
                              order.status === 'delivered'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : order.status === 'pending'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-stone-50 text-stone-800 border-stone-200'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>

                        {/* Customer & Payment details */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="text-[#8C7A6D] block">Customer:</span>
                            <span className="font-bold text-[#2D1F17]">{order.customerName}</span>
                            <div className="text-[#5C3618] mt-0.5">{order.customerPhone}</div>
                            {order.customerTelegram && (
                              <a
                                href={`https://t.me/${order.customerTelegram.replace('@', '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#0088cc] hover:underline flex items-center gap-1 mt-0.5"
                              >
                                <Send className="w-3 h-3" />
                                <span>{order.customerTelegram}</span>
                              </a>
                            )}
                          </div>

                          <div>
                            <span className="text-[#8C7A6D] block">Items ({order.items.length}):</span>
                            {order.items.map((it, idx) => (
                              <div key={idx} className="truncate font-semibold text-[#3D281D]">
                                • {it.title} x{it.quantity}
                              </div>
                            ))}
                            <div className="font-extrabold text-[#7C4A21] mt-1">
                              Total: {Number(order.totalAmount).toLocaleString()} MMK
                            </div>
                          </div>

                          <div>
                            <span className="text-[#8C7A6D] block">Payment:</span>
                            <span className="font-semibold text-[#2D1F17]">{order.paymentMethod}</span>
                            {order.paymentRef && (
                              <div className="text-[#645347]">Ref: <strong className="font-mono text-[#2D1F17]">{order.paymentRef}</strong></div>
                            )}
                            {order.paymentSlipUrl && (
                              <a
                                href={order.paymentSlipUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-[#8B5A2B] underline font-bold mt-1 block"
                              >
                                View Payment Slip Image
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Delivered Keys if present */}
                        {order.deliveredKeys && order.deliveredKeys.length > 0 && (
                          <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                            <span className="font-bold block flex items-center gap-1">
                              <Key className="w-3.5 h-3.5 text-emerald-700" />
                              Delivered Keys:
                            </span>
                            {order.deliveredKeys.map((k, idx) => (
                              <div key={idx} className="font-mono bg-white p-1 px-2 rounded border border-emerald-300">
                                {k}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="pt-2 border-t border-[#F2ECE4] flex flex-wrap items-center justify-between gap-2">
                          {/* Direct message links */}
                          <div className="flex items-center gap-2">
                            {order.customerTelegram && (
                              <a
                                href={`https://t.me/${order.customerTelegram.replace('@', '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc]/20 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1"
                              >
                                <Send className="w-3 h-3" />
                                <span>Message Telegram</span>
                              </a>
                            )}
                            {order.customerPhone && (
                              <a
                                href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>WhatsApp Customer</span>
                              </a>
                            )}
                          </div>

                          {/* Status Actions */}
                          <div className="flex items-center gap-1.5">
                            {order.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'verified')}
                                  className="text-xs bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 rounded-lg font-bold transition cursor-pointer"
                                >
                                  Verify Payment
                                </button>
                                <button
                                  onClick={() => setSelectedOrder(order)}
                                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer"
                                >
                                  <Key className="w-3 h-3" />
                                  <span>Deliver Keys</span>
                                </button>
                              </>
                            )}

                            {order.status !== 'delivered' && (
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="text-xs bg-[#8B5A2B] hover:bg-[#72451E] text-white px-3 py-1.5 rounded-lg font-bold transition cursor-pointer"
                              >
                                Deliver / Fulfill
                              </button>
                            )}

                            {order.status !== 'cancelled' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                                className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                  {orders.length === 0 && (
                    <div className="text-center py-12 text-[#7C6A5A] text-sm">
                      No orders placed yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Products */}
            {activeTab === 'products' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-lg text-[#2D1F17]">
                      Digital Products Inventory
                    </h3>
                    <p className="text-xs text-[#7C6A5A]">
                      {lang === 'my' ? 'မည်သည့် Digital Product မဆို အသစ်ထည့်သွင်းခြင်းနှင့် စီမံခန့်ခွဲခြင်း' : 'Manage keys, licenses, credentials and pricing for any digital product'}
                    </p>
                  </div>
                  <button
                    onClick={handleOpenAddProduct}
                    className="py-2 px-4 rounded-xl bg-[#8B5A2B] hover:bg-[#72451E] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Digital Product</span>
                  </button>
                </div>

                {broadcastToast && (
                  <div className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
                    broadcastToast.success 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    <span>{broadcastToast.message}</span>
                    <button onClick={() => setBroadcastToast(null)} className="text-stone-400 hover:text-stone-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {products.map(prod => (
                    <div
                      key={prod.id}
                      className="bg-white rounded-2xl border border-[#EDE4D9] p-4 flex gap-3 shadow-2xs hover:border-[#8B5A2B]/40 transition"
                    >
                      <img
                        src={prod.image}
                        alt={prod.title}
                        className="w-20 h-20 rounded-xl object-cover bg-[#F5ECE3] shrink-0"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-bold text-sm text-[#2D1F17] truncate">
                              {prod.title}
                            </h4>
                            <span className="text-[10px] bg-[#F5ECE3] text-[#7C4A21] px-2 py-0.5 rounded-full font-bold uppercase shrink-0">
                              {prod.category}
                            </span>
                          </div>
                          <div className="text-xs font-extrabold text-[#7C4A21] mt-0.5">
                            {Number(prod.price).toLocaleString()} MMK
                            {prod.priceUsd && <span className="text-stone-400 font-normal ml-1">(${prod.priceUsd})</span>}
                          </div>
                          <div className="text-[11px] text-[#7C6A5A] mt-1">
                            Type: <span className="font-semibold">{prod.deliveryType}</span> • Stock: <span className="font-semibold text-emerald-700">{prod.availableKeys?.length || 0} keys left</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-[#F2ECE4]">
                          <button
                            onClick={() => handleBroadcastProduct(prod.id)}
                            disabled={broadcastingId === prod.id}
                            className="p-1.5 px-2 rounded-lg bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-[#0088cc] transition text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            title="Broadcast this product to Telegram Channel"
                          >
                            <Send className={`w-3.5 h-3.5 ${broadcastingId === prod.id ? 'animate-spin' : ''}`} />
                            <span>{broadcastingId === prod.id ? 'Posting...' : 'Post to Channel'}</span>
                          </button>
                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-1.5 rounded-lg hover:bg-[#F5ECE3] text-[#5C3618] transition text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Telegram & WhatsApp Integration */}
            {activeTab === 'telegram' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                <div className="bg-[#FAF6F0] p-4 sm:p-5 rounded-2xl border border-[#EFE5D8] space-y-2">
                  <div className="flex items-center gap-2 text-[#7C4A21] font-bold text-sm">
                    <Send className="w-5 h-5 text-[#0088cc]" />
                    <span>
                      {lang === 'my' 
                        ? 'Telegram Bot ချိတ်ဆက်မှုစနစ် (အော်ဒါတန်းတက်စေရန်)' 
                        : 'Telegram Bot Live Order Alert Integration'}
                    </span>
                  </div>
                  <p className="text-xs text-[#5C4533] leading-relaxed">
                    {lang === 'my'
                      ? 'ဝယ်ယူသူက website မှ Digital Product အော်ဒါတင်လိုက်တာနဲ့ သင့် Telegram Channel သို့မဟုတ် Account ထံ အော်ဒါအသေးစိတ်၊ ဖုန်းနံပါတ်၊ ငွေလွှဲပြေစာတို့ ချက်ချင်း တန်းတက်ရောက်ရှိလာပါမည်။'
                      : 'Orders placed on the website will be instantly pushed to your Telegram bot or private chat.'}
                  </p>
                </div>

                {/* Telegram Bot Token & Chat ID Configuration */}
                <div className="bg-white p-5 rounded-2xl border border-[#EDE4D9] space-y-4">
                  <h4 className="text-xs font-bold text-[#7C4A21] uppercase tracking-wider">
                    Telegram Bot Credentials
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#544337] block mb-1">
                        Telegram Bot Token (from @BotFather)
                      </label>
                      <input
                        type="text"
                        value={tgToken}
                        onChange={(e) => setTgToken(e.target.value)}
                        placeholder="e.g. 7123456789:AAHxxxxx_xxxxxxxxxxxx"
                        className="w-full text-xs font-mono p-2.5 rounded-xl border border-[#D5C2B1] focus:border-[#8B5A2B] focus:outline-none"
                      />
                      <span className="text-[10px] text-[#8C7A6D] mt-1 block">
                        Get free bot token by messaging @BotFather on Telegram.
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#544337] block mb-1">
                        Admin Chat ID (အော်ဒါသတိပေးချက်လာမည့် ID)
                      </label>
                      <input
                        type="text"
                        value={tgChatId}
                        onChange={(e) => setTgChatId(e.target.value)}
                        placeholder="e.g. 123456789"
                        className="w-full text-xs font-mono p-2.5 rounded-xl border border-[#D5C2B1] focus:border-[#8B5A2B] focus:outline-none"
                      />
                      <span className="text-[10px] text-[#8C7A6D] mt-1 block">
                        Get numeric Chat ID by forwarding message to @userinfobot.
                      </span>
                    </div>

                    <div className="sm:col-span-2 bg-[#FBF9F6] p-3.5 rounded-xl border border-[#EDE4D9] space-y-2">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                          <label className="text-xs font-bold text-[#7C4A21] flex items-center gap-1.5">
                            <Send className="w-3.5 h-3.5 text-[#0088cc]" />
                            <span>Telegram Channel Username / ID (ပစ္စည်းတင်မည့် Channel)</span>
                          </label>
                          <span className="text-[11px] text-[#7C6A5A] block mt-0.5">
                            ဥပမာ: <code>@linhtet_channel</code> သို့မဟုတ် Numeric ID <code>-100xxxxxxxxxx</code>
                          </span>
                        </div>

                        <label className="inline-flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-[#D5C2B1] shadow-2xs">
                          <input
                            type="checkbox"
                            checked={autoPostProducts}
                            onChange={(e) => setAutoPostProducts(e.target.checked)}
                            className="w-4 h-4 text-[#8B5A2B] rounded accent-[#8B5A2B] cursor-pointer"
                          />
                          <span className="text-xs font-bold text-[#2D1F17]">
                            ⚡ Auto-Post New Products to Channel
                          </span>
                        </label>
                      </div>

                      <input
                        type="text"
                        value={tgChannelId}
                        onChange={(e) => setTgChannelId(e.target.value)}
                        placeholder="@your_channel_name or -1001234567890"
                        className="w-full text-xs font-mono p-2.5 rounded-xl border border-[#D5C2B1] focus:border-[#8B5A2B] focus:outline-none bg-white"
                      />
                      <p className="text-[11px] text-[#8C7A6D]">
                        📌 <strong>အရေးကြီးသည်:</strong> သင့် Telegram Channel ထဲတွင် Bot ကို <strong>Administrator</strong> အဖြစ် Add ပေးထားပြီး <strong>"Post Messages"</strong> Permission ဖွင့်ပေးထားရပါမည်။
                      </p>
                    </div>
                  </div>

                  {/* Test Connection Buttons */}
                  <div className="pt-2 flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      disabled={tgTesting || !tgToken || !tgChatId}
                      onClick={handleTestTelegram}
                      className="py-2.5 px-3.5 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{tgTesting ? 'Sending...' : 'Test Order Alert (Chat)'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={tgChannelTesting || !tgToken || (!tgChannelId && !tgChatId)}
                      onClick={handleTestTelegramChannel}
                      className="py-2.5 px-3.5 rounded-xl bg-[#2D74BA] hover:bg-[#235d97] text-white text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{tgChannelTesting ? 'Posting to Channel...' : '📢 Test Post to Channel'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      className="py-2.5 px-4 rounded-xl bg-[#8B5A2B] hover:bg-[#72451E] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Bot & Channel Settings</span>
                    </button>

                    {saveSettingsSuccess && (
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-4 h-4" /> Saved!
                      </span>
                    )}
                  </div>

                  {/* Results feedback */}
                  {tgTestResult && (
                    <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      tgTestResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      {tgTestResult.success ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />}
                      <span>{tgTestResult.message}</span>
                    </div>
                  )}

                  {tgChannelTestResult && (
                    <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      tgChannelTestResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      {tgChannelTestResult.success ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />}
                      <span>{tgChannelTestResult.message}</span>
                    </div>
                  )}
                </div>

                {/* WhatsApp Settings */}
                <div className="bg-white p-5 rounded-2xl border border-[#EDE4D9] space-y-4">
                  <div className="flex items-center gap-2 text-[#25D366] font-bold text-sm">
                    <MessageSquare className="w-5 h-5" />
                    <span>WhatsApp Order Notification Routing</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#544337] block mb-1">
                      Admin WhatsApp Number (Country code included, without +)
                    </label>
                    <input
                      type="text"
                      value={waNumber}
                      onChange={(e) => setWaNumber(e.target.value)}
                      placeholder="e.g. 959789654321"
                      className="w-full text-xs font-mono p-2.5 rounded-xl border border-[#D5C2B1] focus:border-[#8B5A2B] focus:outline-none max-w-md"
                    />
                    <span className="text-[10px] text-[#8C7A6D] mt-1 block">
                      Customers will have a 1-click button on checkout to send invoice straight to this WhatsApp number.
                    </span>
                  </div>
                </div>

                {/* Step-by-Step Setup Guide */}
                <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#EDE4D9] space-y-2 text-xs text-[#5C4533]">
                  <span className="font-bold text-[#7C4A21] block">
                    📖 How to connect Telegram in 2 minutes:
                  </span>
                  <ol className="list-decimal list-inside space-y-1 pl-1">
                    <li>Open Telegram and search for <strong>@BotFather</strong>.</li>
                    <li>Send <code>/newbot</code> command, follow instructions to name your bot (e.g. <em>LinHtetOrderBot</em>).</li>
                    <li>Copy the HTTP API Token provided and paste into <strong>Telegram Bot Token</strong> above.</li>
                    <li>Start a chat with your new bot and click <strong>/start</strong>.</li>
                    <li>Search <strong>@userinfobot</strong> on Telegram to see your numeric <strong>Id</strong> (e.g. <code>123456789</code>) and paste it into <strong>Chat ID</strong>.</li>
                    <li>Click <strong>Send Test Telegram Alert</strong> and you are done!</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Tab 4: Payments & Shop Settings */}
            {activeTab === 'payments' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-lg text-[#2D1F17]">
                      Payment Accounts & Shop Settings
                    </h3>
                    <p className="text-xs text-[#7C6A5A]">
                      Update KBZPay, WavePay, Bank numbers and admin credentials
                    </p>
                  </div>
                  <button
                    onClick={handleSaveSettings}
                    className="py-2 px-4 rounded-xl bg-[#8B5A2B] hover:bg-[#72451E] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save All Changes</span>
                  </button>
                </div>

                {/* Payment Accounts List */}
                <div className="space-y-3">
                  {localSettings.paymentAccounts?.map((acc, index) => (
                    <div key={acc.id} className="bg-white p-4 rounded-2xl border border-[#EDE4D9] grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-[#8C7A6D] block">Account Method Name</label>
                        <input
                          type="text"
                          value={acc.name}
                          onChange={(e) => {
                            const updated = [...localSettings.paymentAccounts];
                            updated[index].name = e.target.value;
                            setLocalSettings({ ...localSettings, paymentAccounts: updated });
                          }}
                          className="w-full text-xs p-2 rounded-lg border border-[#D5C2B1] font-semibold mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-[#8C7A6D] block">Account Number / Phone</label>
                        <input
                          type="text"
                          value={acc.accountNumber}
                          onChange={(e) => {
                            const updated = [...localSettings.paymentAccounts];
                            updated[index].accountNumber = e.target.value;
                            setLocalSettings({ ...localSettings, paymentAccounts: updated });
                          }}
                          className="w-full text-xs p-2 rounded-lg border border-[#D5C2B1] font-mono mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-[#8C7A6D] block">Account Holder Name</label>
                        <input
                          type="text"
                          value={acc.accountName}
                          onChange={(e) => {
                            const updated = [...localSettings.paymentAccounts];
                            updated[index].accountName = e.target.value;
                            setLocalSettings({ ...localSettings, paymentAccounts: updated });
                          }}
                          className="w-full text-xs p-2 rounded-lg border border-[#D5C2B1] mt-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shop Info Settings */}
                <div className="bg-white p-5 rounded-2xl border border-[#EDE4D9] space-y-4">
                  <h4 className="text-xs font-bold text-[#7C4A21] uppercase tracking-wider">
                    Store Information & Social Handles
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-[#544337] block mb-1">Shop Name</label>
                      <input
                        type="text"
                        value={localSettings.shopName}
                        onChange={(e) => setLocalSettings({ ...localSettings, shopName: e.target.value })}
                        className="w-full p-2 rounded-lg border border-[#D5C2B1]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[#544337] block mb-1">Telegram Public Username</label>
                      <input
                        type="text"
                        value={localSettings.telegramUsername}
                        onChange={(e) => setLocalSettings({ ...localSettings, telegramUsername: e.target.value })}
                        className="w-full p-2 rounded-lg border border-[#D5C2B1]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[#544337] block mb-1">Support Phone</label>
                      <input
                        type="text"
                        value={localSettings.phone}
                        onChange={(e) => setLocalSettings({ ...localSettings, phone: e.target.value })}
                        className="w-full p-2 rounded-lg border border-[#D5C2B1]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[#544337] block mb-1">Support Email</label>
                      <input
                        type="email"
                        value={localSettings.email}
                        onChange={(e) => setLocalSettings({ ...localSettings, email: e.target.value })}
                        className="w-full p-2 rounded-lg border border-[#D5C2B1]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Management Tab */}
            {activeTab === 'reviews' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-[#2D1F17]">
                      Customer Reviews & Trust Management ({adminReviews.length})
                    </h3>
                    <p className="text-xs text-[#7C6A5A]">
                      View, verify, and moderate customer product reviews stored in the database.
                    </p>
                  </div>
                  <button
                    onClick={fetchAdminReviews}
                    disabled={loadingReviews}
                    className="py-1.5 px-3 rounded-xl bg-white border border-[#D5C2B1] text-xs font-bold text-[#5C3618] hover:bg-[#FAF8F5] transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingReviews ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {loadingReviews ? (
                  <div className="p-8 text-center text-xs text-[#7C6A5A]">Loading reviews...</div>
                ) : adminReviews.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 border border-[#EDE4D9] text-center text-xs text-[#7C6A5A]">
                    No reviews in the database yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {adminReviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="bg-white rounded-2xl p-4 border border-[#EDE4D9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs hover:border-[#8B5A2B]/40 transition"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#2D1F17]">{rev.customerName}</span>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3 h-3 ${
                                    s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'fill-stone-200 text-stone-200'
                                  }`}
                                />
                              ))}
                            </div>
                            {rev.verifiedPurchase && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                                Verified
                              </span>
                            )}
                            <span className="text-[10px] text-stone-400">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {rev.productTitle && (
                            <span className="inline-block text-[11px] font-medium text-[#8B5A2B] bg-[#FAF6F0] px-2 py-0.5 rounded-lg border border-[#EDE4D9]">
                              📦 {rev.productTitle}
                            </span>
                          )}
                          <p className="text-xs text-[#4A3B30] italic">
                            "{rev.comment}"
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <span className="text-xs text-stone-500 font-medium">👍 {rev.likes || 0}</span>
                          <button
                            onClick={() => handleDeleteReview(rev.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
                            title="Delete Review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Fulfill / Deliver Key Modal Drawer */}
        {selectedOrder && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 border border-[#E8DFD3] shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#EDE4D9] pb-3">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-base text-[#2D1F17]">
                    Deliver Order #{selectedOrder.id}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs text-[#544337] space-y-1">
                <p><strong>Customer:</strong> {selectedOrder.customerName} ({selectedOrder.customerPhone})</p>
                <p><strong>Items:</strong> {selectedOrder.items.map(i => i.title).join(', ')}</p>
                <p><strong>Total:</strong> {Number(selectedOrder.totalAmount).toLocaleString()} MMK</p>
              </div>

              <div>
                <label className="text-xs font-bold text-[#544337] block mb-1">
                  Enter License Key / Login Credentials / Link to Deliver:
                </label>
                <textarea
                  rows={3}
                  value={deliveryInputKey}
                  onChange={(e) => setDeliveryInputKey(e.target.value)}
                  placeholder="e.g. W11P-XXXX-XXXX-XXXX or Account: user@domain | Pass: xyz"
                  className="w-full text-xs font-mono p-2.5 rounded-xl border border-[#D5C2B1] focus:border-[#8B5A2B] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'delivered', deliveryInputKey.trim())}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Confirm & Mark Delivered
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="py-2.5 px-4 rounded-xl border border-[#D5C2B1] text-[#645347] text-xs font-semibold hover:bg-[#F5ECE3]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add / Edit Digital Product Modal */}
        {isProductModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 border border-[#E8DFD3] shadow-2xl space-y-4 my-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#EDE4D9] pb-3">
                <h3 className="font-black text-base sm:text-lg text-[#2D1F17]">
                  {editingProduct ? 'Edit Digital Product' : 'Add Any Digital Product'}
                </h3>
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-[#544337] block mb-1">Product Title (English)</label>
                  <input
                    type="text"
                    required
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    placeholder="e.g. Windows 11 Pro Genuine Retail License"
                    className="w-full p-2 rounded-lg border border-[#D5C2B1]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#544337] block mb-1">Product Title (Myanmar)</label>
                  <input
                    type="text"
                    value={productForm.titleMm}
                    onChange={(e) => setProductForm({ ...productForm, titleMm: e.target.value })}
                    placeholder="e.g. Windows 11 Pro မူရင်း လိုင်စင်ကီး"
                    className="w-full p-2 rounded-lg border border-[#D5C2B1]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-[#544337] block mb-1">Category</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full p-2 rounded-lg border border-[#D5C2B1] bg-white"
                    >
                      <option value="software_keys">Software Licenses</option>
                      <option value="subscriptions">Subscriptions</option>
                      <option value="ai_tools">AI & Productivity</option>
                      <option value="vpn_security">VPN & Security</option>
                      <option value="dev_assets">Source Code & Scripts</option>
                      <option value="gaming">Gaming & Wallet</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#544337] block mb-1">Delivery Type</label>
                    <select
                      value={productForm.deliveryType}
                      onChange={(e) => setProductForm({ ...productForm, deliveryType: e.target.value as DeliveryType })}
                      className="w-full p-2 rounded-lg border border-[#D5C2B1] bg-white"
                    >
                      <option value="instant_key">Instant Key ⚡</option>
                      <option value="account_credentials">Account Login 🔑</option>
                      <option value="manual_delivery">Manual Telegram ✈️</option>
                      <option value="download_link">Download Link 🔗</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-[#544337] block mb-1">Price (MMK)</label>
                    <input
                      type="number"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg border border-[#D5C2B1]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#544337] block mb-1">Price (USD Approx)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={productForm.priceUsd}
                      onChange={(e) => setProductForm({ ...productForm, priceUsd: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg border border-[#D5C2B1]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#544337] block mb-1">Image URL</label>
                  <input
                    type="url"
                    required
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    className="w-full p-2 rounded-lg border border-[#D5C2B1]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#544337] block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full p-2 rounded-lg border border-[#D5C2B1]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#544337] block mb-1">
                    Available Keys Inventory (1 per line, auto-assigned on checkout)
                  </label>
                  <textarea
                    rows={3}
                    value={productForm.keysText}
                    onChange={(e) => setProductForm({ ...productForm, keysText: e.target.value })}
                    placeholder="W11P-AAAA-BBBB-CCCC&#10;W11P-DDDD-EEEE-FFFF"
                    className="w-full p-2 rounded-lg border border-[#D5C2B1] font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#544337] block mb-1">Features (1 per line)</label>
                  <textarea
                    rows={2}
                    value={productForm.featuresText}
                    onChange={(e) => setProductForm({ ...productForm, featuresText: e.target.value })}
                    className="w-full p-2 rounded-lg border border-[#D5C2B1]"
                  />
                </div>

                <div className="bg-[#FAF6F0] p-3 rounded-xl border border-[#EFE5D8]">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#7C4A21]">
                    <input
                      type="checkbox"
                      checked={productForm.postToTelegram}
                      onChange={(e) => setProductForm({ ...productForm, postToTelegram: e.target.checked })}
                      className="w-4 h-4 text-[#8B5A2B] rounded accent-[#8B5A2B] cursor-pointer"
                    />
                    <Send className="w-3.5 h-3.5 text-[#0088cc]" />
                    <span>📢 Save ပြီးတာနဲ့ Telegram Channel သို့ တန်းတင်မည် (Auto-Post to Channel)</span>
                  </label>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#EDE4D9]">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="py-2 px-3 rounded-lg border border-[#D5C2B1] text-[#645347] font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 rounded-lg bg-[#8B5A2B] hover:bg-[#72451E] text-white font-bold transition shadow-xs cursor-pointer"
                  >
                    Save Digital Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
