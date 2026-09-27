import ExcelJS from 'exceljs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Quotation } from '../types';
import { db } from '../services/db';

// Helper to format date as DD-MM-YYYY (e.g. "27-09-2026")
export function formatQuotationDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    const day = parts[2].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[0];
    return `${day}-${month}-${year}`;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
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

// Convert numbers to Indian Currency words: e.g. "Thirty Three Thousand Ninety Nine Rupees"
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
 * Downloads the quotation as an exact, fully-styled XLSX spreadsheet matching the reference template
 * Properly sized, scaled, and formatted to fill a full A4 portrait page with no wasted margins.
 */
export async function downloadQuotationXLSX(quotation: Quotation): Promise<void> {
  const quoteId = quotation.quotationId || quotation.transactionId;
  const client = quotation.clientSnapshot;
  const quoteDate = formatQuotationDate(quotation.quotationDate);
  const validityDate = formatQuotationDate(quotation.validUntil);
  const clientMaster = client.clientId ? db.getClientById(client.clientId) : undefined;
  const location = client.serviceLocation?.trim() || clientMaster?.serviceLocation?.trim() || (client.address ? client.address.split(',')[0].trim() : 'AS Rao Nagar');
  const sacCode = quotation.sacCode?.trim() || 'N/A';

  // Tax calculations
  const gstMode = quotation.gstMode || 'CGST_SGST';
  const amountBeforeTax = quotation.subtotal - (quotation.totalDiscount || 0);

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;
  let totalGstAmount = 0;

  if (gstMode === 'CGST_SGST') {
    cgstAmount = quotation.cgst !== undefined && quotation.cgst > 0
      ? quotation.cgst
      : Number((amountBeforeTax * 0.09).toFixed(2));
    sgstAmount = quotation.sgst !== undefined && quotation.sgst > 0
      ? quotation.sgst
      : Number((amountBeforeTax * 0.09).toFixed(2));
    totalGstAmount = quotation.totalTax !== undefined && quotation.totalTax > 0 
      ? quotation.totalTax 
      : Number((cgstAmount + sgstAmount).toFixed(2));
  } else {
    igstAmount = quotation.igst !== undefined && quotation.igst > 0
      ? quotation.igst
      : Number((amountBeforeTax * 0.18).toFixed(2));
    totalGstAmount = quotation.totalTax !== undefined && quotation.totalTax > 0 
      ? quotation.totalTax 
      : igstAmount;
  }

  const calculatedGrandTotal = amountBeforeTax + totalGstAmount;
  const roundedGrandTotal = Math.round(calculatedGrandTotal);
  const roundOffDiff = roundedGrandTotal - calculatedGrandTotal;
  const roundOffDisplay = Math.abs(roundOffDiff) < 0.001 ? '-' : (roundOffDiff > 0 ? `+${roundOffDiff.toFixed(2)}` : roundOffDiff.toFixed(2));
  const finalTotal = roundedGrandTotal;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Taaskmate Enterprise';
  workbook.created = new Date();

  // Create worksheet with A4 Portrait setup, fitToPage 1x1, and Page Break Preview mode
  const worksheet = workbook.addWorksheet('Sheet1', {
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

  // 13-column grid (A to M) matching reference layout:
  // Col A: S No (narrow 5.5)
  // Cols B-I: Services Details (8 columns of 6.5 each = 52.0 wide)
  // Col J: Qty (8.5)
  // Col K: Units (9.5)
  // Col L: Rate (13.5)
  // Col M: Base Amount (15.5)
  // Total width: ~104.5 (fills full A4 portrait page width)
  worksheet.columns = [
    { key: 'colA', width: 5.5 },
    { key: 'colB', width: 6.5 },
    { key: 'colC', width: 6.5 },
    { key: 'colD', width: 6.5 },
    { key: 'colE', width: 6.5 },
    { key: 'colF', width: 6.5 },
    { key: 'colG', width: 6.5 },
    { key: 'colH', width: 6.5 },
    { key: 'colI', width: 6.5 },
    { key: 'colJ', width: 8.5 },
    { key: 'colK', width: 9.5 },
    { key: 'colL', width: 13.5 },
    { key: 'colM', width: 15.5 }
  ];

  // Palette & Typography
  const maroonFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF850E24' }
  };

  const whiteBoldFont: Partial<ExcelJS.Font> = {
    name: 'Arial',
    size: 10,
    bold: true,
    color: { argb: 'FFFFFFFF' }
  };

  const whiteTitleFont: Partial<ExcelJS.Font> = {
    name: 'Arial',
    size: 11,
    bold: true,
    color: { argb: 'FFFFFFFF' }
  };

  const blackRegularFont: Partial<ExcelJS.Font> = {
    name: 'Arial',
    size: 9,
    color: { argb: 'FF000000' }
  };

  const blackBoldFont: Partial<ExcelJS.Font> = {
    name: 'Arial',
    size: 9,
    bold: true,
    color: { argb: 'FF000000' }
  };

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // Helper to apply borders & style to all cells in a range
  const formatCellRange = (
    startCol: number,
    startRow: number,
    endCol: number,
    endRow: number,
    style: {
      font?: Partial<ExcelJS.Font>;
      fill?: ExcelJS.Fill;
      alignment?: Partial<ExcelJS.Alignment>;
      border?: Partial<ExcelJS.Borders>;
      numFmt?: string;
    }
  ) => {
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const cell = worksheet.getCell(r, c);
        if (style.font) cell.font = style.font;
        if (style.fill) cell.fill = style.fill;
        if (style.alignment) cell.alignment = style.alignment;
        if (style.border) cell.border = style.border;
        if (style.numFmt) cell.numFmt = style.numFmt;
      }
    }
  };

  // ==========================================
  // 1. HEADER SECTION (Centered Logo & Address)
  // ==========================================
  worksheet.mergeCells('A1:M1');
  let logoEmbedded = false;
  try {
    const logoResponse = await fetch('/taaskmate-logo.png');
    if (logoResponse.ok) {
      const logoBuffer = await logoResponse.arrayBuffer();
      const imageId = workbook.addImage({
        buffer: logoBuffer,
        extension: 'png'
      });
      worksheet.addImage(imageId, {
        tl: { col: 4.5, row: 0.1 },
        ext: { width: 180, height: 44 }
      });
      logoEmbedded = true;
    }
  } catch (e) {
    console.warn('Could not embed logo image in Excel', e);
  }

  const r1 = worksheet.getCell('A1');
  if (!logoEmbedded) {
    r1.value = 'TAASKMATE';
    r1.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF850E24' } };
  } else {
    r1.value = '';
  }
  r1.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).height = 48;

  // Row 2: Address
  worksheet.mergeCells('A2:M2');
  const r2 = worksheet.getCell('A2');
  r2.value = '12-1-7/91, Sai Raghavendra Colony, Muttuguda, Bandlaguda, Nagole, Hyderabad, 500068';
  r2.font = blackRegularFont;
  r2.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(2).height = 18;

  // Row 3: Email
  worksheet.mergeCells('A3:M3');
  const r3 = worksheet.getCell('A3');
  r3.value = 'sudhir@taaskmate.in';
  r3.font = blackRegularFont;
  r3.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(3).height = 17;

  // Row 4: GSTIN
  worksheet.mergeCells('A4:M4');
  const r4 = worksheet.getCell('A4');
  r4.value = 'GSTIN: ';
  r4.font = blackBoldFont;
  r4.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(4).height = 17;

  // Row 5: Visual Breathing Space
  worksheet.getRow(5).height = 8;

  // ==========================================
  // 2. QUOTATION TITLE BANNER
  // ==========================================
  worksheet.mergeCells('A6:M6');
  formatCellRange(1, 6, 13, 6, {
    font: whiteTitleFont,
    fill: maroonFill,
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: thinBorder
  });
  worksheet.getCell('A6').value = 'QUOTATION';
  worksheet.getRow(6).height = 24;

  // ==========================================
  // 3. QUOTATION META GRID
  // ==========================================
  // Row 7: Quotation Number (A-D), Value (E-H), Quotation Validity (I-K), Validity Date (L-M)
  worksheet.mergeCells('A7:D7');
  worksheet.mergeCells('E7:H7');
  worksheet.mergeCells('I7:K7');
  worksheet.mergeCells('L7:M7');
  formatCellRange(1, 7, 13, 7, {
    font: blackBoldFont,
    border: thinBorder,
    alignment: { vertical: 'middle' }
  });
  worksheet.getCell('A7').value = 'Quotation Number:';
  worksheet.getCell('A7').alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  worksheet.getCell('E7').value = quoteId;
  worksheet.getCell('E7').alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getCell('I7').value = 'Quotation Validity';
  worksheet.getCell('I7').alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getCell('L7').value = validityDate;
  worksheet.getCell('L7').alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(7).height = 22;

  // Row 8: Date: (A-D), Date Value (E-H), Location (I-K), Location Value (L-M)
  worksheet.mergeCells('A8:D8');
  worksheet.mergeCells('E8:H8');
  worksheet.mergeCells('I8:K8');
  worksheet.mergeCells('L8:M8');
  formatCellRange(1, 8, 13, 8, {
    font: blackBoldFont,
    border: thinBorder,
    alignment: { vertical: 'middle' }
  });
  worksheet.getCell('A8').value = 'Date:';
  worksheet.getCell('A8').alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getCell('E8').value = quoteDate;
  worksheet.getCell('E8').alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getCell('I8').value = 'Location';
  worksheet.getCell('I8').alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getCell('L8').value = location;
  worksheet.getCell('L8').alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(8).height = 22;

  // ==========================================
  // 4. QUOTATION TO SECTION
  // ==========================================
  worksheet.mergeCells('A9:M9');
  formatCellRange(1, 9, 13, 9, {
    font: whiteBoldFont,
    fill: maroonFill,
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: thinBorder
  });
  worksheet.getCell('A9').value = 'Quotation To';
  worksheet.getRow(9).height = 22;

  // Rows 10-15: Client Details with generous merged space (A-D for label, E-M for value)
  const clientDetails = [
    { label: 'NAME', value: client.clientName, boldVal: true },
    { label: 'Address', value: client.address, boldVal: false },
    { label: 'E-Mail', value: client.email || '—', boldVal: false },
    { label: 'GSTIN', value: client.gstin || 'NA', boldVal: false },
    { label: 'Service Location', value: location, boldVal: false },
    { label: 'SAC Code', value: sacCode, boldVal: false }
  ];

  clientDetails.forEach((cd, idx) => {
    const rowNum = 10 + idx;
    worksheet.mergeCells(`A${rowNum}:D${rowNum}`);
    worksheet.mergeCells(`E${rowNum}:M${rowNum}`);
    formatCellRange(1, rowNum, 13, rowNum, {
      border: thinBorder,
      alignment: { vertical: 'middle', wrapText: true }
    });
    
    const labelCell = worksheet.getCell(`A${rowNum}`);
    labelCell.value = cd.label;
    labelCell.font = blackBoldFont;
    labelCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };

    const valCell = worksheet.getCell(`E${rowNum}`);
    valCell.value = cd.value;
    valCell.font = cd.boldVal ? blackBoldFont : blackRegularFont;
    valCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1, wrapText: true };

    worksheet.getRow(rowNum).height = 21;
  });

  // ==========================================
  // 5. SERVICES DETAILS TABLE HEADER
  // ==========================================
  worksheet.mergeCells('B16:I16');
  formatCellRange(1, 16, 13, 16, {
    font: whiteBoldFont,
    fill: maroonFill,
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: thinBorder
  });
  worksheet.getCell('A16').value = 'S No';
  worksheet.getCell('B16').value = 'Services Details';
  worksheet.getCell('J16').value = 'Qty';
  worksheet.getCell('K16').value = 'Units';
  worksheet.getCell('L16').value = 'Rate';
  worksheet.getCell('M16').value = 'Base Amount';
  worksheet.getRow(16).height = 24;

  // ==========================================
  // 6. LINE ITEMS WITH PROPER ROW HEIGHTS
  // ==========================================
  let currentRow = 17;
  quotation.items.forEach((item, index) => {
    const serviceDetail = item.description || item.materialName || 'Service description';

    const qty = Number(item.quantity) || 1;
    const rate = Number(item.rate) || 0;
    const baseAmount = Number(((qty * rate) - (item.discount || 0)).toFixed(2));

    worksheet.mergeCells(`B${currentRow}:I${currentRow}`);
    formatCellRange(1, currentRow, 13, currentRow, {
      border: thinBorder,
      alignment: { vertical: 'middle' }
    });

    const cA = worksheet.getCell(`A${currentRow}`);
    cA.value = index + 1;
    cA.font = blackBoldFont;
    cA.alignment = { horizontal: 'center', vertical: 'middle' };

    const cB = worksheet.getCell(`B${currentRow}`);
    cB.value = serviceDetail;
    cB.font = blackRegularFont;
    cB.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true, indent: 1 };

    const cJ = worksheet.getCell(`J${currentRow}`);
    cJ.value = qty;
    cJ.font = blackBoldFont;
    cJ.alignment = { horizontal: 'center', vertical: 'middle' };

    const cK = worksheet.getCell(`K${currentRow}`);
    cK.value = item.uom === 'Nos' ? "No's" : (item.uom || 'LS');
    cK.font = blackRegularFont;
    cK.alignment = { horizontal: 'center', vertical: 'middle' };

    const cL = worksheet.getCell(`L${currentRow}`);
    cL.value = rate;
    cL.font = blackRegularFont;
    cL.alignment = { horizontal: 'right', vertical: 'middle' };
    cL.numFmt = '#,##0.00';

    const cM = worksheet.getCell(`M${currentRow}`);
    cM.value = baseAmount;
    cM.font = blackBoldFont;
    cM.alignment = { horizontal: 'right', vertical: 'middle' };
    cM.numFmt = '#,##0.00';

    // Generous row height based on text and lines so nothing is cut off
    const lineCount = (serviceDetail.match(/\n/g) || []).length + 1;
    const estLinesFromLength = Math.ceil(serviceDetail.length / 52);
    const effectiveLines = Math.max(lineCount, estLinesFromLength);
    worksheet.getRow(currentRow).height = Math.max(32, effectiveLines * 18 + 8);

    currentRow++;
  });

  // =========================================================================
  // 7. DYNAMIC SPACER ROWS TO FULLY FILL THE A4 PAGE (NO UNWANTED BLANK BOTTOM)
  // =========================================================================
  const targetPageHeight = 760;
  const headerAndMetaHeight = 48 + 18 + 17 + 17 + 8 + 24 + 22 + 22 + 22 + (6 * 21) + 24; // 348pt
  let itemsHeight = 0;
  for (let r = 17; r < currentRow; r++) {
    itemsHeight += worksheet.getRow(r).height || 30;
  }
  const totalsAndFooterHeight = (5 * 20) + 24 + (26 + 4 * 20); // 230pt

  const remainingSpacerHeight = Math.max(70, targetPageHeight - (headerAndMetaHeight + itemsHeight + totalsAndFooterHeight));
  const spacerCount = 5;
  const eachSpacerHeight = Math.max(20, Math.round(remainingSpacerHeight / spacerCount));

  for (let s = 0; s < spacerCount; s++) {
    worksheet.mergeCells(`B${currentRow}:I${currentRow}`);
    const isLastSpacer = s === spacerCount - 1;
    
    // Borders maintaining table columns: A, B-I, J, K, L, M
    formatCellRange(1, currentRow, 13, currentRow, {
      border: {
        left: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: isLastSpacer ? { style: 'thin', color: { argb: 'FF000000' } } : undefined
      }
    });

    worksheet.getRow(currentRow).height = eachSpacerHeight;
    currentRow++;
  }

  // ==========================================
  // 8. TOTALS / GST SECTION (Right aligned)
  // ==========================================
  // 1. Amount Before Tax
  worksheet.getCell(`A${currentRow}`).border = { left: { style: 'thin', color: { argb: 'FF000000' } } };
  worksheet.mergeCells(`B${currentRow}:I${currentRow}`);
  worksheet.getCell(`B${currentRow}`).border = {
    left: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };
  worksheet.mergeCells(`J${currentRow}:L${currentRow}`);
  formatCellRange(10, currentRow, 13, currentRow, { border: thinBorder });
  worksheet.getCell(`J${currentRow}`).value = 'Amount Before Tax';
  worksheet.getCell(`J${currentRow}`).font = blackBoldFont;
  worksheet.getCell(`J${currentRow}`).alignment = { horizontal: 'right', vertical: 'middle' };
  worksheet.getCell(`M${currentRow}`).value = amountBeforeTax;
  worksheet.getCell(`M${currentRow}`).font = blackBoldFont;
  worksheet.getCell(`M${currentRow}`).alignment = { horizontal: 'right', vertical: 'middle' };
  worksheet.getCell(`M${currentRow}`).numFmt = '#,##0.00';
  worksheet.getRow(currentRow).height = 20;
  currentRow++;

  // 2. Tax rows: CGST + SGST (Intrastate) or IGST (Interstate)
  if (gstMode === 'CGST_SGST') {
    // Add: CGST @ 9%
    worksheet.getCell(`A${currentRow}`).border = { left: { style: 'thin', color: { argb: 'FF000000' } } };
    worksheet.mergeCells(`B${currentRow}:I${currentRow}`);
    worksheet.getCell(`B${currentRow}`).border = {
      left: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
    worksheet.mergeCells(`J${currentRow}:L${currentRow}`);
    formatCellRange(10, currentRow, 13, currentRow, { border: thinBorder });
    worksheet.getCell(`J${currentRow}`).value = 'Add: CGST @ 9%';
    worksheet.getCell(`J${currentRow}`).font = blackRegularFont;
    worksheet.getCell(`J${currentRow}`).alignment = { horizontal: 'right', vertical: 'middle' };
    worksheet.getCell(`M${currentRow}`).value = cgstAmount;
    worksheet.getCell(`M${currentRow}`).font = blackRegularFont;
    worksheet.getCell(`M${currentRow}`).alignment = { horizontal: 'right', vertical: 'middle' };
    worksheet.getCell(`M${currentRow}`).numFmt = '#,##0.00';
    worksheet.getRow(currentRow).height = 20;
    currentRow++;

    // Add: SGST @ 9%
    worksheet.getCell(`A${currentRow}`).border = { left: { style: 'thin', color: { argb: 'FF000000' } } };
    worksheet.mergeCells(`B${currentRow}:I${currentRow}`);
    worksheet.getCell(`B${currentRow}`).border = {
      left: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
    worksheet.mergeCells(`J${currentRow}:L${currentRow}`);
    formatCellRange(10, currentRow, 13, currentRow, { border: thinBorder });
    worksheet.getCell(`J${currentRow}`).value = 'Add: SGST @ 9%';
    worksheet.getCell(`J${currentRow}`).font = blackRegularFont;
    worksheet.getCell(`J${currentRow}`).alignment = { horizontal: 'right', vertical: 'middle' };
    worksheet.getCell(`M${currentRow}`).value = sgstAmount;
    worksheet.getCell(`M${currentRow}`).font = blackRegularFont;
    worksheet.getCell(`M${currentRow}`).alignment = { horizontal: 'right', vertical: 'middle' };
    worksheet.getCell(`M${currentRow}`).numFmt = '#,##0.00';
    worksheet.getRow(currentRow).height = 20;
    currentRow++;
  } else {
    // Add: IGST @ 18%
    worksheet.getCell(`A${currentRow}`).border = { left: { style: 'thin', color: { argb: 'FF000000' } } };
    worksheet.mergeCells(`B${currentRow}:I${currentRow}`);
    worksheet.getCell(`B${currentRow}`).border = {
      left: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
    worksheet.mergeCells(`J${currentRow}:L${currentRow}`);
    formatCellRange(10, currentRow, 13, currentRow, { border: thinBorder });
    worksheet.getCell(`J${currentRow}`).value = 'Add: IGST @ 18%';
    worksheet.getCell(`J${currentRow}`).font = blackRegularFont;
    worksheet.getCell(`J${currentRow}`).alignment = { horizontal: 'right', vertical: 'middle' };
    worksheet.getCell(`M${currentRow}`).value = igstAmount;
    worksheet.getCell(`M${currentRow}`).font = blackRegularFont;
    worksheet.getCell(`M${currentRow}`).alignment = { horizontal: 'right', vertical: 'middle' };
    worksheet.getCell(`M${currentRow}`).numFmt = '#,##0.00';
    worksheet.getRow(currentRow).height = 20;
    currentRow++;
  }

  // 4. Round off
  worksheet.getCell(`A${currentRow}`).border = { left: { style: 'thin', color: { argb: 'FF000000' } } };
  worksheet.mergeCells(`B${currentRow}:I${currentRow}`);
  worksheet.getCell(`B${currentRow}`).border = {
    left: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };
  worksheet.mergeCells(`J${currentRow}:L${currentRow}`);
  formatCellRange(10, currentRow, 13, currentRow, { border: thinBorder });
  worksheet.getCell(`J${currentRow}`).value = 'Round off';
  worksheet.getCell(`J${currentRow}`).font = blackRegularFont;
  worksheet.getCell(`J${currentRow}`).alignment = { horizontal: 'right', vertical: 'middle' };
  worksheet.getCell(`M${currentRow}`).value = roundOffDisplay;
  worksheet.getCell(`M${currentRow}`).font = blackRegularFont;
  worksheet.getCell(`M${currentRow}`).alignment = { horizontal: 'right', vertical: 'middle' };
  worksheet.getRow(currentRow).height = 20;
  currentRow++;

  // 5. Total Amount (Maroon Row)
  worksheet.getCell(`A${currentRow}`).border = {
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } }
  };
  worksheet.mergeCells(`B${currentRow}:I${currentRow}`);
  worksheet.getCell(`B${currentRow}`).border = {
    left: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } }
  };
  worksheet.mergeCells(`J${currentRow}:L${currentRow}`);
  formatCellRange(10, currentRow, 13, currentRow, {
    font: whiteBoldFont,
    fill: maroonFill,
    border: thinBorder,
    alignment: { horizontal: 'right', vertical: 'middle' }
  });
  worksheet.getCell(`J${currentRow}`).value = 'Total Amount';
  worksheet.getCell(`M${currentRow}`).value = finalTotal;
  worksheet.getCell(`M${currentRow}`).numFmt = '#,##0.00';
  worksheet.getRow(currentRow).height = 24;
  currentRow++;

  // ==========================================
  // 9. IN WORDS ROW
  // ==========================================
  worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
  worksheet.mergeCells(`E${currentRow}:M${currentRow}`);
  formatCellRange(1, currentRow, 13, currentRow, {
    border: thinBorder,
    alignment: { vertical: 'middle', wrapText: true }
  });
  worksheet.getCell(`A${currentRow}`).value = 'In Words:';
  worksheet.getCell(`A${currentRow}`).font = blackBoldFont;
  worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  worksheet.getCell(`E${currentRow}`).value = numberToIndianWords(finalTotal);
  worksheet.getCell(`E${currentRow}`).font = blackBoldFont;
  worksheet.getCell(`E${currentRow}`).alignment = { horizontal: 'left', vertical: 'middle', indent: 1, wrapText: true };
  worksheet.getRow(currentRow).height = 24;
  currentRow++;

  // ==========================================
  // 10. FOOTER: TERMS & CONDITIONS
  // ==========================================
  const footerStartRow = currentRow;
  worksheet.mergeCells(`A${footerStartRow}:M${footerStartRow}`);
  formatCellRange(1, footerStartRow, 13, footerStartRow, {
    border: {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    },
    alignment: { vertical: 'middle' }
  });

  const termsHead = worksheet.getCell(`A${footerStartRow}`);
  termsHead.value = 'Terms & Conditions:';
  termsHead.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF850E24' } };
  termsHead.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  worksheet.getRow(footerStartRow).height = 24;
  currentRow++;

  // Footer Details Row: Payment Terms
  worksheet.mergeCells(`A${currentRow}:M${currentRow}`);
  formatCellRange(1, currentRow, 13, currentRow, {
    border: {
      left: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } },
      ...(quotation.notes ? {} : { bottom: { style: 'thin', color: { argb: 'FF000000' } } })
    },
    alignment: { vertical: 'middle', wrapText: true }
  });
  worksheet.getCell(`A${currentRow}`).value = quotation.paymentTerms || 'Payment Terms will be Net 7 days after Invoice date';
  worksheet.getCell(`A${currentRow}`).font = blackRegularFont;
  worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'left', vertical: 'middle', indent: 1, wrapText: true };
  worksheet.getRow(currentRow).height = 20;

  if (quotation.notes) {
    currentRow++;
    worksheet.mergeCells(`A${currentRow}:M${currentRow}`);
    formatCellRange(1, currentRow, 13, currentRow, {
      border: {
        left: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } }
      },
      alignment: { vertical: 'middle', wrapText: true }
    });
    worksheet.getCell(`A${currentRow}`).value = quotation.notes;
    worksheet.getCell(`A${currentRow}`).font = { name: 'Arial', size: 8, color: { argb: 'FF555555' } };
    worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'left', vertical: 'middle', indent: 1, wrapText: true };
    worksheet.getRow(currentRow).height = 20;
  }

  // Print area: ONLY strictly A1 to M[lastRow]
  const lastRow = currentRow;
  worksheet.pageSetup.printArea = `A1:M${lastRow}`;

  // Export buffer to file in browser
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  const cleanQuoteId = (quoteId || 'TM260001').replace(/[^a-zA-Z0-9_-]/g, '_');
  anchor.download = `${cleanQuoteId}_Corporate_Quotation.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

/**
 * Downloads the quotation container as a high-fidelity PDF
 */
export async function downloadQuotationPDF(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Quotation element with ID "${elementId}" not found`);
  }

  // High-res canvas scale for crisp output with fixed width & font
  const canvas = await html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 1200,
    onclone: (clonedDoc) => {
      const clonedEl = clonedDoc.getElementById(elementId);
      if (clonedEl) {
        clonedEl.style.width = '800px';
        clonedEl.style.maxWidth = '800px';
        clonedEl.style.minWidth = '800px';
        clonedEl.style.boxSizing = 'border-box';
        clonedEl.style.margin = '0 auto';
        clonedEl.style.padding = '24px';
        clonedEl.style.boxShadow = 'none';
        clonedEl.style.fontFamily = 'Arial, "Helvetica Neue", Helvetica, sans-serif';
      }
    }
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = 210; // A4 width in mm
  const pdfHeight = 297; // A4 height in mm
  
  // Calculate proportionate fit maintaining aspect ratio with neat margins
  const maxAvailableWidth = pdfWidth - 10; // 200 mm
  const maxAvailableHeight = pdfHeight - 10; // 287 mm

  let imgWidth = maxAvailableWidth;
  let imgHeight = (canvas.height * imgWidth) / canvas.width;

  if (imgHeight > maxAvailableHeight) {
    imgHeight = maxAvailableHeight;
    imgWidth = (canvas.width * imgHeight) / canvas.height;
  }

  // Perfectly center the quotation document on the A4 page
  const xOffset = (pdfWidth - imgWidth) / 2;
  const yOffset = (pdfHeight - imgHeight) / 2;

  pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
  
  const cleanQuoteId = (filename || 'TM260001').replace(/[^a-zA-Z0-9_-]/g, '_');
  pdf.save(`${cleanQuoteId}_Corporate_Quotation.pdf`);
}
