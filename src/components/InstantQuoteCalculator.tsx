import React, { useState } from 'react';
import { PRODUCTS, PRINT_TECHNIQUES, ANGOLAN_PROVINCES, calculateVolumeDiscount, formatKz, DEFAULT_CUSTOMIZER_PRODUCT } from '../data/products';
import { PrintTechnique, Product, OrderRecord } from '../types';
import { Calculator, Download, MessageSquare, Printer, CheckCircle2, ShieldCheck, Truck, FileText, Check } from 'lucide-react';
import { downloadInvoicePDF, printInvoiceDocument } from '../utils/generateInvoicePDF';

interface InstantQuoteCalculatorProps {
  products?: Product[];
  initialProductId?: string;
  initialQuantity?: number;
  initialTechnique?: PrintTechnique;
  onProceedToOrder?: (productId: string, qty: number, technique: PrintTechnique) => void;
}

export const InstantQuoteCalculator: React.FC<InstantQuoteCalculatorProps> = ({
  products,
  initialProductId = 'tshirt-algodao-premium',
  initialQuantity = 25,
  initialTechnique = 'dtf',
  onProceedToOrder
}) => {
  const productList = products && products.length > 0 ? products : [DEFAULT_CUSTOMIZER_PRODUCT];
  const [productId, setProductId] = useState<string>(
    initialProductId && productList.some(p => p.id === initialProductId)
      ? initialProductId
      : productList[0]?.id || DEFAULT_CUSTOMIZER_PRODUCT.id
  );
  const [quantity, setQuantity] = useState<number>(initialQuantity);
  const [technique, setTechnique] = useState<PrintTechnique>(initialTechnique);
  const [positionsCount, setPositionsCount] = useState<number>(1);
  const [selectedProvinceIndex, setSelectedProvinceIndex] = useState<number>(0);
  const [includeIndividualBag, setIncludeIndividualBag] = useState<boolean>(true);
  const [includeIva, setIncludeIva] = useState<boolean>(true);

  // Client Details for Proforma
  const [clientName, setClientName] = useState('Empresa / Cliente Exemplo');
  const [clientNif, setClientNif] = useState('5001928341');
  const [clientPhone, setClientPhone] = useState('+244 923 456 789');
  const [clientEmail, setClientEmail] = useState('comercial@empresa.ao');
  const [showProformaModal, setShowProformaModal] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  const product: Product = productList.find(p => p.id === productId) || productList[0] || DEFAULT_CUSTOMIZER_PRODUCT;

  const tech = PRINT_TECHNIQUES[technique];
  const province = ANGOLAN_PROVINCES[selectedProvinceIndex];

  // Mathematical Calculation
  const discountRate = calculateVolumeDiscount(quantity);
  const baseCost = product.basePrice;
  const techCost = (tech?.pricePerUnit || 1000) * (positionsCount > 1 ? 1.6 : 1);
  const packagingCost = includeIndividualBag ? 250 : 0;
  
  const rawUnitCost = baseCost + techCost + packagingCost;
  const unitCostAfterDiscount = Math.round(rawUnitCost * (1 - discountRate));
  const subtotalProducts = unitCostAfterDiscount * quantity;

  // Free shipping threshold for Luanda >= 150.000 Kz
  const isFreeShipping = selectedProvinceIndex === 0 && subtotalProducts >= 150000;
  const shippingFee = isFreeShipping ? 0 : province.fee;

  const ivaRate = includeIva ? 0.14 : 0; // 14% IVA in Angola
  const ivaAmount = Math.round(subtotalProducts * ivaRate);
  const grandTotal = subtotalProducts + shippingFee + ivaAmount;

  const handleDownloadProforma = () => {
    const proformaOrder: OrderRecord = {
      id: 'QA-PRF-2026/0894',
      date: new Date().toLocaleDateString('pt-AO'),
      customerName: clientName,
      customerPhone: clientPhone,
      customerEmail: clientEmail,
      customerAddress: 'Talatona / Luanda',
      customerProvince: province.name,
      isCompany: true,
      companyName: clientName,
      nif: clientNif,
      items: [
        {
          id: 'quote-item-1',
          product,
          quantity,
          selectedColor: product.availableColors[0],
          technique,
          unitPrice: unitCostAfterDiscount,
          totalPrice: subtotalProducts
        }
      ],
      subtotal: subtotalProducts,
      discount: Math.round(rawUnitCost * discountRate * quantity),
      shippingFee,
      tax: ivaAmount,
      totalAmount: grandTotal,
      paymentMethod: 'mcx',
      paymentStatus: 'pendente',
      trackingStep: 0
    };
    downloadInvoicePDF(proformaOrder);
    setPdfDownloaded(true);
    setTimeout(() => setPdfDownloaded(false), 4000);
  };

  // WhatsApp formatted quote message
  const handleWhatsAppQuote = () => {
    const text = encodeURIComponent(
      `Olá Quieto Angola! Gostaria de validar este orçamento rápido feito no site:\n\n` +
      `📦 Artigo: ${product.name}\n` +
      `🔢 Quantidade: ${quantity} unidades\n` +
      `⚙️ Técnica: ${tech.name} (${positionsCount} posições)\n` +
      `📍 Destino: ${province.name}\n` +
      `💰 Total Previsto: ${formatKz(grandTotal)}\n` +
      `👤 Cliente: ${clientName} (${clientPhone})\n\n` +
      `Podem confirmar a disponibilidade e enviar a Proforma final?`
    );
    window.open(`https://wa.me/244923000000?text=${text}`, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-5xl mx-auto my-12" id="orcamento-rapido">
      {/* Top Banner */}
      <div className="bg-slate-950 text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#FF6B00] mb-1 tracking-wider uppercase">
            <Calculator className="w-4 h-4" />
            <span>Simulador de Orçamentos Rápidos em Kwanzas</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold font-display tracking-tight text-white">
            Calculadora Proforma Instantânea
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Transparência total sem custos ocultos. Descontos progressivos de atacado até 35%.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowProformaModal(true)}
            className="px-4 py-2 bg-[#FF6B00] hover:bg-[#EA580C] text-black font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Gerar Fatura Proforma</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Inputs vs Realtime Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 p-6 md:p-8 space-y-6 bg-white">
          {/* 1. Product Select */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
              1. Seleciona o Artigo do Catálogo
            </label>
            <select
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value);
                const p = productList.find(item => item.id === e.target.value);
                if (p && !p.supportedTechniques.includes(technique)) {
                  setTechnique(p.supportedTechniques[0]);
                }
              }}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium bg-slate-50 focus:bg-white focus:outline-none focus:border-[#FF6B00]"
            >
              {productList.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — A partir de {formatKz(p.basePrice)}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Quantity Slider & Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                2. Quantidade Pretendida: <span className="text-[#FF6B00] text-sm font-extrabold">{quantity} unidades</span>
              </label>
              {discountRate > 0 && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  -{Math.round(discountRate * 100)}% Desconto Atacado
                </span>
              )}
            </div>
            
            <input
              type="range"
              min={product.minOrder}
              max="500"
              step="5"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full accent-[#FF6B00] h-2 bg-slate-200 rounded-lg cursor-pointer mb-2"
            />

            {/* Quick Quantity Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {[10, 25, 50, 100, 250, 500].map(q => (
                <button
                  key={q}
                  onClick={() => setQuantity(q)}
                  className={`px-3 py-1 text-xs rounded-lg border font-medium transition-colors ${
                    quantity === q
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {q} un
                </button>
              ))}
            </div>
          </div>

          {/* 3. Printing Technique & Positions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                3. Técnica de Impressão
              </label>
              <select
                value={technique}
                onChange={(e) => setTechnique(e.target.value as PrintTechnique)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium bg-slate-50 focus:bg-white focus:outline-none focus:border-[#FF6B00]"
              >
                {product.supportedTechniques.map(t => (
                  <option key={t} value={t}>
                    {PRINT_TECHNIQUES[t].name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                Posições a Personalizar
              </label>
              <select
                value={positionsCount}
                onChange={(e) => setPositionsCount(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium bg-slate-50 focus:bg-white focus:outline-none focus:border-[#FF6B00]"
              >
                <option value={1}>1 Posição (ex: Só Frente Peito)</option>
                <option value={2}>2 Posições (ex: Frente + Costas)</option>
                <option value={3}>3 Posições (ex: Peito + Costas + Manga)</option>
              </select>
            </div>
          </div>

          {/* 4. Delivery Destination & Options */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
              4. Província / Local de Entrega
            </label>
            <select
              value={selectedProvinceIndex}
              onChange={(e) => setSelectedProvinceIndex(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium bg-slate-50 focus:bg-white focus:outline-none focus:border-[#FF6B00]"
            >
              {ANGOLAN_PROVINCES.map((prov, idx) => (
                <option key={prov.name} value={idx}>
                  {prov.name} — {formatKz(prov.fee)} ({prov.time})
                </option>
              ))}
            </select>
            {isFreeShipping && (
              <p className="text-xs text-emerald-600 mt-1 font-semibold flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" />
                <span>Porte Grátis qualificado para Luanda (pedido acima de 150.000 Kz)!</span>
              </p>
            )}
          </div>

          {/* Add-ons Checkboxes */}
          <div className="pt-2 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={includeIndividualBag}
                onChange={(e) => setIncludeIndividualBag(e.target.checked)}
                className="w-4 h-4 rounded text-[#FF6B00] accent-[#FF6B00]"
              />
              <span>Embalagem individual plastificada protetora (+250 Kz/peça)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={includeIva}
                onChange={(e) => setIncludeIva(e.target.checked)}
                className="w-4 h-4 rounded text-[#FF6B00] accent-[#FF6B00]"
              />
              <span>Incluir IVA (14% regulamentar de Angola) para Fatura Fiscal AGT</span>
            </label>
          </div>
        </div>

        {/* Right Summary & Breakdown (5 cols) */}
        <div className="lg:col-span-5 p-6 md:p-8 bg-slate-50 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-200">
              Resumo do Orçamento
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Artigo Base:</span>
                <span className="font-semibold text-slate-800">{product.name}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Preço Unitário Base:</span>
                <span className="tabular-nums">{formatKz(baseCost)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Personalização ({tech.name}):</span>
                <span className="tabular-nums">+{formatKz(techCost)}</span>
              </div>
              {includeIndividualBag && (
                <div className="flex items-center justify-between text-slate-600">
                  <span>Embalagem Individual:</span>
                  <span className="tabular-nums">+{formatKz(packagingCost)}</span>
                </div>
              )}
              {discountRate > 0 && (
                <div className="flex items-center justify-between text-emerald-600 font-medium">
                  <span>Desconto de Volume ({Math.round(discountRate * 100)}%):</span>
                  <span className="tabular-nums">-{formatKz(Math.round(rawUnitCost * discountRate))} / un</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-slate-900">
                <span>Preço Final Unitário:</span>
                <span className="text-[#FF6B00] text-sm tabular-nums">{formatKz(unitCostAfterDiscount)}</span>
              </div>
            </div>

            {/* Total Breakdown Container */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal ({quantity} unidades):</span>
                <span className="font-semibold text-slate-900 tabular-nums">{formatKz(subtotalProducts)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Transporte ({province.name.split(' ')[0]}):</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {isFreeShipping ? 'Grátis' : formatKz(shippingFee)}
                </span>
              </div>
              {includeIva && (
                <div className="flex items-center justify-between text-slate-600">
                  <span>IVA (14%):</span>
                  <span className="font-semibold text-slate-900 tabular-nums">{formatKz(ivaAmount)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase">Total Geral Estimado</div>
                  <div className="text-2xl font-black font-display text-slate-950 tabular-nums">
                    {formatKz(grandTotal)}
                  </div>
                </div>
              </div>
            </div>

            {/* Production Timelines & Assurances */}
            <div className="space-y-1.5 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Prazo de execução: <strong>{product.leadTimeDays + 1} dias úteis</strong> após aprovação digital</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
                <span>Pagamento facilitado por <strong>Multicaixa Express</strong> ou <strong>Referência</strong></span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-6 space-y-2">
            <button
              onClick={handleWhatsAppQuote}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Validar Orçamento no WhatsApp</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowProformaModal(true)}
                className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-[#FF6B00]" />
                <span>Ver Proforma</span>
              </button>

              {onProceedToOrder && (
                <button
                  onClick={() => onProceedToOrder(product.id, quantity, technique)}
                  className="py-2.5 px-3 bg-[#FF6B00] hover:bg-[#EA580C] text-black font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Fazer Pedido</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- PROFORMA INVOICE MODAL --- */}
      {showProformaModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 md:p-8 shadow-2xl relative border border-slate-200">
            {/* Modal Controls */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 print:hidden">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Fatura Proforma Oficial (Pré-visualização)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadProforma}
                  className="px-3.5 py-1.5 bg-[#FF6B00] hover:bg-[#EA580C] text-black text-xs font-extrabold rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descarregar PDF (.pdf)</span>
                </button>
                <button
                  onClick={() => {
                    try {
                      window.print();
                    } catch (e) {
                      handleDownloadProforma();
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
                <button
                  onClick={() => setShowProformaModal(false)}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {pdfDownloaded && (
              <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fade-in print:hidden">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Fatura Proforma transferida com sucesso em formato PDF!</span>
              </div>
            )}

            {/* Printable Document Body */}
            <div className="print:p-0 space-y-6 text-slate-900">
              {/* Proforma Header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-[#FF6B00] text-black font-black text-sm rounded">QUIETO</span>
                    <span className="font-extrabold font-display text-xl tracking-tight text-slate-900">ANGOLA</span>
                  </div>
                  <p className="text-xs text-slate-600 font-semibold">Quieto Angola - Soluções Gráficas & Brindes, Lda</p>
                  <p className="text-xs text-slate-500">NIF: 5418293021 · Registo Comercial de Luanda</p>
                  <p className="text-xs text-slate-500">Via Expressa, Km 14, Talatona, Luanda - Angola</p>
                  <p className="text-xs text-slate-500">Tel: +244 923 000 000 · Email: comercial@quietoangola.ao</p>
                </div>

                <div className="text-right">
                  <div className="inline-block px-3 py-1 bg-slate-900 text-white font-extrabold text-xs rounded mb-1">
                    FATURA PROFORMA
                  </div>
                  <p className="text-sm font-bold text-slate-900">Nº QA-PRF-2026/0894</p>
                  <p className="text-xs text-slate-500">Data: {new Date().toLocaleDateString('pt-PT')}</p>
                  <p className="text-xs text-[#FF6B00] font-semibold">Validade: 15 dias</p>
                </div>
              </div>

              {/* Client Info Bar */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Faturar A:</span>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#FF6B00] focus:outline-none w-full"
                    placeholder="Nome da Empresa / Cliente"
                  />
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-slate-500">NIF:</span>
                    <input
                      type="text"
                      value={clientNif}
                      onChange={(e) => setClientNif(e.target.value)}
                      className="font-medium text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#FF6B00] focus:outline-none w-28"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Contacto & Entrega:</span>
                  <p className="font-medium text-slate-800">{clientPhone}</p>
                  <p className="text-slate-600">{province.name}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 font-bold">Descrição do Artigo / Serviço</th>
                      <th className="py-2.5 px-2 font-bold text-center">Qtd</th>
                      <th className="py-2.5 px-3 font-bold text-right">P. Unitário</th>
                      <th className="py-2.5 px-3 font-bold text-right">Total (Kz)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{product.name}</div>
                        <div className="text-[11px] text-slate-500">
                          Personalização em {tech.name} ({positionsCount} posições) {includeIndividualBag ? '+ Embalagem Individual' : ''}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center font-bold">{quantity}</td>
                      <td className="py-3 px-3 text-right tabular-nums">{formatKz(unitCostAfterDiscount)}</td>
                      <td className="py-3 px-3 text-right font-bold tabular-nums">{formatKz(subtotalProducts)}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-slate-600">Serviço de Entrega & Logística ({province.name.split(' ')[0]})</td>
                      <td className="py-2.5 px-2 text-center">1</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{isFreeShipping ? '0,00 Kz' : formatKz(shippingFee)}</td>
                      <td className="py-2.5 px-3 text-right font-semibold tabular-nums">{isFreeShipping ? 'Grátis' : formatKz(shippingFee)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Totals & Banking Coordinates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Bank Coordinates */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1">
                  <span className="font-bold text-slate-800 uppercase block">Coordenadas para Liquidação:</span>
                  <p className="text-slate-600"><strong>Banco BAI:</strong> AO06 0040 0000 1234 5678 9012 3</p>
                  <p className="text-slate-600"><strong>Banco BFA:</strong> AO06 0006 0000 9876 5432 1012 4</p>
                  <p className="text-slate-600"><strong>Multicaixa Express:</strong> 923 000 000</p>
                  <p className="text-slate-500 italic mt-1">Enviar comprovativo para financeiro@quietoangola.ao</p>
                </div>

                {/* Subtotals & Total */}
                <div className="space-y-1.5 text-xs text-right">
                  <div className="flex justify-between text-slate-600">
                    <span>Incidência:</span>
                    <span className="tabular-nums">{formatKz(subtotalProducts + shippingFee)}</span>
                  </div>
                  {includeIva && (
                    <div className="flex justify-between text-slate-600">
                      <span>IVA (14%):</span>
                      <span className="tabular-nums">{formatKz(ivaAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-extrabold text-slate-950 pt-2 border-t border-slate-200">
                    <span>TOTAL A PAGAR:</span>
                    <span className="text-[#FF6B00] tabular-nums">{formatKz(grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="text-[10px] text-slate-400 text-center border-t border-slate-200 pt-3">
                Processado por Programa Certificado nº 142/AGT/2026 · Quieto Angola © Todos os direitos reservados.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
