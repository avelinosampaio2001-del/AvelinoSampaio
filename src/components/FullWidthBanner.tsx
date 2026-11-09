import React, { useState, useEffect, useRef } from 'react';
import { BannerSlide } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play, 
  ArrowRight,
  Images
} from 'lucide-react';

interface FullWidthBannerProps {
  slides: BannerSlide[];
  onOpenCustomizer: () => void;
  onScrollToQuote: () => void;
  onScrollToCatalog: () => void;
  onScrollToPortfolio?: () => void;
  onScrollToGallery?: () => void;
  onOpenAdmin?: () => void;
}

export const FullWidthBanner: React.FC<FullWidthBannerProps> = ({
  slides,
  onOpenCustomizer,
  onScrollToQuote,
  onScrollToCatalog,
  onScrollToPortfolio,
  onScrollToGallery,
  onOpenAdmin
}) => {
  const activeSlides = slides.filter(s => s.active !== false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const SLIDE_DURATION = 5000; // 5 seconds per slide
  const PROGRESS_STEP = 50;

  // Reset to first slide if out of bounds
  useEffect(() => {
    if (currentIndex >= activeSlides.length) {
      setCurrentIndex(0);
    }
  }, [activeSlides.length, currentIndex]);

  // Handle auto-play timer and smooth progress bar
  useEffect(() => {
    if (!isPlaying || activeSlides.length <= 1) {
      return;
    }

    setProgress(0);
    const startTime = Date.now();

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / SLIDE_DURATION) * 100);
      setProgress(pct);
    }, PROGRESS_STEP);

    intervalRef.current = setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % activeSlides.length);
      setProgress(0);
    }, SLIDE_DURATION);

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentIndex, isPlaying, activeSlides.length]);

  const handleNext = () => {
    setProgress(0);
    setCurrentIndex(prev => (prev + 1) % activeSlides.length);
  };

  const handlePrev = () => {
    setProgress(0);
    setCurrentIndex(prev => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const handleSelectSlide = (idx: number) => {
    setProgress(0);
    setCurrentIndex(idx);
  };

  const currentSlide = activeSlides[currentIndex] || activeSlides[0];

  const handleCtaClick = (action?: 'customizer' | 'quote' | 'catalog') => {
    if (action === 'customizer') onOpenCustomizer();
    else if (action === 'quote') onScrollToQuote();
    else onScrollToCatalog();
  };

  if (!currentSlide) return null;

  return (
    <div 
      className="relative w-full overflow-hidden bg-slate-950 text-white select-none border-b border-slate-800"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* 1. Main Background Image Container with Smooth Crossfade */}
      <div className="relative w-full h-[400px] sm:h-[460px] md:h-[500px] lg:h-[540px] overflow-hidden">
        {activeSlides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Image with subtle zoom effect */}
              {(() => {
                const normImg = slide.image.startsWith('/public/') ? slide.image.replace(/^\/public\//, '/') : slide.image;
                return (
                  <img
                    src={normImg}
                    alt={slide.title}
                    className={`w-full h-full object-cover object-center transform transition-transform duration-6000 ease-out ${
                      isActive ? 'scale-105' : 'scale-100'
                    }`}
                    referrerPolicy="no-referrer"
                  />
                );
              })()}

              {/* Lightweight Gradient Scrim for crisp typography without darkening the photo */}
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
            </div>
          );
        })}

        {/* 2. Simplified Clean Content Layer (Minimalist & Punchy) */}
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 sm:p-10 md:p-14 max-w-7xl mx-auto">
          {/* Top Bar: Discreet Admin Link Only */}
          <div className="flex justify-end">
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                title="Gerir Imagens do Banner no Painel Admin"
                className="px-2.5 py-1 rounded-lg bg-black/50 hover:bg-[#FF6B00] hover:text-black text-slate-300 text-[11px] font-bold border border-slate-700/70 hover:border-[#FF6B00] transition-all backdrop-blur-xs"
              >
                <span>Editar Banners 🔒</span>
              </button>
            )}
          </div>

          {/* Center-Left Content: Direct Main Title & Actions (No overlapping taglines above) */}
          <div className="max-w-2xl space-y-4 my-auto md:my-0 md:pb-6">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-[1.15] drop-shadow-md text-balance">
              {currentSlide.title}
            </h1>

            {/* Clean Direct Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => handleCtaClick(currentSlide.ctaAction || 'customizer')}
                className="px-5 py-3 bg-[#FF6B00] hover:bg-[#EA580C] text-black font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2"
              >
                <span>{currentSlide.ctaText || 'Personalizar Agora'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {(onScrollToPortfolio || onScrollToGallery) && (
                <button
                  onClick={onScrollToPortfolio || onScrollToGallery}
                  className="px-4 py-3 bg-black/50 hover:bg-black/80 text-white font-bold text-xs sm:text-sm rounded-xl border border-slate-700/80 backdrop-blur-sm transition-colors flex items-center gap-2"
                >
                  <Images className="w-4 h-4 text-[#FF6B00]" />
                  <span>Ver Portfólio de Brindes</span>
                </button>
              )}
            </div>
          </div>

          {/* Bottom Bar: Minimal Slide Dots & Navigation Controls */}
          <div className="flex items-center justify-between gap-4 pt-3">
            {/* Slide Dots / Indicators */}
            <div className="flex items-center gap-2">
              {activeSlides.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => handleSelectSlide(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'w-7 bg-[#FF6B00]'
                      : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Play/Pause & Left/Right Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                title={isPlaying ? 'Pausar' : 'Reproduzir'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handlePrev}
                className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                title="Slide Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleNext}
                className="w-8 h-8 rounded-full bg-[#FF6B00] hover:bg-[#EA580C] text-black flex items-center justify-center transition-colors shadow"
                title="Próximo Slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Subtle Dynamic Linear Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/15 z-30">
          <div 
            className="h-full bg-[#FF6B00] transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
