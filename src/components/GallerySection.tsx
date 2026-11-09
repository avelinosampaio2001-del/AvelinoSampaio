import React, { useState, useMemo } from 'react';
import { GALLERY_ITEMS, GalleryItem } from '../data/galleryItems';
import { 
  Search, 
  Eye, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  FileText,
  Building2,
  Tag
} from 'lucide-react';

interface GallerySectionProps {
  items?: GalleryItem[];
  onOpenCustomizer: () => void;
  onScrollToQuote: (techniqueSuggested?: string) => void;
  onOpenAdmin?: () => void;
}

type CategoryFilter = 'all' | 'textil' | 'brindes' | 'papelaria' | 'epi' | 'frotas';

export const GallerySection: React.FC<GallerySectionProps> = ({
  items = GALLERY_ITEMS,
  onOpenCustomizer,
  onScrollToQuote,
  onOpenAdmin
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);

  const categories: { id: CategoryFilter; label: string }[] = [
    { id: 'all', label: 'Todos os Brindes' },
    { id: 'textil', label: 'Têxtil & Uniformes' },
    { id: 'brindes', label: 'Brindes Executivos' },
    { id: 'papelaria', label: 'Papelaria & Dossiers' },
    { id: 'epi', label: 'Segurança & EPI' },
    { id: 'frotas', label: 'Frotas & Viaturas' },
  ];

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        item.title.toLowerCase().includes(q) ||
        item.technique.toLowerCase().includes(q) ||
        item.client.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  const activeItem = activeItemIndex !== null ? filteredItems[activeItemIndex] : null;

  const handleNextLightbox = () => {
    if (activeItemIndex === null) return;
    setActiveItemIndex((activeItemIndex + 1) % filteredItems.length);
  };

  const handlePrevLightbox = () => {
    if (activeItemIndex === null) return;
    setActiveItemIndex((activeItemIndex - 1 + filteredItems.length) % filteredItems.length);
  };

  return (
    <section id="portfolio" className="py-16 bg-slate-900 text-white scroll-mt-14 relative">
      {/* Anchor for backward compatibility with #galeria */}
      <span id="galeria" className="absolute -top-14" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-bold text-[#FF6B00] tracking-widest uppercase block mb-1.5">
              Oficina Gráfica · Portfólio de Produção Real
            </span>
            <h2 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white">
              Portfólio de Trabalhos Quieto Angola
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Explora as nossas produções reais para empresas, conferências e eventos em Luanda. Personalização em estampas DTF, gravação a laser, bordados e impressão de alta fidelidade.
            </p>
          </div>

          {/* Quick Search & Admin Shortcut */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar brinde, técnica..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6B00] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition-colors whitespace-nowrap"
                title="Adicionar ou remover fotos no painel de administração"
              >
                <span>Gerir Fotos 🔒</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map((cat) => {
            const count = cat.id === 'all' 
              ? items.length 
              : items.filter(i => i.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#FF6B00] text-black shadow-lg shadow-orange-500/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  isSelected ? 'bg-black/20 text-black' : 'bg-slate-900 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Gallery Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-slate-950/60 rounded-2xl border border-slate-800">
            <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-300">Nenhum brinde encontrado</h3>
            <p className="text-xs text-slate-500 mt-1">Tenta outro termo de pesquisa ou seleciona outra categoria.</p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl text-white transition-colors"
            >
              Ver Todos os Brindes ({items.length})
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className="group bg-slate-950 border border-slate-800 hover:border-[#FF6B00]/60 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col shadow-sm hover:shadow-xl hover:shadow-orange-950/30"
              >
                {/* Image Container with Hover Overlay */}
                <div 
                  className="relative h-64 overflow-hidden bg-slate-900 cursor-pointer"
                  onClick={() => setActiveItemIndex(index)}
                >
                  <img
                    src={item.image.startsWith('/public/') ? item.image.replace(/^\/public\//, '/') : item.image}
                    alt={item.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  
                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-200">
                    {item.categoryLabel}
                  </div>

                  {/* Hover Overlay Icon */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="p-2.5 bg-[#FF6B00] text-black rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      <Eye className="w-4 h-4" />
                      <span>Ver em Detalhe</span>
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-[#FF6B00] tracking-wide mb-1 flex items-center gap-1.5">
                      <Tag className="w-3 h-3" />
                      <span className="truncate">{item.technique}</span>
                    </div>

                    <h3 
                      onClick={() => setActiveItemIndex(index)}
                      className="text-sm font-bold text-white group-hover:text-[#FF6B00] transition-colors cursor-pointer line-clamp-2"
                    >
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Footer Client & Quote Button */}
                  <div className="pt-4 mt-4 border-t border-slate-900 flex items-center justify-between gap-3 text-xs">
                    <div className="text-slate-500 text-[11px] truncate flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{item.client}</span>
                    </div>

                    <button
                      onClick={() => onScrollToQuote(item.title)}
                      className="text-xs font-bold text-[#FF6B00] hover:text-[#FF8833] flex items-center gap-1 shrink-0"
                    >
                      <span>Orçar</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Callout banner to encourage customization */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-black via-slate-950 to-orange-950/40 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-black text-white">
              Queres estampar a marca da tua empresa num destes brindes?
            </h4>
            <p className="text-xs text-slate-400 max-w-xl">
              Utiliza o nosso Estúdio 2D em tempo real para visualizar o logótipo ou pede uma cotação proforma com emissão de fatura certificada.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenCustomizer}
              className="px-5 py-3 bg-[#FF6B00] hover:bg-[#EA580C] text-black font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span>Personalizador 3D</span>
            </button>
            <button
              onClick={() => onScrollToQuote()}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors"
            >
              Pedir Orçamento
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeItem && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveItemIndex(null)}
        >
          <div 
            className="relative bg-slate-950 border border-slate-800 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveItemIndex(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Image View with Nav Chevrons */}
            <div className="relative md:w-3/5 bg-black flex items-center justify-center min-h-[300px] md:min-h-[460px] overflow-hidden">
              <img
                src={activeItem.image.startsWith('/public/') ? activeItem.image.replace(/^\/public\//, '/') : activeItem.image}
                alt={activeItem.title}
                className="w-full h-full object-contain max-h-[70vh]"
                referrerPolicy="no-referrer"
              />

              {/* Prev/Next inside lightbox */}
              <button
                onClick={(e) => { e.stopPropagation(); handlePrevLightbox(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white border border-white/20 flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNextLightbox(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white border border-white/20 flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div className="absolute bottom-3 left-3 bg-black/80 px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-300">
                {(activeItemIndex ?? 0) + 1} de {filteredItems.length}
              </div>
            </div>

            {/* Right Information Panel */}
            <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="inline-block px-2.5 py-1 rounded bg-[#FF6B00]/20 text-[#FF6B00] text-[11px] font-bold uppercase tracking-wider mb-2 border border-[#FF6B00]/30">
                  {activeItem.categoryLabel}
                </div>

                <h3 className="text-xl font-black font-display text-white mb-3">
                  {activeItem.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed mb-5">
                  {activeItem.description}
                </p>

                <div className="space-y-3 py-4 border-y border-slate-800 text-xs">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block text-[11px]">Técnica Gráfica Aplicada:</span>
                      <strong className="text-white font-semibold">{activeItem.technique}</strong>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block text-[11px]">Cliente / Projeto:</span>
                      <strong className="text-white font-semibold">{activeItem.client}</strong>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Layers className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block text-[11px]">Quantidade Mínima Sugerida:</span>
                      <strong className="text-white font-semibold">{activeItem.minQuantity} unidades</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons in Modal */}
              <div className="pt-6 space-y-2">
                <button
                  onClick={() => {
                    setActiveItemIndex(null);
                    onScrollToQuote(activeItem.title);
                  }}
                  className="w-full py-3 bg-[#FF6B00] hover:bg-[#EA580C] text-black font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Pedir Orçamento Deste Brinde</span>
                </button>

                <button
                  onClick={() => {
                    setActiveItemIndex(null);
                    onOpenCustomizer();
                  }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors"
                >
                  Personalizar no Estúdio 2D
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
