import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Printer, 
  Edit3,
  Wrench,
  AlertCircle
} from 'lucide-react';
import { db } from '../services/db';

// Helper to format date as "21-Aug-26" like the reference
function formatRefDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = String(d.getFullYear()).slice(-2);
  
  return `${day}-${month}-${year}`;
}

export const ServiceReportViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const transaction = id ? db.getTransactionById(id) : undefined;
  const serviceReport = transaction?.serviceReport;

  const handlePrint = () => {
    window.print();
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

  // Determine category name
  const categoryName = serviceReport.serviceType || 
    (quotation?.items[0]?.materialName) || 
    'Electrical';

  // Items to display (from serviceReport.materialsUsed or quotation items or fallback)
  const items = (serviceReport.materialsUsed && serviceReport.materialsUsed.length > 0)
    ? serviceReport.materialsUsed
    : (quotation?.items && quotation.items.length > 0)
      ? quotation.items
      : [
          {
            itemId: 'item-1',
            categoryId: 'CAT-0001',
            materialName: serviceReport.serviceType || 'General Facility Maintenance',
            uom: 'Nos' as any,
            quantity: 1,
            rate: 0,
            discount: 0,
            taxPercent: 18,
            taxAmount: 0,
            amount: 0,
            purpose: serviceReport.workDescription
          }
        ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
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
          .table-header-gold {
            background-color: #F7E1A0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Screen Action Bar (Hidden in Print) */}
      <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
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
            <p className="text-[11px] text-slate-400">Date: {formatRefDate(serviceReport.serviceDate)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Link
            to={`/portal/transaction/${transaction.transactionId}`}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            Transaction Hub
          </Link>

          <Link
            to={`/portal/service-report?tid=${transaction.transactionId}&edit=true`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Link>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#00C878]" />
            <span>Print Service Report</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXACT REFERENCE LAYOUT SERVICE REPORT CONTAINER                          */}
      {/* ========================================================================= */}
      <div 
        className="print-service-report-outer bg-white text-black border-2 border-black p-0 shadow-md font-sans text-xs leading-tight flex flex-col"
        style={{ minHeight: '280mm', height: '280mm' }}
      >
        
        {/* TOP SECTION (Fixed Height) */}
        <div className="flex-none">
          {/* TOP HEADER: LOGO BOX & 3-ROW COMPANY INFO */}
          <div className="border-b border-black">
            <div className="flex">
              {/* Logo Box on Left */}
              <div className="w-[22%] border-r border-black flex flex-col items-center justify-center p-3 text-center">
                <div className="w-10 h-10 rounded-lg bg-[#0A1620] flex items-center justify-center text-[#00C878] mb-1">
                  <svg viewBox="0 0 36 36" fill="none" className="w-6 h-6">
                    <path d="M18 3L31 10.5V25.5L18 33L5 25.5V10.5L18 3Z" stroke="#00C878" strokeWidth="2.5" />
                    <path d="M11 18.5L16 23.5L25 13.5" stroke="#00C878" strokeWidth="3" />
                  </svg>
                </div>
                <div className="font-black text-sm tracking-tight text-slate-900 leading-none">
                  TAASK<span className="text-[#00C878]">MATE</span>
                </div>
              </div>

              {/* Right Side: 3 Stacked Horizontal Rows */}
              <div className="flex-1 flex flex-col">
                {/* Row 1: Company Legal Title */}
                <div className="py-2 px-3 text-center border-b border-black">
                  <h1 className="text-base sm:text-lg font-black tracking-wide text-[#1B6E3F] uppercase font-serif">
                    TAASKMATE FACILITY SERVICES PRIVATE LIMITED
                  </h1>
                </div>

                {/* Row 2: Address */}
                <div className="py-1 px-3 text-center border-b border-black text-[11px] text-slate-800 font-medium">
                  GAR 71, 4th Floor, Brookefield, Outer Ring Road, Bengaluru, Karnataka - 560103
                </div>

                {/* Row 3: GSTIN */}
                <div className="py-1 px-3 text-center text-[11px] font-bold text-slate-900 font-mono">
                  GSTIN: 29AAACT9876Q1Z4
                </div>
              </div>
            </div>
          </div>

          {/* SERVICE REPORT TITLE BAR (Yellow #F7E1A0) */}
          <div className="bg-[#F7E1A0] border-b border-black py-1.5 px-4 text-center font-bold text-sm tracking-wide text-slate-900 uppercase">
            Service Report
          </div>

          {/* TWO-COLUMN DETAILS TABLE: CLIENT & JOB DETAILS */}
          <table className="w-full border-collapse border-b border-black text-[11px]">
            <tbody>
              <tr className="border-b border-black">
                <td className="w-28 py-1.5 px-2 font-bold border-r border-black align-top">Name</td>
                <td className="w-[45%] py-1.5 px-2 font-bold uppercase border-r border-black align-top text-slate-900">
                  {clientSnapshot.clientName}
                </td>
                <td className="w-32 py-1.5 px-2 font-bold border-r border-black align-top">Job Card No.</td>
                <td className="py-1.5 px-2 font-mono font-bold align-top text-slate-900">
                  {transaction.transactionId}
                </td>
              </tr>

              <tr className="border-b border-black">
                <td className="py-1.5 px-2 font-bold border-r border-black align-top">Billing Address</td>
                <td className="py-1.5 px-2 border-r border-black align-top leading-tight text-slate-800">
                  {clientSnapshot.address}
                </td>
                <td className="py-1.5 px-2 font-bold border-r border-black align-top">Service Date</td>
                <td className="py-1.5 px-2 align-top text-slate-900 font-medium">
                  {formatRefDate(serviceReport.serviceDate)}
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
                  {clientSnapshot.gstin || 'Unregistered'}
                </td>
                <td className="py-1.5 px-2 border-r border-black"></td>
                <td className="py-1.5 px-2"></td>
              </tr>

              <tr>
                <td className="py-1.5 px-2 font-bold border-r border-black align-top">Service Location</td>
                <td className="py-1.5 px-2 border-r border-black align-top text-slate-800">
                  {serviceReport.location || clientSnapshot.address}
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
              <tr className="bg-[#F7E1A0] text-slate-900 font-bold border-b border-black">
                <th className="py-1.5 px-2 w-12 text-center border-r border-black">S.No</th>
                <th className="py-1.5 px-3 text-center border-r border-black">Description</th>
                <th className="py-1.5 px-2 w-14 text-center border-r border-black"></th>
                <th className="py-1.5 px-2 w-14 text-center border-r border-black"></th>
                <th className="py-1.5 px-3 w-18 text-center border-r border-black">Qty</th>
                <th className="py-1.5 px-3 w-20 text-center">Units</th>
              </tr>
            </thead>
            <tbody>
              {/* Category Subheading Row */}
              <tr className="border-b border-black bg-slate-50/60 font-bold">
                <td colSpan={6} className="py-1 px-2 text-slate-900 text-xs">
                  {categoryName}:
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
                      Service:
                    </div>
                    <div className="text-slate-800 pl-1 mt-0.5 leading-relaxed">
                      * {item.materialName}
                    </div>
                    {item.purpose && (
                      <div className="text-slate-700 pl-1 mt-0.5 leading-relaxed">
                        * {item.purpose}
                      </div>
                    )}
                    {serviceReport.workDescription && index === 0 && !item.purpose && (
                      <div className="text-slate-700 pl-1 mt-0.5 leading-relaxed">
                        * {serviceReport.workDescription}
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-2 border-r border-black"></td>
                  <td className="py-2.5 px-2 border-r border-black"></td>
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
              Taaskmate Facility Services Pvt Ltd
            </div>
            <div className="w-1/2 py-1.5 px-3 text-center uppercase text-slate-900">
              {clientSnapshot.clientName}
            </div>
          </div>

          {/* Blank Stamp and Signature Area */}
          <div className="flex border-b border-black">
            {/* Left Box (Taaskmate) */}
            <div className="w-1/2 h-24 print:h-20 border-r border-black relative p-2 flex flex-col justify-end items-center">
              {/* Left blank for manual stamp & physical signature as requested */}
              <div className="font-bold text-slate-900 text-center text-[10px] print:text-[9px]">
                Stamp & Signature
              </div>
            </div>

            {/* Right Box (Client) */}
            <div className="w-1/2 h-24 print:h-20 relative p-2 flex flex-col justify-end items-end">
              {/* Left blank for manual stamp & physical signature as requested */}
              <div className="font-bold text-slate-900 pr-2 text-[10px] print:text-[9px]">
                Stamp & Signature
              </div>
            </div>
          </div>

          {/* Client Contact Details Footer */}
          <div className="flex">
            <div className="w-1/2 border-r border-black"></div>
            <div className="w-1/2 py-2 px-3 space-y-0.5 text-[11px]">
              <div>
                <span className="font-bold text-slate-900">Contact Name : </span>
                <span className="text-slate-800">{clientSnapshot.contactPerson || '—'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-900">Contact Number : </span>
                <span className="text-slate-800 font-mono">{clientSnapshot.phone || '—'}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
