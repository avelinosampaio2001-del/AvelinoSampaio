import React, { useState, useEffect } from 'react';
import { CartItem, PaymentMethodType, OrderRecord } from '../types';
import { ANGOLAN_PROVINCES, formatKz } from '../data/products';
import { 
  CreditCard, 
  Smartphone, 
  FileText, 
  Building2, 
  CheckCircle2, 
  Copy, 
  Check, 
  Clock, 
  ShieldCheck, 
  Truck, 
  Upload,
  AlertCircle
} from 'lucide-react';

interface PaymentModalProps {
  items: CartItem[];
  onClose: () => void;
  onOrderSuccess: (order: OrderRecord) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  items,
  onClose,
  onOrderSuccess
}) => {
  const [step, setStep] = useState<'details' | 'payment' | 'confirmation'>('details');

  // Customer Details Form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('923 ');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerProvince, setCustomerProvince] = useState(ANGOLAN_PROVINCES[0].name);
  const [isCompany, setIsCompany] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [nif, setNif] = useState('');

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('mcx');
  const [mcxPhone, setMcxPhone] = useState('923 000 000');
  const [mcxStatus, setMcxStatus] = useState<'idle' | 'waiting' | 'approved'>('idle');
  const [mcxTimer, setMcxTimer] = useState(90);

  // Upload Proof
  const [proofFile, setProofFile] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Completed Order info
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(null);

  // Totals
  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
  const selectedProvinceObj = ANGOLAN_PROVINCES.find(p => p.name === customerProvince) || ANGOLAN_PROVINCES[0];
  const shippingFee = (subtotal >= 150000 && customerProvince.includes('Luanda')) ? 0 : selectedProvinceObj.fee;
  const tax = isCompany ? Math.round(subtotal * 0.14) : 0;
  const grandTotal = subtotal + shippingFee + tax;

  // Copy helper
  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // MCX Countdown Simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mcxStatus === 'waiting' && mcxTimer > 0) {
      interval = setInterval(() => {
        setMcxTimer(prev => prev - 1);
      }, 1000);
    } else if (mcxTimer === 0 && mcxStatus === 'waiting') {
      setMcxStatus('idle');
    }
    return () => clearInterval(interval);
  }, [mcxStatus, mcxTimer]);

  const handleStartMcxPayment = () => {
    setMcxStatus('waiting');
    setMcxTimer(90);
  };

  const handleSimulateMcxApproval = () => {
    setMcxStatus('approved');
    finishOrder('aprovado');
  };

  const finishOrder = (status: 'pendente' | 'aprovado' | 'em_analise') => {
    const orderId = `QA-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: OrderRecord = {
      id: orderId,
      date: new Date().toLocaleDateString('pt-AO'),
      customerName: customerName || 'Cliente Quieto',
      customerPhone: customerPhone,
      customerEmail: customerEmail,
      customerAddress: customerAddress || 'Luanda, Angola',
      customerProvince: customerProvince,
      isCompany,
      companyName: isCompany ? companyName : undefined,
      nif: isCompany ? nif : undefined,
      items,
      subtotal,
      discount: 0,
      shippingFee,
      tax,
      totalAmount: grandTotal,
      paymentMethod,
      paymentStatus: status,
      trackingStep: status === 'aprovado' ? 1 : 0,
      paymentReference: {
        entity: '00428',
        reference: '928341850',
        expiryDate: '48 horas'
      },
      mcxPhone,
      proofFileName: proofFile ? 'Comprovativo_Transferencia.pdf' : undefined
    };

    setCompletedOrder(newOrder);
    setStep('confirmation');
    onOrderSuccess(newOrder);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Top Header */}
        <div className="bg-slate-950 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
            <h3 className="font-bold font-display text-base text-white">
              {step === 'details' && '1. Dados de Envio & Faturação'}
              {step === 'payment' && '2. Pagamento Local Angolano'}
              {step === 'confirmation' && 'Encomenda Confirmada!'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* --- STEP 1: CUSTOMER DETAILS --- */}
        {step === 'details' && (
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo / Responsável *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ex: Manuel António Domingos"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telefone / WhatsApp (Angola) *
                </label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+244 9XX XXX XXX"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail para Receção da Fatura
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="exemplo@empresa.ao"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Província de Entrega *
                </label>
                <select
                  value={customerProvince}
                  onChange={(e) => setCustomerProvince(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#FF6B00]"
                >
                  {ANGOLAN_PROVINCES.map((prov) => (
                    <option key={prov.name} value={prov.name}>
                      {prov.name} ({formatKz(prov.fee)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Endereço de Entrega Detalhado *
              </label>
              <input
                type="text"
                required
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Ex: Luanda, Talatona, Condomínio Parque das Acácias, Casa 14B"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#FF6B00]"
              />
            </div>

            {/* Company invoice toggle */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={isCompany}
                  onChange={(e) => setIsCompany(e.target.checked)}
                  className="w-4 h-4 text-[#FF6B00] accent-[#FF6B00] rounded"
                />
                <span>Emitir Fatura em nome de Empresa com NIF (AGT Angola)</span>
              </label>

              {isCompany && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Razão Social:</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Ex: Sonangol EP / Banco BAI"
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">NIF Fiscal (10 dígitos):</label>
                    <input
                      type="text"
                      value={nif}
                      onChange={(e) => setNif(e.target.value)}
                      placeholder="Ex: 5418293021"
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Mini Summary */}
            <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-200">
              <span>{items.length} artigo(s) no carrinho</span>
              <span className="font-bold text-slate-900 text-sm tabular-nums">
                Total: {formatKz(grandTotal)}
              </span>
            </div>

            <button
              onClick={() => {
                if (!customerName || !customerPhone) {
                  alert('Por favor preencha o seu nome e telefone.');
                  return;
                }
                setStep('payment');
              }}
              className="w-full py-3 bg-[#FF6B00] hover:bg-[#EA580C] text-black font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <span>Continuar para Pagamento</span>
              <span>→</span>
            </button>
          </div>
        )}

        {/* --- STEP 2: PAYMENT METHOD --- */}
        {step === 'payment' && (
          <div className="p-6 space-y-6">
            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => setPaymentMethod('mcx')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                  paymentMethod === 'mcx'
                    ? 'border-[#FF6B00] bg-orange-50/50 ring-1 ring-[#FF6B00]'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <Smartphone className="w-5 h-5 text-[#FF6B00]" />
                <span className="text-xs font-bold text-slate-900">Multicaixa Express</span>
                <span className="text-[10px] text-slate-500">Push no Telemóvel</span>
              </button>

              <button
                onClick={() => setPaymentMethod('referencia')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                  paymentMethod === 'referencia'
                    ? 'border-[#FF6B00] bg-orange-50/50 ring-1 ring-[#FF6B00]'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <CreditCard className="w-5 h-5 text-slate-800" />
                <span className="text-xs font-bold text-slate-900">Por Referência</span>
                <span className="text-[10px] text-slate-500">ATM ou Homebanking</span>
              </button>

              <button
                onClick={() => setPaymentMethod('transferencia')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                  paymentMethod === 'transferencia'
                    ? 'border-[#FF6B00] bg-orange-50/50 ring-1 ring-[#FF6B00]'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <Building2 className="w-5 h-5 text-slate-800" />
                <span className="text-xs font-bold text-slate-900">IBAN Direto</span>
                <span className="text-[10px] text-slate-500">BAI, BFA, BIC</span>
              </button>

              <button
                onClick={() => setPaymentMethod('tpa')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                  paymentMethod === 'tpa'
                    ? 'border-[#FF6B00] bg-orange-50/50 ring-1 ring-[#FF6B00]'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <Truck className="w-5 h-5 text-slate-800" />
                <span className="text-xs font-bold text-slate-900">TPA Entrega</span>
                <span className="text-[10px] text-slate-500">Só Luanda</span>
              </button>
            </div>

            {/* METHOD 1: MULTICAIXA EXPRESS (MCX) */}
            {paymentMethod === 'mcx' && (
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-[#FF6B00]" />
                    <span className="font-bold text-xs text-slate-900">Pagamento Multicaixa Express (EMIS)</span>
                  </div>
                  <span className="text-xs font-extrabold text-[#FF6B00] tabular-nums">{formatKz(grandTotal)}</span>
                </div>

                {mcxStatus === 'idle' && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600">
                      Insira o número de telemóvel associado ao seu aplicativo Multicaixa Express. Receberá uma notificação instantânea para validar o pagamento com o seu PIN.
                    </p>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Número de Telefone Multicaixa Express (+244):
                      </label>
                      <input
                        type="text"
                        value={mcxPhone}
                        onChange={(e) => setMcxPhone(e.target.value)}
                        placeholder="Ex: 923 456 789"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#FF6B00] font-bold"
                      />
                    </div>
                    <button
                      onClick={handleStartMcxPayment}
                      className="w-full py-2.5 bg-[#FF6B00] hover:bg-[#EA580C] text-black font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Enviar Notificação de Cobrança ao Telemóvel</span>
                    </button>
                  </div>
                )}

                {mcxStatus === 'waiting' && (
                  <div className="text-center py-4 space-y-3">
                    <div className="w-12 h-12 rounded-full border-4 border-[#FF6B00] border-t-transparent animate-spin mx-auto" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">Pedido enviado para o telemóvel {mcxPhone}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Abra o seu aplicativo <strong>Multicaixa Express</strong> e introduza o seu PIN de 6 dígitos para autorizar.
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-full font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Expira em {mcxTimer} segundos</span>
                    </div>

                    {/* Simulation Button for interactive testing */}
                    <div className="pt-2">
                      <button
                        onClick={handleSimulateMcxApproval}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
                      >
                        ✓ Simular Aprovação no App MCX (Teste Imediato)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* METHOD 2: REFERENCIA MULTICAIXA */}
            {paymentMethod === 'referencia' && (
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="font-bold text-xs text-slate-900">Pagamento por Referência Multicaixa</span>
                  <span className="text-xs text-slate-500">Válido por 48 horas</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Entidade</span>
                    <span className="font-mono font-bold text-sm text-slate-900">00428</span>
                    <button
                      onClick={() => handleCopy('00428', 'entidade')}
                      className="text-[10px] text-[#FF6B00] mt-1 block mx-auto hover:underline"
                    >
                      {copiedField === 'entidade' ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Referência</span>
                    <span className="font-mono font-bold text-sm text-slate-900">928 341 850</span>
                    <button
                      onClick={() => handleCopy('928341850', 'ref')}
                      className="text-[10px] text-[#FF6B00] mt-1 block mx-auto hover:underline"
                    >
                      {copiedField === 'ref' ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Montante</span>
                    <span className="font-bold text-sm text-[#FF6B00] tabular-nums">{formatKz(grandTotal)}</span>
                    <button
                      onClick={() => handleCopy(grandTotal.toString(), 'montante')}
                      className="text-[10px] text-[#FF6B00] mt-1 block mx-auto hover:underline"
                    >
                      {copiedField === 'montante' ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 space-y-1 bg-white p-3 rounded-lg border border-slate-200">
                  <p className="font-semibold text-slate-700">Como pagar:</p>
                  <p>1. No Caixa Multicaixa (ATM) ou Internet Banking, selecione <strong>Pagamentos</strong>.</p>
                  <p>2. Escolha <strong>Pagamento por Referência</strong> e introduza a Entidade e Referência acima.</p>
                  <p>3. A confirmação é processada automaticamente pelo sistema em 5 minutos.</p>
                </div>

                <button
                  onClick={() => finishOrder('pendente')}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors"
                >
                  Confirmar Encomenda com Esta Referência
                </button>
              </div>
            )}

            {/* METHOD 3: TRANSFERÊNCIA BANCÁRIA IBAN */}
            {paymentMethod === 'transferencia' && (
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
                <span className="font-bold text-xs text-slate-900 block">Contas Bancárias Oficiais (Quieto Angola Lda)</span>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">Banco BAI (Kz)</span>
                      <span className="font-mono text-[11px] text-slate-600">AO06 0040 0000 1234 5678 9012 3</span>
                    </div>
                    <button
                      onClick={() => handleCopy('AO06004000001234567890123', 'bai')}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-medium"
                    >
                      {copiedField === 'bai' ? '✓ Copiado' : 'Copiar IBAN'}
                    </button>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">Banco BFA (Kz)</span>
                      <span className="font-mono text-[11px] text-slate-600">AO06 0006 0000 9876 5432 1012 4</span>
                    </div>
                    <button
                      onClick={() => handleCopy('AO06000600009876543210124', 'bfa')}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-medium"
                    >
                      {copiedField === 'bfa' ? '✓ Copiado' : 'Copiar IBAN'}
                    </button>
                  </div>
                </div>

                {/* Proof of Payment Upload */}
                <div className="p-3 bg-white rounded-lg border border-dashed border-slate-300 text-center">
                  <label className="cursor-pointer block">
                    <Upload className="w-5 h-5 text-[#FF6B00] mx-auto mb-1" />
                    <span className="text-xs font-semibold text-slate-800 block">
                      {proofFile ? '✓ Comprovativo Anexado com Sucesso' : 'Anexar Comprovativo de Transferência (PDF/Foto)'}
                    </span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        if (e.target.files?.[0]) setProofFile(e.target.files[0].name);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                <button
                  onClick={() => finishOrder(proofFile ? 'em_analise' : 'pendente')}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors"
                >
                  Finalizar & Enviar Comprovativo
                </button>
              </div>
            )}

            {/* METHOD 4: TPA NA ENTREGA */}
            {paymentMethod === 'tpa' && (
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Truck className="w-4 h-4 text-[#FF6B00]" />
                  <span>Pagamento com Cartão Multicaixa no TPA do Estafeta</span>
                </div>
                <p className="text-xs text-slate-600">
                  O nosso motorista leva a máquina de TPA Multicaixa móvel no momento da entrega no seu endereço em Luanda. Pagamento 100% seguro com cartão de débito ou crédito.
                </p>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-800">
                  Nota: Válido exclusivamente para a Província de Luanda.
                </div>
                <button
                  onClick={() => finishOrder('pendente')}
                  className="w-full py-2.5 bg-[#FF6B00] hover:bg-[#EA580C] text-black font-bold text-xs rounded-lg transition-colors"
                >
                  Confirmar Encomenda com Pagamento na Entrega
                </button>
              </div>
            )}

            {/* Navigation back */}
            <button
              onClick={() => setStep('details')}
              className="text-xs text-slate-500 hover:text-slate-800 underline block mx-auto"
            >
              ← Voltar aos dados de entrega
            </button>
          </div>
        )}

        {/* --- STEP 3: ORDER CONFIRMATION --- */}
        {step === 'confirmation' && completedOrder && (
          <div className="p-6 md:p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider">
                Pedido Registado com Sucesso
              </span>
              <h3 className="text-2xl font-black font-display text-slate-950 mt-1">
                Encomenda Nº {completedOrder.id}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Obrigado pela sua preferência! Enviámos um SMS e e-mail com a confirmação.
              </p>
            </div>

            {/* Order Details Card */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Cliente:</span>
                <span className="font-semibold text-slate-900">{completedOrder.customerName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Telefone:</span>
                <span className="font-semibold text-slate-900">{completedOrder.customerPhone}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Destino:</span>
                <span className="font-semibold text-slate-900">{completedOrder.customerProvince}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Método de Pagamento:</span>
                <span className="font-semibold uppercase text-[#FF6B00]">{completedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-slate-950">
                <span>Valor Total:</span>
                <span className="text-[#FF6B00] text-sm tabular-nums">{formatKz(completedOrder.totalAmount)}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Voltar à Loja
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
