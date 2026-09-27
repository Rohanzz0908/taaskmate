import ExcelJS from 'exceljs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { MasterTransaction, QuotationItem } from '../types';
import { DEFAULT_BANK_DETAILS, db } from '../services/db';

// Helper to format date as "27-Sep-26"
export function formatInvoiceDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = String(d.getFullYear()).slice(-2);
  
  return `${day}-${month}-${year}`;
}

// Format numbers with commas and two decimals (e.g. 11,970.00)
export function formatCurrencyNumber(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) return '0.00';
  return Number(num).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Convert numbers to Indian Currency words: e.g. "Five Thousand Four Hundred And Seventy Seven Rupees"
export function numberToIndianWords(num: number): string {
  if (!num || isNaN(num)) return 'Zero Rupees';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n: number): string {
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
  }

  function convertThreeDigits(n: number): string {
    let str = '';
    if (Math.floor(n / 100) > 0) {
      str += ones[Math.floor(n / 100)] + ' Hundred ';
    }
    const remainder = n % 100;
    if (remainder > 0) {
      str += convertTwoDigits(remainder);
    }
    return str.trim();
  }

  let integerPart = Math.floor(Math.round(num));
  let result = '';

  const crore = Math.floor(integerPart / 10000000);
  integerPart %= 10000000;

  const lakh = Math.floor(integerPart / 100000);
  integerPart %= 100000;

  const thousand = Math.floor(integerPart / 1000);
  integerPart %= 1000;

  if (crore > 0) result += convertTwoDigits(crore) + ' Crore ';
  if (lakh > 0) result += convertTwoDigits(lakh) + ' Lakh ';
  if (thousand > 0) result += convertTwoDigits(thousand) + ' Thousand ';
  if (integerPart > 0) result += convertThreeDigits(integerPart);

  return (result.trim() + ' Rupees');
}

/**
 * Downloads the Commercial Invoice HTML container as a crisp, single A4 PDF
 */
export async function downloadInvoicePDF(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Invoice element with ID "${elementId}" not found`);
  }

  const canvas = await html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 1000
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = 210; // A4 width in mm
  const pdfHeight = 297; // A4 height in mm
  
  const imgWidth = pdfWidth - 10;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const xOffset = 5;
  const yOffset = 5;

  pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, Math.min(imgHeight, pdfHeight - 10));
  
  const cleanId = (filename || 'Commercial_Invoice').replace(/[^a-zA-Z0-9_-]/g, '_');
  pdf.save(`${cleanId}_Commercial_Invoice.pdf`);
}

/**
 * Downloads the Commercial Invoice as an exact XLSX spreadsheet matching the reference template.
 * Configured with style: 'pageBreakPreview' so Excel opens in Page Break Preview mode
 * with the blue page border and outside area greyed out.
 */
export async function downloadInvoiceXLSX(transaction: MasterTransaction): Promise<void> {
  const inv = transaction.invoice;
  const client = transaction.clientSnapshot;
  const quote = transaction.quotation;
  const sr = transaction.serviceReport;

  const invoiceId = inv?.invoiceId || transaction.transactionId || 'TMI2600001';
  const invoiceDate = formatInvoiceDate(inv?.invoiceDate || quote?.quotationDate || new Date().toISOString());
  const quoteId = quote?.quotationId || transaction.transactionId || '';
  const clientMaster = client.clientId ? db.getClientById(client.clientId) : undefined;
  const serviceLoc = client.serviceLocation?.trim() || clientMaster?.serviceLocation?.trim() || sr?.location || (client.address ? client.address.split(',')[0].trim() : 'Gachibowli Hyderabad');

  // Items
  const items: QuotationItem[] = (quote?.items && quote.items.length > 0)
    ? quote.items
    : (inv?.items && inv.items.length > 0)
      ? inv.items
      : [
          {
            itemId: 'item-1',
            categoryId: 'CAT-0001',
            materialName: 'Facility Service',
            description: 'Facility Service',
            quantity: 1,
            uom: 'Nos',
            rate: inv?.subtotal || 0,
            discount: 0,
            taxPercent: 18,
            taxAmount: inv?.totalTax || 0,
            amount: inv?.grandTotal || 0,
          }
        ];

  // Financial totals
  let rawSubtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;

  items.forEach(it => {
    const q = Number(it.quantity) || 0;
    const r = Number(it.rate ?? it.clientRate) || 0;
    const d = Number(it.discount) || 0;
    const t = Number(it.taxAmount) || 0;
    rawSubtotal += (q * r);
    totalDiscount += d;
    totalTax += t;
  });

  const gstMode = transaction.quotation?.gstMode || inv?.gstMode || 'CGST_SGST';
  const subtotalBeforeTax = Math.max(0, rawSubtotal - totalDiscount);

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;
  let totalGstAmount = 0;

  if (gstMode === 'CGST_SGST') {
    cgstAmount = inv?.cgst !== undefined && inv.cgst > 0
      ? inv.cgst
      : Number((subtotalBeforeTax * 0.09).toFixed(2));
    sgstAmount = inv?.sgst !== undefined && inv.sgst > 0
      ? inv.sgst
      : Number((subtotalBeforeTax * 0.09).toFixed(2));
    totalGstAmount = Number((cgstAmount + sgstAmount).toFixed(2));
  } else {
    igstAmount = inv?.igst !== undefined && inv.igst > 0
      ? inv.igst
      : Number((subtotalBeforeTax * 0.18).toFixed(2));
    totalGstAmount = igstAmount;
  }

  const calculatedGrandTotal = subtotalBeforeTax + totalGstAmount;
  const roundedGrandTotal = Math.round(calculatedGrandTotal);
  const roundOffDiff = roundedGrandTotal - calculatedGrandTotal;
  const roundOffDisplay = Math.abs(roundOffDiff) < 0.001 ? '0.00' : (roundOffDiff > 0 ? `+${roundOffDiff.toFixed(2)}` : `(${Math.abs(roundOffDiff).toFixed(2)})`);
  const finalTotal = roundedGrandTotal;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Taaskmate Enterprise';
  workbook.created = new Date();

  // Create worksheet with A4 Portrait setup, fitToPage 1x1, and Page Break Preview mode
  const ws = workbook.addWorksheet('Sheet1', {
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 1,
      horizontalCentered: true,
      verticalCentered: false,
      margins: {
        left: 0.25,
        right: 0.25,
        top: 0.25,
        bottom: 0.25,
        header: 0,
        footer: 0
      }
    },
    views: [
      {
        state: 'normal',
        style: 'pageBreakPreview',
        tabSelected: true,
        showGridLines: true
      } as any
    ]
  });

  // 6 Columns: S.No (A), Description (B), Qty (C), Units (D), Rate (E), Base Amount (F)
  ws.columns = [
    { key: 'sno', width: 7 },
    { key: 'desc', width: 44 },
    { key: 'qty', width: 10 },
    { key: 'units', width: 12 },
    { key: 'rate', width: 14 },
    { key: 'amount', width: 16 },
  ];

  // Helper styles
  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } },
  };

  const maroonFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF801426' } // Maroon branding
  };

  const goldFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF7E1A0' } // Light gold highlight
  };

  const whiteBoldFont: Partial<ExcelJS.Font> = {
    name: 'Calibri',
    size: 10,
    bold: true,
    color: { argb: 'FFFFFFFF' }
  };

  // ==========================================
  // 1. HEADER SECTION (Logo, Address, GSTIN)
  // ==========================================
  let logoEmbedded = false;
  try {
    let logoResp = await fetch('/taaskmate-logo.png');
    let ext: 'png' | 'jpeg' = 'png';
    if (!logoResp.ok) {
      logoResp = await fetch('/taaskmate-logo.jpg');
      ext = 'jpeg';
    }
    if (logoResp.ok) {
      const logoBuffer = await logoResp.arrayBuffer();
      const imageId = workbook.addImage({
        buffer: logoBuffer,
        extension: ext
      });
      ws.addImage(imageId, {
        tl: { col: 1.65, row: 0.15 },
        ext: { width: 185, height: 44 }
      });
      logoEmbedded = true;
    }
  } catch (e) {
    console.warn('Could not embed logo image in Excel', e);
  }

  // Row 1: Company Logo / Title
  const r1 = ws.addRow(['', '', '', '', '', '']);
  ws.mergeCells('A1:F1');
  const cTitle = ws.getCell('A1');
  if (!logoEmbedded) {
    cTitle.value = 'TAASKMATE';
    cTitle.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FF801426' } };
    cTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  } else {
    cTitle.value = '';
  }
  r1.height = 46;

  // Row 2: Address (Stored in A2 before merging A2:F2)
  const r2 = ws.addRow(['12-1-7/91, Sai Raghavendra Colony, Muttuguda, Bandlaguda, Nagole, Hyderabad, 500068', '', '', '', '', '']);
  ws.mergeCells('A2:F2');
  const cAddr = ws.getCell('A2');
  cAddr.font = { name: 'Calibri', size: 9, color: { argb: 'FF333333' } };
  cAddr.alignment = { horizontal: 'center', vertical: 'middle' };
  r2.height = 16;

  // Row 3: GSTIN (Stored in A3 before merging A3:F3)
  const r3 = ws.addRow(['GSTIN: ', '', '', '', '', '']);
  ws.mergeCells('A3:F3');
  const cGst = ws.getCell('A3');
  cGst.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF111111' } };
  cGst.alignment = { horizontal: 'center', vertical: 'middle' };
  r3.height = 16;

  // Row 4: TWO-COLUMN BANNER: Invoice To (A-D) & Invoice Details (E-F)
  const r4 = ws.addRow(['Invoice To', '', '', '', 'Invoice Details', '']);
  ws.mergeCells('A4:D4');
  ws.mergeCells('E4:F4');
  const cBannerLeft = ws.getCell('A4');
  cBannerLeft.fill = maroonFill;
  cBannerLeft.font = whiteBoldFont;
  cBannerLeft.alignment = { horizontal: 'center', vertical: 'middle' };
  cBannerLeft.border = thinBorder;
  ws.getCell('B4').border = thinBorder;
  ws.getCell('C4').border = thinBorder;
  ws.getCell('D4').border = thinBorder;

  const cBannerRight = ws.getCell('E4');
  cBannerRight.fill = maroonFill;
  cBannerRight.font = whiteBoldFont;
  cBannerRight.alignment = { horizontal: 'center', vertical: 'middle' };
  cBannerRight.border = thinBorder;
  ws.getCell('F4').border = thinBorder;
  r4.height = 22;

  // Metadata Table Rows (Rows 5 to 10)
  // Left: Name, Address, E-Mail, GSTIN, Service Location, HSN / SAC Code
  // Right: Invoice Number, Invoice Date, PO / WO Number, PO / WO Date, Quotation Number, (empty)
  const metaRows = [
    { 
      k1: 'Name', 
      v1: client.clientName || '', 
      k2: 'Invoice Number', 
      v2: invoiceId 
    },
    { 
      k1: 'Address', 
      v1: client.address || '', 
      k2: 'Invoice Date', 
      v2: invoiceDate 
    },
    { 
      k1: 'E-Mail', 
      v1: client.email || '—', 
      k2: 'PO / WO Number', 
      v2: inv?.poNumber?.trim() || 'N/A' 
    },
    { 
      k1: 'GSTIN', 
      v1: client.gstin || 'Na', 
      k2: 'PO / WO Date', 
      v2: inv?.poDate ? formatInvoiceDate(inv.poDate) : 'N/A' 
    },
    { 
      k1: 'Service Location', 
      v1: serviceLoc, 
      k2: 'Quotation Number', 
      v2: quoteId 
    },
    { 
      k1: 'HSN / SAC Code', 
      v1: inv?.hsnCode?.trim() || 'N/A', 
      k2: '', 
      v2: '' 
    },
  ];

  metaRows.forEach(m => {
    const row = ws.addRow([m.k1, m.v1, '', '', m.k2, m.v2]);
    const rowNum = row.number;
    ws.mergeCells(`B${rowNum}:D${rowNum}`);

    row.height = m.k1 === 'Address' || m.k1 === 'Service Location' ? 34 : 18;

    // Col A: Label 1
    const c1 = row.getCell(1);
    c1.font = { name: 'Calibri', size: 9, bold: true };
    c1.alignment = { vertical: 'top', horizontal: 'left' };
    c1.border = thinBorder;

    // Cols B-D: Value 1
    const c2 = row.getCell(2);
    c2.font = { name: 'Calibri', size: 9, bold: m.k1 === 'Name' };
    c2.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
    c2.border = thinBorder;
    row.getCell(3).border = thinBorder;
    row.getCell(4).border = thinBorder;

    // Col E: Label 2
    const c5 = row.getCell(5);
    c5.font = { name: 'Calibri', size: 9, bold: true };
    c5.alignment = { vertical: 'middle', horizontal: 'left' };
    c5.border = thinBorder;

    // Col F: Value 2
    const c6 = row.getCell(6);
    c6.font = { name: 'Calibri', size: 9, bold: m.k2 === 'Invoice Number' || m.k2 === 'Quotation Number' };
    c6.alignment = { vertical: 'middle', horizontal: 'center' };
    c6.border = thinBorder;
  });

  // Table Header Row: Maroon #801426
  const rHeader = ws.addRow(['S.No', 'Description', 'Qty', 'Units', 'Rate', 'Base Amount']);
  rHeader.height = 22;
  [1, 2, 3, 4, 5, 6].forEach(colIdx => {
    const c = rHeader.getCell(colIdx);
    c.fill = maroonFill;
    c.font = whiteBoldFont;
    c.alignment = { 
      horizontal: colIdx === 2 ? 'left' : (colIdx >= 5 ? 'right' : 'center'), 
      vertical: 'middle' 
    };
    c.border = thinBorder;
  });

  // Items
  items.forEach((it, idx) => {
    const title = it.description || it.materialName || 'Service description';
    const q = Number(it.quantity) || 1;
    const r = Number(it.rate ?? it.clientRate) || 0;
    const baseAmt = (q * r) - (Number(it.discount) || 0);

    const row = ws.addRow([
      idx + 1,
      title,
      q,
      it.uom === 'Nos' ? "No's" : (it.uom || 'Nos'),
      r,
      baseAmt
    ]);
    row.height = 24;

    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(1).font = { name: 'Calibri', size: 9, bold: true };
    row.getCell(1).border = thinBorder;

    row.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
    row.getCell(2).font = { name: 'Calibri', size: 9 };
    row.getCell(2).border = thinBorder;

    row.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(3).font = { name: 'Calibri', size: 9, bold: true };
    row.getCell(3).border = thinBorder;

    row.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(4).font = { name: 'Calibri', size: 9 };
    row.getCell(4).border = thinBorder;

    row.getCell(5).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(5).font = { name: 'Calibri', size: 9 };
    row.getCell(5).numFmt = '#,##0.00';
    row.getCell(5).border = thinBorder;

    row.getCell(6).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(6).font = { name: 'Calibri', size: 9, bold: true };
    row.getCell(6).numFmt = '#,##0.00';
    row.getCell(6).border = thinBorder;
  });

  // Add 4 spacer rows to maintain A4 proportions
  for (let i = 0; i < 4; i++) {
    const rSpacer = ws.addRow(['', '', '', '', '', '']);
    rSpacer.height = 18;
    [1, 2, 3, 4, 5, 6].forEach(colIdx => {
      rSpacer.getCell(colIdx).border = thinBorder;
    });
  }

  // Financial Totals block (right aligned across cols A-E, amount in F)
  const addTotalRow = (label: string, value: number | string, isBold: boolean = true, isGold: boolean = false) => {
    const row = ws.addRow([label, '', '', '', '', value]);
    const rNum = row.number;
    ws.mergeCells(`A${rNum}:E${rNum}`);
    row.height = 18;

    const cLbl = ws.getCell(`A${rNum}`);
    cLbl.font = { name: 'Calibri', size: 9, bold: isBold };
    cLbl.alignment = { horizontal: 'right', vertical: 'middle' };
    cLbl.border = thinBorder;
    [2, 3, 4, 5].forEach(ci => row.getCell(ci).border = thinBorder);

    const cVal = row.getCell(6);
    cVal.font = { name: 'Calibri', size: 9, bold: isBold };
    cVal.alignment = { horizontal: 'right', vertical: 'middle' };
    if (typeof value === 'number') {
      cVal.numFmt = '#,##0.00';
    }
    cVal.border = thinBorder;

    if (isGold) {
      cLbl.fill = goldFill;
      cVal.fill = goldFill;
      cLbl.font = { name: 'Calibri', size: 10, bold: true };
      cVal.font = { name: 'Calibri', size: 10, bold: true };
    }
  };

  addTotalRow('Total Amount Before Tax', subtotalBeforeTax);
  if (gstMode === 'CGST_SGST') {
    addTotalRow('Add: CGST @ 9%', cgstAmount);
    addTotalRow('Add: SGST @ 9%', sgstAmount);
  } else {
    addTotalRow('Add: IGST @ 18%', igstAmount);
  }
  addTotalRow('Round off', roundOffDisplay);
  addTotalRow('Total Amount', finalTotal, true, true);

  // IN WORDS ROW
  const rWords = ws.addRow([`IN WORDS : ${numberToIndianWords(finalTotal)}`, '', '', '', '', '']);
  const wNum = rWords.number;
  ws.mergeCells(`A${wNum}:F${wNum}`);
  const cW = ws.getCell(`A${wNum}`);
  cW.font = { name: 'Calibri', size: 9, bold: true };
  cW.alignment = { horizontal: 'left', vertical: 'middle' };
  cW.border = thinBorder;
  [2, 3, 4, 5, 6].forEach(ci => rWords.getCell(ci).border = thinBorder);
  rWords.height = 20;

  // ==========================================
  // TERMS & CONDITIONS ROW (Full width A to F)
  // ==========================================
  const termsText = inv?.notes?.trim() || '1. Payment should be clear immediately after invoice submission';
  const rTerms = ws.addRow([`Terms & Condition:\n${termsText}`, '', '', '', '', '']);
  const tNum = rTerms.number;
  ws.mergeCells(`A${tNum}:F${tNum}`);
  const cTerms = ws.getCell(`A${tNum}`);
  cTerms.font = { name: 'Calibri', size: 9 };
  cTerms.alignment = { horizontal: 'left', vertical: 'top', wrapText: true };
  cTerms.border = thinBorder;
  [2, 3, 4, 5, 6].forEach(ci => rTerms.getCell(ci).border = thinBorder);
  rTerms.height = 36;

  // ==========================================
  // DUAL COLUMNS: Taaskmate Signature (A-C) | Bank Details (D-F)
  // ==========================================
  const bank = {
    accountNumber: inv?.bankDetails?.accountNumber || DEFAULT_BANK_DETAILS.accountNumber,
    ifsc: inv?.bankDetails?.ifsc || DEFAULT_BANK_DETAILS.ifsc,
    bankName: inv?.bankDetails?.bankName || DEFAULT_BANK_DETAILS.bankName,
    branch: inv?.bankDetails?.branch || DEFAULT_BANK_DETAILS.branch || 'Nagole, HYD',
  };

  const leftSignText = `Taaskmate\n\n\n\nStamp & Signature`;
  const rightBankText = `Taaskmate Bank Account Details\nBank Account Number: ${bank.accountNumber}\nBank IFSC Code: ${bank.ifsc}\nBank Name: ${bank.bankName}\nBranch Address: ${bank.branch}`;

  const rDual = ws.addRow([leftSignText, '', '', rightBankText, '', '']);
  const dNum = rDual.number;
  ws.mergeCells(`A${dNum}:C${dNum}`);
  ws.mergeCells(`D${dNum}:F${dNum}`);
  rDual.height = 80;

  const cLeft = ws.getCell(`A${dNum}`);
  cLeft.font = { name: 'Calibri', size: 9, bold: true };
  cLeft.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  cLeft.border = thinBorder;
  [2, 3].forEach(ci => rDual.getCell(ci).border = thinBorder);

  const cRight = ws.getCell(`D${dNum}`);
  cRight.font = { name: 'Calibri', size: 8.5 };
  cRight.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  cRight.border = thinBorder;
  [5, 6].forEach(ci => rDual.getCell(ci).border = thinBorder);

  // Write and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  const cleanId = (invoiceId || 'UTI2604007').replace(/[^a-zA-Z0-9_-]/g, '_');
  anchor.download = `${cleanId}_Commercial_Invoice.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}
