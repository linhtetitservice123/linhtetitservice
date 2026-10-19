import React from 'react';
import { Monitor, Tablet, Smartphone, Maximize2 } from 'lucide-react';
import { DeviceFormat, Language } from '../types';
import { translations } from '../translations';

interface DeviceFrameWrapperProps {
  format: DeviceFormat;
  setFormat: (format: DeviceFormat) => void;
  lang: Language;
  children: React.ReactNode;
}

export const DeviceFrameWrapper: React.FC<DeviceFrameWrapperProps> = ({
  format,
  setFormat,
  lang,
  children
}) => {
  const t = translations[lang];

  if (format === 'desktop') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#24170E] py-6 sm:py-8 px-2 sm:px-4 flex flex-col items-center justify-start overflow-x-hidden">
      {/* Floating Format Switcher Toolbar */}
      <div className="sticky top-4 z-50 mb-6 bg-[#3D2514]/90 backdrop-blur-md border border-[#8B5A2B]/40 rounded-2xl p-1.5 px-3 flex items-center gap-3 shadow-xl text-white">
        <span className="text-xs text-[#E8CDB5] font-semibold hidden sm:inline">
          Format View:
        </span>

        <div className="flex items-center gap-1 bg-[#28170B] p-1 rounded-xl">
          <button
            onClick={() => setFormat('desktop')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              (format as string) === 'desktop' ? 'bg-[#8B5A2B] text-white shadow-xs' : 'text-[#CDB59E] hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>

          <button
            onClick={() => setFormat('tablet')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              format === 'tablet' ? 'bg-[#8B5A2B] text-white shadow-xs' : 'text-[#CDB59E] hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet (iPad)</span>
          </button>

          <button
            onClick={() => setFormat('mobile')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              format === 'mobile' ? 'bg-[#8B5A2B] text-white shadow-xs' : 'text-[#CDB59E] hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Phone (Mobile)</span>
          </button>
        </div>

        <button
          onClick={() => setFormat('desktop')}
          className="text-xs text-[#E8CDB5] hover:text-white flex items-center gap-1 pl-2 border-l border-[#643E1F]"
          title="Exit Device Preview"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Full Screen</span>
        </button>
      </div>

      {/* Device Frame Wrapper */}
      {format === 'tablet' && (
        <div className="w-full max-w-[820px] bg-[#1C120B] p-4 rounded-[40px] shadow-2xl border-4 border-[#3D2514] ring-1 ring-white/10 relative transition-all duration-300">
          {/* Tablet Front Camera Notch */}
          <div className="w-2.5 h-2.5 rounded-full bg-black/80 mx-auto mb-3 border border-white/10" />

          {/* Screen Container */}
          <div className="bg-[#FAF8F5] rounded-2xl overflow-y-auto max-h-[85vh] shadow-inner">
            {children}
          </div>

          {/* Tablet Home Bar */}
          <div className="w-32 h-1 bg-white/20 rounded-full mx-auto mt-3" />
        </div>
      )}

      {format === 'mobile' && (
        <div className="w-full max-w-[420px] bg-[#1C120B] p-3 sm:p-4 rounded-[48px] shadow-2xl border-4 border-[#3D2514] ring-1 ring-white/10 relative transition-all duration-300">
          {/* Dynamic Island / Notch */}
          <div className="w-24 h-5 bg-black rounded-full mx-auto mb-2 flex items-center justify-center border border-white/10">
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-white/10 mr-2" />
          </div>

          {/* Screen Container */}
          <div className="bg-[#FAF8F5] rounded-[32px] overflow-y-auto max-h-[82vh] shadow-inner">
            {children}
          </div>

          {/* Phone Home Bar */}
          <div className="w-28 h-1 bg-white/30 rounded-full mx-auto mt-2.5" />
        </div>
      )}
    </div>
  );
};
