import React, { useState } from 'react';
import { Product, PrintTechnique, SideDesign, TextElement, GraphicElement, CartItem } from '../types';
import { PRODUCTS, PRINT_TECHNIQUES, COLOR_OPTIONS, calculateVolumeDiscount, formatKz, DEFAULT_CUSTOMIZER_PRODUCT } from '../data/products';
import { STOCK_GRAPHICS } from '../data/graphics';
import { ProductSilhouette } from './ProductSilhouettes';
import { ThreeDStudioViewer } from './ThreeDStudioViewer';
import { 
  Type, 
  Image as ImageIcon, 
  RotateCw, 
  Trash2, 
  Upload, 
  ShoppingBag, 
  FileText, 
  Layers, 
  Check, 
  Move,
  Info,
  Box,
  Eye,
  Compass
} from 'lucide-react';

interface LiveCustomizerProps {
  products?: Product[];
  initialProductId?: string;
  onAddToCart: (item: CartItem) => void;
  onRequestQuote: (productId: string, qty: number, technique: PrintTechnique) => void;
  onClose?: () => void;
}

export const LiveCustomizer: React.FC<LiveCustomizerProps> = ({
  products,
  initialProductId = 'tshirt-algodao-premium',
  onAddToCart,
  onRequestQuote,
  onClose
}) => {
  const productList = products && products.length > 0 ? products : [DEFAULT_CUSTOMIZER_PRODUCT];
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProductId && productList.some(p => p.id === initialProductId)
      ? initialProductId
      : productList[0]?.id || DEFAULT_CUSTOMIZER_PRODUCT.id
  );
  const selectedProduct = productList.find(p => p.id === selectedProductId) || productList[0] || DEFAULT_CUSTOMIZER_PRODUCT;

  const [activeSide, setActiveSide] = useState<'frente' | 'costas'>('frente');
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [selectedColor, setSelectedColor] = useState(
    (selectedProduct.availableColors && selectedProduct.availableColors[0]) || COLOR_OPTIONS[0]
  );
  const [selectedTechnique, setSelectedTechnique] = useState<PrintTechnique>(
    (selectedProduct.supportedTechniques && selectedProduct.supportedTechniques[0]) || 'dtf'
  );
  const [quantity, setQuantity] = useState<number>(Math.max(10, selectedProduct.minOrder || 1));


  // Front and Back designs
  const [frontDesign, setFrontDesign] = useState<SideDesign>({
    textElements: [
      {
        id: 'init-text-1',
        text: 'QUIETO ANGOLA',
        font: 'Outfit',
        color: '#FFFFFF',
        fontSize: 22,
        x: 250,
        y: 220,
        rotation: 0
      }
    ],
    graphics: [
      {
        id: 'init-gfx-1',
        src: STOCK_GRAPHICS[0].svgDataUri,
        label: 'Logo Quieto',
        scale: 0.85,
        x: 250,
        y: 170,
        rotation: 0
      }
    ]
  });

  const [backDesign, setBackDesign] = useState<SideDesign>({
    textElements: [],
    graphics: []
  });

  const [activeTab, setActiveTab] = useState<'text' | 'graphics' | 'technique' | 'color'>('text');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // New text input form
  const [newText, setNewText] = useState('LUANDA 2026');
  const [newFont, setNewFont] = useState('Outfit');
  const [newTextColor, setNewTextColor] = useState('#FF6B00');
  const [newTextSize, setNewTextSize] = useState(20);

  const currentDesign = activeSide === 'frente' ? frontDesign : backDesign;
  const setCurrentDesign = (newDesign: SideDesign) => {
    if (activeSide === 'frente') {
      setFrontDesign(newDesign);
    } else {
      setBackDesign(newDesign);
    }
  };

  // Pricing calculation
  const techniqueInfo = PRINT_TECHNIQUES[selectedTechnique];
  const hasFrontPrint = frontDesign.textElements.length > 0 || frontDesign.graphics.length > 0;
  const hasBackPrint = backDesign.textElements.length > 0 || backDesign.graphics.length > 0;
  const printPositionsCount = (hasFrontPrint ? 1 : 0) + (hasBackPrint ? 1 : 0) || 1;

  const baseProductCost = selectedProduct.basePrice;
  const personalizationCost = (techniqueInfo?.pricePerUnit || 1200) * (printPositionsCount > 1 ? 1.6 : 1);
  const rawUnit = baseProductCost + personalizationCost;
  const discountRate = calculateVolumeDiscount(quantity);
  const unitPrice = Math.round(rawUnit * (1 - discountRate));
  const totalPrice = unitPrice * quantity;

  // Add text to canvas
  const handleAddText = () => {
    if (!newText.trim()) return;
    const newId = `txt-${Date.now()}`;
    const newEl: TextElement = {
      id: newId,
      text: newText,
      font: newFont,
      color: newTextColor,
      fontSize: newTextSize,
      x: 250,
      y: 240,
      rotation: 0
    };
    setCurrentDesign({
      ...currentDesign,
      textElements: [...currentDesign.textElements, newEl]
    });
    setSelectedElementId(newId);
  };

  // Add graphic
  const handleAddStockGraphic = (graphic: typeof STOCK_GRAPHICS[0]) => {
    const newId = `gfx-${Date.now()}`;
    const newEl: GraphicElement = {
      id: newId,
      src: graphic.svgDataUri,
      label: graphic.name,
      scale: 0.8,
      x: 250,
      y: 210,
      rotation: 0
    };
    setCurrentDesign({
      ...currentDesign,
      graphics: [...currentDesign.graphics, newEl]
    });
    setSelectedElementId(newId);
  };

  // Upload user file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUri = event.target?.result as string;
      const newId = `upload-${Date.now()}`;
      const newEl: GraphicElement = {
        id: newId,
        src: dataUri,
        label: file.name,
        scale: 0.9,
        x: 250,
        y: 210,
        rotation: 0
      };
      setCurrentDesign({
        ...currentDesign,
        graphics: [...currentDesign.graphics, newEl]
      });
      setSelectedElementId(newId);
    };
    reader.readAsDataURL(file);
  };

  // Delete selected element
  const handleDeleteSelected = () => {
    if (!selectedElementId) return;
    setCurrentDesign({
      textElements: currentDesign.textElements.filter(t => t.id !== selectedElementId),
      graphics: currentDesign.graphics.filter(g => g.id !== selectedElementId)
    });
    setSelectedElementId(null);
  };

  // Update selected element position/rotation
  const updateSelectedText = (updates: Partial<TextElement>) => {
    if (!selectedElementId) return;
    setCurrentDesign({
      ...currentDesign,
      textElements: currentDesign.textElements.map(t => 
        t.id === selectedElementId ? { ...t, ...updates } : t
      )
    });
  };

  const updateSelectedGraphic = (updates: Partial<GraphicElement>) => {
    if (!selectedElementId) return;
    setCurrentDesign({
      ...currentDesign,
      graphics: currentDesign.graphics.map(g => 
        g.id === selectedElementId ? { ...g, ...updates } : g
      )
    });
  };

  const selectedTextEl = currentDesign.textElements.find(t => t.id === selectedElementId);
  const selectedGfxEl = currentDesign.graphics.find(g => g.id === selectedElementId);

  // Add to Cart handler
  const handleAddToCart = () => {
    const cartItem: CartItem = {
      id: `custom-${Date.now()}`,
      product: selectedProduct,
      quantity,
      selectedColor,
      selectedSize: selectedProduct.availableSizes ? selectedProduct.availableSizes[1] || 'L' : undefined,
      technique: selectedTechnique,
      customDesign: {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        color: selectedColor,
        technique: selectedTechnique,
        quantity,
        front: frontDesign,
        back: backDesign
      },
      unitPrice,
      totalPrice
    };
    onAddToCart(cartItem);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl max-w-6xl mx-auto my-8">
      {/* Header Bar */}
      <div className="px-6 py-4 bg-slate-950 text-white flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#FF6B00] flex items-center justify-center font-bold text-black text-lg">
            Q
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight font-display text-white">
              Estúdio de Personalização em Tempo Real
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{selectedProduct.name}</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#FF6B00] font-semibold flex items-center gap-1">
                <Box className="w-3.5 h-3.5 inline" /> Modelo 3D Interativo 360°
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-300 font-medium">Orçamento Dinâmico</span>
            </div>
          </div>
        </div>

        {/* Product Dropdown Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 whitespace-nowrap">Modelo:</label>
          <select
            value={selectedProductId}
            onChange={(e) => {
              setSelectedProductId(e.target.value);
              const p = productList.find(item => item.id === e.target.value);
              if (p) {
                setSelectedColor(p.availableColors[0]);
                setSelectedTechnique(p.supportedTechniques[0]);
              }
            }}
            className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#FF6B00]"
          >
            {productList.filter(p => p.allowCustomizer).map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-sm p-1.5 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Studio Body: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* Left Column: Canvas Preview & Side Selector (7 cols) */}
        <div className="lg:col-span-7 bg-[#F4F4F6] p-6 flex flex-col justify-between items-center relative border-r border-slate-200">
          {/* Top Canvas Controls: 3D/2D View Mode, Front/Back view & Clear */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2 z-10">
            {/* View Mode: 3D Orbit vs 2D Precision Editor */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
              <button
                onClick={() => setViewMode('3d')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                  viewMode === '3d'
                    ? 'bg-[#FF6B00] text-black shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>Modelo 3D (Rato)</span>
              </button>
              <button
                onClick={() => setViewMode('2d')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                  viewMode === '2d'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Editor 2D</span>
              </button>
            </div>

            {/* Front / Back Side Switcher */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
              <button
                onClick={() => { setActiveSide('frente'); setSelectedElementId(null); }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeSide === 'frente'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Frente
              </button>
              <button
                onClick={() => { setActiveSide('costas'); setSelectedElementId(null); }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeSide === 'costas'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Costas
              </button>
            </div>

            <button
              onClick={() => {
                setCurrentDesign({ textElements: [], graphics: [] });
                setSelectedElementId(null);
              }}
              className="text-xs text-rose-600 hover:text-rose-700 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors ml-auto sm:ml-0"
            >
              Limpar {activeSide === 'frente' ? 'Frente' : 'Costas'}
            </button>
          </div>

          {/* Center Stage: 3D WebGL Model or 2D Interactive Silhouette */}
          <div className="my-auto w-full flex items-center justify-center py-2">
            {viewMode === '3d' ? (
              <ThreeDStudioViewer
                product={selectedProduct}
                colorHex={selectedColor.hex}
                frontDesign={frontDesign}
                backDesign={backDesign}
                activeSide={activeSide}
                onSwitchSide={(side) => setActiveSide(side)}
              />
            ) : (
              <ProductSilhouette
                productId={selectedProduct.id}
                side={activeSide}
                colorHex={selectedColor.hex}
                design={currentDesign}
                selectedElementId={selectedElementId}
                onSelectElement={(id) => setSelectedElementId(id)}
                interactive={true}
              />
            )}
          </div>

          {/* Selected Element Quick Controls Toolbar */}
          {selectedElementId ? (
            <div className="w-full bg-white p-3 rounded-xl border border-slate-300 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs z-10">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <Move className="w-4 h-4 text-[#FF6B00]" />
                <span>Elemento Ativo: {selectedTextEl ? `"${selectedTextEl.text}"` : selectedGfxEl?.label}</span>
              </div>

              <div className="flex items-center gap-3">
                {selectedTextEl && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Tamanho:</span>
                    <input
                      type="range"
                      min="12"
                      max="42"
                      value={selectedTextEl.fontSize}
                      onChange={(e) => updateSelectedText({ fontSize: Number(e.target.value) })}
                      className="w-20 accent-[#FF6B00]"
                    />
                  </div>
                )}

                {selectedGfxEl && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Escala:</span>
                    <input
                      type="range"
                      min="0.4"
                      max="1.5"
                      step="0.05"
                      value={selectedGfxEl.scale}
                      onChange={(e) => updateSelectedGraphic({ scale: Number(e.target.value) })}
                      className="w-20 accent-[#FF6B00]"
                    />
                  </div>
                )}

                {/* X and Y reposition buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      if (selectedTextEl) updateSelectedText({ y: selectedTextEl.y - 10 });
                      if (selectedGfxEl) updateSelectedGraphic({ y: selectedGfxEl.y - 10 });
                    }}
                    className="p-1 rounded bg-slate-100 hover:bg-slate-200"
                    title="Mover para cima"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => {
                      if (selectedTextEl) updateSelectedText({ y: selectedTextEl.y + 10 });
                      if (selectedGfxEl) updateSelectedGraphic({ y: selectedGfxEl.y + 10 });
                    }}
                    className="p-1 rounded bg-slate-100 hover:bg-slate-200"
                    title="Mover para baixo"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => {
                      if (selectedTextEl) updateSelectedText({ x: 250 });
                      if (selectedGfxEl) updateSelectedGraphic({ x: 250 });
                    }}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    Centrar
                  </button>
                </div>

                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-1 text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remover</span>
                </button>
              </div>
            </div>
          ) : viewMode === '3d' ? (
            <div className="w-full bg-white/90 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-600 flex items-center justify-between gap-2 shadow-sm">
              <div className="flex items-center gap-2">
                <RotateCw className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <span><strong>Interação 3D:</strong> Clica e arrasta com o rato para virar o modelo em qualquer ângulo.</span>
              </div>
              <button
                onClick={() => setViewMode('2d')}
                className="text-[11px] font-bold text-[#FF6B00] hover:text-orange-700 hover:underline shrink-0"
              >
                Editor 2D →
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>Clica em qualquer texto ou emblema na peça para redimensionar ou mover.</span>
            </div>
          )}
        </div>

        {/* Right Column: Tools, Customization Panels & Checkout (5 cols) */}
        <div className="lg:col-span-5 p-6 flex flex-col justify-between bg-white overflow-y-auto max-h-[750px]">
          <div>
            {/* Tool Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl mb-6">
              <button
                onClick={() => setActiveTab('text')}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === 'text' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Type className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>Texto</span>
              </button>
              <button
                onClick={() => setActiveTab('graphics')}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === 'graphics' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>Logotipo</span>
              </button>
              <button
                onClick={() => setActiveTab('color')}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === 'color' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-[#FF6B00]" />
                <span>Cor</span>
              </button>
              <button
                onClick={() => setActiveTab('technique')}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === 'technique' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>Técnica</span>
              </button>
            </div>

            {/* TAB 1: ADD TEXT */}
            {activeTab === 'text' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Escreve o teu texto ou frase:
                  </label>
                  <input
                    type="text"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="Ex: NOME DA EMPRESA, FRASE, NÚMERO..."
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Tipo de Letra:</label>
                    <select
                      value={newFont}
                      onChange={(e) => setNewFont(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-[#FF6B00]"
                    >
                      <option value="Outfit">Outfit Modern</option>
                      <option value="Impact">Impact Bold</option>
                      <option value="sans-serif">Clean Sans</option>
                      <option value="Georgia">Editorial Serif</option>
                      <option value="monospace">Tech Mono</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Tamanho: {newTextSize}px</label>
                    <input
                      type="range"
                      min="14"
                      max="38"
                      value={newTextSize}
                      onChange={(e) => setNewTextSize(Number(e.target.value))}
                      className="w-full accent-[#FF6B00] mt-2"
                    />
                  </div>
                </div>

                {/* Text Color Swatches */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Cor da Estampa:</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {['#FFFFFF', '#121212', '#FF6B00', '#EAB308', '#DC2626', '#2563EB', '#10B981', '#A855F7'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setNewTextColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-7 h-7 rounded-full border ${
                          newTextColor === c ? 'ring-2 ring-[#FF6B00] ring-offset-2 scale-110' : 'border-slate-300'
                        } transition-transform`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleAddText}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Type className="w-4 h-4 text-[#FF6B00]" />
                  <span>Inserir Texto na {activeSide === 'frente' ? 'Frente' : 'Costas'}</span>
                </button>
              </div>
            )}

            {/* TAB 2: LOGOTIPO & GRAPHICS */}
            {activeTab === 'graphics' && (
              <div className="space-y-4">
                {/* Upload Custom File */}
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-[#FF6B00] transition-colors bg-slate-50/50">
                  <Upload className="w-6 h-6 text-[#FF6B00] mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-800">Carregar Logotipo ou Imagem</p>
                  <p className="text-[11px] text-slate-500 mb-3">Formatos PNG (fundo transparente), JPG ou SVG</p>
                  <label className="inline-block py-1.5 px-4 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm">
                    Selecionar Arquivo
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                {/* Pre-made Angolan & Corporate Emblems */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-700">Emblemas & Selos Prontos:</span>
                    <span className="text-[11px] text-slate-500">Clique para aplicar</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {STOCK_GRAPHICS.map((sg) => (
                      <button
                        key={sg.id}
                        onClick={() => handleAddStockGraphic(sg)}
                        className="p-2 border border-slate-200 rounded-lg hover:border-[#FF6B00] hover:bg-orange-50/30 transition-all flex flex-col items-center gap-1 group text-center"
                      >
                        <img src={sg.svgDataUri} alt={sg.name} className="w-10 h-10 object-contain group-hover:scale-105 transition-transform" />
                        <span className="text-[10px] text-slate-600 font-medium line-clamp-1">{sg.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: COLOR OF PRODUCT */}
            {activeTab === 'color' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Cor do Artigo: <span className="font-bold text-slate-900">{selectedColor.name}</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedProduct.availableColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color)}
                        className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all ${
                          selectedColor.name === color.name
                            ? 'border-[#FF6B00] bg-orange-50/40 ring-1 ring-[#FF6B00]'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div
                          style={{ backgroundColor: color.hex }}
                          className="w-5 h-5 rounded-full border border-black/10 shrink-0"
                        />
                        <span className="text-xs font-medium text-slate-800 text-left">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: PRINTING TECHNIQUE */}
            {activeTab === 'technique' && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Técnica de Personalização Recomendada:
                </label>
                <div className="space-y-2">
                  {selectedProduct.supportedTechniques.map((techKey) => {
                    const tech = PRINT_TECHNIQUES[techKey];
                    const isSelected = selectedTechnique === techKey;
                    return (
                      <button
                        key={techKey}
                        onClick={() => setSelectedTechnique(techKey)}
                        className={`w-full p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-[#FF6B00] bg-orange-50/40 ring-1 ring-[#FF6B00]'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-900">{tech.name}</span>
                          <span className="text-xs font-semibold text-[#FF6B00] tabular-nums">
                            +{formatKz(tech.pricePerUnit)}/peça
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2">{tech.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Section: Quantity, Pricing Summary & Actions */}
          <div className="pt-6 border-t border-slate-200 mt-6 space-y-4">
            {/* Quantity Stepper & Tier Discount */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantidade:
                </label>
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50 w-32">
                  <button
                    onClick={() => setQuantity(Math.max(selectedProduct.minOrder, quantity - 5))}
                    className="px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={selectedProduct.minOrder}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(selectedProduct.minOrder, Number(e.target.value) || 1))}
                    className="w-full text-center text-xs font-bold bg-transparent focus:outline-none"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 5)}
                    className="px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Volume Discount Indicator */}
              <div className="text-right">
                <div className="text-xs text-slate-500">Desconto de Volume:</div>
                <div className="text-xs font-bold text-emerald-600">
                  {discountRate > 0 ? `${Math.round(discountRate * 100)}% DESCONTO ATACADO` : 'Preço Normal'}
                </div>
              </div>
            </div>

            {/* Price Breakdown Box */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Preço Unitário (com estampa):</span>
                <span className="font-semibold text-slate-900 tabular-nums">{formatKz(unitPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Prazo Estimado de Produção:</span>
                <span className="font-medium text-slate-900">{selectedProduct.leadTimeDays} dias úteis</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-sm font-bold text-slate-900">
                <span>Total Estimado ({quantity} un):</span>
                <span className="text-[#FF6B00] text-base tabular-nums">{formatKz(totalPrice)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onRequestQuote(selectedProduct.id, quantity, selectedTechnique)}
                className="py-2.5 px-3 border border-slate-300 hover:border-slate-400 bg-white text-slate-800 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-slate-600" />
                <span>Orçamento Proforma</span>
              </button>

              <button
                onClick={handleAddToCart}
                className="py-2.5 px-3 bg-[#FF6B00] hover:bg-[#EA580C] text-black font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Adicionar ao Pedido</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
