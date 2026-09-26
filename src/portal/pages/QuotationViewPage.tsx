import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  Printer, 
  ArrowLeft, 
  Edit2, 
  FileSpreadsheet, 
  Download, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Quotation, QuotationStatus } from '../types';
import { db } from '../services/db';
import { 
  formatQuotationDate, 
  formatCurrencyNumber, 
  numberToIndianWords, 
  downloadQuotationXLSX, 
  downloadQuotationPDF 
} from '../utils/quotationExport';

export const QuotationViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingXlsx, setIsDownloadingXlsx] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (id) {
      const q = db.getQuotationById(id);
      if (q) {
        setQuotation(q);
      } else {
        navigate('/portal/quotations');
      }
    }
  }, [id, navigate]);

  // Handle auto-print if ?print=true
  useEffect(() => {
    if (quotation && searchParams.get('print') === 'true') {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [quotation, searchParams]);

  if (!quotation) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00C878]"></div>
      </div>
    );
  }

  const handleStatusUpdate = (newStatus: QuotationStatus) => {
    db.updateQuotationStatus(quotation.quotationId || quotation.transactionId, newStatus);
    setQuotation({ ...quotation, status: newStatus });
    showToast('success', `Status updated to ${newStatus}`);
  };

  // Calculations
  const amountBeforeTax = quotation.subtotal - (quotation.totalDiscount || 0);
  const sgstAmount = Number((amountBeforeTax * 0.09).toFixed(2));
  const cgstAmount = Number((amountBeforeTax * 0.09).toFixed(2));
  const calculatedGrandTotal = amountBeforeTax + sgstAmount + cgstAmount;
  const roundedGrandTotal = Math.round(calculatedGrandTotal);
  const roundOffDiff = roundedGrandTotal - calculatedGrandTotal;
  const roundOffDisplay = Math.abs(roundOffDiff) < 0.001 ? '-' : (roundOffDiff > 0 ? `+${roundOffDiff.toFixed(2)}` : roundOffDiff.toFixed(2));
  const finalTotal = roundedGrandTotal;

  // Format ID for display
  const displayQuoteId = quotation.quotationId || quotation.transactionId;
  const client = quotation.clientSnapshot;
  const location = client.address ? client.address.split(',')[0].trim() : 'AS Rao Nagar';
  const sacCode = '998533';

  // Handler for PDF download
  const handleDownloadPDF = async () => {
    try {
      setIsDownloadingPdf(true);
      await downloadQuotationPDF('quotation-print-container', displayQuoteId || 'quotation');
      showToast('success', 'PDF downloaded successfully');
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      showToast('error', 'Could not generate PDF. Please try Print as PDF instead.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Handler for XLSX download
  const handleDownloadXLSX = async () => {
    try {
      setIsDownloadingXlsx(true);
      await downloadQuotationXLSX(quotation);
      showToast('success', 'Excel (.xlsx) downloaded successfully');
    } catch (err) {
      console.error('Failed to export XLSX:', err);
      showToast('error', 'Could not export Excel file.');
    } finally {
      setIsDownloadingXlsx(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl transition-all duration-200 border ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-[#00C878]" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
          <span className="text-xs font-medium">{toast.message}</span>
        </div>
      )}

      {/* Print Specific CSS for precise A4 output */}
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
          .print-quotation-outer {
            border: 1.5px solid #000000 !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 16px !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .quotation-maroon-bg {
            background-color: #850E24 !important;
            color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        .quotation-maroon-bg {
          background-color: #850E24;
          color: #ffffff;
        }
      `}</style>

      {/* Screen Action Bar (Hidden in Print) */}
      <div className="no-print flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => navigate('/portal/quotations')}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Back to Quotation list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm font-mono">
                {displayQuoteId}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                quotation.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                quotation.status === 'Sent' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                quotation.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {quotation.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Date: {formatQuotationDate(quotation.quotationDate)}</p>
          </div>
        </div>

        {/* Action Controls: 2 Download formats (PDF, XLSX) + Print + Edit */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <select
            value={quotation.status}
            onChange={(e) => handleStatusUpdate(e.target.value as QuotationStatus)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#00C878] cursor-pointer"
          >
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Expired">Expired</option>
          </select>

          <Link
            to={`/portal/transaction/${displayQuoteId}`}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            Hub
          </Link>

          <button
            onClick={() => navigate(`/portal/quotation/edit/${displayQuoteId}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          {/* DOWNLOAD PDF BUTTON */}
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloadingPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#850E24] hover:bg-[#6e0a1c] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
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
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Download formatted Excel spreadsheet (.xlsx)"
          >
            {isDownloadingXlsx ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5" />
            )}
            <span>Download XLSX</span>
          </button>

          {/* PRINT BUTTON */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Print or Save via Browser"
          >
            <Printer className="w-3.5 h-3.5 text-[#00C878]" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXACT REFERENCE QUOTATION DOCUMENT                                       */}
      {/* Matches user's uploaded template layout pixel-by-pixel                    */}
      {/* ========================================================================= */}
      <div 
        id="quotation-print-container"
        ref={printRef}
        className="print-quotation-outer bg-white text-black border-[1.5px] border-black p-5 sm:p-7 shadow-lg font-sans text-xs leading-normal mx-auto"
        style={{ width: '100%', maxWidth: '820px' }}
      >
        
        {/* HEADER SECTION: Centered Logo & Company Details */}
        <div className="flex flex-col items-center justify-center text-center pb-3">
          <div className="flex items-center justify-center mb-1">
            <img 
              src="/taaskmate-logo.png" 
              alt="Taaskmate" 
              className="h-10 sm:h-12 w-auto object-contain"
              onError={(e) => {
                // Fallback to jpg if png not available
                (e.target as HTMLImageElement).src = '/taaskmate-logo.jpg';
              }}
            />
          </div>
          <div className="text-[11px] text-slate-800 font-medium">
            12-1-7/91, Sai Raghavendra Colony, Muttuguda, Bandlaguda, Nagole, Hyderabad, 500068
          </div>
          <div className="text-[11px] text-slate-800 font-medium mt-0.5">
            sudhir@taaskmate.in
          </div>
          <div className="text-[11px] font-bold text-slate-900 mt-0.5">
            GSTIN: 
          </div>
        </div>

        {/* QUOTATION BANNER */}
        <div className="quotation-maroon-bg text-center py-1.5 border border-black font-bold text-xs uppercase tracking-wider">
          QUOTATION
        </div>

        {/* 4-COLUMN META TABLE */}
        <table className="w-full border-collapse border-x border-b border-black text-[11px]">
          <tbody>
            <tr className="border-b border-black">
              <td className="w-[20%] py-1.5 px-3 font-bold border-r border-black">Quotation Number:</td>
              <td className="w-[30%] py-1.5 px-3 font-bold border-r border-black font-mono text-center">
                {displayQuoteId}
              </td>
              <td className="w-[25%] py-1.5 px-3 font-bold border-r border-black text-center">
                Quotation Validity
              </td>
              <td className="w-[25%] py-1.5 px-3 font-bold text-center">
                {formatQuotationDate(quotation.validUntil)}
              </td>
            </tr>
            <tr>
              <td className="py-1.5 px-3 font-bold border-r border-black text-center">Date:</td>
              <td className="py-1.5 px-3 font-bold border-r border-black text-center">
                {formatQuotationDate(quotation.quotationDate)}
              </td>
              <td className="py-1.5 px-3 font-bold border-r border-black text-center">Location</td>
              <td className="py-1.5 px-3 font-bold text-center">
                {location}
              </td>
            </tr>
          </tbody>
        </table>

        {/* QUOTATION TO BANNER */}
        <div className="quotation-maroon-bg text-center py-1.5 border-x border-b border-black font-bold text-xs">
          Quotation To
        </div>

        {/* CLIENT DETAILS TABLE */}
        <table className="w-full border-collapse border-x border-b border-black text-[11px]">
          <tbody>
            <tr className="border-b border-black">
              <td className="w-[25%] py-1.5 px-3 font-bold border-r border-black">NAME</td>
              <td className="py-1.5 px-3 font-medium text-slate-900">
                {client.clientName}
              </td>
            </tr>
            <tr className="border-b border-black">
              <td className="py-1.5 px-3 font-bold border-r border-black">Address</td>
              <td className="py-1.5 px-3 text-slate-800">
                {client.address}
              </td>
            </tr>
            <tr className="border-b border-black">
              <td className="py-1.5 px-3 font-bold border-r border-black">E-Mail</td>
              <td className="py-1.5 px-3 text-slate-800">
                {client.email || '—'}
              </td>
            </tr>
            <tr className="border-b border-black">
              <td className="py-1.5 px-3 font-bold border-r border-black">GSTIN</td>
              <td className="py-1.5 px-3 font-medium">
                {client.gstin || 'NA'}
              </td>
            </tr>
            <tr className="border-b border-black">
              <td className="py-1.5 px-3 font-bold border-r border-black">Service Location</td>
              <td className="py-1.5 px-3 text-slate-800">
                {location}
              </td>
            </tr>
            <tr>
              <td className="py-1.5 px-3 font-bold border-r border-black">SAC Code</td>
              <td className="py-1.5 px-3 text-slate-800 font-mono">
                {sacCode}
              </td>
            </tr>
          </tbody>
        </table>

        {/* MAIN SERVICES ITEMIZED TABLE */}
        <table className="w-full border-collapse border-x border-b border-black text-[11px]">
          <thead>
            <tr className="quotation-maroon-bg font-bold border-b border-black text-center">
              <th className="py-1.5 px-2 w-12 border-r border-black">S No</th>
              <th className="py-1.5 px-3 border-r border-black text-center">Services Details</th>
              <th className="py-1.5 px-2 w-14 border-r border-black">Qty</th>
              <th className="py-1.5 px-2 w-16 border-r border-black">Units</th>
              <th className="py-1.5 px-3 w-24 border-r border-black text-center">Rate</th>
              <th className="py-1.5 px-3 w-28 text-center">Base Amount</th>
            </tr>
          </thead>
          <tbody>
            {/* Line Items */}
            {quotation.items.map((item, index) => {
              const qty = Number(item.quantity) || 1;
              const rate = Number(item.rate) || 0;
              const itemBaseAmount = (qty * rate) - (item.discount || 0);

              // Split description into lines if it contains newlines or bullets
              const desc = item.description || item.materialName || 'Service description';
              const descLines = desc.split('\n').filter(l => l.trim().length > 0);

              return (
                <tr key={item.itemId || index} className="border-b border-black align-top">
                  <td className="py-2.5 px-2 text-center border-r border-black font-semibold">
                    {index + 1}
                  </td>
                  <td className="py-2.5 px-3 border-r border-black">
                    {descLines.length > 0 ? (
                      <div className="space-y-1">
                        <div className="font-semibold text-slate-900">
                          {descLines[0]}
                        </div>
                        {descLines.slice(1).map((line, lIdx) => (
                          <div key={lIdx} className="text-slate-800 pl-1 leading-snug">
                            {line.startsWith('•') || line.startsWith('-') || line.startsWith('*') ? line : `• ${line}`}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="font-semibold text-slate-900">{desc}</div>
                    )}
                    {item.purpose && (
                      <div className="text-slate-700 pl-1 mt-1 leading-snug">
                        • {item.purpose}
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-center border-r border-black font-medium">
                    {qty}
                  </td>
                  <td className="py-2.5 px-2 text-center border-r border-black text-slate-800">
                    {item.uom === 'Nos' ? "No's" : (item.uom || 'LS')}
                  </td>
                  <td className="py-2.5 px-3 text-right border-r border-black font-mono">
                    {formatCurrencyNumber(rate)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium">
                    {formatCurrencyNumber(itemBaseAmount)}
                  </td>
                </tr>
              );
            })}

            {/* Spacer row to preserve visual spacing */}
            <tr className="border-b border-black" style={{ height: '70px' }}>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td></td>
            </tr>

            {/* Totals Section */}
            <tr className="border-b border-black">
              <td colSpan={2} className="border-r border-black"></td>
              <td colSpan={3} className="py-1 px-3 text-right font-bold border-r border-black text-slate-900">
                Amount Before Tax
              </td>
              <td className="py-1 px-3 text-right font-mono font-bold text-slate-900">
                {formatCurrencyNumber(amountBeforeTax)}
              </td>
            </tr>
            <tr className="border-b border-black">
              <td colSpan={2} className="border-r border-black"></td>
              <td colSpan={3} className="py-1 px-3 text-right text-slate-700 border-r border-black">
                Add: SGST @ 9%
              </td>
              <td className="py-1 px-3 text-right font-mono text-slate-800">
                {formatCurrencyNumber(sgstAmount)}
              </td>
            </tr>
            <tr className="border-b border-black">
              <td colSpan={2} className="border-r border-black"></td>
              <td colSpan={3} className="py-1 px-3 text-right text-slate-700 border-r border-black">
                Add: CGST @ 9%
              </td>
              <td className="py-1 px-3 text-right font-mono text-slate-800">
                {formatCurrencyNumber(cgstAmount)}
              </td>
            </tr>
            <tr className="border-b border-black">
              <td colSpan={2} className="border-r border-black"></td>
              <td colSpan={3} className="py-1 px-3 text-right text-slate-700 border-r border-black">
                Round off
              </td>
              <td className="py-1 px-3 text-right font-mono text-slate-800">
                {roundOffDisplay}
              </td>
            </tr>
            <tr className="quotation-maroon-bg font-bold border-t border-black">
              <td colSpan={2} className="border-r border-black bg-white"></td>
              <td colSpan={3} className="py-1.5 px-3 text-right border-r border-black text-white">
                Total Amount
              </td>
              <td className="py-1.5 px-3 text-right font-mono font-bold text-white text-xs">
                {formatCurrencyNumber(finalTotal)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* IN WORDS ROW */}
        <div className="border-x border-b border-black py-1.5 px-3 font-bold text-[11px] bg-white text-slate-900 flex items-center">
          <span className="w-20 shrink-0">In Words:</span>
          <span className="font-medium text-slate-800">{numberToIndianWords(finalTotal)}</span>
        </div>

        {/* BOTTOM SECTION: Terms & Conditions and Bank Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-x border-b border-black text-[11px]">
          {/* Left: Terms & Conditions */}
          <div className="p-3 border-b md:border-b-0 md:border-r border-black">
            <div className="font-bold text-[#850E24] mb-1">
              Terms & Conditions:
            </div>
            <div className="text-slate-800 leading-snug">
              {quotation.paymentTerms || 'Payment Terms will be Net 7 days after Invoice date'}
            </div>
            {quotation.notes && (
              <div className="text-slate-600 mt-2 text-[10px] leading-snug">
                {quotation.notes}
              </div>
            )}
          </div>

          {/* Right: Bank Details Box */}
          <div className="p-3 bg-white">
            <div className="font-bold text-slate-900">
              TAASKMATE
            </div>
            <div className="font-bold text-slate-900 mb-1">
              BANK DETAILS
            </div>
            <div className="space-y-0.5 text-slate-800">
              <div>BANK ACCOUNT NUMBER : </div>
              <div>BANK IFSC CODE: </div>
              <div>BANK NAME: Bank OF Baroda</div>
              <div>BRANCH NAME: Nagole Branch</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
