import React, { useState, useEffect } from 'react';
import { Product, ProductCategory, CartItem, PrintTechnique } from '../types';
import { PRODUCTS, formatKz, calculateVolumeDiscount, PRINT_TECHNIQUES } from '../data/products';
import { Search, Box, Plus, Check, ShoppingBag, Eye, SlidersHorizontal, Tag } from 'lucide-react';
import { ProductSilhouette } from './ProductSilhouettes';

export const ProductCardImage: React.FC<{ product: Product; className?: string }> = ({ product, className = "w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" }) => {
  const [hasError, setHasError] = useState(false);

  // Reset error when image URL changes
  useEffect(() => {
    setHasError(false);
  }, [product.image]);

  const rawSrc = product.image || '';
  // Normalize paths: strip leading /public/ since public folder is served from root in Vite
  const normalizedSrc = rawSrc.startsWith('/public/') ? rawSrc.replace(/^\/public\//, '/') : rawSrc;

  if (hasError || !normalizedSrc) {
    return (
      <div className="w-full h-full flex items-center justify-center p-2">
        <ProductSilhouette
          productId={product.id}
          side="frente"
          colorHex={product.availableColors?.[0]?.hex || '#121212'}
          design={{ textElements: [], graphics: [] }}
          interactive={false}
        />
      </div>
    );
  }

  return (
    <img
      key={normalizedSrc}
      src={normalizedSrc}
      alt={product.name}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => {
        // If it failed and had /public/, try without it, otherwise set hasError
        if (rawSrc.startsWith('/public/')) {
          setHasError(true);
        } else {
          setHasError(true);
        }
      }}
    />
  );
};

interface CatalogProps {
  products?: Product[];
  onAddToCart: (item: CartItem) => void;
  onOpenCustomizerWithProduct: (productId: string) => void;
  onOpenQuoteWithProduct: (productId: string, qty: number) => void;
  onOpenAdmin?: () => void;
}

const CATEGORIES: { id: ProductCategory; label: string }[] = [
  { id: 'todos', label: 'Todos os Brindes' },
  { id: 'vestuario', label: 'T-shirts & Vestuário' },
  { id: 'brindes_executivos', label: 'Brindes Executivos' },
  { id: 'bebidas_termicos', label: 'Bebidas & Térmicos' },
  { id: 'eventos_sacolas', label: 'Eventos & Sacolas' },
  { id: 'tecnologia', label: 'Tecnologia' }
];

export const Catalog: React.FC<CatalogProps> = ({
  products,
  onAddToCart,
  onOpenCustomizerWithProduct,
  onOpenQuoteWithProduct,
  onOpenAdmin
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedItemNotification, setAddedItemNotification] = useState<string | null>(null);

  // Quick view modal for product details
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const productList = products || PRODUCTS;

  const filteredProducts = productList.filter((p) => {
    const matchesCategory = selectedCategory === 'todos' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getProductQuantity = (productId: string, minOrder: number) => {
    return quantities[productId] || Math.max(1, minOrder);
  };

  const setProductQuantity = (productId: string, val: number) => {
    setQuantities(prev => ({ ...prev, [productId]: Math.max(1, val) }));
  };

  const handleQuickAdd = (product: Product) => {
    const qty = getProductQuantity(product.id, product.minOrder);
    const discount = calculateVolumeDiscount(qty);
    const unitPrice = Math.round(product.basePrice * (1 - discount));
    
    const cartItem: CartItem = {
      id: `item-${Date.now()}-${product.id}`,
      product,
      quantity: qty,
      selectedColor: product.availableColors[0],
      selectedSize: product.availableSizes ? product.availableSizes[0] : undefined,
      technique: product.supportedTechniques[0] || 'dtf',
      unitPrice,
      totalPrice: unitPrice * qty
    };

    onAddToCart(cartItem);
    setAddedItemNotification(product.name);
    setTimeout(() => setAddedItemNotification(null), 3000);
  };

  return (
    <section className="py-14 max-w-7xl mx-auto px-6" id="catalogo">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-[11px] font-bold text-[#FF6B00] tracking-widest uppercase block mb-1">
            Catálogo Oficial de Brindes & Vestuário · Quieto Angola
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-slate-950">
            Coleção Corporativa para Personalização
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Tabelas de atacado e retalho em Kwanzas (Kz). Escolhe qualquer artigo para prova gráfica digital em 3D ou orçamento imediato.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por nome ou artigo..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#FF6B00] bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-slate-950 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Added Notification Toast */}
      {addedItemNotification && (
        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between animate-fade-in shadow-sm">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Adicionado ao carrinho com sucesso: <strong>{addedItemNotification}</strong></span>
          </div>
          <span className="text-[11px] text-emerald-600">Ver no topo</span>
        </div>
      )}

      {/* Empty State: Zeroed Database awaiting Admin entry */}
      {productList.length === 0 ? (
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8 sm:p-12 text-center my-6 max-w-2xl mx-auto shadow-xs">
          <div className="w-14 h-14 bg-white border border-stone-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-stone-700 shadow-xs">
            <Box className="w-7 h-7 text-[#FF6B00]" />
          </div>
          <span className="text-[11px] font-bold text-[#FF6B00] uppercase tracking-wider block mb-1">
            Base de Dados Pronta para Cadastro
          </span>
          <h3 className="text-xl font-bold font-display text-stone-900 mb-2">
            Catálogo Aguardando Artigos Pelo Administrador
          </h3>
          <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed mb-6">
            A base de dados de produtos está limpa (0 artigos) para permitir que insiras pessoalmente os teus produtos, descrições, fotos e preços em Kwanzas.
          </p>
          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-950 hover:bg-[#FF6B00] text-white hover:text-black font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              <span>🔒 Aceder ao Painel Admin e Cadastrar Primeiro Produto</span>
            </button>
          )}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center my-6">
          <p className="text-sm font-bold text-stone-800">Nenhum artigo encontrado para o filtro selecionado.</p>
          <p className="text-xs text-stone-500 mt-1">Tenta selecionar outra categoria ou limpar o termo de pesquisa.</p>
        </div>
      ) : (
        /* Products Grid (matching user reference card format) */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const qty = getProductQuantity(product.id, product.minOrder);
            const hasCustomizer = product.allowCustomizer;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between hover:shadow-lg hover:border-slate-300 transition-all group"
              >
                <div>
                  {/* Image / Mockup Card Header */}
                  <div 
                    onClick={() => setQuickViewProduct(product)}
                    className="w-full aspect-square bg-[#F8F9FA] rounded-xl overflow-hidden mb-3.5 relative flex items-center justify-center p-3 cursor-pointer group-hover:bg-[#F1F3F5] transition-colors"
                  >
                    <ProductCardImage product={product} />

                    {/* Clean unboxed 3D indicator if eligible */}
                    {hasCustomizer && (
                      <div className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-sm text-[#FF6B00] font-bold text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                        <Box className="w-3 h-3" />
                        <span>3D</span>
                      </div>
                    )}
                  </div>

                  {/* Category kicker */}
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-0.5">
                    {product.categoryLabel}
                  </span>

                  {/* Product Name */}
                  <h3 
                    onClick={() => setQuickViewProduct(product)}
                    className="font-bold text-sm text-stone-900 leading-snug hover:text-[#FF6B00] transition-colors cursor-pointer line-clamp-2 mb-1.5"
                  >
                    {product.name}
                  </h3>

                  {/* Price Display */}
                  <div className="text-xs text-stone-500 mb-3">
                    <span>A partir de </span>
                    <span className="font-extrabold text-stone-950 text-sm tabular-nums">
                      {formatKz(product.basePrice)}
                    </span>
                  </div>
                </div>

                {/* Action Controls: Quantity + Add + Customizer */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 w-24">
                      <button
                        onClick={() => setProductQuantity(product.id, Math.max(product.minOrder, qty - 1))}
                        className="px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={product.minOrder}
                        value={qty}
                        onChange={(e) => setProductQuantity(product.id, Math.max(product.minOrder, Number(e.target.value) || 1))}
                        className="w-full text-center text-xs font-bold bg-transparent focus:outline-none"
                      />
                      <button
                        onClick={() => setProductQuantity(product.id, qty + 1)}
                        className="px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200"
                      >
                        +
                      </button>
                    </div>

                    {/* Add Button */}
                    <button
                      onClick={() => handleQuickAdd(product)}
                      className="flex-1 py-1.5 px-3 bg-stone-900 hover:bg-black text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#FF6B00]" />
                      <span>Adicionar</span>
                    </button>
                  </div>

                  {/* Customize Button if eligible */}
                  {hasCustomizer && (
                    <button
                      onClick={() => onOpenCustomizerWithProduct(product.id)}
                      className="w-full py-1.5 px-3 bg-stone-50 hover:bg-[#FF6B00] text-stone-800 hover:text-black border border-stone-200 hover:border-[#FF6B00] font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5"
                    >
                      <Box className="w-3.5 h-3.5 text-[#FF6B00]" />
                      <span>Simular no Modelo 3D</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}


      {/* --- PRODUCT QUICK VIEW MODAL --- */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
            >
              ✕
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-slate-100 rounded-xl p-4 aspect-square flex items-center justify-center">
                <ProductCardImage product={quickViewProduct} />
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-bold text-[#FF6B00] uppercase tracking-wider block">
                    {quickViewProduct.categoryLabel}
                  </span>
                  <h3 className="text-xl font-bold font-display text-slate-900 mt-0.5">
                    {quickViewProduct.name}
                  </h3>
                  <div className="text-lg font-black text-slate-950 mt-1 tabular-nums">
                    {formatKz(quickViewProduct.basePrice)} <span className="text-xs font-normal text-slate-500">/ un</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {quickViewProduct.description}
                </p>

                {/* Available Colors */}
                <div>
                  <span className="text-xs font-semibold text-slate-800 block mb-1.5">Cores Disponíveis:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {quickViewProduct.availableColors.map(c => (
                      <div
                        key={c.name}
                        title={c.name}
                        style={{ backgroundColor: c.hex }}
                        className="w-5 h-5 rounded-full border border-black/10 shadow-sm"
                      />
                    ))}
                  </div>
                </div>

                {/* Volume Discounts Table */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-[11px] space-y-1">
                  <span className="font-bold text-slate-800 block">Tabela de Descontos de Quantidade:</span>
                  <div className="flex justify-between text-slate-600">
                    <span>10 a 49 unidades:</span>
                    <span className="font-bold text-emerald-600">10% OFF</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>50 a 99 unidades:</span>
                    <span className="font-bold text-emerald-600">18% OFF</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>100 a 499 unidades:</span>
                    <span className="font-bold text-emerald-600">25% OFF</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>+500 unidades:</span>
                    <span className="font-bold text-emerald-600">35% OFF (Atacado)</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  {quickViewProduct.allowCustomizer && (
                    <button
                      onClick={() => {
                        const pid = quickViewProduct.id;
                        setQuickViewProduct(null);
                        onOpenCustomizerWithProduct(pid);
                      }}
                      className="flex-1 py-2.5 px-3 bg-[#FF6B00] hover:bg-[#EA580C] text-black font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                    >
                      <Box className="w-4 h-4" />
                      <span>Simular no Modelo 3D</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleQuickAdd(quickViewProduct);
                      setQuickViewProduct(null);
                    }}
                    className="py-2.5 px-4 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
