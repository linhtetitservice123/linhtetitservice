import React from 'react';
import { 
  Send, 
  MessageSquare, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Lock,
  Search,
  ExternalLink
} from 'lucide-react';
import { StoreSettings, Language } from '../types';
import { translations } from '../translations';

interface FooterProps {
  settings: StoreSettings | null;
  lang: Language;
  onOpenTracker: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  lang,
  onOpenTracker,
  onOpenAdmin
}) => {
  const t = translations[lang];

  return (
    <footer className="bg-[#2D1F17] text-[#EDE4D9] border-t border-[#4A3222] pt-12 pb-8 mt-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#4A3222]/80">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#8B5A2B] text-white flex items-center justify-center font-bold text-base border border-[#C68B59]/40">
                LH
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                Lin Htet IT Service
              </span>
            </div>
            <p className="text-xs text-[#CDB59E] leading-relaxed">
              {lang === 'my'
                ? 'အကောင်းဆုံး Digital Products များနှင့် Software Service များကို ယုံကြည်စိတ်ချစွာ ဝယ်ယူနိုင်သော ပလက်ဖောင်းဖြစ်ပါသည်။'
                : 'Your trusted partner for authentic digital products, software licenses, and IT support.'}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-xs text-emerald-300 font-semibold">24/7 Automated Orders</span>
            </div>
          </div>

          {/* Contact Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#E8CDB5] uppercase tracking-wider">
              {lang === 'my' ? 'ဆက်သွယ်ရန်' : 'Direct Contacts'}
            </h4>
            <div className="space-y-2 text-xs text-[#CDB59E]">
              {settings?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#C68B59]" />
                  <span>{settings.phone}</span>
                </div>
              )}
              {settings?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#C68B59]" />
                  <span>{settings.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#C68B59]" />
                <span>{settings?.address || 'Yangon, Myanmar'}</span>
              </div>
            </div>
          </div>

          {/* Instant Channels */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#E8CDB5] uppercase tracking-wider">
              {lang === 'my' ? 'Telegram & WhatsApp ချိတ်ဆက်မှု' : 'Live Channels'}
            </h4>
            <div className="space-y-2">
              {settings?.telegramUsername && (
                <a
                  href={`https://t.me/${settings.telegramUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-[#64B5F6] hover:text-white transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram: @{settings.telegramUsername}</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}
              {settings?.whatsappNumber && (
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-[#81C784] hover:text-white transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp: {settings.whatsappNumber}</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}
              <button
                onClick={onOpenTracker}
                className="flex items-center gap-2 text-xs text-[#E8CDB5] hover:text-white transition cursor-pointer pt-1"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{t.trackOrder}</span>
              </button>
            </div>
          </div>

          {/* Payments Accepted */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#E8CDB5] uppercase tracking-wider">
              {lang === 'my' ? 'လက်ခံသော ငွေပေးချေမှုများ' : 'Accepted Payments'}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {['KBZPay', 'WavePay', 'KBZ Bank', 'AYA Bank', 'CB Bank', 'USDT'].map((pay) => (
                <span
                  key={pay}
                  className="text-[11px] bg-[#3D281D] text-[#E8CDB5] px-2.5 py-1 rounded-md border border-[#543827] font-medium"
                >
                  {pay}
                </span>
              ))}
            </div>
            <div className="pt-2">
              <button
                onClick={onOpenAdmin}
                className="text-xs text-[#A68A75] hover:text-white flex items-center gap-1.5 transition cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-[#8B5A2B]" />
                <span>Admin Backend Login</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#9E8675] gap-2">
          <p>© {new Date().getFullYear()} Lin Htet IT Service. All Rights Reserved.</p>
          <p className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure Digital Delivery & Instant Order Notification System</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
