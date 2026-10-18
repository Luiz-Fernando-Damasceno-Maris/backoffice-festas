import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ContractItem {
  id?: string;
  name: string;
  replacement_value?: string | number;
}

export interface ContractData {
  order: {
    id: string;
    event_date: string;
    assembly_time?: string | null;
    retrieval_time?: string | null;
    negotiated_value: string | number;
    advance_fee: string | number;
    status_payment: string;
    client_name?: string;
    client_whatsapp?: string;
    client_cpf?: string;
    client_address?: string;
    kit_name?: string;
  };
  client?: {
    id?: string;
    name: string;
    whatsapp?: string;
    cpf?: string;
    full_address?: string;
  };
  kit?: {
    id?: string;
    name: string;
    base_price?: string | number;
    items?: ContractItem[];
  };
}

function formatCurrency(val: string | number | undefined): string {
  const num = Number(val || 0);
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(isoStr: string | undefined): string {
  if (!isoStr) return 'A combinar';
  try {
    const parts = isoStr.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(isoStr);
    return d.toLocaleDateString('pt-BR');
  } catch {
    return isoStr;
  }
}

function formatDateTime(isoStr: string | null | undefined): string {
  if (!isoStr) return 'A combinar';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    const dateFormatted = d.toLocaleDateString('pt-BR');
    const timeFormatted = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${dateFormatted} às ${timeFormatted}`;
  } catch {
    return isoStr;
  }
}

export function generateContractPDF(data: ContractData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let currentY = 14;

  const clientName = data.client?.name || data.order.client_name || 'Não informado';
  const clientCpf = data.client?.cpf || data.order.client_cpf || 'Não informado';
  const clientPhone = data.client?.whatsapp || data.order.client_whatsapp || 'Não informado';
  const clientAddress = data.client?.full_address || data.order.client_address || 'Não informado';

  const kitName = data.kit?.name || data.order.kit_name || 'Kit de Decoração';
  const items = data.kit?.items || [];

  const totalValue = Number(data.order.negotiated_value || 0);
  const advanceValue = Number(data.order.advance_fee || 0);
  const remainingValue = Math.max(0, totalValue - advanceValue);

  // 1. BARRA SUPERIOR COLORIDA
  doc.setFillColor(79, 70, 229); // Indigo #4F46E5
  doc.rect(0, 0, pageWidth, 5, 'F');

  // 2. CABEÇALHO DA EMPRESA
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(30, 27, 75); // Deep Indigo
  doc.text('ALE MARIS MINI FESTAS', margin, currentY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(79, 70, 229);
  doc.text('CONTRATO DE LOCAÇÃO E TERMO DE RESPONSABILIDADE', margin, currentY + 5);

  // Número do Contrato e Data de Emissão (Alinhados à direita)
  const orderRef = `#PED-${data.order.id.slice(0, 8).toUpperCase()}`;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81);
  doc.text(orderRef, pageWidth - margin, currentY, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(`Emissão: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - margin, currentY + 5, { align: 'right' });

  currentY += 12;

  // Linha divisória fina
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 5;

  // 3. SEÇÃO: DADOS DO LOCATÁRIO (CLIENTE)
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.roundedRect(margin, currentY, contentWidth, 23, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, contentWidth, 23, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(79, 70, 229);
  doc.text('1. DADOS DO LOCATÁRIO (CLIENTE)', margin + 3, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(55, 65, 81);

  // Linha 1: Nome e CPF
  doc.text(`Nome: ${clientName}`, margin + 3, currentY + 11);
  doc.text(`CPF: ${clientCpf}`, margin + 110, currentY + 11);

  // Linha 2: Telefone e Endereço
  doc.text(`WhatsApp / Tel: ${clientPhone}`, margin + 3, currentY + 17);
  doc.text(`Local / Endereço: ${clientAddress}`, margin + 110, currentY + 17);

  currentY += 27;

  // 4. SEÇÃO: DADOS DO EVENTO & VALORES
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, contentWidth, 27, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, contentWidth, 27, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(79, 70, 229);
  doc.text('2. DETALHES DO EVENTO & CONDIÇÕES FINANCEIRAS', margin + 3, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(55, 65, 81);

  // Linha 1: Kit e Data
  doc.text(`Kit Contratado: ${kitName}`, margin + 3, currentY + 11);
  doc.text(`Data da Festa: ${formatDate(data.order.event_date)}`, margin + 110, currentY + 11);

  // Linha 2: Horários
  doc.text(`Montagem Prevista: ${formatDateTime(data.order.assembly_time)}`, margin + 3, currentY + 16);
  doc.text(`Retirada Prevista: ${formatDateTime(data.order.retrieval_time)}`, margin + 110, currentY + 16);

  // Linha 3: Valores Financeiros
  doc.setFont('helvetica', 'bold');
  doc.text(`Valor Total Fechado: ${formatCurrency(totalValue)}`, margin + 3, currentY + 22);
  doc.setTextColor(22, 101, 52); // Verde
  doc.text(`Sinal Pago: ${formatCurrency(advanceValue)}`, margin + 65, currentY + 22);

  if (remainingValue > 0) {
    doc.setTextColor(194, 65, 12); // Laranja escuro
    doc.text(`Saldo Restante a Quitar: ${formatCurrency(remainingValue)}`, margin + 110, currentY + 22);
  } else {
    doc.setTextColor(22, 101, 52);
    doc.text(`Situação: QUITADO TOTALMENTE`, margin + 110, currentY + 22);
  }

  currentY += 31;

  // 5. SEÇÃO: TABELA DE PEÇAS & VALORES DE REPOSIÇÃO
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(79, 70, 229);
  doc.text('3. INVENTÁRIO DO KIT & TABELA DE VALORES DE REPOSIÇÃO', margin, currentY + 3);
  currentY += 5;

  const tableRows = items.length > 0
    ? items.map((item, index) => [
        String(index + 1),
        item.name,
        '1 un.',
        formatCurrency(item.replacement_value),
      ])
    : [['1', 'Itens e Peças de Acordo com Modelo Selecionado', '1 kit', formatCurrency(data.kit?.base_price || totalValue)]];

  autoTable(doc, {
    startY: currentY,
    head: [['#', 'Item / Peça Decorativa', 'Qtd', 'Valor Unit. de Reposição (Avaria / Extravio)']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 55, halign: 'right' },
    },
    styles: {
      fontSize: 7.5,
      textColor: [55, 65, 81],
      cellPadding: 1.8,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    margin: { left: margin, right: margin },
  });

  // Pega a posição logo após a tabela
  // @ts-expect-error autoTable adds lastAutoTable to doc
  currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 5 : currentY + 45;

  // Se estiver muito próximo do fim da página, cria nova página
  if (currentY > pageHeight - 55) {
    doc.addPage();
    currentY = 14;
  }

  // 6. SEÇÃO: CLÁUSULAS & TERMOS DE RESPONSABILIDADE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(79, 70, 229);
  doc.text('4. TERMOS DE RESPONSABILIDADE E CONDIÇÕES DE LOCAÇÃO', margin, currentY);
  currentY += 4;

  const clauses = [
    'CLÁUSULA 1ª: O LOCATÁRIO declara receber todas as peças e itens acima descritos em perfeito estado de conservação, higiene e funcionamento.',
    'CLÁUSULA 2ª: É expressamente proibido colar fitas adesivas não autorizadas, furar, grampear ou expor os itens à chuva, umidade e fogo.',
    'CLÁUSULA 3ª: Em caso de quebra, dano irreparável, manchas ou extravio de qualquer item, o LOCATÁRIO compromete-se a indenizar a LOCADORA no ato da devolução pelo respectivo Valor Unitário de Reposição estipulado na tabela acima.',
    'CLÁUSULA 4ª: O saldo devedor restante (se houver) deverá ser quitado impreterivelmente até a entrega e montagem das peças no local acordado.',
    'CLÁUSULA 5ª: As partes elegem a boa-fé e o acordo mútuo para dirimir quaisquer dúvidas decorrentes do presente termo de locação.',
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(75, 85, 99);

  clauses.forEach((clause) => {
    const splitClause = doc.splitTextToSize(clause, contentWidth);
    doc.text(splitClause, margin, currentY);
    currentY += splitClause.length * 3.2;
  });

  currentY += 4;

  // Se faltar espaço para as assinaturas, quebra de página
  if (currentY > pageHeight - 35) {
    doc.addPage();
    currentY = 25;
  }

  // 7. SEÇÃO DE ASSINATURAS
  currentY += 8;
  const colWidth = (contentWidth - 20) / 2;

  // Assinatura Locadora
  doc.setDrawColor(156, 163, 175);
  doc.setLineWidth(0.3);
  doc.line(margin, currentY, margin + colWidth, currentY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(31, 41, 55);
  doc.text('ALE MARIS MINI FESTAS', margin + colWidth / 2, currentY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(107, 114, 128);
  doc.text('LOCADORA', margin + colWidth / 2, currentY + 7.5, { align: 'center' });

  // Assinatura Locatário
  const clientX = margin + colWidth + 20;
  doc.line(clientX, currentY, clientX + colWidth, currentY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(31, 41, 55);
  doc.text(clientName.toUpperCase(), clientX + colWidth / 2, currentY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(107, 114, 128);
  doc.text(`LOCATÁRIO (A) - CPF: ${clientCpf}`, clientX + colWidth / 2, currentY + 7.5, { align: 'center' });

  // 8. RODAPÉ DE PÁGINA
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Ale Maris Mini Festas · Documento gerado eletronicamente em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  // Gera o nome do arquivo amigável: Contrato_NomeCliente_Data.pdf
  const sanitizedClient = clientName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Contrato_${sanitizedClient}_${data.order.id.slice(0, 6)}.pdf`;

  // Salva e faz download no navegador
  doc.save(filename);
}
