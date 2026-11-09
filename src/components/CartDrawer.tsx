import React from 'react';
import { CartItem } from '../types';
import { formatKz } from '../data/products';
import { ShoppingBag, Trash2, ArrowRight, Box, X, ShieldCheck } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="px-6 py-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#FF6B00]" />
              <h3 className="font-bold font-display text-sm text-white">
                O Teu Carrinho ({items.length})
              </h3>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-12 text-slate-500 space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">O carrinho está vazio</p>
                <p className="text-xs text-slate-400">
                  Explora o nosso catálogo ou personaliza uma T-shirt no estúdio 2D.
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Continuar a Comprar
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex gap-3 relative group"
                >
                  <div className="w-16 h-16 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-xs text-slate-900 truncate">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 my-1">
                      <span className="flex items-center gap-1">
                        <span 
                          style={{ backgroundColor: item.selectedColor.hex }}
                          className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block"
                        />
                        <span>{item.selectedColor.name}</span>
                      </span>
                      {item.selectedSize && (
                        <>
                          <span>·</span>
                          <span>Tam: {item.selectedSize}</span>
                        </>
                      )}
                      {item.customDesign && (
                        <>
                          <span>·</span>
                          <span className="text-[#FF6B00] font-semibold flex items-center gap-1">
                            <Box className="w-2.5 h-2.5" /> Personalizado
                          </span>
                        </>
                      )}
                    </div>

                    {/* Quantity & Unit Price */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-slate-200 rounded-md bg-white">
                        <button
                          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-100"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-xs text-slate-900 tabular-nums">
                          {formatKz(item.totalPrice)}
                        </div>
                        <div className="text-[10px] text-slate-400 tabular-nums">
                          {formatKz(item.unitPrice)}/un
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Subtotal dos Artigos:</span>
                  <span className="font-semibold text-slate-900 tabular-nums">{formatKz(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Taxa de Entrega:</span>
                  <span className="text-slate-500">Calculada no checkout</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-base font-black text-slate-950">
                  <span>Total:</span>
                  <span className="text-[#FF6B00] tabular-nums">{formatKz(subtotal)}</span>
                </div>
              </div>

              <button
                onClick={onCheckout}
                className="w-full py-3 bg-[#FF6B00] hover:bg-[#EA580C] text-black font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Finalizar Pedido com Multicaixa</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pagamentos Seguros por Multicaixa Express e Referência EMIS</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
