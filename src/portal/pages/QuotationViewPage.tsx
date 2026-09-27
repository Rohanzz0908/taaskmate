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
  AlertCircle,
  Lock,
  ChevronDown,
  Check,
  X,
  Clock,
  Send,
  XCircle,
  Wrench,
  FileText,
  RefreshCw,
  ArrowRight
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
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<QuotationStatus>('Draft');
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

  const isCompleted = quotation?.status === 'Completed' || (quotation?.status as string) === 'Approved';

  const handleStatusUpdate = (newStatus: QuotationStatus) => {
    if (!quotation) return;
    db.updateQuotationStatus(quotation.quotationId || quotation.transactionId, newStatus);
    setQuotation({ ...quotation, status: newStatus });
    showToast('success', `Status updated to ${newStatus}`);
    setIsStatusModalOpen(false);
  };

  const handleSyncDownstream = () => {
    const tid = quotation?.quotationId || quotation?.transactionId || id;
    if (!tid) return;
    const synced = db.syncTransactionFromQuotation(tid);
    if (!synced) {
      showToast('error', 'No quotation found to sync.');
      return;
    }
    showToast('success', 'Synchronized latest quotation items & pricing to Service Report and Invoice!');
  };

  const openStatusModal = () => {
    if (!quotation) return;
    const normalized = (quotation.status as string) === 'Approved' ? 'Completed' : quotation.status;
    setSelectedStatus(normalized);
    setIsStatusModalOpen(true);
  };

  // GST Mode & Calculations
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

  // Format ID for display
  const displayQuoteId = quotation.quotationId || quotation.transactionId;
  const client = quotation.clientSnapshot;
  const clientMaster = client.clientId ? db.getClientById(client.clientId) : undefined;
  const location = client.serviceLocation?.trim() || clientMaster?.serviceLocation?.trim() || (client.address ? client.address.split(',')[0].trim() : 'AS Rao Nagar');
  const sacCode = quotation.sacCode?.trim() || 'N/A';

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
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
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

        {/* Action Controls: Update Status + Hub + Edit + PDF + XLSX + Print */}
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 w-full lg:w-auto justify-end shrink-0">
          {/* Update Status Button */}
          <button
            onClick={openStatusModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-2xs hover:border-[#00C878] hover:text-[#00C878] transition-all cursor-pointer whitespace-nowrap"
            title="Click to shift quotation status"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#00C878]" />
            <span>Update Status</span>
          </button>

          <Link
            to={`/portal/transaction/${displayQuoteId}`}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors whitespace-nowrap"
          >
            Hub
          </Link>

          {/* Edit Button */}
          <button
            onClick={() => navigate(`/portal/quotation/edit/${displayQuoteId}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          {/* DOWNLOAD PDF BUTTON */}
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloadingPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#850E24] hover:bg-[#6e0a1c] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
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
            <span>Download XLSX</span>
          </button>

          {/* PRINT BUTTON */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
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
        className="print-quotation-outer bg-white text-black border-[1.5px] border-black shadow-lg font-sans text-xs leading-normal mx-auto"
        style={{ 
          width: '800px', 
          maxWidth: '100%', 
          boxSizing: 'border-box',
          padding: '24px',
          fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif' 
        }}
      >
        
        {/* HEADER SECTION: Centered Logo & Company Details */}
        <div style={{ textAlign: 'center', width: '100%', paddingBottom: '12px' }}>
          <div style={{ textAlign: 'center', width: '100%', marginBottom: '6px' }}>
            <img 
              src="/taaskmate-logo.png" 
              alt="Taaskmate" 
              style={{ display: 'inline-block', margin: '0 auto', maxHeight: '48px', height: '48px', width: 'auto' }}
              onError={(e) => {
                // Fallback to jpg if png not available
                (e.target as HTMLImageElement).src = '/taaskmate-logo.jpg';
              }}
            />
          </div>
          <div style={{ textAlign: 'center', fontSize: '12px', color: '#1e293b', fontWeight: 500, lineHeight: 1.4 }}>
            12-1-7/91, Sai Raghavendra Colony, Muttuguda, Bandlaguda, Nagole, Hyderabad, 500068
          </div>
          <div style={{ textAlign: 'center', fontSize: '12px', color: '#1e293b', fontWeight: 500, lineHeight: 1.4, marginTop: '2px' }}>
            sudhir@taaskmate.in
          </div>
          <div style={{ textAlign: 'center', fontSize: '12px', color: '#0f172a', fontWeight: 'bold', lineHeight: 1.4, marginTop: '2px' }}>
            GSTIN: 
          </div>
        </div>

        {/* QUOTATION BANNER */}
        <div 
          className="quotation-maroon-bg"
          style={{ 
            backgroundColor: '#850E24', 
            color: '#ffffff', 
            textAlign: 'center', 
            padding: '7px 0', 
            fontWeight: 'bold', 
            fontSize: '13px', 
            letterSpacing: '0.05em', 
            textTransform: 'uppercase', 
            width: '100%', 
            border: '1px solid #000000', 
            boxSizing: 'border-box',
            lineHeight: 1.3
          }}
        >
          QUOTATION
        </div>

        {/* 4-COLUMN META TABLE */}
        <table 
          style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            borderLeft: '1px solid #000000', 
            borderRight: '1px solid #000000', 
            borderBottom: '1px solid #000000', 
            fontSize: '12px', 
            tableLayout: 'fixed', 
            boxSizing: 'border-box' 
          }}
        >
          <colgroup>
            <col style={{ width: '20%' }} />
            <col style={{ width: '30%' }} />
            <col style={{ width: '25%' }} />
            <col style={{ width: '25%' }} />
          </colgroup>
          <tbody>
            <tr style={{ borderBottom: '1px solid #000000', height: '32px' }}>
              <td style={{ width: '20%', padding: '6px 12px', fontWeight: 'bold', borderRight: '1px solid #000000', textAlign: 'left', verticalAlign: 'middle' }}>
                Quotation Number:
              </td>
              <td style={{ width: '30%', padding: '6px 12px', fontWeight: 'bold', borderRight: '1px solid #000000', textAlign: 'center', verticalAlign: 'middle' }}>
                {displayQuoteId}
              </td>
              <td style={{ width: '25%', padding: '6px 12px', fontWeight: 'bold', borderRight: '1px solid #000000', textAlign: 'center', verticalAlign: 'middle' }}>
                Quotation Validity
              </td>
              <td style={{ width: '25%', padding: '6px 12px', fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle' }}>
                {formatQuotationDate(quotation.validUntil)}
              </td>
            </tr>
            <tr style={{ height: '32px' }}>
              <td style={{ width: '20%', padding: '6px 12px', fontWeight: 'bold', borderRight: '1px solid #000000', textAlign: 'center', verticalAlign: 'middle' }}>
                Date:
              </td>
              <td style={{ width: '30%', padding: '6px 12px', fontWeight: 'bold', borderRight: '1px solid #000000', textAlign: 'center', verticalAlign: 'middle' }}>
                {formatQuotationDate(quotation.quotationDate)}
              </td>
              <td style={{ width: '25%', padding: '6px 12px', fontWeight: 'bold', borderRight: '1px solid #000000', textAlign: 'center', verticalAlign: 'middle' }}>
                Location
              </td>
              <td style={{ width: '25%', padding: '6px 12px', fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle' }}>
                {location}
              </td>
            </tr>
          </tbody>
        </table>

        {/* QUOTATION TO BANNER */}
        <div 
          className="quotation-maroon-bg"
          style={{ 
            backgroundColor: '#850E24', 
            color: '#ffffff', 
            textAlign: 'center', 
            padding: '7px 0', 
            fontWeight: 'bold', 
            fontSize: '13px', 
            width: '100%', 
            borderLeft: '1px solid #000000', 
            borderRight: '1px solid #000000', 
            borderBottom: '1px solid #000000', 
            boxSizing: 'border-box',
            lineHeight: 1.3
          }}
        >
          Quotation To
        </div>

        {/* CLIENT DETAILS TABLE */}
        <table 
          style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            borderLeft: '1px solid #000000', 
            borderRight: '1px solid #000000', 
            borderBottom: '1px solid #000000', 
            fontSize: '12px', 
            tableLayout: 'fixed', 
            boxSizing: 'border-box' 
          }}
        >
          <colgroup>
            <col style={{ width: '20%' }} />
            <col style={{ width: '80%' }} />
          </colgroup>
          <tbody>
            <tr style={{ borderBottom: '1px solid #000000', height: '30px' }}>
              <td style={{ width: '20%', padding: '6px 12px', fontWeight: 'bold', borderRight: '1px solid #000000', textAlign: 'left', verticalAlign: 'middle' }}>NAME</td>
              <td style={{ width: '80%', padding: '6px 12px', fontWeight: 600, color: '#0f172a', textAlign: 'left', verticalAlign: 'middle' }}>
                {client.clientName}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #000000', height: '30px' }}>
              <td style={{ width: '20%', padding: '6px 12px', fontWeight: 'bold', borderRight: '1px solid #000000', textAlign: 'left', verticalAlign: 'middle' }}>Address</td>
              <td style={{ width: '80%', padding: '6px 12px', color: '#1e293b', textAlign: 'left', verticalAlign: 'middle' }}>
                {client.address}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #000000', height: '30px' }}>
              <td style={{ width: '20%', padding: '6px 12px', fontWeight: 'bold', borderRight: '1px solid #000000', textAlign: 'left', verticalAlign: 'middle' }}>E-Mail</td>
              <td style={{ width: '80%', padding: '6px 12px', color: '#1e293b', textAlign: 'left', verticalAlign: 'middle' }}>
                {client.email || '—'}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #000000', height: '30px' }}>
              <td style={{ width: '20%', padding: '6px 12px', fontWeight: 'bold', borderRight: '1px solid #000000', textAlign: 'left', verticalAlign: 'middle' }}>GSTIN</td>
              <td style={{ width: '80%', padding: '6px 12px', fontWeight: 600, textAlign: 'left', verticalAlign: 'middle' }}>
                {client.gstin || 'NA'}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #000000', height: '30px' }}>
              <td style={{ width: '20%', padding: '6px 12px', fontWeight: 'bold', borderRight: '1px solid #000000', textAlign: 'left', verticalAlign: 'middle' }}>Service Location</td>
              <td style={{ width: '80%', padding: '6px 12px', color: '#1e293b', textAlign: 'left', verticalAlign: 'middle' }}>
                {location}
              </td>
            </tr>
            <tr style={{ height: '30px' }}>
              <td style={{ width: '20%', padding: '6px 12px', fontWeight: 'bold', borderRight: '1px solid #000000', textAlign: 'left', verticalAlign: 'middle' }}>SAC Code</td>
              <td style={{ width: '80%', padding: '6px 12px', color: '#1e293b', fontWeight: 500, textAlign: 'left', verticalAlign: 'middle' }}>
                {sacCode}
              </td>
            </tr>
          </tbody>
        </table>

        {/* MAIN SERVICES ITEMIZED TABLE */}
        <table 
          style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            borderLeft: '1px solid #000000', 
            borderRight: '1px solid #000000', 
            borderBottom: '1px solid #000000', 
            fontSize: '12px', 
            tableLayout: 'fixed', 
            boxSizing: 'border-box' 
          }}
        >
          <colgroup>
            <col style={{ width: '7%' }} />
            <col style={{ width: '45%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '15%' }} />
          </colgroup>
          <thead>
            <tr className="quotation-maroon-bg" style={{ backgroundColor: '#850E24', color: '#ffffff', borderBottom: '1px solid #000000' }}>
              <th style={{ padding: '8px 4px', width: '7%', borderRight: '1px solid #000000', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>S No</th>
              <th style={{ padding: '8px 12px', width: '45%', borderRight: '1px solid #000000', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>Services Details</th>
              <th style={{ padding: '8px 4px', width: '9%', borderRight: '1px solid #000000', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>Qty</th>
              <th style={{ padding: '8px 4px', width: '10%', borderRight: '1px solid #000000', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>Units</th>
              <th style={{ padding: '8px 12px', width: '14%', borderRight: '1px solid #000000', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>Rate</th>
              <th style={{ padding: '8px 12px', width: '15%', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>Base Amount</th>
            </tr>
          </thead>
          <tbody>
            {/* Line Items */}
            {quotation.items.map((item, index) => {
              const qty = Number(item.quantity) || 1;
              const rate = Number(item.rate) || 0;
              const itemBaseAmount = (qty * rate) - (item.discount || 0);

              const desc = item.description || item.materialName || 'Service description';
              const descLines = desc.split('\n').filter(l => l.trim().length > 0);

              return (
                <tr key={item.itemId || index} style={{ borderBottom: '1px solid #000000', minHeight: '34px' }}>
                  <td style={{ padding: '8px 4px', textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #000000', fontWeight: 600 }}>
                    {index + 1}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'left', verticalAlign: 'middle', borderRight: '1px solid #000000' }}>
                    {descLines.length > 0 ? (
                      <div className="space-y-1">
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>
                          {descLines[0]}
                        </div>
                        {descLines.slice(1).map((line, lIdx) => (
                          <div key={lIdx} style={{ color: '#1e293b', paddingLeft: '4px', lineHeight: 1.3 }}>
                            {line.startsWith('•') || line.startsWith('-') || line.startsWith('*') ? line : `• ${line}`}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{desc}</div>
                    )}
                  </td>
                  <td style={{ padding: '8px 4px', textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #000000', fontWeight: 500 }}>
                    {qty}
                  </td>
                  <td style={{ padding: '8px 4px', textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #000000', color: '#1e293b' }}>
                    {item.uom === 'Nos' ? "No's" : (item.uom || 'LS')}
                  </td>
                  <td style={{ padding: '8px 16px', textAlign: 'right', verticalAlign: 'middle', borderRight: '1px solid #000000', fontWeight: 500 }}>
                    {formatCurrencyNumber(rate)}
                  </td>
                  <td style={{ padding: '8px 16px', textAlign: 'right', verticalAlign: 'middle', fontWeight: 600 }}>
                    {formatCurrencyNumber(itemBaseAmount)}
                  </td>
                </tr>
              );
            })}

            {/* Spacer row to preserve visual spacing */}
            <tr style={{ borderBottom: '1px solid #000000', height: '48px' }}>
              <td style={{ borderRight: '1px solid #000000' }}></td>
              <td style={{ borderRight: '1px solid #000000' }}></td>
              <td style={{ borderRight: '1px solid #000000' }}></td>
              <td style={{ borderRight: '1px solid #000000' }}></td>
              <td style={{ borderRight: '1px solid #000000' }}></td>
              <td></td>
            </tr>

            {/* Totals Section */}
            <tr style={{ borderBottom: '1px solid #000000', height: '30px' }}>
              <td colSpan={2} style={{ borderRight: '1px solid #000000', backgroundColor: '#ffffff' }}></td>
              <td colSpan={3} style={{ padding: '6px 16px', textAlign: 'right', verticalAlign: 'middle', fontWeight: 'bold', borderRight: '1px solid #000000', color: '#0f172a' }}>
                Amount Before Tax
              </td>
              <td style={{ padding: '6px 16px', textAlign: 'right', verticalAlign: 'middle', fontWeight: 'bold', color: '#0f172a' }}>
                {formatCurrencyNumber(amountBeforeTax)}
              </td>
            </tr>
            {gstMode === 'CGST_SGST' ? (
              <>
                <tr style={{ borderBottom: '1px solid #000000', height: '28px' }}>
                  <td colSpan={2} style={{ borderRight: '1px solid #000000', backgroundColor: '#ffffff' }}></td>
                  <td colSpan={3} style={{ padding: '5px 16px', textAlign: 'right', verticalAlign: 'middle', color: '#334155', fontWeight: 500, borderRight: '1px solid #000000' }}>
                    Add: CGST @ 9%
                  </td>
                  <td style={{ padding: '5px 16px', textAlign: 'right', verticalAlign: 'middle', color: '#1e293b', fontWeight: 500 }}>
                    {formatCurrencyNumber(cgstAmount)}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #000000', height: '28px' }}>
                  <td colSpan={2} style={{ borderRight: '1px solid #000000', backgroundColor: '#ffffff' }}></td>
                  <td colSpan={3} style={{ padding: '5px 16px', textAlign: 'right', verticalAlign: 'middle', color: '#334155', fontWeight: 500, borderRight: '1px solid #000000' }}>
                    Add: SGST @ 9%
                  </td>
                  <td style={{ padding: '5px 16px', textAlign: 'right', verticalAlign: 'middle', color: '#1e293b', fontWeight: 500 }}>
                    {formatCurrencyNumber(sgstAmount)}
                  </td>
                </tr>
              </>
            ) : (
              <tr style={{ borderBottom: '1px solid #000000', height: '28px' }}>
                <td colSpan={2} style={{ borderRight: '1px solid #000000', backgroundColor: '#ffffff' }}></td>
                <td colSpan={3} style={{ padding: '5px 16px', textAlign: 'right', verticalAlign: 'middle', color: '#334155', fontWeight: 500, borderRight: '1px solid #000000' }}>
                  Add: IGST @ 18%
                </td>
                <td style={{ padding: '5px 16px', textAlign: 'right', verticalAlign: 'middle', color: '#1e293b', fontWeight: 500 }}>
                  {formatCurrencyNumber(igstAmount)}
                </td>
              </tr>
            )}
            <tr style={{ borderBottom: '1px solid #000000', height: '28px' }}>
              <td colSpan={2} style={{ borderRight: '1px solid #000000', backgroundColor: '#ffffff' }}></td>
              <td colSpan={3} style={{ padding: '5px 16px', textAlign: 'right', verticalAlign: 'middle', color: '#334155', fontWeight: 500, borderRight: '1px solid #000000' }}>
                Round off
              </td>
              <td style={{ padding: '5px 16px', textAlign: 'right', verticalAlign: 'middle', color: '#1e293b', fontWeight: 500 }}>
                {roundOffDisplay}
              </td>
            </tr>
            <tr className="quotation-maroon-bg" style={{ backgroundColor: '#850E24', color: '#ffffff', borderTop: '1px solid #000000', height: '36px' }}>
              <td colSpan={2} style={{ borderRight: '1px solid #000000', backgroundColor: '#ffffff' }}></td>
              <td colSpan={3} style={{ padding: '7px 16px', textAlign: 'right', verticalAlign: 'middle', borderRight: '1px solid #000000', color: '#ffffff', fontWeight: 'bold', fontSize: '13px' }}>
                Total Amount
              </td>
              <td style={{ padding: '7px 16px', textAlign: 'right', verticalAlign: 'middle', color: '#ffffff', fontWeight: 'bold', fontSize: '13px' }}>
                {formatCurrencyNumber(finalTotal)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* IN WORDS ROW */}
        <div style={{ borderLeft: '1px solid #000000', borderRight: '1px solid #000000', borderBottom: '1px solid #000000', padding: '8px 12px', fontSize: '12px', backgroundColor: '#ffffff', color: '#0f172a', display: 'block', boxSizing: 'border-box', lineHeight: 1.4 }}>
          <span style={{ fontWeight: 'bold', display: 'inline-block', width: '70px' }}>In Words:</span>
          <span style={{ fontWeight: 600, color: '#1e293b', display: 'inline-block', paddingLeft: '16px' }}>{numberToIndianWords(finalTotal)}</span>
        </div>

        {/* BOTTOM SECTION: Terms & Conditions */}
        <div style={{ borderLeft: '1px solid #000000', borderRight: '1px solid #000000', borderBottom: '1px solid #000000', fontSize: '12px', padding: '14px', backgroundColor: '#ffffff', boxSizing: 'border-box' }}>
          <div style={{ color: '#850E24', fontWeight: 'bold', fontSize: '12.5px', marginBottom: '6px' }}>
            Terms & Conditions:
          </div>
          <div style={{ color: '#1e293b', lineHeight: 1.5 }}>
            {quotation.paymentTerms || '50% mobilization advance along with signed Purchase Order, balance 50% upon successful joint inspection and sign-off within 15 days.'}
          </div>
          {quotation.notes && (
            <div style={{ color: '#475569', marginTop: '8px', fontSize: '11px', lineHeight: 1.4 }}>
              {quotation.notes}
            </div>
          )}
        </div>

      </div>

      {/* STATUS CHANGE POPUP MODAL */}
      {isStatusModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
          onClick={() => setIsStatusModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00C878] flex items-center justify-center border border-emerald-100 shrink-0">
                  <RefreshCw className="w-5 h-5 text-[#00C878]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Update Quotation Status</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="font-mono font-semibold text-slate-700">{displayQuoteId}</span>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">{client.clientName}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Options */}
            <div className="p-5 space-y-3.5">
              <div className="flex items-center justify-between bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-600">
                  Current Status: <span className="font-bold text-slate-900">{quotation.status === 'Approved' ? 'Completed' : quotation.status}</span>
                </div>
                {selectedStatus !== (quotation.status === 'Approved' ? 'Completed' : quotation.status) && (
                  <div className="flex items-center gap-1.5 text-xs text-[#00C878] font-bold">
                    <span>Shifting to</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>{selectedStatus}</span>
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-slate-800">
                  Which status should it shift to?
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Select the target status to transition this quotation to:
                </p>
              </div>

              {/* Status Radio Cards */}
              <div className="space-y-2">
                {/* Draft Option */}
                <div 
                  onClick={() => setSelectedStatus('Draft')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    selectedStatus === 'Draft'
                      ? 'border-amber-400 bg-amber-50/40 ring-2 ring-amber-400/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Shift to Draft</span>
                      {selectedStatus === 'Draft' && <Check className="w-4 h-4 text-amber-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Internal proposal draft. Line items and pricing can be freely modified.
                    </p>
                  </div>
                </div>

                {/* Sent Option */}
                <div 
                  onClick={() => setSelectedStatus('Sent')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    selectedStatus === 'Sent'
                      ? 'border-blue-400 bg-blue-50/40 ring-2 ring-blue-400/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Send className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Shift to Sent</span>
                      {selectedStatus === 'Sent' && <Check className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Delivered to client. Awaiting client review or purchase order acceptance.
                    </p>
                  </div>
                </div>

                {/* Completed Option */}
                <div 
                  onClick={() => setSelectedStatus('Completed')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    selectedStatus === 'Completed'
                      ? 'border-[#00C878] bg-emerald-50/50 ring-2 ring-[#00C878]/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#00C878] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">Shift to Completed</span>
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Enables Workflow
                        </span>
                      </div>
                      {selectedStatus === 'Completed' && <Check className="w-4 h-4 text-[#00C878]" />}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      Accepted & finalized. <span className="font-semibold text-emerald-800">Unlocks Service Report and Tax Invoice creation.</span> Locks quotation against direct edits.
                    </p>
                  </div>
                </div>

                {/* Rejected Option */}
                <div 
                  onClick={() => setSelectedStatus('Rejected')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    selectedStatus === 'Rejected'
                      ? 'border-rose-400 bg-rose-50/40 ring-2 ring-rose-400/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Shift to Rejected</span>
                      {selectedStatus === 'Rejected' && <Check className="w-4 h-4 text-rose-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Declined by client or project cancelled. Downstream reports cannot be issued.
                    </p>
                  </div>
                </div>
              </div>

              {/* Notice */}
              {selectedStatus === 'Completed' ? (
                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00C878] shrink-0 mt-0.5" />
                  <span>
                    Setting to <strong>Completed</strong> will lock this quote from editing and permit creating the field Service Report and GST Invoice.
                  </span>
                </div>
              ) : isCompleted ? (
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Switching back from <strong>Completed</strong> will re-enable quotation editing, but pause Service Report and Invoice creation.
                  </span>
                </div>
              ) : null}
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedStatus)}
                className="px-4 py-2 rounded-lg bg-[#00C878] hover:bg-[#00B069] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Shift to {selectedStatus}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
