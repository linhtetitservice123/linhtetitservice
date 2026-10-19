import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  CheckCircle2, 
  Clock, 
  Key, 
  Copy, 
  Check, 
  Send, 
  MessageSquare, 
  AlertCircle,
  PackageCheck
} from 'lucide-react';
import { Order, Language } from '../types';
import { translations } from '../translations';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  initialOrderId?: string;
  telegramUsername?: string;
  whatsappNumber?: string;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  onClose,
  lang,
  initialOrderId = '',
  telegramUsername = 'linhtet_itservice',
  whatsappNumber = '959789654321'
}) => {
  const t = translations[lang];

  const [searchId, setSearchId] = useState(initialOrderId);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (initialOrderId) {
      handleSearch(initialOrderId);
    }
  }, [initialOrderId]);

  if (!isOpen) return null;

  const handleSearch = async (idToSearch?: string) => {
    const id = (idToSearch || searchId).trim().toUpperCase();
    if (!id) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(id)}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setError(data.message || (lang === 'my' ? 'အော်ဒါရှာမတွေ့ပါ' : 'Order not found'));
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching order');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Status mapping
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return {
          label: t.statusDelivered,
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500'
        };
      case 'verified':
        return {
          label: t.statusVerified,
          badge: 'bg-sky-100 text-sky-800 border-sky-300',
          dot: 'bg-sky-500'
        };
      case 'cancelled':
        return {
          label: t.statusCancelled,
          badge: 'bg-red-100 text-red-800 border-red-300',
          dot: 'bg-red-500'
        };
      default:
        return {
          label: t.statusPending,
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          dot: 'bg-amber-500 animate-pulse'
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#E8DFD3] overflow-hidden my-6 relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#EDE4D9] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-[#8B5A2B]" />
            <h2 className="font-bold text-base sm:text-lg text-[#2D1F17]">
              {t.trackTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#EBE2D7] text-[#645347] flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Search Box */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder={t.trackPlaceholder}
                className="w-full text-sm p-3 rounded-xl border border-[#D5C2B1] focus:border-[#8B5A2B] focus:outline-none uppercase font-mono"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={loading || !searchId.trim()}
              className="py-3 px-5 rounded-xl bg-[#8B5A2B] hover:bg-[#72451E] text-white text-xs sm:text-sm font-semibold transition disabled:opacity-50 shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? '...' : t.search}</span>
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Order Details Display */}
          {order && (
            <div className="space-y-4 pt-2">
              {/* Order Status Header Card */}
              <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#EFE5D8] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#8C7A6D] uppercase tracking-wider font-bold block">
                      Order Reference
                    </span>
                    <span className="font-mono text-base font-extrabold text-[#7C4A21]">
                      #{order.id}
                    </span>
                  </div>

                  <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${getStatusBadge(order.status).badge}`}>
                    <span className={`w-2 h-2 rounded-full ${getStatusBadge(order.status).dot}`}></span>
                    <span>{getStatusBadge(order.status).label}</span>
                  </div>
                </div>

                <div className="text-xs text-[#645347] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#8B5A2B]" />
                  <span>Placed on: {new Date(order.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Items in order */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#7C4A21] uppercase tracking-wider">
                  {lang === 'my' ? 'မှာယူထားသော ပစ္စည်းများ' : 'Order Items'}
                </h4>
                <div className="space-y-1.5">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-white border border-[#EDE4D9]">
                      <span className="font-semibold text-[#2D1F17]">
                        {item.title} x{item.quantity}
                      </span>
                      <span className="font-bold text-[#7C4A21]">
                        {Number(item.price * item.quantity).toLocaleString()} MMK
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivered Digital Keys / Credentials */}
              {order.deliveredKeys && order.deliveredKeys.length > 0 ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <Key className="w-4 h-4 text-emerald-700" />
                    <span>{t.deliveredKeysTitle}</span>
                  </div>
                  <div className="space-y-1.5">
                    {order.deliveredKeys.map((keyVal, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded-xl border border-emerald-300 font-mono text-xs text-emerald-950 flex items-center justify-between">
                        <span className="select-all break-all">{keyVal}</span>
                        <button
                          onClick={() => handleCopy(keyVal, `k-${idx}`)}
                          className="ml-2 text-xs font-bold text-emerald-700 hover:text-emerald-900 shrink-0"
                        >
                          {copiedKey === `k-${idx}` ? t.copied : t.copy}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-[#F5ECE3] border border-[#E2CEBD] text-xs text-[#644B36] space-y-1">
                  <p className="font-semibold">
                    {lang === 'my' 
                      ? 'လိုင်စင်ကီးကို စစ်ဆေးအတည်ပြုပြီးပါက ဤနေရာတွင် တန်းမြင်ရမည်ဖြစ်ပြီး Telegram သို့လည်း ပို့ဆောင်ပေးပါမည်။' 
                      : 'Digital keys & credentials will appear here automatically upon admin verification.'}
                  </p>
                </div>
              )}

              {/* Support Links */}
              <div className="flex gap-2 pt-2">
                <a
                  href={`https://t.me/${telegramUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-[#0088cc] text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram Support</span>
                </a>
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Support</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
