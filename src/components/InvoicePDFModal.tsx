import React, { useRef, useState } from 'react';
import { OrderRecord } from '../types';
import { formatKz } from '../data/products';
import { downloadInvoicePDF, printInvoiceDocument } from '../utils/generateInvoicePDF';
import { 
  Printer, 
  Download, 
  MessageSquare, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  Building2,
  Check
} from 'lucide-react';

interface InvoicePDFModalProps {
  order: OrderRecord;
  onClose: () => void;
  invoiceType?: 'factura' | 'proforma' | 'recibo';
}

export const InvoicePDFModal: React.FC<InvoicePDFModalProps> = ({
  order,
  onClose,
  invoiceType = 'factura'
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const invoiceNumber = order.id.replace('QA-', 'FT QA-');
  const issueDate = order.date || new Date().toLocaleDateString('pt-AO');
  const dueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-AO');

  const subtotal = order.subtotal;
  const shipping = order.shippingFee;
  const tax = order.tax || Math.round(subtotal * 0.14);
  const total = order.totalAmount;

  // Direct PDF Download (100% reliable in any browser and iframe)
  const handleDownloadPDF = () => {
    downloadInvoicePDF(order);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  // Print invoice
  const handlePrint = () => {
    try {
      printInvoiceDocument(order);
      // Also try standard window.print as secondary
      window.print();
    } catch (e) {
      console.warn('Native print failed, downloading PDF directly', e);
      downloadInvoicePDF(order);
    }
  };

  // WhatsApp share
  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Olá ${order.customerName}! Segue a sua Factura ${invoiceNumber} da Quieto Angola no valor de ${formatKz(total)}.\n` +
      `Estado: ${order.paymentStatus === 'aprovado' ? 'LIQUIDADA / PAGA' : 'AGUARDA PAGAMENTO'}\n` +
      `Artigos: ${order.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}\n` +
      `Obrigado pela preferência!`
    );
    const phone = order.customerPhone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phone.startsWith('244') ? phone : '244' + phone}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col my-auto max-h-[95vh]">
        {/* Modal Top Actions Toolbar (Hidden on print) */}
        <div className="bg-slate-950 text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
            <span className="font-bold font-display text-sm text-white">
              Emissor de Factura Comercial em PDF (AGT Angola)
            </span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
              {invoiceNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Primary Direct Download Button (Works in any iframe / browser) */}
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-1.5 bg-[#FF6B00] hover:bg-[#EA580C] text-black font-extrabold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Descarregar PDF (.pdf)</span>
            </button>

            {/* Print button with iframe fallback */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>Imprimir Documento</span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Success Banner when Download is triggered */}
        {downloadSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2 text-xs font-semibold text-emerald-800 flex items-center gap-2 print:hidden animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Factura transferida em formato PDF com sucesso! Podes abri-la ou imprimi-la diretamente.</span>
          </div>
        )}

        {/* --- PRINTABLE A4 INVOICE SHEET --- */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-100 flex justify-center print:bg-white print:p-0">
          <div
            ref={invoiceRef}
            className="bg-white w-full max-w-3xl p-8 sm:p-12 rounded-xl shadow-lg border border-slate-200 print:shadow-none print:border-none print:p-0 text-slate-900 text-xs"
            id="factura-impressao"
          >
            {/* Header: Quieto Angola Brand + Document Meta */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b-2 border-slate-900">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-lg bg-black text-[#FF6B00] flex items-center justify-center font-black font-display text-lg">
                    Q
                  </span>
                  <span className="text-2xl font-black font-display uppercase tracking-tight text-slate-950">
                    Quieto <span className="text-[#FF6B00]">Angola</span>
                  </span>
                </div>
                <p className="font-extrabold text-slate-800 text-xs">
                  Quieto Angola - Soluções Gráficas, Brindes & Vestuário, Lda
                </p>
                <p className="text-slate-600">NIF da Empresa: <strong>5418293021</strong></p>
                <p className="text-slate-600">Via Expressa, Km 14, Talatona, Luanda - Angola</p>
                <p className="text-slate-600">Telefone: +244 923 000 000 · Email: financeiro@quietoangola.ao</p>
                <p className="text-slate-500 text-[11px] mt-1">Registo Comercial de Luanda sob o nº 8941/2024</p>
              </div>

              <div className="text-left sm:text-right">
                <div className="inline-block px-3 py-1 bg-black text-white font-black text-xs rounded mb-2 uppercase tracking-wide">
                  {order.paymentStatus === 'aprovado' ? 'FACTURA-RECIBO' : 'FACTURA COMERCIAL'}
                </div>
                <h3 className="text-base font-black text-slate-900 tracking-tight font-mono">
                  {invoiceNumber}
                </h3>
                <div className="space-y-0.5 text-slate-600 mt-2">
                  <p><strong>Data de Emissão:</strong> {issueDate}</p>
                  <p><strong>Vencimento:</strong> {dueDate}</p>
                  <p><strong>Moeda:</strong> AOA (Kwanzas)</p>
                  <p className="text-[11px] font-semibold text-emerald-700 mt-1">
                    {order.paymentStatus === 'aprovado' ? '✓ PAGO / LIQUIDADO' : 'AGUARDA LIQUIDAÇÃO'}
                  </p>
                </div>
              </div>
            </div>

            {/* Client & Delivery Info Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-1">
                  Exmo.(s) Sr.(s) / Dados do Cliente
                </span>
                <p className="text-sm font-bold text-slate-950">
                  {order.isCompany && order.companyName ? order.companyName : order.customerName}
                </p>
                {order.isCompany && order.nif ? (
                  <p className="text-slate-700"><strong>NIF:</strong> {order.nif}</p>
                ) : (
                  <p className="text-slate-500"><strong>NIF:</strong> Consumidor Final (999999999)</p>
                )}
                <p className="text-slate-600">{order.customerEmail || 'Não indicado'}</p>
                <p className="text-slate-600">{order.customerPhone}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-1">
                  Local de Entrega & Despacho
                </span>
                <p className="text-slate-800 font-semibold">{order.customerAddress}</p>
                <p className="text-slate-600">{order.customerProvince}</p>
                <p className="text-slate-500 text-[11px] mt-1">
                  Método de Pagamento: <strong className="uppercase">{order.paymentMethod}</strong>
                </p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-white text-[11px] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Artigo / Descrição do Serviço</th>
                    <th className="py-2.5 px-2 text-center">Qtd</th>
                    <th className="py-2.5 px-3 text-right">P. Unitário</th>
                    <th className="py-2.5 px-2 text-center">Taxa IVA</th>
                    <th className="py-2.5 px-3 text-right">Total Líquido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {order.items.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{item.product.name}</div>
                        <div className="text-[11px] text-slate-500">
                          Cor: {item.selectedColor.name} {item.selectedSize ? `· Tam: ${item.selectedSize}` : ''}
                          {item.technique ? ` · Personalização: ${item.technique.toUpperCase()}` : ''}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-slate-900">{item.quantity}</td>
                      <td className="py-3 px-3 text-right tabular-nums text-slate-700">{formatKz(item.unitPrice)}</td>
                      <td className="py-3 px-2 text-center text-slate-600">14%</td>
                      <td className="py-3 px-3 text-right font-bold tabular-nums text-slate-950">
                        {formatKz(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                  {/* Shipping item */}
                  <tr className="bg-slate-50/50">
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-800">Serviço de Transporte & Logística</div>
                      <div className="text-[11px] text-slate-500">Destino: {order.customerProvince}</div>
                    </td>
                    <td className="py-2.5 px-2 text-center">1</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">{formatKz(shipping)}</td>
                    <td className="py-2.5 px-2 text-center text-slate-600">14%</td>
                    <td className="py-2.5 px-3 text-right font-semibold tabular-nums text-slate-900">
                      {shipping === 0 ? 'Grátis' : formatKz(shipping)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals & Banking Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 mb-6">
              {/* Bank accounts for payment */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1.5">
                <span className="font-bold text-slate-900 uppercase block">Coordenadas Bancárias Oficiais:</span>
                <p className="text-slate-700"><strong>Banco BAI (AO06):</strong> 0040 0000 1234 5678 9012 3</p>
                <p className="text-slate-700"><strong>Banco BFA (AO06):</strong> 0006 0000 9876 5432 1012 4</p>
                <p className="text-slate-700"><strong>Multicaixa Express:</strong> 923 000 000</p>
                <p className="text-slate-700"><strong>Referência Multicaixa:</strong> Entidade 00428 · Ref 928 341 850</p>
                <p className="text-slate-500 italic mt-1">Enviar comprovativo para: comprovativos@quietoangola.ao</p>
              </div>

              {/* Fiscal Calculation Summary */}
              <div className="space-y-2 text-xs text-right">
                <div className="flex justify-between text-slate-600">
                  <span>Incidência / Total Ilíquido:</span>
                  <span className="font-semibold tabular-nums text-slate-800">{formatKz(subtotal + shipping)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Imposto sobre o Valor Acrescentado (IVA 14%):</span>
                  <span className="font-semibold tabular-nums text-slate-800">{formatKz(tax)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Desconto Comercial Concedido:</span>
                    <span className="font-semibold tabular-nums">-{formatKz(order.discount)}</span>
                  </div>
                )}
                <div className="pt-2 border-t-2 border-slate-900 flex justify-between items-center text-sm font-black text-slate-950">
                  <span>TOTAL A PAGAR (Kz):</span>
                  <span className="text-xl text-[#FF6B00] tabular-nums font-display">{formatKz(total)}</span>
                </div>
              </div>
            </div>

            {/* Legal Fiscal Certification Footer (AGT Angola) */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500">
              <div className="space-y-0.5">
                <p className="font-mono">
                  {order.id}-bK9X-Processado por programa certificado nº 142/AGT/2026 QuietoGest
                </p>
                <p>Os bens e serviços consideram-se colocados à disposição do adquirente nesta data.</p>
                <p className="text-slate-400">Regime Geral de Tributação do IVA · Artigo 43º do Código do IVA de Angola.</p>
              </div>

              {/* Visual Stamp / Seal */}
              <div className="flex items-center gap-2 border border-slate-300 rounded-lg p-2 bg-slate-50 shrink-0">
                <div className="w-9 h-9 rounded-full border-2 border-dashed border-[#FF6B00] text-[#FF6B00] flex items-center justify-center font-bold text-[9px] uppercase text-center leading-tight">
                  AGT<br/>2026
                </div>
                <div className="text-[9px] text-left">
                  <span className="font-bold text-slate-800 block">QUIETO ANGOLA LDA</span>
                  <span className="text-emerald-700 font-semibold block">DOCUMENTO CERTIFICADO</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
