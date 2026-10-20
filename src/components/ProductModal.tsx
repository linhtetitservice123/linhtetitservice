import React from 'react';
import { 
  X, 
  Zap, 
  Key, 
  Download, 
  Send, 
  Check, 
  ShieldCheck, 
  HelpCircle, 
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Star
} from 'lucide-react';
import { Product, Language } from '../types';
import { translations } from '../translations';

interface ProductModalProps {
  product: Product | null;
  lang: Language;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  lang,
  onClose,
  onAddToCart,
  onBuyNow
}) => {
  if (!product) return null;
  const t = translations[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-[#E8DFD3] overflow-hidden my-8 relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header Image */}
        <div className="relative h-56 sm:h-64 bg-[#2D1F17] shrink-0">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
          
          <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
            {product.badge && (
              <span className="inline-flex items-center gap-1 bg-[#8B5A2B] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-1">
                <Sparkles className="w-3 h-3" />
                {product.badge}
              </span>
            )}
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {lang === 'my' && product.titleMm ? product.titleMm : product.title}
            </h2>
            {lang === 'my' && product.title && (
              <p className="text-xs text-stone-300">{product.title}</p>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Price & Stock bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#FAF6F0] border border-[#EFE5D8]">
            <div>
              <span className="text-xs text-[#8C7A6D] block">{lang === 'my' ? 'စျေးနှုန်း' : 'Official Price'}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#7C4A21]">
                  {Number(product.price).toLocaleString()}
                </span>
                <span className="text-sm font-bold text-[#8B5A2B]">MMK</span>
                {product.priceUsd && (
                  <span className="text-xs text-[#9E8E81] ml-1">
                    (Approx. ${product.priceUsd})
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {product.stockStatus === 'in_stock' ? t.inStock : t.outOfStock}
              </span>
              {product.availableKeys && (
                <span className="text-xs text-[#7C6A5A]">
                  ({product.availableKeys.length} {lang === 'my' ? 'ကီးလက်ကျန်' : 'keys remaining'})
                </span>
              )}
            </div>
          </div>

          {/* Trust & Reviews Callout */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-xs">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-extrabold text-amber-900">4.9 / 5.0</span>
              <span className="text-[#8B5A2B] font-medium hidden sm:inline">• {lang === 'my' ? '၁၀၀% စိတ်ချရသော ဝယ်ယူသူသုံးသပ်ချက်များ' : '100% Verified Customer Reviews'}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                setTimeout(() => {
                  const el = document.getElementById('reviews');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="text-[#8B5A2B] hover:text-[#5C3618] font-bold underline cursor-pointer shrink-0"
            >
              {lang === 'my' ? 'သုံးသပ်ချက်များ ကြည့်ရန်' : 'Read Reviews'}
            </button>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-[#7C4A21] uppercase tracking-wider mb-1">
              {lang === 'my' ? 'ပစ္စည်းအကြောင်း အကျဉ်းချုပ်' : 'Product Overview'}
            </h4>
            <p className="text-sm text-[#4A3B30] leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Features Checklist */}
          {product.features && product.features.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-[#7C4A21] uppercase tracking-wider mb-2">
                {lang === 'my' ? 'အဓိက အချက်များနှင့် အကျိုးကျေးဇူးများ' : 'Key Features & Benefits'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-[#4A3B30] bg-[#FAF8F5] p-2 rounded-xl border border-[#EDE4D9]">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* How Delivery Works */}
          <div className="p-4 rounded-2xl bg-[#F5ECE3] border border-[#E2CEBD] space-y-2">
            <div className="flex items-center gap-2 text-[#7C4A21] font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-[#8B5A2B]" />
              <span>
                {lang === 'my' ? 'ပစ္စည်းရယူနည်းနှင့် အသုံးပြုပုံ လမ်းညွှန်' : 'Delivery & Activation Instructions'}
              </span>
            </div>
            <p className="text-xs text-[#5C4533] leading-relaxed">
              {product.instructions || 
                (lang === 'my' 
                  ? 'အော်ဒါတင်သွင်းပြီး ငွေလွှဲပြေစာအတည်ပြုပြီးသည်နှင့် Telegram သို့မဟုတ် Email သို့ တန်းရောက်ရှိပါမည်။' 
                  : 'Delivered instantly upon automated payment confirmation via Telegram & Email.')}
            </p>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 sm:p-5 border-t border-[#EDE4D9] bg-white flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => { onAddToCart(product); onClose(); }}
            className="flex-1 py-3 px-4 rounded-xl border border-[#D5C2B1] hover:bg-[#F5ECE3] text-[#5C3618] text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-[#7C4A21]" />
            <span>{t.addToCart}</span>
          </button>
          <button
            onClick={() => { onBuyNow(product); onClose(); }}
            className="flex-1 py-3 px-4 rounded-xl bg-[#8B5A2B] hover:bg-[#72451E] text-white text-sm font-semibold flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
          >
            <span>{t.buyNow}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
