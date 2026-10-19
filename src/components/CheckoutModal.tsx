import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  Check, 
  Copy, 
  Send, 
  MessageSquare, 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  AlertCircle,
  FileCheck,
  Printer,
  ExternalLink,
  Sparkles,
  Search,
  Key
} from 'lucide-react';
import { CartItem, Language, StoreSettings, Order } from '../types';
import { translations } from '../translations';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  settings: StoreSettings | null;
  lang: Language;
  onOrderSuccess: (order: Order) => void;
  onTrackOrder: (orderId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  settings,
  lang,
  onOrderSuccess,
  onTrackOrder
}) => {
  const t = translations[lang];

  const totalAmount = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerTelegram, setCustomerTelegram] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  
  // Payment State
  const defaultMethod = settings?.paymentAccounts?.[0]?.name || 'KBZPay (KPay)';
  const [selectedPayment, setSelectedPayment] = useState(defaultMethod);
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentSlipUrl, setPaymentSlipUrl] = useState('');

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [telegramAdminUrl, setTelegramAdminUrl] = useState('');
  const [telegramNotifyResult, setTelegramNotifyResult] = useState<any>(null);

  // Find selected payment account object
  const currentAccount = settings?.paymentAccounts?.find(
    (acc) => acc.name === selectedPayment || acc.id === selectedPayment
  ) || settings?.paymentAccounts?.[0];

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(id);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentSlipUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerPhone.trim()) {
      setError(lang === 'my' ? 'ကျေးဇူးပြု၍ ဖုန်းနံပါတ် ထည့်သွင်းပေးပါ' : 'Please provide your phone number');
      return;
    }

    if (items.length === 0) {
      setError(lang === 'my' ? 'စျေးဝယ်ခြင်းထဲတွင် ပစ္စည်းမရှိပါ' : 'Cart is empty');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        customerName: customerName.trim() || (lang === 'my' ? 'ဝယ်ယူသူ' : 'Customer'),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        customerTelegram: customerTelegram.trim(),
        customerWhatsapp: customerWhatsapp.trim() || customerPhone.trim(),
        customerNote: customerNote.trim(),
        items: items.map(item => ({
          productId: item.product.id,
          title: item.product.title,
          price: item.product.price,
          quantity: item.quantity,
          deliveryType: item.product.deliveryType
        })),
        totalAmount,
        paymentMethod: selectedPayment,
        paymentRef: paymentRef.trim(),
        paymentSlipUrl: paymentSlipUrl.trim()
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success && data.order) {
        setCompletedOrder(data.order);
        setWhatsappUrl(data.whatsappUrl || '');
        setTelegramAdminUrl(data.telegramAdminUrl || '');
        setTelegramNotifyResult(data.telegramResult);
        onOrderSuccess(data.order);

        // Confetti celebration
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // ignore
        }
      } else {
        setError(data.message || 'Failed to place order');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-[#E8DFD3] overflow-hidden my-6 relative flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#EDE4D9] flex items-center justify-between bg-[#FAF8F5] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#8B5A2B] text-white flex items-center justify-center font-bold text-sm">
              LH
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-[#2D1F17]">
                {completedOrder ? t.orderSuccessTitle : t.checkoutTitle}
              </h2>
              <p className="text-xs text-[#7C6A5A]">Lin Htet IT Service</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#EBE2D7] text-[#645347] flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {completedOrder ? (
            /* Order Placed Success View */
            <div id="printable-receipt" className="space-y-6">
              <div className="text-center space-y-3 py-2">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-inner">
                  <Check className="w-9 h-9 stroke-[3]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#2D1F17]">
                  {t.orderSuccessTitle}
                </h3>
                <p className="text-xs sm:text-sm text-[#645347] max-w-md mx-auto">
                  {t.orderSuccessMsg}
                </p>
              </div>

              {/* Order Reference Card */}
              <div className="bg-[#FAF6F0] p-4 sm:p-5 rounded-2xl border border-[#EFE5D8] space-y-3">
                <div className="flex items-center justify-between border-b border-[#E8DCCF] pb-3">
                  <span className="text-xs text-[#7C6A5A] font-semibold">{t.orderIdLabel}:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base sm:text-lg font-extrabold text-[#7C4A21] bg-white px-3 py-1 rounded-lg border border-[#E2CEBD]">
                      #{completedOrder.id}
                    </span>
                    <button
                      onClick={() => handleCopy(completedOrder.id, 'order-id')}
                      className="p-1.5 text-xs text-[#8B5A2B] hover:bg-[#EAE0D5] rounded-md transition"
                      title="Copy Order ID"
                    >
                      {copiedAccount === 'order-id' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-[#544337]">
                  <div>
                    <span className="text-[#8C7A6D] block">{t.fullName}:</span>
                    <span className="font-semibold text-[#2D1F17]">{completedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-[#8C7A6D] block">{t.phone}:</span>
                    <span className="font-semibold text-[#2D1F17]">{completedOrder.customerPhone}</span>
                  </div>
                  <div>
                    <span className="text-[#8C7A6D] block">{t.subtotal}:</span>
                    <span className="font-bold text-[#7C4A21]">{Number(completedOrder.totalAmount).toLocaleString()} MMK</span>
                  </div>
                  <div>
                    <span className="text-[#8C7A6D] block">{t.paymentMethod}:</span>
                    <span className="font-semibold text-[#2D1F17]">{completedOrder.paymentMethod}</span>
                  </div>
                </div>

                {/* Instant License Key if already fulfilled */}
                {completedOrder.deliveredKeys && completedOrder.deliveredKeys.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#E8DCCF] space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                      <Key className="w-4 h-4 text-emerald-600" />
                      <span>{t.deliveredKeysTitle}:</span>
                    </div>
                    {completedOrder.deliveredKeys.map((keyStr, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded-xl border border-emerald-300 font-mono text-xs text-[#1E3A2F] flex items-center justify-between">
                        <span className="select-all break-all">{keyStr}</span>
                        <button
                          onClick={() => handleCopy(keyStr, `key-${idx}`)}
                          className="ml-2 text-xs text-emerald-700 hover:text-emerald-900 shrink-0 font-bold"
                        >
                          {copiedAccount === `key-${idx}` ? t.copied : t.copy}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Instant Telegram & WhatsApp Dispatch Action Hub */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#5C3618]">
                  <span>
                    {lang === 'my' ? 'အော်ဒါပြေစာ တိုက်ရိုက်ပေးပို့ရန်' : 'Instant Direct Dispatch:'}
                  </span>
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ⚡ Auto-Notified
                  </span>
                </div>

                {/* Telegram Button */}
                <a
                  href={telegramAdminUrl || `https://t.me/${settings?.telegramUsername || 'linhtet_itservice'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <Send className="w-4 h-4" />
                  <span>{t.sendToTelegram} (@{settings?.telegramUsername || 'linhtet_itservice'})</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>

                {/* WhatsApp Button */}
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{t.sendToWhatsapp}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </a>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#EDE4D9]">
                <button
                  onClick={handlePrintReceipt}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-[#D5C2B1] hover:bg-[#F5ECE3] text-[#5C3618] text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>{lang === 'my' ? 'ပြေစာ Print / Save' : 'Print Receipt'}</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onTrackOrder(completedOrder.id);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#8B5A2B] hover:bg-[#72451E] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs"
                >
                  <Search className="w-4 h-4" />
                  <span>{t.trackOrder}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Order Entry Form */
            <form onSubmit={handleSubmitOrder} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Order Items Summary */}
              <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#EDE4D9] space-y-2">
                <span className="text-xs font-bold text-[#5C3618] block">
                  {lang === 'my' ? 'ဝယ်ယူမည့် ပစ္စည်းများ' : 'Order Summary'} ({items.length})
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {items.map((it) => (
                    <div key={it.product.id} className="flex justify-between items-center text-xs">
                      <span className="text-[#3D281D] font-medium truncate max-w-[220px]">
                        {it.product.title} <span className="text-[#8B5A2B] font-bold">x{it.quantity}</span>
                      </span>
                      <span className="font-bold text-[#7C4A21]">
                        {Number(it.product.price * it.quantity).toLocaleString()} MMK
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#E6DDD2] pt-2 flex justify-between items-center text-sm font-extrabold text-[#2D1F17]">
                  <span>{t.subtotal}:</span>
                  <span className="text-[#7C4A21] text-base">
                    {Number(totalAmount).toLocaleString()} MMK
                  </span>
                </div>
              </div>

              {/* Step 1: Customer Contact Form */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#7C4A21] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#8B5A2B] text-white flex items-center justify-center text-[10px]">1</span>
                  <span>{t.customerInfo}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#544337] block mb-1">
                      {t.fullName}
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={lang === 'my' ? 'သင့်အမည်' : 'Your Name'}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#D5C2B1] focus:border-[#8B5A2B] focus:outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#544337] block mb-1">
                      {t.phone} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="09..."
                      className="w-full text-xs p-2.5 rounded-xl border border-[#D5C2B1] focus:border-[#8B5A2B] focus:outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#544337] block mb-1">
                      {t.email}
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      className="w-full text-xs p-2.5 rounded-xl border border-[#D5C2B1] focus:border-[#8B5A2B] focus:outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#544337] block mb-1 flex items-center gap-1">
                      <Send className="w-3 h-3 text-[#0088cc]" />
                      <span>{t.telegramUser}</span>
                    </label>
                    <input
                      type="text"
                      value={customerTelegram}
                      onChange={(e) => setCustomerTelegram(e.target.value)}
                      placeholder="@username"
                      className="w-full text-xs p-2.5 rounded-xl border border-[#D5C2B1] focus:border-[#8B5A2B] focus:outline-none bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#544337] block mb-1">
                    {t.note}
                  </label>
                  <input
                    type="text"
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    placeholder={lang === 'my' ? 'ထပ်ဆောင်းမှတ်ချက် (ဥပမာ- Canva အတွက် email သီးသန့်)' : 'Additional request / notes'}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#D5C2B1] focus:border-[#8B5A2B] focus:outline-none bg-white"
                  />
                </div>
              </div>

              {/* Step 2: Payment Gateway Selection */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-[#7C4A21] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#8B5A2B] text-white flex items-center justify-center text-[10px]">2</span>
                  <span>{t.paymentMethod}</span>
                </h4>

                {/* Payment Accounts Tab Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {settings?.paymentAccounts?.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setSelectedPayment(acc.name)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer text-left ${
                        selectedPayment === acc.name
                          ? 'border-[#8B5A2B] bg-[#F5ECE3] text-[#7C4A21] shadow-2xs font-bold'
                          : 'border-[#EDE4D9] bg-white text-[#544337] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5 text-[#8B5A2B] shrink-0" />
                      <span className="truncate">{acc.name}</span>
                    </button>
                  ))}
                </div>

                {/* Selected Payment Details Box */}
                {currentAccount && (
                  <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#EFE5D8] space-y-3">
                    <p className="text-xs text-[#7C6A5A]">
                      {t.paymentInstructions}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E8DCCF]">
                      <div className="space-y-0.5 text-center sm:text-left">
                        <span className="text-[10px] text-[#8C7A6D] uppercase tracking-wider font-bold block">
                          {currentAccount.name}
                        </span>
                        <div className="text-sm sm:text-base font-extrabold text-[#2D1F17] font-mono">
                          {currentAccount.accountNumber}
                        </div>
                        <span className="text-xs text-[#7C6A5A]">
                          {t.accountName}: <strong className="text-[#2D1F17]">{currentAccount.accountName}</strong>
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopy(currentAccount.accountNumber, currentAccount.id)}
                        className="py-1.5 px-3 rounded-lg bg-[#8B5A2B] hover:bg-[#72451E] text-white text-xs font-bold flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-2xs"
                      >
                        {copiedAccount === currentAccount.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{t.copied}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{t.copy}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* QR Code if present */}
                    {currentAccount.qrCode && (
                      <div className="flex items-center gap-3 bg-white/70 p-2.5 rounded-xl border border-[#E8DCCF]">
                        <img 
                          src={currentAccount.qrCode} 
                          alt="QR Code" 
                          className="w-16 h-16 object-cover rounded-lg border border-stone-200" 
                        />
                        <div className="text-xs text-[#5C4533]">
                          <span className="font-bold block flex items-center gap-1">
                            <QrCode className="w-3.5 h-3.5 text-[#8B5A2B]" />
                            QR Pay Scanner
                          </span>
                          <span className="text-[11px] text-[#7C6A5A]">
                            App မှ QR scan ဖတ်၍ တိုက်ရိုက် ငွေလွှဲနိုင်ပါသည်
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Payment Proof input */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-[11px] font-semibold text-[#544337] block mb-1">
                          {t.paymentRef}
                        </label>
                        <input
                          type="text"
                          value={paymentRef}
                          onChange={(e) => setPaymentRef(e.target.value)}
                          placeholder="e.g. 849201"
                          className="w-full text-xs p-2 rounded-xl border border-[#D5C2B1] focus:border-[#8B5A2B] focus:outline-none bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[#544337] block mb-1">
                          {t.paymentSlip}
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="w-full text-xs p-1 text-[#544337] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#8B5A2B] file:text-white hover:file:bg-[#72451E] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-4 rounded-xl bg-[#8B5A2B] hover:bg-[#72451E] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span>{t.processing}</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{t.confirmOrder} • {Number(totalAmount).toLocaleString()} MMK</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
