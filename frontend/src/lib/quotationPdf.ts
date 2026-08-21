import { jsPDF } from "jspdf";

export type PdfRequest = {
  title: string;
  customerName?: string;
  email?: string;
  phone?: string;
  deliveryLocation?: string;
  country?: string;
  quantity?: string;
  description?: string;
};

export type PdfQuotation = {
  quotationNumber: string;
  currency: "ZMW" | "USD";
  freightCost: number;
  customsCost: number;
  serviceFee: number;
  markupAmount?: number;
  totalAmount: number;
  deliveryTime: string;
  validityDays: number;
  terms?: string;
  notes?: string;
  createdAt?: string;
};

const money = (value: number, currency: string) =>
  `${currency} ${Number(value || 0).toLocaleString("en-ZM", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function downloadQuotationPdf(quotation: PdfQuotation, request: PdfRequest) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const navy: [number, number, number] = [9, 35, 74];
  const gold: [number, number, number] = [234, 179, 8];
  const left = 18;
  const width = 174;

  pdf.setFillColor(...navy);
  pdf.rect(0, 0, 210, 42, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.text("AFRILINK CAPITAL", left, 19);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text("African procurement, sourcing and delivery", left, 27);
  pdf.setFillColor(...gold);
  pdf.rect(160, 0, 50, 42, "F");
  pdf.setTextColor(...navy);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.text("QUOTATION", 185, 18, { align: "center" });
  pdf.setFontSize(9);
  pdf.text(quotation.quotationNumber, 185, 26, { align: "center" });

  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(9);
  const date = quotation.createdAt ? new Date(quotation.createdAt) : new Date();
  pdf.text(`Date: ${date.toLocaleDateString("en-GB")}`, left, 54);
  pdf.text(`Valid for: ${quotation.validityDays} days`, 192, 54, { align: "right" });

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("PREPARED FOR", left, 68);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text(request.customerName || "Valued Customer", left, 76);
  pdf.text(request.phone || "", left, 82);
  pdf.text(request.email || "", left, 88);
  pdf.text([request.deliveryLocation, request.country].filter(Boolean).join(", "), left, 94);

  pdf.setFont("helvetica", "bold");
  pdf.text("REQUEST", 112, 68);
  pdf.setFont("helvetica", "normal");
  pdf.text(pdf.splitTextToSize(request.title, 80), 112, 76);
  pdf.text(`Quantity: ${request.quantity || "As requested"}`, 112, 88);

  let y = 108;
  pdf.setFillColor(241, 245, 249);
  pdf.rect(left, y, width, 10, "F");
  pdf.setFont("helvetica", "bold");
  pdf.text("Cost item", left + 4, y + 7);
  pdf.text("Amount", 188, y + 7, { align: "right" });
  y += 10;

  const lines: Array<[string, number]> = [
    ["Product sourcing and supply", quotation.totalAmount - quotation.freightCost - quotation.customsCost - quotation.serviceFee],
    ["Freight and logistics", quotation.freightCost],
    ["Customs and clearance", quotation.customsCost],
    ["Afrilink service fee", quotation.serviceFee],
  ];
  pdf.setFont("helvetica", "normal");
  for (const [label, value] of lines) {
    if (value <= 0) continue;
    pdf.line(left, y + 10, 192, y + 10);
    pdf.text(label, left + 4, y + 7);
    pdf.text(money(value, quotation.currency), 188, y + 7, { align: "right" });
    y += 10;
  }

  pdf.setFillColor(...navy);
  pdf.rect(112, y + 3, 80, 14, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text("TOTAL", 117, y + 12);
  pdf.text(money(quotation.totalAmount, quotation.currency), 188, y + 12, { align: "right" });
  y += 30;

  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(10);
  pdf.text(`Estimated delivery: ${quotation.deliveryTime}`, left, y);
  pdf.text(`Payment terms: ${quotation.terms || "70% deposit, 30% before delivery."}`, left, y + 8);
  if (quotation.notes) {
    pdf.setFont("helvetica", "bold");
    pdf.text("Notes", left, y + 20);
    pdf.setFont("helvetica", "normal");
    pdf.text(pdf.splitTextToSize(quotation.notes, width), left, y + 27);
  }

  pdf.setDrawColor(...gold);
  pdf.setLineWidth(0.8);
  pdf.line(left, 270, 192, 270);
  pdf.setFontSize(8);
  pdf.setTextColor(71, 85, 105);
  pdf.text("Issued by Afrilink Capital | afrilinkcapital.com", 105, 278, { align: "center" });
  pdf.text("Supplier information and internal margins are confidential.", 105, 283, { align: "center" });

  pdf.save(`${quotation.quotationNumber}.pdf`);
}
