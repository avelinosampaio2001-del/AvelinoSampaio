import React, { useState } from 'react';
import { Search, CheckCircle2, Clock, Package, Truck, Check } from 'lucide-react';
import { OrderRecord } from '../types';
import { formatKz } from '../data/products';

interface OrderTrackerModalProps {
  onClose: () => void;
  recentOrders?: OrderRecord[];
}

const TRACKING_STEPS = [
  { label: 'Pedido Registado', desc: 'Orçamento gerado e aguarda pagamento' },
  { label: 'Pagamento Confirmado', desc: 'Liquidado via Multicaixa Express / Referência' },
  { label: 'Prova Digital Aprovada', desc: 'Mockup 2D validado pelo cliente' },
  { label: 'Em Estamparia / Produção', desc: 'Impressão DTF / Serigrafia / Bordado em curso' },
  { label: 'Controlo de Qualidade', desc: 'Inspeção têxtil e embalagem protetora' },
  { label: 'Pronto / Em Distribuição', desc: 'Estafeta a caminho ou levantamento em Luanda' }
];

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({ onClose, recentOrders = [] }) => {
  const [searchCode, setSearchCode] = useState('QA-2026-8941');
  const [activeOrder, setActiveOrder] = useState<any>({
    id: 'QA-2026-8941',
    date: '30/10/2026',
    customerName: 'Manuel Domingos / BFA Luanda',
    productSummary: '50x T-shirt Algodão Penteado + 25x Caneca Térmica',
    technique: 'DTF Têxtil HD',
    totalAmount: 320500,
    province: 'Luanda (Talatona)',
    currentStep: 3, // Em Produção
    statusNote: 'Peças em processo de cura térmica e estamparia DTF industrial.'
  });

  const handleSearch = () => {
    const found = recentOrders.find(o => o.id.toLowerCase() === searchCode.toLowerCase().trim());
    if (found) {
      setActiveOrder({
        id: found.id,
        date: found.date,
        customerName: found.customerName,
        productSummary: `${found.items.length} artigo(s) personalizados`,
        technique: found.items[0]?.technique ? found.items[0].technique.toUpperCase() : 'DTF',
        totalAmount: found.totalAmount,
        province: found.customerProvince,
        currentStep: found.trackingStep || 1,
        statusNote: 'Encomenda em processamento na nossa gráfica em Luanda.'
      });
    } else {
      // Default sample order
      setActiveOrder({
        id: searchCode.toUpperCase(),
        date: '30/10/2026',
        customerName: 'Cliente Quieto Angola',
        productSummary: 'Lote de Brindes e Vestuário Corporativo',
        technique: 'DTF / Laser',
        totalAmount: 185000,
        province: 'Luanda',
        currentStep: 2,
        statusNote: 'Prova digital aprovada. A preparar películas DTF para produção.'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 md:p-8 shadow-2xl relative border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h3 className="font-extrabold font-display text-lg text-slate-900">
              Rastreamento de Encomendas
            </h3>
            <p className="text-xs text-slate-500">
              Acompanha o progresso da tua produção gráfica em Luanda em tempo real
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Search input */}
        <div className="my-6 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Ex: QA-2026-8941"
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#FF6B00] font-mono font-bold uppercase"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
          >
            Consultar
          </button>
        </div>

        {/* Order Details Card */}
        {activeOrder && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Código: {activeOrder.id}</span>
                <span className="text-[#FF6B00] tabular-nums">{formatKz(activeOrder.totalAmount)}</span>
              </div>
              <div className="text-slate-600 flex justify-between">
                <span>Cliente: {activeOrder.customerName}</span>
                <span>Destino: {activeOrder.province}</span>
              </div>
              <div className="text-slate-500 text-[11px]">
                Artigos: {activeOrder.productSummary} · Técnica: {activeOrder.technique}
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="space-y-4">
              {TRACKING_STEPS.map((step, idx) => {
                const isCompleted = idx < activeOrder.currentStep;
                const isCurrent = idx === activeOrder.currentStep;

                return (
                  <div key={step.label} className="flex items-start gap-3 relative">
                    {/* Circle icon */}
                    <div className="relative z-10">
                      {isCompleted ? (
                        <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                          <Check className="w-4 h-4" />
                        </div>
                      ) : isCurrent ? (
                        <div className="w-7 h-7 rounded-full bg-[#FF6B00] text-black flex items-center justify-center font-bold text-xs ring-4 ring-orange-100 shadow-md">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 border border-slate-300 flex items-center justify-center text-xs font-semibold">
                          {idx + 1}
                        </div>
                      )}
                    </div>

                    {/* Connecting line */}
                    {idx < TRACKING_STEPS.length - 1 && (
                      <div
                        className={`absolute left-3.5 top-7 w-0.5 h-8 -ml-[1px] ${
                          idx < activeOrder.currentStep ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                      />
                    )}

                    {/* Text info */}
                    <div className="flex-1 pb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${
                          isCurrent ? 'text-[#FF6B00]' : isCompleted ? 'text-slate-900' : 'text-slate-400'
                        }`}>
                          {step.label}
                        </span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.2 bg-orange-100 text-[#FF6B00] text-[10px] font-bold rounded">
                            Fase Atual
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-950 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#FF6B00] shrink-0" />
              <span>{activeOrder.statusNote}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
