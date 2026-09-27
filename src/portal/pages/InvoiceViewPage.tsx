import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Printer, 
  AlertCircle,
  RefreshCw,
  Download,
  FileSpreadsheet,
  Loader2,
  Edit3
} from 'lucide-react';
import { db, DEFAULT_BANK_DETAILS } from '../services/db';
import { 
  downloadInvoicePDF, 
  downloadInvoiceXLSX,
  formatInvoiceDate,
  formatCurrencyNumber,
  numberToIndianWords
} from '../utils/invoiceExport';

export const InvoiceViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tx, setTx] = useState(id ? db.getTransactionById(id) : undefined);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingXlsx, setIsDownloadingXlsx] = useState(false);

  const transaction = tx || (id ? db.getTransactionById(id) : undefined);
  const invoice = transaction?.invoice;

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSyncFromQuotation = () => {
    if (!id) return;
    const synced = db.syncTransactionFromQuotation(id);
    if (!synced) {
      showToast('error', 'No quotation found to sync.');
      return;
    }
    setTx({ ...synced });
    showToast('success', 'Commercial Invoice synchronized with latest quotation items and pricing!');
  };

  const handleDownloadPDF = async () => {
    if (!transaction) return;
    try {
      setIsDownloadingPdf(true);
      await downloadInvoicePDF('invoice-printable', invoice?.invoiceId || transaction.transactionId);
      showToast('success', 'Tax Invoice PDF downloaded successfully!');
    } catch (err) {
      console.error('Failed to download PDF:', err);
      showToast('error', 'Failed to generate PDF. You can also use the Print button.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadXLSX = async () => {
    if (!transaction) return;
    try {
      setIsDownloadingXlsx(true);
      await downloadInvoiceXLSX(transaction);
      showToast('success', 'Tax Invoice Excel (.xlsx) downloaded successfully!');
    } catch (err) {
      console.error('Failed to export XLSX:', err);
      showToast('error', 'Failed to generate Excel spreadsheet.');
    } finally {
      setIsDownloadingXlsx(false);
    }
  };

  if (!transaction || !invoice) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Invoice Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">
          No Commercial Invoice has been issued for Transaction ID <span className="font-semibold text-slate-700">{id}</span>.
        </p>
        <Link
          to={`/portal/invoice?tid=${id}`}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all inline-block"
        >
          Generate Invoice for {id}
        </Link>
      </div>
    );
  }

  const { clientSnapshot, serviceReport, quotation } = transaction;

  // Items to display: prioritize latest quotation items to stay in sync with quotation revisions
  const items = (quotation?.items && quotation.items.length > 0)
    ? quotation.items
    : (invoice.items || []);

  let rawSubtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;

  items.forEach(item => {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate ?? item.clientRate) || 0;
    const discount = Number(item.discount) || 0;
    const taxAmt = Number(item.taxAmount) || 0;

    rawSubtotal += (qty * rate);
    totalDiscount += discount;
    totalTax += taxAmt;
  });

  const gstMode = quotation?.gstMode || invoice.gstMode || 'CGST_SGST';
  const subtotalBeforeTax = Math.max(0, rawSubtotal - totalDiscount);

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;
  let totalGstAmount = 0;

  if (gstMode === 'CGST_SGST') {
    cgstAmount = invoice.cgst !== undefined && invoice.cgst > 0
      ? invoice.cgst
      : Number((subtotalBeforeTax * 0.09).toFixed(2));
    sgstAmount = invoice.sgst !== undefined && invoice.sgst > 0
      ? invoice.sgst
      : Number((subtotalBeforeTax * 0.09).toFixed(2));
    totalGstAmount = Number((cgstAmount + sgstAmount).toFixed(2));
  } else {
    igstAmount = invoice.igst !== undefined && invoice.igst > 0
      ? invoice.igst
      : Number((subtotalBeforeTax * 0.18).toFixed(2));
    totalGstAmount = igstAmount;
  }

  const calculatedGrandTotal = subtotalBeforeTax + totalGstAmount;
  const roundedGrandTotal = Math.round(calculatedGrandTotal);
  const roundOffDiff = roundedGrandTotal - calculatedGrandTotal;
  const roundOffDisplay = Math.abs(roundOffDiff) < 0.001 ? '0.00' : (roundOffDiff > 0 ? `+${roundOffDiff.toFixed(2)}` : `(${Math.abs(roundOffDiff).toFixed(2)})`);
  const finalInvoiceTotal = roundedGrandTotal;

  const clientMaster = clientSnapshot.clientId ? db.getClientById(clientSnapshot.clientId) : undefined;
  const serviceLoc = clientSnapshot.serviceLocation?.trim() || clientMaster?.serviceLocation?.trim() || serviceReport?.location || (clientSnapshot.address ? clientSnapshot.address.split(',')[0].trim() : 'Gachibowli Hyderabad');

  const bank = {
    accountNumber: invoice.bankDetails?.accountNumber || DEFAULT_BANK_DETAILS.accountNumber,
    ifsc: invoice.bankDetails?.ifsc || DEFAULT_BANK_DETAILS.ifsc,
    bankName: invoice.bankDetails?.bankName || DEFAULT_BANK_DETAILS.bankName,
    branch: invoice.bankDetails?.branch || DEFAULT_BANK_DETAILS.branch || 'Nagole, HYD',
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Print Specific CSS for full-size single A4 page */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          html, body, #root, .min-h-screen, main {
            background-color: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print, nav, aside, header, .portal-sidebar, .portal-topbar {
            display: none !important;
          }
          .print-invoice-outer {
            border: 2px solid #000000 !important;
            box-shadow: none !important;
            margin: 0 auto !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            min-height: auto !important;
            max-height: none !important;
            box-sizing: border-box !important;
            display: block !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .inv-maroon-bg {
            background-color: #801426 !important;
            color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .inv-gold-bg {
            background-color: #F7E1A0 !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl transition-all duration-200 border ${
          toast.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Screen Action Bar (Hidden in Print) */}
      <div className="no-print flex flex-col xl:flex-row items-center justify-between gap-4 bg-white px-5 py-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 w-full xl:w-auto shrink-0">
          <button
            onClick={() => navigate('/portal/invoices')}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Back to Invoices list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm font-mono">
                Invoice: {invoice.invoiceId || transaction.transactionId}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                invoice.payment?.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                invoice.payment?.status === 'Partial' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-purple-50 text-purple-700 border-purple-200'
              }`}>
                {(invoice.payment?.status || 'Pending').toUpperCase()}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Date: {(() => {
              if (!invoice.invoiceDate) return '—';
              const match = invoice.invoiceDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
              return match ? `${match[3]}-${match[2]}-${match[1]}` : formatInvoiceDate(invoice.invoiceDate);
            })()}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap xl:flex-nowrap items-center gap-2 w-full xl:w-auto justify-end shrink-0">
          {transaction.quotation && (
            <button
              onClick={handleSyncFromQuotation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-semibold shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
              title="Click to refresh commercial invoice items and pricing with latest quotation"
            >
              <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
              <span>Sync from Quotation</span>
            </button>
          )}

          <Link
            to={`/portal/transaction/${transaction.transactionId}`}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors whitespace-nowrap"
          >
            Hub
          </Link>

          <Link
            to={`/portal/invoice?tid=${transaction.transactionId}&edit=true`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors whitespace-nowrap"
            title="Edit Commercial Invoice"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Link>

          {/* DOWNLOAD PDF BUTTON */}
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloadingPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#801426] hover:bg-[#6b0f1f] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
            title="Download formatted PDF document"
          >
            {isDownloadingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Download PDF</span>
          </button>

          {/* DOWNLOAD XLSX BUTTON */}
          <button
            onClick={handleDownloadXLSX}
            disabled={isDownloadingXlsx}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
            title="Download formatted Excel spreadsheet (.xlsx)"
          >
            {isDownloadingXlsx ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5" />
            )}
            <span>Download Excel</span>
          </button>

          {/* PRINT BUTTON */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            title="Print Tax Invoice via Browser"
          >
            <Printer className="w-3.5 h-3.5 text-[#00C878]" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXACT REFERENCE LAYOUT COMMERCIAL INVOICE CONTAINER                      */}
      {/* Matches user's screenshot: Centered Logo, Maroon Banner, Scope Table      */}
      {/* ========================================================================= */}
      <div 
        id="invoice-printable"
        className="print-invoice-outer bg-white text-black border-2 border-black p-0 shadow-md font-sans text-xs leading-normal mx-auto"
        style={{ width: '100%', maxWidth: '820px' }}
      >
        
        {/* TOP SECTION: COMPANY HEADER WITH LOGO */}
        <div>
          <div className="flex flex-col items-center justify-center text-center pb-2.5 pt-3 px-4">
            <div className="flex items-center justify-center mb-1">
              <img 
                src="/taaskmate-logo.png" 
                alt="Taaskmate" 
                className="h-10 sm:h-12 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/taaskmate-logo.jpg';
                }}
              />
            </div>
            <div className="text-[11px] text-slate-800 font-medium leading-normal">
              12-1-7/91, Sai Raghavendra Colony, Muttuguda, Bandlaguda, Nagole, Hyderabad, 500068
            </div>
            <div className="text-[11px] font-bold text-slate-900 mt-0.5">
              GSTIN: 
            </div>
          </div>

          {/* TWO-COLUMN DETAILS TABLE: INVOICE TO & INVOICE DETAILS */}
          <table className="w-full border-collapse border-y border-black text-[11px] leading-normal">
            <thead>
              <tr className="bg-[#801426] text-white font-bold border-b border-black inv-maroon-bg">
                <th colSpan={2} className="py-2 px-3 border-r border-black text-center uppercase tracking-wide">
                  Invoice To
                </th>
                <th colSpan={2} className="py-2 px-3 text-center uppercase tracking-wide">
                  Invoice Details
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-black">
                <td className="w-28 py-1.5 px-3 font-bold border-r border-black align-middle text-slate-900">Name</td>
                <td className="w-[45%] py-1.5 px-3 font-bold border-r border-black align-middle text-slate-900">
                  {clientSnapshot.clientName}
                </td>
                <td className="w-36 py-1.5 px-3 font-bold border-r border-black align-middle text-slate-900">Invoice Number</td>
                <td className="py-1.5 px-3 font-bold text-center align-middle text-slate-900">
                  {invoice.invoiceId || transaction.transactionId}
                </td>
              </tr>

              <tr className="border-b border-black">
                <td className="py-1.5 px-3 font-bold border-r border-black align-middle text-slate-900">Address</td>
                <td className="py-1.5 px-3 border-r border-black align-middle leading-snug text-slate-800">
                  {clientSnapshot.address}
                </td>
                <td className="py-1.5 px-3 font-bold border-r border-black align-middle text-slate-900">Invoice Date</td>
                <td className="py-1.5 px-3 text-center align-middle text-slate-900 font-medium">
                  {formatInvoiceDate(invoice.invoiceDate)}
                </td>
              </tr>

              <tr className="border-b border-black">
                <td className="py-1.5 px-3 font-bold border-r border-black align-middle text-slate-900">E-Mail</td>
                <td className="py-1.5 px-3 border-r border-black align-middle text-slate-800">
                  {clientSnapshot.email || '—'}
                </td>
                <td className="py-1.5 px-3 font-bold border-r border-black align-middle text-slate-900">PO / WO Number</td>
                <td className="py-1.5 px-3 text-center align-middle text-slate-800 font-medium">
                  {invoice.poNumber?.trim() || 'NA'}
                </td>
              </tr>

              <tr className="border-b border-black">
                <td className="py-1.5 px-3 font-bold border-r border-black align-middle text-slate-900">GSTIN</td>
                <td className="py-1.5 px-3 font-bold border-r border-black align-middle text-slate-900">
                  {clientSnapshot.gstin || 'NA'}
                </td>
                <td className="py-1.5 px-3 font-bold border-r border-black align-middle text-slate-900">PO / WO Date</td>
                <td className="py-1.5 px-3 text-center align-middle text-slate-800 font-medium">
                  {invoice.poDate ? formatInvoiceDate(invoice.poDate) : 'NA'}
                </td>
              </tr>

              <tr className="border-b border-black">
                <td className="py-1.5 px-3 font-bold border-r border-black align-middle text-slate-900">Service Location</td>
                <td className="py-1.5 px-3 border-r border-black align-middle text-slate-800 leading-snug">
                  {serviceLoc}
                </td>
                <td className="py-1.5 px-3 font-bold border-r border-black align-middle text-slate-900">Quotation Number</td>
                <td className="py-1.5 px-3 font-bold text-center align-middle text-slate-900">
                  {quotation?.quotationId || transaction.transactionId}
                </td>
              </tr>

              <tr>
                <td className="py-1.5 px-3 font-bold border-r border-black align-middle text-slate-900">HSN / SAC Code</td>
                <td className="py-1.5 px-3 border-r border-black align-middle text-slate-800">
                  {invoice.hsnCode?.trim() || '995461'}
                </td>
                <td className="py-1.5 px-3 border-r border-black"></td>
                <td className="py-1.5 px-3"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* MIDDLE SECTION: MAIN ITEMIZED SCOPE TABLE */}
        <div className="w-full">
          <table className="w-full border-collapse border-b border-black text-[11px] leading-normal">
            <thead>
              <tr className="bg-[#801426] text-white font-bold border-b border-black inv-maroon-bg">
                <th className="py-2 px-2 w-12 text-center border-r border-black">S.No</th>
                <th className="py-2 px-3 text-left border-r border-black">Description</th>
                <th className="py-2 px-2 w-14 text-center border-r border-black">Qty</th>
                <th className="py-2 px-2 w-16 text-center border-r border-black">Units</th>
                <th className="py-2 px-3 w-28 text-right border-r border-black">Rate</th>
                <th className="py-2 px-3 w-32 text-right">Base Amount</th>
              </tr>
            </thead>
            <tbody>
              {/* Line Items */}
              {items.map((item, index) => {
                const q = Number(item.quantity) || 0;
                const r = Number(item.rate ?? item.clientRate) || 0;
                const baseAmt = (q * r) - (Number(item.discount) || 0);

                return (
                  <tr key={item.itemId || index} className="border-b border-black align-top">
                    <td className="py-2.5 px-2 text-center border-r border-black font-semibold text-slate-800">
                      {index + 1}
                    </td>
                    <td className="py-2.5 px-3 border-r border-black">
                      <div className="font-semibold text-slate-900">
                        {item.description || item.materialName}
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center border-r border-black font-semibold text-slate-900">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 px-2 text-center border-r border-black text-slate-800">
                      {item.uom === 'Nos' ? "No's" : item.uom}
                    </td>
                    <td className="py-2.5 px-3 text-right border-r border-black font-medium text-slate-900 tabular-nums">
                      {formatCurrencyNumber(r)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-900 tabular-nums">
                      {formatCurrencyNumber(baseAmt)}
                    </td>
                  </tr>
                );
              })}

              {/* Clean Spacer row that preserves visual balance without breaking table layout */}
              <tr className="border-b border-black align-top" style={{ height: items.length === 1 ? '160px' : items.length <= 2 ? '110px' : items.length <= 4 ? '60px' : '20px' }}>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td></td>
              </tr>

              {/* Total Amount Before Tax */}
              <tr className="border-b border-black">
                <td colSpan={5} className="py-1.5 px-3 text-right border-r border-black font-bold text-slate-900">
                  Total Amount Before Tax
                </td>
                <td className="py-1.5 px-3 text-right font-bold text-slate-900 tabular-nums">
                  {formatCurrencyNumber(subtotalBeforeTax)}
                </td>
              </tr>

              {/* GST Tax from Quotation */}
              {gstMode === 'CGST_SGST' ? (
                <>
                  <tr className="border-b border-black">
                    <td colSpan={5} className="py-1.5 px-3 text-right border-r border-black font-bold text-slate-900">
                      Add: CGST @ 9%
                    </td>
                    <td className="py-1.5 px-3 text-right font-bold text-slate-900 tabular-nums">
                      {formatCurrencyNumber(cgstAmount)}
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td colSpan={5} className="py-1.5 px-3 text-right border-r border-black font-bold text-slate-900">
                      Add: SGST @ 9%
                    </td>
                    <td className="py-1.5 px-3 text-right font-bold text-slate-900 tabular-nums">
                      {formatCurrencyNumber(sgstAmount)}
                    </td>
                  </tr>
                </>
              ) : (
                <tr className="border-b border-black">
                  <td colSpan={5} className="py-1.5 px-3 text-right border-r border-black font-bold text-slate-900">
                    Add: IGST @ 18%
                  </td>
                  <td className="py-1.5 px-3 text-right font-bold text-slate-900 tabular-nums">
                    {formatCurrencyNumber(igstAmount)}
                  </td>
                </tr>
              )}

              {/* Round off Row */}
              <tr className="border-b border-black">
                <td colSpan={5} className="py-1.5 px-3 text-right border-r border-black font-bold text-slate-900">
                  Round off
                </td>
                <td className="py-1.5 px-3 text-right font-bold text-slate-900 tabular-nums">
                  {roundOffDisplay}
                </td>
              </tr>

              {/* TOTAL AMOUNT (Gold Row) */}
              <tr className="bg-[#F7E1A0] inv-gold-bg border-b border-black font-bold text-xs">
                <td colSpan={5} className="py-2 px-3 text-right border-r border-black text-slate-950">
                  Total Amount
                </td>
                <td className="py-2 px-3 text-right font-bold text-slate-950 text-xs tabular-nums">
                  {formatCurrencyNumber(finalInvoiceTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* BOTTOM SECTION: IN WORDS, TERMS & CONDITIONS, SIGN-OFF / BANK DETAILS */}
        <div className="text-[11px] leading-normal">
          {/* IN WORDS ROW */}
          <div className="border-b border-black p-2.5 font-bold bg-white text-slate-900">
            <span>IN WORDS : </span>
            <span className="font-semibold">{numberToIndianWords(finalInvoiceTotal)}</span>
          </div>

          {/* TERMS & CONDITIONS BOX */}
          <div className="border-b border-black p-2.5 bg-white text-slate-900">
            <div className="font-bold mb-0.5">
              Terms & Condition:
            </div>
            <div className="text-slate-800 text-[10.5px] whitespace-pre-line leading-relaxed">
              {invoice.notes?.trim() || '1. Payment should be clear immediately after invoice submission'}
            </div>
          </div>

          {/* Dual Columns: Taaskmate Stamp (Left) | Bank Account Details (Right) */}
          <div className="flex">
            {/* Left Box: Taaskmate Signature & Stamp */}
            <div className="w-1/2 border-r border-black flex flex-col justify-between p-3 h-28 print:h-24">
              <div className="font-bold text-slate-900 text-center text-xs">
                Taaskmate
              </div>
              <div className="font-bold text-slate-800 text-center text-[10px] print:text-[9px]">
                Stamp & Signature
              </div>
            </div>

            {/* Right Box: Bank Details */}
            <div className="w-1/2 p-3 print:p-2 space-y-1 text-slate-900 leading-tight font-sans text-[10px] print:text-[9.5px] flex flex-col justify-center h-28 print:h-24">
              <div className="text-center font-bold text-xs pb-1">
                Taaskmate Bank Account Details
              </div>
              <div className="space-y-0.5 text-center">
                <div>Bank Account Number: {bank.accountNumber || ''}</div>
                <div>Bank IFSC Code: {bank.ifsc || ''}</div>
                <div className="font-medium">Bank Name: {bank.bankName || ''}</div>
                <div>Branch Address: {bank.branch || 'Nagole, HYD'}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
