import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Monitor, 
  Tablet, 
  Smartphone, 
  ShieldCheck, 
  Send, 
  MessageSquare, 
  Lock, 
  Globe, 
  Menu, 
  X,
  Sparkles,
  ExternalLink,
  Star
} from 'lucide-react';
import { Language, DeviceFormat, StoreSettings } from '../types';
import { translations } from '../translations';

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
  format: DeviceFormat;
  setFormat: (format: DeviceFormat) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenTracker: () => void;
  onOpenAdmin: () => void;
  settings: StoreSettings | null;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  setLang,
  format,
  setFormat,
  cartCount,
  onOpenCart,
  onOpenTracker,
  onOpenAdmin,
  settings
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE3D9] shadow-xs transition-all">
      {/* Top Announcement Bar */}
      <div className="bg-[#4A2B13] text-[#F5ECE3] text-xs px-4 py-1.5 font-medium flex items-center justify-between">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            <span className="hidden sm:inline">
              {lang === 'my' 
                ? '⚡ အော်ဒါတင်လိုက်တာနဲ့ Telegram & WhatsApp သို့ အလိုအလျောက် သတိပေးချက် တန်းတက်ပါသည်' 
                : '⚡ Instant order alerts dispatched directly to Telegram & WhatsApp'}
            </span>
            <span className="sm:hidden">
              {lang === 'my' ? '⚡ Telegram & WhatsApp အော်ဒါစနစ်' : '⚡ Live Digital Store'}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Viewport Format Switcher Bar (Desktop / Tablet / Phone) */}
            <div className="flex items-center bg-[#3D220E] rounded-md px-1.5 py-0.5 border border-[#643E1F] text-[11px]">
              <span className="text-[#CDB59E] mr-1.5 hidden md:inline">Format:</span>
              <button
                onClick={() => setFormat('desktop')}
                title="Desktop Format (Full width)"
                className={`p-1 rounded flex items-center gap-1 transition ${
                  format === 'desktop' ? 'bg-[#8B5A2B] text-white font-semibold' : 'text-[#CDB59E] hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[10px]">PC</span>
              </button>
              <button
                onClick={() => setFormat('tablet')}
                title="Tablet Format (iPad view)"
                className={`p-1 rounded flex items-center gap-1 transition ${
                  format === 'tablet' ? 'bg-[#8B5A2B] text-white font-semibold' : 'text-[#CDB59E] hover:text-white'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[10px]">Tablet</span>
              </button>
              <button
                onClick={() => setFormat('mobile')}
                title="Phone Format (Mobile view)"
                className={`p-1 rounded flex items-center gap-1 transition ${
                  format === 'mobile' ? 'bg-[#8B5A2B] text-white font-semibold' : 'text-[#CDB59E] hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[10px]">Phone</span>
              </button>
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'my' ? 'en' : 'my')}
              className="flex items-center space-x-1 text-xs hover:text-[#E8CDB5] transition font-medium cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'my' ? 'EN' : 'မြန်မာ'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#8B5A2B] to-[#4A2B13] text-white flex items-center justify-center font-bold text-lg shadow-sm border border-[#C68B59]/30">
            LH
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-lg md:text-xl text-[#3D2412] tracking-tight">
                Lin Htet
              </h1>
              <span className="text-xs bg-[#F5ECE3] text-[#7C4A21] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-[#E8D4C3]">
                IT Service
              </span>
            </div>
            <p className="text-[11px] text-[#7C6A5A] hidden sm:block">
              {settings?.tagline || t.brandTagline}
            </p>
          </div>
        </div>

        {/* Desktop Quick Nav */}
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-[#4A3B30]">
          <a href="#products" className="hover:text-[#8B5A2B] transition flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-[#8B5A2B]" />
            <span>{t.allCategories}</span>
          </a>

          <button
            onClick={onOpenTracker}
            className="hover:text-[#8B5A2B] transition flex items-center gap-1 cursor-pointer"
          >
            <Search className="w-4 h-4 text-[#8B5A2B]" />
            <span>{t.trackOrder}</span>
          </button>

          <a
            href="#reviews"
            className="hover:opacity-90 transition flex items-center gap-1.5 text-xs font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 text-amber-900 shadow-2xs"
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>4.9★ {lang === 'my' ? 'သုံးသပ်ချက်များ' : 'Reviews'}</span>
          </a>

          {/* Quick Telegram Support */}
          {settings?.telegramUsername && (
            <a
              href={`https://t.me/${settings.telegramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0088cc] hover:opacity-80 transition flex items-center gap-1 text-xs bg-[#0088cc]/10 px-2.5 py-1 rounded-full font-semibold"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram Chat</span>
            </a>
          )}

          {/* Quick WhatsApp Support */}
          {settings?.whatsappNumber && (
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#25D366] hover:opacity-80 transition flex items-center gap-1 text-xs bg-[#25D366]/10 px-2.5 py-1 rounded-full font-semibold"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          )}
        </div>

        {/* Action Buttons: Cart & Admin */}
        <div className="flex items-center space-x-2.5">
          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative p-2.5 rounded-xl bg-[#F5ECE3] hover:bg-[#EBDCCF] text-[#5C3618] transition flex items-center gap-2 cursor-pointer border border-[#E2CEBD]"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-5 h-5 text-[#7C4A21]" />
            <span className="text-xs font-bold text-[#5C3618] hidden sm:inline">
              {t.cart}
            </span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#8B5A2B] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-bounce">
                {cartCount}
              </span>
            )}
          </button>

          {/* Admin Login Button */}
          <button
            onClick={onOpenAdmin}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#5C3618] border border-[#D5C2B1] transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-xs"
            title="Admin Backend Dashboard"
          >
            <Lock className="w-4 h-4 text-[#8B5A2B]" />
            <span className="hidden sm:inline">Admin</span>
          </button>

          {/* Mobile menu hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#4A3B30] hover:text-[#8B5A2B] transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-[#5C3618]" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#EAE3D9] px-4 py-4 space-y-3 shadow-lg">
          <div className="flex justify-between items-center pb-2 border-b border-[#F0EBE3]">
            <span className="text-xs text-[#7C6A5A] font-medium">{t.formatSwitcherTip}:</span>
            <div className="flex items-center bg-[#F5ECE3] rounded-md p-1 gap-1">
              <button
                onClick={() => { setFormat('desktop'); setMobileMenuOpen(false); }}
                className={`px-2 py-1 rounded text-xs ${format === 'desktop' ? 'bg-[#8B5A2B] text-white' : 'text-[#5C3618]'}`}
              >
                PC
              </button>
              <button
                onClick={() => { setFormat('tablet'); setMobileMenuOpen(false); }}
                className={`px-2 py-1 rounded text-xs ${format === 'tablet' ? 'bg-[#8B5A2B] text-white' : 'text-[#5C3618]'}`}
              >
                Tablet
              </button>
              <button
                onClick={() => { setFormat('mobile'); setMobileMenuOpen(false); }}
                className={`px-2 py-1 rounded text-xs ${format === 'mobile' ? 'bg-[#8B5A2B] text-white' : 'text-[#5C3618]'}`}
              >
                Mobile
              </button>
            </div>
          </div>

          <a
            href="#products"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-[#4A3B30] hover:text-[#8B5A2B]"
          >
            {t.allCategories}
          </a>

          <button
            onClick={() => { onOpenTracker(); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 text-sm font-medium text-[#4A3B30] hover:text-[#8B5A2B] flex items-center justify-between"
          >
            <span>{t.trackOrder}</span>
            <Search className="w-4 h-4 text-[#8B5A2B]" />
          </button>

          <a
            href="#reviews"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between py-2 text-sm font-medium text-[#4A3B30] hover:text-[#8B5A2B]"
          >
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{t.customerReviews}</span>
            </span>
            <span className="text-xs bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">4.9 ★</span>
          </a>

          <div className="pt-2 flex flex-col gap-2">
            {settings?.telegramUsername && (
              <a
                href={`https://t.me/${settings.telegramUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#0088cc]/10 text-[#0088cc] text-xs font-semibold"
              >
                <Send className="w-4 h-4" />
                <span>Contact Telegram: @{settings.telegramUsername}</span>
              </a>
            )}

            {settings?.whatsappNumber && (
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#25D366]/10 text-[#25D366] text-xs font-semibold"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp: {settings.whatsappNumber}</span>
              </a>
            )}

            <button
              onClick={() => { onOpenAdmin(); setMobileMenuOpen(false); }}
              className="w-full py-2 px-3 rounded-lg bg-[#FAF8F5] border border-[#D5C2B1] text-[#5C3618] text-xs font-semibold flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-[#8B5A2B]" />
              <span>Admin Backend Panel</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
