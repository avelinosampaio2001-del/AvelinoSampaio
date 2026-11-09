import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, X } from 'lucide-react';

interface AdminLoginModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default admin pin is '2026' or 'admin' or 'quieto'
    if (pin === '2026' || pin === 'admin' || pin.toLowerCase() === 'quieto') {
      onSuccess();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold"
        >
          ✕
        </button>

        <div className="text-center space-y-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-black text-[#FF6B00] flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold font-display text-lg text-slate-900">
              Acesso à Administração
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Introduz o PIN de administrador para gerir imagens, preços em tempo real e facturas PDF.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              PIN ou Senha de Acesso:
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                autoFocus
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                placeholder="Código de acesso (Predefinido: 2026)"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-[#FF6B00] text-center font-mono tracking-widest"
              />
            </div>
            {error && (
              <p className="text-[11px] text-rose-600 mt-1 font-semibold text-center">
                PIN incorreto! Usa o código 2026 para aceder.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#FF6B00] hover:bg-[#EA580C] text-black font-extrabold text-xs rounded-xl shadow-md transition-colors"
          >
            Entrar no Painel de Gestão
          </button>

          <p className="text-[11px] text-slate-400 text-center">
            Código predefinido de teste: <strong className="text-slate-600 font-mono">2026</strong>
          </p>
        </form>
      </div>
    </div>
  );
};
