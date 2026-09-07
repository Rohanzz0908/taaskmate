import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  Printer, 
  ArrowLeft, 
  Edit2, 
  Eye
} from 'lucide-react';
import { Quotation, QuotationStatus } from '../types';
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

// Convert number to Indian currency words
function numberToIndianWords(num: number): string {
  if (!num || isNaN(num)) return 'Zero Rupees Only';

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

  return (result.trim() + ' Rupees Only');
}

export const QuotationViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState<Quotation | null>(null);

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
  };

  // Determine Primary Category
  const categories = db.getCategories();
  const firstCategoryName = quotation.items[0] 
    ? (categories.find(c => c.categoryId === quotation.items[0].categoryId)?.categoryName || 'General Maintenance')
    : 'Electrical';

  // Subtotal before tax
  const totalBeforeTax = quotation.subtotal - (quotation.totalDiscount || 0);

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
          .print-quotation-outer {
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
            onClick={() => navigate('/portal/quotations')}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Back to Quotation list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm font-mono">
                {quotation.transactionId || quotation.quotationId}
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
            <p className="text-[11px] text-slate-400">Date: {formatRefDate(quotation.quotationDate)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={quotation.status}
            onChange={(e) => handleStatusUpdate(e.target.value as QuotationStatus)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#00C878] cursor-pointer"
          >
            <option value="Draft">Status: Draft</option>
            <option value="Sent">Status: Sent</option>
            <option value="Approved">Status: Approved</option>
            <option value="Rejected">Status: Rejected</option>
            <option value="Expired">Status: Expired</option>
          </select>

          <Link
            to={`/portal/transaction/${quotation.transactionId || quotation.quotationId}`}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            Transaction Hub
          </Link>

          <button
            onClick={() => navigate(`/portal/quotation/edit/${quotation.transactionId || quotation.quotationId}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#00C878]" />
            <span>Print Quotation</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXACT REFERENCE LAYOUT PRINT CONTAINER                                   */}
      {/* ========================================================================= */}
      <div 
        className="print-quotation-outer bg-white text-black border-2 border-black p-0 shadow-md font-sans text-xs leading-tight flex flex-col"
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

          {/* TWO-COLUMN DETAILS TABLE: QUOTATION TO & QUOTATION DETAILS */}
          <table className="w-full border-collapse border-b border-black text-[11px]">
            <thead>
              <tr className="bg-[#F7E1A0] text-slate-900 font-bold border-b border-black">
                <th colSpan={2} className="py-1.5 px-2 border-r border-black text-center uppercase tracking-wide">
                  Quotation To
                </th>
                <th colSpan={2} className="py-1.5 px-2 text-center uppercase tracking-wide">
                  Quotation Details
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-black">
                <td className="w-24 py-1.5 px-2 font-bold border-r border-black align-top">Name</td>
                <td className="w-[38%] py-1.5 px-2 font-bold uppercase border-r border-black align-top text-slate-900">
                  {quotation.clientSnapshot.clientName}
                </td>
                <td className="w-36 py-1.5 px-2 font-bold border-r border-black align-top">Quotation Number</td>
                <td className="py-1.5 px-2 font-mono font-bold align-top text-slate-900">
                  {quotation.transactionId || quotation.quotationId}
                </td>
              </tr>

              <tr className="border-b border-black">
                <td className="py-1.5 px-2 font-bold border-r border-black align-top">Billing Address</td>
                <td className="py-1.5 px-2 border-r border-black align-top leading-tight text-slate-800">
                  {quotation.clientSnapshot.address}
                </td>
                <td className="py-1.5 px-2 font-bold border-r border-black align-top">Date</td>
                <td className="py-1.5 px-2 align-top text-slate-900 font-medium">
                  {formatRefDate(quotation.quotationDate)}
                </td>
              </tr>

              <tr className="border-b border-black">
                <td className="py-1.5 px-2 font-bold border-r border-black align-top">E-Mail</td>
                <td className="py-1.5 px-2 border-r border-black align-top text-slate-800">
                  {quotation.clientSnapshot.email || '—'}
                </td>
                <td className="py-1.5 px-2 font-bold border-r border-black align-top">Quotation Validity</td>
                <td className="py-1.5 px-2 align-top text-slate-900 font-medium">
                  {formatRefDate(quotation.validUntil)}
                </td>
              </tr>

              <tr className="border-b border-black">
                <td className="py-1.5 px-2 font-bold border-r border-black align-top">GSTIN</td>
                <td className="py-1.5 px-2 font-mono font-bold border-r border-black align-top text-slate-900">
                  {quotation.clientSnapshot.gstin || 'Unregistered'}
                </td>
                <td className="py-1.5 px-2 font-bold border-r border-black align-top">Service Category</td>
                <td className="py-1.5 px-2 align-top font-semibold text-slate-900">
                  {firstCategoryName}
                </td>
              </tr>

              <tr>
                <td className="py-1.5 px-2 font-bold border-r border-black align-top">Service Location</td>
                <td className="py-1.5 px-2 border-r border-black align-top text-slate-800">
                  {quotation.clientSnapshot.address.split(',').slice(-2).join(',').trim() || quotation.clientSnapshot.address}
                </td>
                <td className="py-1.5 px-2 border-r border-black"></td>
                <td className="py-1.5 px-2"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* MIDDLE SECTION: MAIN ITEMIZED ESTIMATE TABLE (Expands to fill vertical space) */}
        <div className="flex-1 flex flex-col min-h-0 w-full">
          <table className="w-full h-full flex-1 border-collapse border-b border-black text-[11px]">
            <thead>
              <tr className="bg-[#F7E1A0] text-slate-900 font-bold border-b border-black">
                <th className="py-1.5 px-2 w-12 text-center border-r border-black">S.No</th>
                <th className="py-1.5 px-3 text-center border-r border-black">Description</th>
                <th className="py-1.5 px-2 w-14 text-center border-r border-black">Qty</th>
                <th className="py-1.5 px-2 w-16 text-center border-r border-black">Units</th>
                <th className="py-1.5 px-3 w-24 text-right border-r border-black">Rate</th>
                <th className="py-1.5 px-3 w-28 text-right">Base Amount</th>
              </tr>
            </thead>
            <tbody>
              {/* Category Subheading Row */}
              <tr className="border-b border-black bg-slate-50/60 font-bold">
                <td colSpan={6} className="py-1 px-2 text-slate-900 text-xs">
                  {firstCategoryName}:
                </td>
              </tr>

              {/* Line Items */}
              {quotation.items.map((item, index) => (
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
                  </td>
                  <td className="py-2.5 px-2 text-center border-r border-black font-semibold text-slate-900">
                    {item.quantity}
                  </td>
                  <td className="py-2.5 px-2 text-center border-r border-black text-slate-800">
                    {item.uom === 'Nos' ? "No's" : item.uom}
                  </td>
                  <td className="py-2.5 px-3 text-right border-r border-black font-mono font-medium text-slate-900">
                    {item.rate.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {((item.quantity * item.rate) - (item.discount || 0)).toFixed(2)}
                  </td>
                </tr>
              ))}

              {/* Dynamic Spacer row that stretches all the way down to the totals */}
              <tr className="border-b border-black align-top" style={{ height: '100%' }}>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td></td>
              </tr>

              {/* TOTAL AMOUNT BEFORE TAX (Gold Row) */}
              <tr className="bg-[#F7E1A0] font-bold text-xs">
                <td colSpan={5} className="py-1.5 px-3 text-right border-r border-black text-slate-900">
                  Total Amount Before Tax
                </td>
                <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-900 text-xs">
                  {totalBeforeTax.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* BOTTOM SECTION: IN WORDS, TERMS & CONDITIONS, ACCEPTANCE BOX (Pinned at bottom) */}
        <div className="flex-none text-[11px]">
          {/* IN WORDS ROW */}
          <div className="border-b border-black p-2 font-bold bg-white text-slate-900">
            <span>IN WORDS : </span>
            <span className="font-semibold">{numberToIndianWords(totalBeforeTax)}</span>
          </div>

          {/* TERMS & CONDITIONS BOX */}
          <div className="border-b border-black p-2 bg-white text-slate-900">
            <div className="font-bold mb-1">
              Terms & Conditions:
            </div>
            <ol className="list-decimal list-inside space-y-0.5 text-slate-800 pl-1 leading-normal">
              <li>If require any extra service at the time of service will be charged extra.</li>
              <li>Payment Should be clear immediately after invoice submission.</li>
              <li>GST will be applicable as per Govt. Norms @18%</li>
              {quotation.paymentTerms && (
                <li>{quotation.paymentTerms}</li>
              )}
              {quotation.notes && (
                <li>{quotation.notes.replace(/\n/g, ' ')}</li>
              )}
            </ol>
          </div>

          {/* DUAL ACCEPTANCE & SIGNATURE BOX */}
          <div>
            <div className="flex border-b border-black font-bold">
              <div className="w-1/2 py-1.5 px-3 text-center border-r border-black text-slate-900">
                Taaskmate Facility Services Pvt Ltd
              </div>
              <div className="w-1/2 py-1.5 px-3 text-center uppercase text-slate-900">
                Client Acceptance & Signatory
              </div>
            </div>

            <div className="flex">
              {/* Left Box: Blank for Stamp & Signature */}
              <div className="w-1/2 h-24 print:h-20 border-r border-black relative p-2 flex flex-col justify-end items-center">
                <div className="font-bold text-slate-900 text-center text-[10px] print:text-[9px]">
                  Stamp & Signature
                </div>
              </div>

              {/* Right Box: Client Acceptance */}
              <div className="w-1/2 h-24 print:h-20 relative p-2 flex flex-col justify-end items-end">
                <div className="font-bold text-slate-900 pr-2 text-[10px] print:text-[9px]">
                  Authorized Signature
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
