import React from 'react';
import { ShoppingBag, Search } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  cartTotal: number;
  portfolioCount?: number;
  isCloudSynced?: boolean;
  onOpenCart: () => void;
  onOpenCustomizer: () => void;
  onOpenTracker: () => void;
  onOpenAdmin: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  cartTotal,
  portfolioCount = 16,
  isCloudSynced = true,
  onOpenCart,
  onOpenCustomizer,
  onOpenTracker,
  onOpenAdmin,
  onNavigateSection
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Brand wordmark (single line, no clutter) */}
        <a 
          href="/" 
          onClick={(e) => { e.preventDefault(); onNavigateSection('topo'); }}
          className="flex items-center gap-2 tracking-tight whitespace-nowrap shrink-0 group"
        >
          <span className="w-8 h-8 rounded-lg bg-black text-[#FF6B00] flex items-center justify-center font-black font-display text-lg group-hover:scale-105 transition-transform shadow-sm">
            Q
          </span>
          <span className="text-xl font-black font-display text-slate-950 uppercase tracking-tighter">
            Quieto <span className="text-[#FF6B00]">Angola</span>
          </span>
        </a>

        {/* Zone 2: 4-5 clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-slate-700 tracking-wide uppercase">
          <a
            href="#catalogo"
            onClick={(e) => { e.preventDefault(); onNavigateSection('catalogo'); }}
            className="hover:text-[#FF6B00] transition-colors whitespace-nowrap shrink-0"
          >
            Catálogo
          </a>
          <a
            href="#portfolio"
            onClick={(e) => { e.preventDefault(); onNavigateSection('portfolio'); }}
            className="hover:text-[#FF6B00] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <span>Portfólio</span>
            <span className="text-[11px] font-mono text-stone-400 font-semibold tabular-nums">
              ({portfolioCount})
            </span>
          </a>
          <button
            onClick={onOpenCustomizer}
            className="hover:text-[#FF6B00] transition-colors whitespace-nowrap shrink-0 font-bold"
          >
            Personalizador 3D
          </button>
          <a
            href="#orcamento-rapido"
            onClick={(e) => { e.preventDefault(); onNavigateSection('orcamento-rapido'); }}
            className="hover:text-[#FF6B00] transition-colors whitespace-nowrap shrink-0"
          >
            Orçamentos
          </a>
          <button
            onClick={onOpenTracker}
            className="hover:text-[#FF6B00] transition-colors whitespace-nowrap shrink-0 text-slate-600 hover:text-slate-900"
          >
            Rastrear Encomenda
          </button>
          <a
            href="#contactos"
            onClick={(e) => { e.preventDefault(); onNavigateSection('contactos'); }}
            className="hover:text-[#FF6B00] transition-colors whitespace-nowrap shrink-0"
          >
            Contactos
          </a>
        </nav>

        {/* Zone 3: Actions (Sync, Cart & Admin) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Real-time Cloud Sync indicator */}
          <div 
            title={isCloudSynced ? "Base de dados sincronizada na nuvem em tempo real (PC & Telemóvel)" : "A sincronizar dados com a nuvem..."}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-stone-100/90 rounded-lg text-[10px] font-semibold text-stone-700 border border-stone-200"
          >
            <span className={`w-2 h-2 rounded-full ${isCloudSynced ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            <span>{isCloudSynced ? 'Nuvem Conectada' : 'A sincronizar'}</span>
          </div>

          <button
            onClick={onOpenAdmin}
            title="Painel de Administração (Preços, Imagens e Facturas)"
            className="p-2 text-slate-500 hover:text-black hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200"
          >
            <span className="sr-only">Painel Admin</span>
            <span className="text-xs font-bold hidden lg:inline mr-1 text-slate-700">Admin</span>
            🔒
          </button>

          <button
            onClick={onOpenCart}
            className="relative px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm whitespace-nowrap shrink-0"
          >
            <ShoppingBag className="w-4 h-4 text-[#FF6B00]" />
            <span className="hidden sm:inline">Carrinho</span>
            {cartCount > 0 && (
              <span className="bg-[#FF6B00] text-black font-extrabold px-1.5 py-0.5 rounded-md text-[11px] tabular-nums">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
