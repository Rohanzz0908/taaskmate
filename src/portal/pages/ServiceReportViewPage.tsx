import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Edit3,
  AlertCircle,
  RefreshCw,
  Download,
  FileSpreadsheet,
  Loader2
} from 'lucide-react';
import { db } from '../services/db';
import { QuotationItem } from '../types';
import {
  downloadServiceReportPDF,
  downloadServiceReportXLSX,
  formatReportDate
} from '../utils/serviceReportExport';

export const ServiceReportViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tx, setTx] = useState(id ? db.getTransactionById(id) : undefined);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingXlsx, setIsDownloadingXlsx] = useState(false);

  const transaction = tx || (id ? db.getTransactionById(id) : undefined);
  const serviceReport = transaction?.serviceReport;

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
    showToast('success', 'Service Report synchronized with latest quotation items!');
  };

  const handleDownloadPDF = async () => {
    if (!transaction) return;
    try {
      setIsDownloadingPdf(true);
      await downloadServiceReportPDF('service-report-printable', transaction.transactionId);
      showToast('success', 'Service Report PDF downloaded successfully!');
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
      await downloadServiceReportXLSX(transaction);
      showToast('success', 'Service Report Excel (.xlsx) downloaded successfully!');
    } catch (err) {
      console.error('Failed to export XLSX:', err);
      showToast('error', 'Failed to generate Excel spreadsheet.');
    } finally {
      setIsDownloadingXlsx(false);
    }
  };

  if (!transaction || !serviceReport) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Service Report Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">
          No Service Report has been filed for Transaction ID <span className="font-semibold text-slate-700">{id}</span>.
        </p>
        <Link
          to={`/portal/service-report?tid=${id}`}
          className="px-4 py-2 bg-[#00C878] hover:bg-[#00B069] text-white rounded-lg text-xs font-semibold shadow-sm transition-all inline-block"
        >
          Create Service Report for {id}
        </Link>
      </div>
    );
  }

  const { clientSnapshot, quotation } = transaction;

  // Determine items to display: prioritize latest quotation items to stay in sync, then materialsUsed, then fallback
  const items: QuotationItem[] = (quotation?.items && quotation.items.length > 0)
    ? quotation.items
    : (serviceReport.materialsUsed && serviceReport.materialsUsed.length > 0)
      ? serviceReport.materialsUsed
      : [
        {
          itemId: 'item-1',
          categoryId: 'CAT-0001',
          materialName: serviceReport.serviceType || 'General Facility Maintenance',
          description: serviceReport.serviceType || 'General Facility Maintenance',
          uom: 'Nos',
          quantity: 1,
          rate: 0,
          discount: 0,
          taxPercent: 18,
          taxAmount: 0,
          amount: 0,
          purpose: serviceReport.workDescription
        }
      ];

  // Determine category name
  const categoryName = (items[0]?.description || items[0]?.materialName) ||
    serviceReport.serviceType ||
    'Carpentry Service';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Print Specific CSS for full-size single A4 page */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm;
          }
          html, body, #root, .min-h-screen, main {
            background-color: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print, nav, aside, header, .portal-sidebar, .portal-topbar {
            display: none !important;
          }
          .print-service-report-outer {
            border: 2px solid #000000 !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: 283mm !important;
            min-height: 283mm !important;
            max-height: 283mm !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
          }
          .sr-maroon-bg {
            background-color: #801426 !important;
            color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl transition-all duration-200 border ${toast.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Screen Action Bar (Hidden in Print) */}
      <div className="no-print flex flex-col lg:flex-row items-center justify-between gap-4 bg-white px-5 py-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 w-full lg:w-auto shrink-0">
          <button
            onClick={() => navigate('/portal/service-reports')}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Back to Service Reports list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm font-mono">
                Job Card: {transaction.transactionId}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {serviceReport.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Execution Date: {formatReportDate(serviceReport.serviceDate)}</p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 w-full lg:w-auto justify-end shrink-0">
          {transaction.quotation && (
            <button
              onClick={handleSyncFromQuotation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
              title="Click to refresh service report items with latest quotation items"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
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
            to={`/portal/service-report?tid=${transaction.transactionId}&edit=true`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors whitespace-nowrap"
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
            title="Print via Browser"
          >
            <Printer className="w-3.5 h-3.5 text-[#00C878]" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXACT REFERENCE LAYOUT SERVICE REPORT CONTAINER                          */}
      {/* Matches user's template: Centered Logo, Maroon Banner, 4-Col Scope Table   */}
      {/* ========================================================================= */}
      <div
        id="service-report-printable"
        className="print-service-report-outer bg-white text-black border-2 border-black p-0 shadow-md font-sans text-xs leading-tight flex flex-col mx-auto"
        style={{ minHeight: '280mm', height: '280mm', width: '100%', maxWidth: '820px' }}
      >

        {/* TOP SECTION: COMPANY HEADER WITH LOGO */}
        <div className="flex-none">
          <div className="flex flex-col items-center justify-center text-center pb-2 pt-2 px-4">
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
            <div className="text-[11px] text-slate-800 font-medium leading-tight">
              12-1-7/91, Sai Raghavendra Colony, Muttuguda, Bandlaguda, Nagole, Hyderabad, 500068
            </div>
            <div className="text-[11px] font-bold text-slate-900 mt-0.5">
              GSTIN:
            </div>
          </div>

          {/* SERVICE REPORT MAROON TITLE BAR */}
          <div className="bg-[#801426] text-white text-center py-1.5 border-t border-b border-black font-bold text-xs uppercase tracking-wider sr-maroon-bg">
            Service Report
          </div>

          {/* TWO-COLUMN DETAILS TABLE: CLIENT & SERVICE DETAILS */}
          <table className="w-full border-collapse border-b border-black text-[11px]">
            <tbody>
              <tr className="border-b border-black">
                <td className="w-28 py-1.5 px-2 font-bold border-r border-black align-top">Name</td>
                <td className="w-[45%] py-1.5 px-2 font-bold border-r border-black align-top text-slate-900">
                  {clientSnapshot.clientName}
                </td>
                <td className="w-36 py-1.5 px-2 font-bold border-r border-black align-top">Quotation Number</td>
                <td className="py-1.5 px-2 font-mono font-bold align-top text-slate-900">
                  {transaction.transactionId}
                </td>
              </tr>

              <tr className="border-b border-black">
                <td className="py-1.5 px-2 font-bold border-r border-black align-top">Address</td>
                <td className="py-1.5 px-2 border-r border-black align-top leading-tight text-slate-800">
                  {clientSnapshot.address}
                </td>
                <td className="py-1.5 px-2 font-bold border-r border-black align-top">Service Date</td>
                <td className="py-1.5 px-2 align-top text-slate-900 font-medium">
                  {formatReportDate(serviceReport.serviceDate)}
                </td>
              </tr>

              <tr className="border-b border-black">
                <td className="py-1.5 px-2 font-bold border-r border-black align-top">E-Mail</td>
                <td className="py-1.5 px-2 border-r border-black align-top text-slate-800">
                  {clientSnapshot.email || '—'}
                </td>
                <td className="py-1.5 px-2 border-r border-black"></td>
                <td className="py-1.5 px-2"></td>
              </tr>

              <tr className="border-b border-black">
                <td className="py-1.5 px-2 font-bold border-r border-black align-top">GSTIN</td>
                <td className="py-1.5 px-2 font-mono font-bold border-r border-black align-top text-slate-900">
                  {clientSnapshot.gstin || 'Na'}
                </td>
                <td className="py-1.5 px-2 border-r border-black"></td>
                <td className="py-1.5 px-2"></td>
              </tr>

              <tr>
                <td className="py-1.5 px-2 font-bold border-r border-black align-top">Service Location</td>
                <td className="py-1.5 px-2 border-r border-black align-top text-slate-800">
                  {clientSnapshot.serviceLocation || serviceReport.location || clientSnapshot.address}
                </td>
                <td className="py-1.5 px-2 border-r border-black"></td>
                <td className="py-1.5 px-2"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* MIDDLE SECTION: MAIN ITEMIZED SCOPE TABLE (Expands to fill vertical height) */}
        <div className="flex-1 flex flex-col min-h-0 w-full">
          <table className="w-full h-full flex-1 border-collapse border-b border-black text-[11px]">
            <thead>
              <tr className="bg-[#801426] text-white font-bold border-b border-black sr-maroon-bg">
                <th className="py-1.5 px-2 w-14 text-center border-r border-black">S.No</th>
                <th className="py-1.5 px-3 text-left border-r border-black">Description</th>
                <th className="py-1.5 px-3 w-20 text-center border-r border-black">Qty</th>
                <th className="py-1.5 px-3 w-24 text-center">Units</th>
              </tr>
            </thead>
            <tbody>
              {/* Category Subheading Row */}
              <tr className="border-b border-black bg-slate-50/70 font-bold">
                <td colSpan={4} className="py-1 px-3 text-slate-900 text-xs">
                  {categoryName} :
                </td>
              </tr>

              {/* Line Items */}
              {items.map((item, index) => (
                <tr key={item.itemId || index} className="border-b border-black align-top">
                  <td className="py-2.5 px-2 text-center border-r border-black font-semibold text-slate-800">
                    {index + 1}
                  </td>
                  <td className="py-2.5 px-3 border-r border-black">
                    <div className="font-semibold text-slate-900">
                      {item.description || item.materialName}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center border-r border-black font-semibold text-slate-900">
                    {item.quantity}
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-800">
                    {item.uom === 'Nos' ? "No's" : item.uom}
                  </td>
                </tr>
              ))}

              {/* Dynamic Spacer row that stretches all the way down to the signature box */}
              <tr className="align-top" style={{ height: '100%' }}>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* BOTTOM SECTION: DUAL SIGN-OFF & STAMP BOX (Pinned at bottom) */}
        <div className="flex-none text-[11px]">
          {/* Signatory Headers (50% / 50%) */}
          <div className="flex border-b border-black font-bold">
            <div className="w-1/2 py-1.5 px-3 text-center border-r border-black text-slate-900">
              Taaskmate
            </div>
            <div className="w-1/2 py-1.5 px-3 text-center text-slate-900">
              {clientSnapshot.clientName}
            </div>
          </div>

          {/* Blank Stamp and Signature Area */}
          <div className="flex">
            {/* Left Box (Taaskmate) */}
            <div className="w-1/2 h-24 print:h-20 border-r border-black relative p-2 flex flex-col justify-end items-center">
              <div className="font-bold text-slate-800 text-center text-[10px] print:text-[9px]">
                Stamp & Signature
              </div>
            </div>

            {/* Right Box (Client) */}
            <div className="w-1/2 h-24 print:h-20 relative p-2 flex flex-col justify-end items-center">
              <div className="font-bold text-slate-800 text-center text-[10px] print:text-[9px]">
                Stamp & Signature
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
