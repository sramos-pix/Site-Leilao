import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { formatCurrency } from "./utils";

export const generateWinningCertificate = (lot: any, user: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Cabeçalho
  doc.setFillColor(249, 115, 22); // Orange-500
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("NOTA DE ARREMATAÇÃO", pageWidth / 2, 25, { align: "center" });

  // Corpo
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  
  const today = new Date().toLocaleDateString('pt-BR');
  doc.text(`Data de Emissão: ${today}`, 20, 55);
  doc.text(`Lote Nº: ${lot.lot_number}`, 20, 65);

  // Dados do Arrematante
  doc.setFont("helvetica", "bold");
  doc.text("DADOS DO ARREMATANTE", 20, 85);
  doc.line(20, 87, 190, 87);
  
  doc.setFont("helvetica", "normal");
  doc.text(`Nome: ${user.user_metadata?.full_name || user.email}`, 20, 95);
  doc.text(`E-mail: ${user.email}`, 20, 105);

  // Dados do Veículo
  doc.setFont("helvetica", "bold");
  doc.text("DADOS DO VEÍCULO", 20, 125);
  doc.line(20, 127, 190, 127);
  
  doc.setFont("helvetica", "normal");
  doc.text(`Veículo: ${lot.title}`, 20, 135);
  doc.text(`Ano: ${lot.year || 'N/A'}`, 20, 145);
  doc.text(`KM: ${lot.mileage_km?.toLocaleString() || '0'} km`, 20, 155);
  doc.text(`Combustível: ${lot.fuel_type || 'N/A'}`, 20, 165);

  // Valores
  doc.setFont("helvetica", "bold");
  doc.text("RESUMO FINANCEIRO", 20, 185);
  doc.line(20, 187, 190, 187);
  
  const finalPrice = lot.current_bid || lot.start_bid;
  const commission = finalPrice * 0.05; // 5% comissão padrão
  const total = finalPrice + commission;

  (doc as any).autoTable({
    startY: 195,
    head: [['Descrição', 'Valor']],
    body: [
      ['Valor do Arremate', formatCurrency(finalPrice)],
      ['Comissão do Leiloeiro (5%)', formatCurrency(commission)],
      ['Total a Pagar', formatCurrency(total)],
    ],
    theme: 'striped',
    headStyles: { fillColor: [249, 115, 22] },
  });

  // Rodapé
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text("Este documento serve como comprovante de arrematação e deve ser apresentado", pageWidth / 2, finalY, { align: "center" });
  doc.text("para a retirada do veículo após a confirmação do pagamento.", pageWidth / 2, finalY + 5, { align: "center" });

  // Salvar
  doc.save(`Nota_Arremate_Lote_${lot.lot_number}.pdf`);
};
