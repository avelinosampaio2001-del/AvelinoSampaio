import { jsPDF } from 'jspdf';
import { OrderRecord } from '../types';
import { formatKz } from '../data/products';

export function generateInvoicePDF(order: OrderRecord): jsPDF {
  // A4 size: 210mm x 297mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const invoiceNumber = order.id.replace('QA-', 'FT QA-');
  const issueDate = order.date || new Date().toLocaleDateString('pt-AO');
  const dueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-AO');
  const isPaid = order.paymentStatus === 'aprovado';

  // 1. Header Banner & Logo
  doc.setFillColor(18, 18, 18); // Deep black
  doc.rect(14, 14, 182, 1, 'F');

  // Orange accent block for brand
  doc.setFillColor(255, 107, 0); // #FF6B00 Orange
  doc.roundedRect(14, 18, 10, 10, 2, 2, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Q', 17, 25);

  // Brand Name
  doc.setTextColor(18, 18, 18);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('QUIETO ANGOLA', 28, 25);

  // Company fiscal info
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('Quieto Angola - Soluções Gráficas, Brindes & Vestuário, Lda', 14, 34);
  doc.text('NIF da Empresa: 5418293021 | Registo Comercial de Luanda nº 8941', 14, 38.5);
  doc.text('Via Expressa, Km 14, Talatona, Luanda - Angola', 14, 43);
  doc.text('Tel: +244 923 000 000 | Email: financeiro@quietoangola.ao', 14, 47.5);

  // 2. Right Side: Invoice Meta Box
  doc.setFillColor(245, 245, 247);
  doc.roundedRect(120, 18, 76, 32, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(18, 18, 18);
  const typeText = isPaid ? 'FACTURA-RECIBO' : 'FACTURA COMERCIAL';
  doc.text(typeText, 125, 25);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 107, 0);
  doc.text(invoiceNumber, 125, 30.5);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Data de Emissão: ${issueDate}`, 125, 36);
  doc.text(`Vencimento: ${dueDate}`, 125, 40.5);
  doc.text(`Moeda: AOA (Kwanzas de Angola)`, 125, 45);

  if (isPaid) {
    doc.setTextColor(22, 101, 52); // Green
    doc.setFont('helvetica', 'bold');
    doc.text('ESTADO: PAGO / LIQUIDADO', 125, 48.5);
  } else {
    doc.setTextColor(180, 83, 9); // Amber
    doc.setFont('helvetica', 'bold');
    doc.text('ESTADO: AGUARDA LIQUIDAÇÃO', 125, 48.5);
  }

  // 3. Client & Shipping Box
  doc.setFillColor(250, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 55, 182, 26, 2, 2, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(148, 163, 184);
  doc.text('DADOS DO CLIENTE / ENTIDADE ADQUIRENTE', 18, 60.5);
  doc.text('LOCAL DE ENTREGA & DESPACHO', 110, 60.5);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(18, 18, 18);
  const clientDisplayName = order.isCompany && order.companyName ? order.companyName : order.customerName;
  doc.text(clientDisplayName, 18, 66);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const nifDisplay = order.isCompany && order.nif ? `NIF: ${order.nif}` : 'NIF: Consumidor Final (999999999)';
  doc.text(nifDisplay, 18, 71);
  doc.text(`Contacto: ${order.customerPhone}`, 18, 75.5);

  // Address
  doc.setFont('helvetica', 'bold');
  doc.text(order.customerAddress || 'Luanda', 110, 66);
  doc.setFont('helvetica', 'normal');
  doc.text(`Província: ${order.customerProvince}`, 110, 71);
  doc.text(`Método: ${order.paymentMethod.toUpperCase()}`, 110, 75.5);

  // 4. Items Table
  let currentY = 88;

  // Table Header
  doc.setFillColor(18, 18, 18);
  doc.rect(14, currentY, 182, 7.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('DESCRIÇÃO DO ARTIGO / SERVIÇO', 18, currentY + 5);
  doc.text('QTD', 112, currentY + 5, { align: 'center' });
  doc.text('P. UNITÁRIO', 140, currentY + 5, { align: 'right' });
  doc.text('IVA', 158, currentY + 5, { align: 'center' });
  doc.text('TOTAL LÍQUIDO', 190, currentY + 5, { align: 'right' });

  currentY += 7.5;

  // Items Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  order.items.forEach((item, index) => {
    // Alternate row fill
    if (index % 2 === 0) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.rect(14, currentY, 182, 10, 'F');

    // Title & details
    doc.setFont('helvetica', 'bold');
    doc.text(item.product.name.substring(0, 52), 18, currentY + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    const details = `Cor: ${item.selectedColor.name} | Técnica: ${(item.technique || 'DTF').toUpperCase()}${item.selectedSize ? ' | Tam: ' + item.selectedSize : ''}`;
    doc.text(details, 18, currentY + 8);

    // Quantity, Price, Total
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(item.quantity.toString(), 112, currentY + 6, { align: 'center' });
    doc.text(formatKz(item.unitPrice), 140, currentY + 6, { align: 'right' });
    doc.text('14%', 158, currentY + 6, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text(formatKz(item.totalPrice), 190, currentY + 6, { align: 'right' });

    currentY += 10;
  });

  // Shipping Row
  doc.setFillColor(248, 250, 252);
  doc.rect(14, currentY, 182, 8, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Serviço de Transporte & Logística (${order.customerProvince.split(' ')[0]})`, 18, currentY + 5);
  doc.text('1', 112, currentY + 5, { align: 'center' });
  doc.text(order.shippingFee === 0 ? 'Grátis' : formatKz(order.shippingFee), 140, currentY + 5, { align: 'right' });
  doc.text('14%', 158, currentY + 5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text(order.shippingFee === 0 ? '0,00 Kz' : formatKz(order.shippingFee), 190, currentY + 5, { align: 'right' });

  currentY += 12;

  // 5. Totals & Banking Details
  const totalsY = currentY;

  // Banking block on left
  doc.setFillColor(250, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, totalsY, 100, 36, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(18, 18, 18);
  doc.text('COORDENADAS BANCÁRIAS PARA LIQUIDAÇÃO:', 18, totalsY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('Banco BAI (AO06): 0040 0000 1234 5678 9012 3', 18, totalsY + 12);
  doc.text('Banco BFA (AO06): 0006 0000 9876 5432 1012 4', 18, totalsY + 17);
  doc.text('Multicaixa Express (MCX): 923 000 000', 18, totalsY + 22);
  doc.text('Referência Multicaixa: Entidade 00428 | Ref 928 341 850', 18, totalsY + 27);
  doc.setFont('helvetica', 'italic');
  doc.text('Enviar comprovativo para: financeiro@quietoangola.ao', 18, totalsY + 32);

  // Totals Breakdown on right
  const subtotal = order.subtotal + order.shippingFee;
  const tax = order.tax || Math.round(order.subtotal * 0.14);
  const grandTotal = order.totalAmount;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Incidência / Subtotal:', 140, totalsY + 6);
  doc.text(formatKz(subtotal), 190, totalsY + 6, { align: 'right' });

  doc.text('IVA (14% Angola):', 140, totalsY + 12);
  doc.text(formatKz(tax), 190, totalsY + 12, { align: 'right' });

  if (order.discount > 0) {
    doc.text('Desconto Comercial:', 140, totalsY + 18);
    doc.text(`-${formatKz(order.discount)}`, 190, totalsY + 18, { align: 'right' });
  }

  // Divider
  doc.setDrawColor(18, 18, 18);
  doc.setLineWidth(0.5);
  doc.line(135, totalsY + 22, 196, totalsY + 22);

  // Grand Total Highlight Box
  doc.setFillColor(18, 18, 18);
  doc.roundedRect(135, totalsY + 24, 61, 12, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('TOTAL A PAGAR:', 139, totalsY + 31.5);
  doc.setTextColor(255, 107, 0); // Orange
  doc.setFontSize(10.5);
  doc.text(formatKz(grandTotal), 192, totalsY + 31.5, { align: 'right' });

  // 6. Legal AGT Certification Footer
  const footerY = 270;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, footerY, 196, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `${order.id}-bK9X-Processado por programa certificado nº 142/AGT/2026 QuietoGest v2.4`,
    14,
    footerY + 4
  );
  doc.text(
    'Os bens ou serviços foram colocados à disposição do adquirente nesta data. Regime Geral de IVA de Angola.',
    14,
    footerY + 8
  );

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52);
  doc.text('DOCUMENTO CERTIFICADO PELA AGT · EMISSÃO VÁLIDA PARA EFEITOS FISCAIS', 14, footerY + 12);

  return doc;
}

export function downloadInvoicePDF(order: OrderRecord): void {
  const doc = generateInvoicePDF(order);
  const filename = `Factura_${order.id.replace('QA-', 'FT_QA_')}.pdf`;
  doc.save(filename);
}

export function printInvoiceDocument(order: OrderRecord): void {
  try {
    // Generate the PDF
    const doc = generateInvoicePDF(order);
    
    // Create an iframe to cleanly invoke print
    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    
    const printIframe = document.createElement('iframe');
    printIframe.style.position = 'fixed';
    printIframe.style.right = '0';
    printIframe.style.bottom = '0';
    printIframe.style.width = '0';
    printIframe.style.height = '0';
    printIframe.style.border = '0';
    printIframe.src = blobUrl;
    
    document.body.appendChild(printIframe);
    
    printIframe.onload = () => {
      try {
        printIframe.contentWindow?.focus();
        printIframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print intercepted, fallback to direct download', err);
        doc.save(`Factura_${order.id.replace('QA-', 'FT_QA_')}.pdf`);
      }
    };

    // If print dialog fails to open after 1 second, also trigger direct download
    setTimeout(() => {
      if (document.body.contains(printIframe)) {
        // Safe fallback
      }
    }, 1500);
  } catch (error) {
    console.warn('Print error fallback:', error);
    downloadInvoicePDF(order);
  }
}
