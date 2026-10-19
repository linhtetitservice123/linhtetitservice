import React from 'react';
import { 
  Zap, 
  Key, 
  UserCheck, 
  Download, 
  Send, 
  Check, 
  Plus, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Product, Language, DeliveryType } from '../types';
import { translations } from '../translations';

interface ProductCardProps {
  product: Product;
  lang: Language;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  lang,
  onAddToCart,
  onBuyNow,
  onViewDetails
}) => {
  const t = translations[lang];

  // Delivery badge icon & label helper
  const getDeliveryBadge = (type: DeliveryType) => {
    switch (type) {
      case 'instant_key':
        return {
          icon: <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />,
          label: lang === 'my' ? '⚡ တန်းရ ကီး' : '⚡ Instant Key',
          bg: 'bg-amber-50 text-amber-800 border-amber-200'
        };
      case 'account_credentials':
        return {
          icon: <Key className="w-3 h-3 text-emerald-600" />,
          label: lang === 'my' ? '🔑 အကောင့် & Login' : '🔑 Account Creds',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200'
        };
      case 'manual_delivery':
        return {
          icon: <Send className="w-3 h-3 text-sky-600" />,
          label: lang === 'my' ? '✈️ Telegram ပို့ပေး' : '✈️ Direct Delivery',
          bg: 'bg-sky-50 text-sky-800 border-sky-200'
        };
      case 'download_link':
        return {
          icon: <Download className="w-3 h-3 text-purple-600" />,
          label: lang === 'my' ? '🔗 ဒေါင်းလုဒ်လင့်ခ်' : '🔗 Direct Download',
          bg: 'bg-purple-50 text-purple-800 border-purple-200'
        };
      default:
        return {
          icon: <Zap className="w-3 h-3 text-amber-500" />,
          label: 'Digital Delivery',
          bg: 'bg-amber-50 text-amber-800 border-amber-200'
        };
    }
  };

  const deliveryBadge = getDeliveryBadge(product.deliveryType);

  return (
    <div className="group bg-white rounded-2xl border border-[#EBE3D7] hover:border-[#8B5A2B]/40 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Product Image & Top Overlays */}
      <div 
        className="relative h-44 sm:h-48 overflow-hidden bg-[#F3EDE6] cursor-pointer"
        onClick={() => onViewDetails(product)}
      >
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-60" />

        {/* Badge (Best Seller, Hot Deal, etc.) */}
        {product.badge && (
          <div className="absolute top-3 left-3 bg-[#8B5A2B] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>{product.badge}</span>
          </div>
        )}

        {/* Delivery Type Badge */}
        <div className={`absolute top-3 right-3 text-[11px] font-semibold px-2.5 py-1 rounded-full border shadow-xs flex items-center gap-1 ${deliveryBadge.bg}`}>
          {deliveryBadge.icon}
          <span>{deliveryBadge.label}</span>
        </div>

        {/* Stock status indicator */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs text-[10px] font-semibold text-[#3B2C21] px-2 py-0.5 rounded-md flex items-center gap-1.5 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>{product.stockStatus === 'in_stock' ? t.inStock : t.outOfStock}</span>
          {product.availableKeys && product.availableKeys.length > 0 && (
            <span className="text-[#8B5A2B] font-bold">({product.availableKeys.length})</span>
          )}
        </div>
      </div>

      {/* Product Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Title */}
          <h3 
            onClick={() => onViewDetails(product)}
            className="font-bold text-base sm:text-lg text-[#2D1F17] group-hover:text-[#8B5A2B] transition cursor-pointer line-clamp-1"
          >
            {lang === 'my' && product.titleMm ? product.titleMm : product.title}
          </h3>
          
          {lang === 'my' && product.title && (
            <p className="text-[12px] text-[#7C6A5A] line-clamp-1 mt-0.5">
              {product.title}
            </p>
          )}

          {/* Description */}
          <p className="text-xs text-[#6A5A4F] line-clamp-2 mt-2 leading-relaxed">
            {product.description}
          </p>

          {/* Feature highlights */}
          {product.features && product.features.length > 0 && (
            <div className="mt-3 space-y-1">
              {product.features.slice(0, 2).map((feat, idx) => (
                <div key={idx} className="flex items-center text-[11px] text-[#544337] gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{feat}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price & Action CTA */}
        <div className="pt-3 border-t border-[#F2ECE4]">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-xs text-[#8C7A6D] block">{lang === 'my' ? 'စျေးနှုန်း' : 'Price'}</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg sm:text-xl font-extrabold text-[#7C4A21]">
                  {Number(product.price).toLocaleString()}
                </span>
                <span className="text-xs font-bold text-[#8B5A2B]">MMK</span>
              </div>
            </div>
            {product.priceUsd && (
              <span className="text-xs text-[#9E8E81] font-medium bg-[#FAF6F0] px-2 py-0.5 rounded-md border border-[#EDE4D9]">
                ≈ ${product.priceUsd}
              </span>
            )}
          </div>

          {/* Buttons: Buy Now & Add to Cart */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onAddToCart(product)}
              className="py-2 px-2.5 rounded-xl border border-[#D5C2B1] hover:bg-[#F5ECE3] text-[#5C3618] text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addToCart}</span>
            </button>
            <button
              onClick={() => onBuyNow(product)}
              className="py-2 px-2.5 rounded-xl bg-[#8B5A2B] hover:bg-[#72451E] text-white text-xs font-semibold flex items-center justify-center gap-1 transition shadow-xs cursor-pointer"
            >
              <span>{t.buyNow}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
