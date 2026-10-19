import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Filter, 
  ArrowUpDown, 
  Zap, 
  CheckCircle2, 
  Send, 
  MessageSquare,
  AlertCircle,
  HelpCircle,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';

import { Product, Category, CartItem, StoreSettings, Language, DeviceFormat, Order } from './types';
import { translations } from './translations';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { DeviceFrameWrapper } from './components/DeviceFrameWrapper';
import './lib/firebase';

export default function App() {
  // App Core State
  const [lang, setLang] = useState<Language>('my');
  const [format, setFormat] = useState<DeviceFormat>('desktop');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc'>('popular');

  // Cart State (stored in localStorage)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('lh_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals & Panels State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [trackerInitialId, setTrackerInitialId] = useState('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Toast / Banner alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const t = translations[lang];

  // Save Cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('lh_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Initial Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, setRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/settings')
      ]);

      const prodData = await prodRes.json();
      const catData = await catRes.json();
      const setData = await setRes.json();

      if (prodData.success) setProducts(prodData.products || []);
      if (catData.success) setCategories(catData.categories || []);
      if (setData.success) setSettings(setData.settings || null);
    } catch (err) {
      console.error('Failed to load store data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Cart Actions
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(
      lang === 'my'
        ? `"${product.titleMm || product.title}" ကို ခြင်းထဲထည့်ပြီးပါပြီ`
        : `Added "${product.title}" to cart`
    );
  };

  const handleBuyNow = (product: Product) => {
    // Add item if not in cart, and open checkout immediately
    const existing = cart.find((item) => item.product.id === product.id);
    if (!existing) {
      setCart((prev) => [...prev, { product, quantity: 1 }]);
    }
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleOrderSuccess = (order: Order) => {
    // Clear cart on successful order
    setCart([]);
  };

  const handleTrackFromCheckout = (orderId: string) => {
    setIsCheckoutOpen(false);
    setTrackerInitialId(orderId);
    setIsTrackerOpen(true);
  };

  // Filtered & Sorted Products
  const filteredProducts = products.filter((prod) => {
    const matchesCategory =
      selectedCategory === 'all' || prod.category === selectedCategory;
    const matchesQuery =
      !searchQuery.trim() ||
      prod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.titleMm && prod.titleMm.toLowerCase().includes(searchQuery.toLowerCase())) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    return 0; // default popular
  });

  // Calculate cart total items
  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const mainContent = (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-60 bg-[#2D1F17] text-[#F5ECE3] px-4 py-2.5 rounded-xl shadow-xl border border-[#8B5A2B]/40 flex items-center gap-2 text-xs font-bold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        lang={lang}
        setLang={setLang}
        format={format}
        setFormat={setFormat}
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTracker={() => setIsTrackerOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        settings={settings}
      />

      {/* Hero Banner with Search */}
      <HeroBanner
        lang={lang}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onTrackOrder={() => setIsTrackerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8 flex-1 max-w-6xl" id="products">
        {/* Category Tabs & Filter Toolbar */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#EDE4D9] pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#2D1F17] tracking-tight">
                {lang === 'my' ? 'ရောင်းချနေသော Digital Products များ' : 'Available Digital Products'}
              </h2>
              <p className="text-xs text-[#7C6A5A]">
                {sortedProducts.length} {lang === 'my' ? 'ခု ရှာဖွေတွေ့ရှိပါသည်' : 'items available'}
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#8C7A6D] font-medium flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#8B5A2B]" />
                {lang === 'my' ? 'စီစဉ်ရန်:' : 'Sort by:'}
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-[#D5C2B1] rounded-xl px-2.5 py-1.5 text-xs text-[#2D1F17] font-semibold focus:outline-none focus:border-[#8B5A2B] cursor-pointer"
              >
                <option value="popular">{lang === 'my' ? 'လူကြိုက်အများဆုံး' : 'Popular / Featured'}</option>
                <option value="price_asc">{lang === 'my' ? 'စျေးနှုန်း အနည်းမှ အများ' : 'Price: Low to High'}</option>
                <option value="price_desc">{lang === 'my' ? 'စျေးနှုန်း အများမှ အနည်း' : 'Price: High to Low'}</option>
              </select>
            </div>
          </div>

          {/* Category Pills Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`py-2 px-3.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-[#8B5A2B] text-white shadow-xs'
                    : 'bg-white text-[#544337] border border-[#E8DFD3] hover:bg-[#F5ECE3]'
                }`}
              >
                {lang === 'my' && cat.nameMm ? cat.nameMm : cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-[#EDE4D9] p-4" />
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#EDE4D9] space-y-3 p-6">
            <div className="w-16 h-16 rounded-full bg-[#F5ECE3] text-[#8B5A2B] mx-auto flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 opacity-60" />
            </div>
            <h3 className="text-base font-bold text-[#2D1F17]">
              {lang === 'my' ? 'ရှာဖွေမှုနှင့် ကိုက်ညီသော ပစ္စည်း မတွေ့ပါ' : 'No digital products found'}
            </h3>
            <p className="text-xs text-[#7C6A5A]">
              {lang === 'my' ? 'အခြားသော အမည် သို့မဟုတ် အမျိုးအစား ရွေးချယ်ကြည့်ပါ' : 'Try clearing your search or selecting a different category.'}
            </p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="py-2 px-4 rounded-xl bg-[#8B5A2B] text-white text-xs font-semibold hover:bg-[#72451E] transition cursor-pointer"
            >
              {lang === 'my' ? 'ပစ္စည်းအားလုံး ပြန်ကြည့်မည်' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                lang={lang}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                onViewDetails={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}

        {/* Feature Banner: Telegram Order Automation Banner */}
        <div className="mt-14 bg-linear-to-r from-[#FAF6F0] via-white to-[#F5ECE3] rounded-3xl p-6 sm:p-8 border border-[#E8DFD3] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[11px] font-bold text-[#8B5A2B] uppercase tracking-wider flex items-center justify-center md:justify-start gap-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Instant Dispatch Technology</span>
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#2D1F17]">
              {lang === 'my'
                ? 'အော်ဒါတင်လိုက်တာနဲ့ Telegram & WhatsApp သို့ ချက်ချင်း အကြောင်းကြားစာ တက်ရောက်ခြင်း'
                : 'Orders instantly trigger real-time Telegram & WhatsApp bot alerts'}
            </h3>
            <p className="text-xs text-[#645347] max-w-xl">
              {lang === 'my'
                ? 'Lin Htet IT Service တွင် မှာယူမှုတိုင်းအတွက် Admin က အမြန်ဆုံး အတည်ပြုပေးနိုင်ရန် Telegram Bot API ဖြင့် တိုက်ရိုက် ချိတ်ဆက်ထားပါသည်။'
                : 'Connected to official Telegram Bot API & WhatsApp business dispatcher for fast fulfillment.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {settings?.telegramUsername && (
              <a
                href={`https://t.me/${settings.telegramUsername}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-4 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>Telegram Support</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            )}
            <button
              onClick={() => setIsTrackerOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-white border border-[#D5C2B1] hover:bg-[#FAF8F5] text-[#5C3618] text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              {t.trackOrder}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        lang={lang}
        onOpenTracker={() => setIsTrackerOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          lang={lang}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onProceedToCheckout={() => setIsCheckoutOpen(true)}
          lang={lang}
        />
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          items={cart}
          settings={settings}
          lang={lang}
          onOrderSuccess={handleOrderSuccess}
          onTrackOrder={handleTrackFromCheckout}
        />
      )}

      {/* Order Tracker Modal */}
      {isTrackerOpen && (
        <OrderTrackerModal
          isOpen={isTrackerOpen}
          onClose={() => setIsTrackerOpen(false)}
          lang={lang}
          initialOrderId={trackerInitialId}
          telegramUsername={settings?.telegramUsername}
          whatsappNumber={settings?.whatsappNumber}
        />
      )}

      {/* Admin Panel Backend */}
      {isAdminOpen && settings && (
        <AdminPanel
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          lang={lang}
          settings={settings}
          onUpdateSettings={(newSettings) => setSettings(newSettings)}
          products={products}
          onRefreshProducts={fetchData}
        />
      )}
    </div>
  );

  return (
    <DeviceFrameWrapper format={format} setFormat={setFormat} lang={lang}>
      {mainContent}
    </DeviceFrameWrapper>
  );
}
