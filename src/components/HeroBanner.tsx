import React from 'react';
import { 
  Search, 
  Zap, 
  ShieldCheck, 
  Send, 
  MessageSquare, 
  Sparkles,
  Headphones,
  CheckCircle2
} from 'lucide-react';
import { Language, Category } from '../types';
import { translations } from '../translations';

interface HeroBannerProps {
  lang: Language;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onTrackOrder: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  lang,
  searchQuery,
  setSearchQuery,
  categories,
  selectedCategory,
  setSelectedCategory,
  onTrackOrder
}) => {
  const t = translations[lang];

  return (
    <div className="relative overflow-hidden bg-linear-to-b from-white via-[#FAF7F2] to-[#FAF8F5] border-b border-[#EFE8DF] pt-8 pb-10">
      {/* Subtle background glow effect */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#EBDCCF]/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-10 w-72 h-72 bg-[#C68B59]/10 rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5ECE3] border border-[#E2CEBD] text-[#7C4A21] text-xs font-semibold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#8B5A2B]" />
            <span>
              {lang === 'my' 
                ? 'Official Digital Store & IT Solutions' 
                : '100% Genuine Digital License & Accounts'}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2D1F17] tracking-tight leading-tight">
            {lang === 'my' ? (
              <>
                <span className="text-[#8B5A2B]">Lin Htet IT Service</span> မှ စိတ်ချရသော <br className="hidden sm:inline" />
                Digital Products များကို တန်းဝယ်ယူပါ
              </>
            ) : (
              <>
                Buy Any Digital Product & Software from <br className="hidden sm:inline" />
                <span className="text-[#8B5A2B]">Lin Htet IT Service</span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-[#645347] text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-normal">
            {t.heroSubtitle}
          </p>

          {/* Search bar */}
          <div className="pt-2 max-w-2xl mx-auto">
            <div className="relative flex items-center shadow-md rounded-2xl bg-white border-2 border-[#E3D6C8] focus-within:border-[#8B5A2B] transition-all overflow-hidden p-1.5">
              <div className="pl-3 text-[#8B5A2B]">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full px-3 py-2 text-sm sm:text-base text-[#2D1F17] placeholder-[#A49486] bg-transparent focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-2 text-xs text-[#9C8C80] hover:text-[#5C3618]"
                >
                  Clear
                </button>
              )}
              <button
                className="bg-[#8B5A2B] hover:bg-[#72451E] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 shadow-xs cursor-pointer"
              >
                {lang === 'my' ? 'ရှာဖွေမည်' : 'Search'}
              </button>
            </div>
          </div>

          {/* Trust Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs font-medium text-[#544337]">
            <div className="bg-white/90 border border-[#EDE4D9] rounded-xl p-2.5 flex items-center gap-2 justify-center shadow-2xs">
              <Zap className="w-4 h-4 text-[#8B5A2B] shrink-0" />
              <span>{lang === 'my' ? 'တန်းရ လိုင်စင်ကီးစနစ်' : 'Instant Key Delivery'}</span>
            </div>
            <div className="bg-white/90 border border-[#EDE4D9] rounded-xl p-2.5 flex items-center gap-2 justify-center shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
              <span>{lang === 'my' ? 'မူရင်း Genuine ၁၀၀%' : '100% Genuine'}</span>
            </div>
            <div className="bg-white/90 border border-[#EDE4D9] rounded-xl p-2.5 flex items-center gap-2 justify-center shadow-2xs">
              <Send className="w-4 h-4 text-[#0088cc] shrink-0" />
              <span>{lang === 'my' ? 'Telegram အော်ဒါတက်' : 'Telegram Instant Alert'}</span>
            </div>
            <div className="bg-white/90 border border-[#EDE4D9] rounded-xl p-2.5 flex items-center gap-2 justify-center shadow-2xs">
              <MessageSquare className="w-4 h-4 text-[#25D366] shrink-0" />
              <span>{lang === 'my' ? 'WhatsApp အော်ဒါချိတ်ဆက်' : 'WhatsApp Connect'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
