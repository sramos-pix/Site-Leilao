import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "./utils";

export const generateWinningCertificate = (lot: any, user: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // --- DESIGN DE FUNDO E BORDAS ---
  doc.setDrawColor(241, 245, 249); // Slate-100
  doc.setLineWidth(0.5);
  doc.rect(5, 5, pageWidth - 10, pageHeight - 10); // Borda externa fina

  // --- CABEÇALHO PREMIUM ---
  doc.setFillColor(15, 23, 42); // Slate-900 (Cor corporativa forte)
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Logo / Nome da Empresa
  doc.setTextColor(249, 115, 22); // Orange-500
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("AUTO", 20, 28);
  doc.setTextColor(255, 255, 255);
  doc.text("BID", 52, 28);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text("PLATAFORMA OFICIAL DE LEILÕES AUTOMOTIVOS", 20, 35);

  // Título do Documento à Direita
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("CERTIFICADO DE", pageWidth - 20, 22, { align: "right" });
  doc.setFontSize(18);
  doc.text("ARREMATAÇÃO", pageWidth - 20, 30, { align: "right" });

  // --- INFORMAÇÕES DE CONTROLE ---
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  const today = new Date().toLocaleDateString('pt-BR');
  const hash = Math.random().toString(36).substring(2, 10).toUpperCase();
  
  doc.text(`EMISSÃO: ${today}`, 20, 60);
  doc.text(`AUTENTICAÇÃO: #AB-${hash}`, pageWidth - 20, 60, { align: "right" });

  // --- SEÇÃO: DADOS DO ARREMATANTE ---
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.rect(20, 70, pageWidth - 40, 35, 'F');
  
  doc.setFontSize(11);
  doc.setTextColor(249, 115, 22);
  doc.text("DADOS DO ARREMATANTE", 25, 78);
  
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`NOME COMPLETO: ${user.user_metadata?.full_name || user.email}`, 25, 86);
  doc.text(`DOCUMENTO: ${user.user_metadata?.document_id || 'Verificado via Sistema'}`, 25, 92);
  doc.text(`E-MAIL: ${user.email}`, 25, 98);

  // --- SEÇÃO: DETALHES DO VEÍCULO ---
  doc.setFont("helvetica", "bold");
  doc.setTextColor(249, 115, 22);
  doc.text("ESPECIFICAÇÕES DO LOTE", 20, 120);
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.line(20, 122, pageWidth - 20, 122);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.text(`${lot.title}`, 20, 132);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`LOTE Nº: ${lot.lot_number}`, 20, 140);
  doc.text(`ANO: ${lot.year || 'N/A'}`, 20, 146);
  doc.text(`QUILOMETRAGEM: ${lot.mileage_km?.toLocaleString() || '0'} KM`, 20, 152);
  doc.text(`COMBUSTÍVEL: ${lot.fuel_type || 'N/A'}`, 20, 158);

  // --- TABELA DE VALORES ---
  const finalPrice = lot.final_price || lot.current_bid;
  const commission = finalPrice * 0.05;
  const total = finalPrice + commission;

  autoTable(doc, {
    startY: 170,
    margin: { left: 20, right: 20 },
    head: [['DESCRIÇÃO DOS VALORES', 'MONTANTE (BRL)']],
    body: [
      ['VALOR DO ARREMATE (LANCE VENCEDOR)', formatCurrency(finalPrice)],
      ['COMISSÃO DO LEILOEIRO (5% FIXO)', formatCurrency(commission)],
      ['TAXAS ADMINISTRATIVAS E PÁTIO', 'INCLUSO'],
      [{ content: 'TOTAL CONSOLIDADO A PAGAR', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } }, 
       { content: formatCurrency(total), styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } }],
    ],
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 10 },
    styles: { fontSize: 9, cellPadding: 5 },
  });

  // --- SELO DE GARANTIA E ASSINATURA ---
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  
  // Simulação de Selo Digital
  doc.setDrawColor(249, 115, 22);
  doc.setLineWidth(1);
  doc.circle(40, finalY + 15, 12);
  doc.setFontSize(7);
  doc.setTextColor(249, 115, 22);
  doc.text("VERIFICADO", 40, finalY + 14, { align: "center" });
  doc.text("AUTOBID", 40, finalY + 18, { align: "center" });

  doc.setTextColor(100, 116, 139); // Slate-500
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text("Documento gerado eletronicamente. A validade deste certificado está condicionada", 60, finalY + 12);
  doc.text("à confirmação bancária do pagamento integral dos valores acima citados.", 60, finalY + 17);

  // --- RODAPÉ ---
  doc.setFillColor(241, 245, 249);
  doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("AutoBid Leilões S.A. - CNPJ: 00.000.000/0001-00 - São Paulo, SP", pageWidth / 2, pageHeight - 12, { align: "center" });
  doc.text("www.autobid.com.br | Suporte: 0800 123 4567", pageWidth / 2, pageHeight - 7, { align: "center" });

  // --- DOWNLOAD AUTOMÁTICO ---
  doc.save(`Nota_Arremate_Lote_${lot.lot_number}_${hash}.pdf`);
};