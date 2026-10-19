import React from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { CartItem, Language } from '../types';
import { translations } from '../translations';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  lang: Language;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  lang
}) => {
  if (!isOpen) return null;
  const t = translations[lang];

  const totalAmount = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#E8DFD3] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#EDE4D9] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#8B5A2B]" />
            <h2 className="font-bold text-base sm:text-lg text-[#2D1F17]">
              {t.cart} ({items.reduce((acc, i) => acc + i.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#EBE2D7] text-[#645347] flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#F5ECE3] text-[#8B5A2B] mx-auto flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 opacity-60" />
              </div>
              <p className="text-sm font-semibold text-[#645347]">
                {t.emptyCart}
              </p>
              <button
                onClick={onClose}
                className="text-xs text-[#8B5A2B] underline font-bold hover:text-[#72451E]"
              >
                {lang === 'my' ? 'Digital Products များ ကြည့်ရှုမည်' : 'Browse Digital Products'}
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 p-3 rounded-2xl border border-[#EDE4D9] bg-white hover:border-[#D5C2B1] transition shadow-2xs"
              >
                <img
                  src={item.product.image}
                  alt={item.product.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 bg-[#F5ECE3]"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-[#2D1F17] truncate">
                    {lang === 'my' && item.product.titleMm ? item.product.titleMm : item.product.title}
                  </h4>
                  <div className="text-xs font-extrabold text-[#7C4A21] mt-0.5">
                    {Number(item.product.price).toLocaleString()} MMK
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-md bg-[#F5ECE3] hover:bg-[#EBDCCF] text-[#5C3618] flex items-center justify-center text-xs transition"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-[#2D1F17] px-1">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-md bg-[#F5ECE3] hover:bg-[#EBDCCF] text-[#5C3618] flex items-center justify-center text-xs transition"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => onRemoveItem(item.product.id)}
                  className="p-2 text-[#A49486] hover:text-red-600 transition"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#EDE4D9] bg-[#FAF8F5] space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#645347] font-medium">{t.subtotal}:</span>
              <div className="text-right">
                <span className="text-xl font-extrabold text-[#7C4A21]">
                  {Number(totalAmount).toLocaleString()}
                </span>
                <span className="text-xs font-bold text-[#8B5A2B] ml-1">MMK</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-[#7C6A5A]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                {lang === 'my' 
                  ? 'အော်ဒါတင်ပြီးပါက Telegram & WhatsApp သို့ အကြောင်းကြားစာ ပို့ပါမည်' 
                  : 'Automated order notification to Telegram & WhatsApp'}
              </span>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-[#8B5A2B] hover:bg-[#72451E] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
            >
              <span>{t.checkout}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
