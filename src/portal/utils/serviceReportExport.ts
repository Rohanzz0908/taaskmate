import ExcelJS from 'exceljs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { MasterTransaction, QuotationItem } from '../types';

// Helper to format date as "27-Sep-26"
export function formatReportDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = String(d.getFullYear()).slice(-2);
  
  return `${day}-${month}-${year}`;
}

/**
 * Downloads the Service Report HTML container as a crisp, full-bleed single A4 PDF
 */
export async function downloadServiceReportPDF(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Service report element with ID "${elementId}" not found`);
  }

  // Hide action bar and screen elements if any are inside
  const canvas = await html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff'
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = 210; // A4 width in mm
  const pdfHeight = 297; // A4 height in mm
  
  // Fit cleanly within standard A4 margins
  const imgWidth = pdfWidth - 10;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const xOffset = 5;
  const yOffset = 5;

  pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, Math.min(imgHeight, pdfHeight - 10));
  
  const cleanId = (filename || 'Service_Report').replace(/[^a-zA-Z0-9_-]/g, '_');
  pdf.save(`${cleanId}_Service_Report.pdf`);
}

/**
 * Downloads the Service Report as a fully styled XLSX spreadsheet matching the reference template
 */
export async function downloadServiceReportXLSX(transaction: MasterTransaction): Promise<void> {
  const sr = transaction.serviceReport;
  const client = transaction.clientSnapshot;
  const quote = transaction.quotation;

  const jobId = transaction.transactionId || quote?.quotationId || 'TM260001';
  const serviceDate = formatReportDate(sr?.serviceDate || quote?.quotationDate || new Date().toISOString());

  // Determine items
  const items: QuotationItem[] = (quote?.items && quote.items.length > 0)
    ? quote.items
    : (sr?.materialsUsed && sr.materialsUsed.length > 0)
      ? sr.materialsUsed
      : [
          {
            itemId: 'item-1',
            categoryId: 'CAT-0001',
            materialName: sr?.serviceType || 'General Maintenance',
            description: sr?.serviceType || 'General Maintenance',
            quantity: 1,
            uom: 'Nos',
            rate: 0,
            discount: 0,
            taxPercent: 18,
            taxAmount: 0,
            amount: 0,
          }
        ];

  const categoryName = (items[0]?.description || items[0]?.materialName || sr?.serviceType || 'General Maintenance');

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Taaskmate Enterprise';
  workbook.created = new Date();

  const ws = workbook.addWorksheet('Service Report', {
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 1,
      margins: {
        left: 0.3,
        right: 0.3,
        top: 0.3,
        bottom: 0.3,
        header: 0,
        footer: 0,
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

  // Column definitions (4 columns: S.No, Description, Qty, Units)
  ws.columns = [
    { key: 'sno', width: 9 },
    { key: 'desc', width: 56 },
    { key: 'qty', width: 14 },
    { key: 'units', width: 14 },
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
    fgColor: { argb: 'FF801426' } // Maroon Taaskmate branding
  };

  const whiteBoldFont: Partial<ExcelJS.Font> = {
    name: 'Calibri',
    size: 11,
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
        tl: { col: 1.45, row: 0.15 },
        ext: { width: 185, height: 44 }
      });
      logoEmbedded = true;
    }
  } catch (e) {
    console.warn('Could not embed logo image in Excel', e);
  }

  // Row 1: Company Logo / Title
  const r1 = ws.addRow(['', '', '', '']);
  ws.mergeCells('A1:D1');
  const cTitle = ws.getCell('A1');
  if (!logoEmbedded) {
    cTitle.value = 'TAASKMATE';
    cTitle.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FF801426' } };
    cTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  } else {
    cTitle.value = '';
  }
  r1.height = 46;

  // Row 2: Address (Stored in A2 before merging A2:D2)
  const r2 = ws.addRow(['12-1-7/91, Sai Raghavendra Colony, Muttuguda, Bandlaguda, Nagole, Hyderabad, 500068', '', '', '']);
  ws.mergeCells('A2:D2');
  const cAddr = ws.getCell('A2');
  cAddr.font = { name: 'Calibri', size: 9, color: { argb: 'FF333333' } };
  cAddr.alignment = { horizontal: 'center', vertical: 'middle' };
  r2.height = 16;

  // Row 3: GSTIN (Stored in A3 before merging A3:D3)
  const r3 = ws.addRow(['GSTIN: ', '', '', '']);
  ws.mergeCells('A3:D3');
  const cGst = ws.getCell('A3');
  cGst.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF111111' } };
  cGst.alignment = { horizontal: 'center', vertical: 'middle' };
  r3.height = 16;

  // Row 4: SERVICE REPORT MAROON BANNER
  const r4 = ws.addRow(['SERVICE REPORT', '', '', '']);
  ws.mergeCells('A4:D4');
  const cBanner = ws.getCell('A4');
  cBanner.fill = maroonFill;
  cBanner.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  cBanner.alignment = { horizontal: 'center', vertical: 'middle' };
  cBanner.border = thinBorder;
  r4.height = 24;

  // Metadata Table Rows:
  // Col A: Label | Col B: Value | Col C: Label | Col D: Value
  const metaRows = [
    { k1: 'Name', v1: client.clientName || '', k2: 'Quotation Number', v2: jobId },
    { k1: 'Address', v1: client.address || '', k2: 'Service Date', v2: serviceDate },
    { k1: 'E-Mail', v1: client.email || '—', k2: '', v2: '' },
    { k1: 'GSTIN', v1: client.gstin || 'Na', k2: '', v2: '' },
    { k1: 'Service Location', v1: client.serviceLocation || sr?.location || client.address || '', k2: '', v2: '' },
  ];

  metaRows.forEach(m => {
    const row = ws.addRow([m.k1, m.v1, m.k2, m.v2]);
    row.height = m.k1 === 'Address' || m.k1 === 'Service Location' ? 36 : 20;

    const c1 = row.getCell(1);
    c1.font = { name: 'Calibri', size: 9, bold: true };
    c1.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
    c1.border = thinBorder;

    const c2 = row.getCell(2);
    c2.font = { name: 'Calibri', size: 9, bold: m.k1 === 'Name' };
    c2.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
    c2.border = thinBorder;

    const c3 = row.getCell(3);
    c3.font = { name: 'Calibri', size: 9, bold: true };
    c3.alignment = { vertical: 'top', horizontal: 'left' };
    c3.border = thinBorder;

    const c4 = row.getCell(4);
    c4.font = { name: 'Calibri', size: 9, bold: m.k2 === 'Quotation Number' };
    c4.alignment = { vertical: 'top', horizontal: 'left' };
    c4.border = thinBorder;
  });

  // Table Header Row: Maroon #801426
  const rHeader = ws.addRow(['S.No', 'Description', 'Qty', 'Units']);
  rHeader.height = 22;
  [1, 2, 3, 4].forEach(colIdx => {
    const c = rHeader.getCell(colIdx);
    c.fill = maroonFill;
    c.font = whiteBoldFont;
    c.alignment = { 
      horizontal: colIdx === 2 ? 'left' : 'center', 
      vertical: 'middle' 
    };
    c.border = thinBorder;
  });

  // Category Subheading Row
  const rCat = ws.addRow([`${categoryName} :`, '', '', '']);
  ws.mergeCells(`A${rCat.number}:D${rCat.number}`);
  const cCat = ws.getCell(`A${rCat.number}`);
  cCat.font = { name: 'Calibri', size: 10, bold: true };
  cCat.alignment = { horizontal: 'left', vertical: 'middle' };
  cCat.border = thinBorder;
  rCat.height = 20;

  // Items
  items.forEach((it, idx) => {
    const itemTitle = it.description || it.materialName || 'Service description';
    const row = ws.addRow([
      idx + 1,
      itemTitle,
      it.quantity || 1,
      it.uom === 'Nos' ? "No's" : (it.uom || 'Nos')
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
  });

  // Fill remaining space with 6 clean spacer rows to match printed template
  for (let i = 0; i < 6; i++) {
    const rSpacer = ws.addRow(['', '', '', '']);
    rSpacer.height = 20;
    [1, 2, 3, 4].forEach(colIdx => {
      rSpacer.getCell(colIdx).border = thinBorder;
    });
  }

  // Dual Sign-off Header Row (50% / 50%)
  const rSignHeader = ws.addRow(['Taaskmate', '', client.clientName, '']);
  const signRowNum = rSignHeader.number;
  ws.mergeCells(`A${signRowNum}:B${signRowNum}`);
  ws.mergeCells(`C${signRowNum}:D${signRowNum}`);

  const cSignLeft = ws.getCell(`A${signRowNum}`);
  cSignLeft.font = { name: 'Calibri', size: 10, bold: true };
  cSignLeft.alignment = { horizontal: 'center', vertical: 'middle' };
  cSignLeft.border = thinBorder;
  ws.getCell(`B${signRowNum}`).border = thinBorder;

  const cSignRight = ws.getCell(`C${signRowNum}`);
  cSignRight.font = { name: 'Calibri', size: 10, bold: true };
  cSignRight.alignment = { horizontal: 'center', vertical: 'middle' };
  cSignRight.border = thinBorder;
  ws.getCell(`D${signRowNum}`).border = thinBorder;
  rSignHeader.height = 20;

  // Empty stamp space row
  const rSignSpace = ws.addRow(['', '', '', '']);
  const spaceRowNum = rSignSpace.number;
  ws.mergeCells(`A${spaceRowNum}:B${spaceRowNum}`);
  ws.mergeCells(`C${spaceRowNum}:D${spaceRowNum}`);
  [1, 2, 3, 4].forEach(colIdx => {
    rSignSpace.getCell(colIdx).border = thinBorder;
  });
  rSignSpace.height = 50;

  // Stamp & Signature label row
  const rSignLabel = ws.addRow(['Stamp & Signature', '', 'Stamp & Signature', '']);
  const labelRowNum = rSignLabel.number;
  ws.mergeCells(`A${labelRowNum}:B${labelRowNum}`);
  ws.mergeCells(`C${labelRowNum}:D${labelRowNum}`);
  const cLbl1 = ws.getCell(`A${labelRowNum}`);
  cLbl1.font = { name: 'Calibri', size: 8, bold: true, color: { argb: 'FF555555' } };
  cLbl1.alignment = { horizontal: 'center', vertical: 'middle' };
  cLbl1.border = thinBorder;
  ws.getCell(`B${labelRowNum}`).border = thinBorder;

  const cLbl2 = ws.getCell(`C${labelRowNum}`);
  cLbl2.font = { name: 'Calibri', size: 8, bold: true, color: { argb: 'FF555555' } };
  cLbl2.alignment = { horizontal: 'center', vertical: 'middle' };
  cLbl2.border = thinBorder;
  ws.getCell(`D${labelRowNum}`).border = thinBorder;
  rSignLabel.height = 18;

  // Generate and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  const cleanJobId = jobId.replace(/[^a-zA-Z0-9_-]/g, '_');
  anchor.download = `${cleanJobId}_Service_Report.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}
