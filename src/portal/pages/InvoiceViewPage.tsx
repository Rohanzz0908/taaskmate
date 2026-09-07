import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Printer, 
  Receipt, 
  AlertCircle
} from 'lucide-react';
import { db } from '../services/db';

// Helper to format date as "05-Sep-26" like the reference
function formatRefDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = String(d.getFullYear()).slice(-2);
  
  return `${day}-${month}-${year}`;
}

// Convert number to Indian words
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

export const InvoiceViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const transaction = id ? db.getTransactionById(id) : undefined;
  const invoice = transaction?.invoice;

  const handlePrint = () => {
    window.print();
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

  const { clientSnapshot, serviceReport } = transaction;

  // Determine Category Name
  const categories = db.getCategories();
  const firstCategoryName = invoice.items[0] 
    ? (categories.find(c => c.categoryId === invoice.items[0].categoryId)?.categoryName || 'General Maintenance')
    : 'Electrical';

  const subtotalBeforeTax = invoice.subtotal - (invoice.totalDiscount || 0);

  // Bank Account details fallback
  const bank = invoice.bankDetails || {
    bankName: 'HDFC BANK',
    accountName: 'Taaskmate Facility Services Pvt Ltd',
    accountNumber: '50200080913620',
    ifsc: 'HDFC0000418',
    branch: 'Kothapet, Gaddiannaram, HYD'
  };

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
          .print-invoice-outer {
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
            onClick={() => navigate('/portal/invoices')}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Back to Invoices list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm font-mono">
                Invoice: {transaction.transactionId}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                invoice.payment.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                invoice.payment.status === 'Partial' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-purple-50 text-purple-700 border-purple-200'
              }`}>
                {invoice.payment.status.toUpperCase()}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Date: {formatRefDate(invoice.invoiceDate)}</p>
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

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#00C878]" />
            <span>Print Tax Invoice</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXACT REFERENCE LAYOUT INVOICE CONTAINER                                 */}
      {/* ========================================================================= */}
      <div 
        className="print-invoice-outer bg-white text-black border-2 border-black p-0 shadow-md font-sans text-xs leading-tight flex flex-col"
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

          {/* TWO-COLUMN DETAILS TABLE: INVOICE TO & INVOICE DETAILS */}
          <table className="w-full border-collapse border-b border-black text-[11px]">
            <thead>
              <tr className="bg-[#F7E1A0] text-slate-900 font-bold border-b border-black">
                <th colSpan={2} className="py-1.5 px-2 border-r border-black text-center uppercase tracking-wide">
                  Invoice To
                </th>
                <th colSpan={2} className="py-1.5 px-2 text-center uppercase tracking-wide">
                  Invoice Details
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-black">
                <td className="w-28 py-1.5 px-2 font-bold border-r border-black align-top">Name</td>
                <td className="w-[45%] py-1.5 px-2 font-bold uppercase border-r border-black align-top text-slate-900">
                  {clientSnapshot.clientName}
                </td>
                <td className="w-36 py-1.5 px-2 font-bold border-r border-black align-top">Invoice Number</td>
                <td className="py-1.5 px-2 font-mono font-bold align-top text-slate-900">
                  {transaction.transactionId}
                </td>
              </tr>

              <tr className="border-b border-black">
                <td className="py-1.5 px-2 font-bold border-r border-black align-top">Address</td>
                <td className="py-1.5 px-2 border-r border-black align-top leading-tight text-slate-800">
                  {clientSnapshot.address}
                </td>
                <td className="py-1.5 px-2 font-bold border-r border-black align-top">Invoice Date</td>
                <td className="py-1.5 px-2 align-top text-slate-900 font-medium">
                  {formatRefDate(invoice.invoiceDate)}
                </td>
              </tr>

              <tr className="border-b border-black">
                <td className="py-1.5 px-2 font-bold border-r border-black align-top">E-Mail</td>
                <td className="py-1.5 px-2 border-r border-black align-top text-slate-800">
                  {clientSnapshot.email || '—'}
                </td>
                <td className="py-1.5 px-2 font-bold border-r border-black align-top">Quotation Number</td>
                <td className="py-1.5 px-2 font-mono font-bold align-top text-slate-900">
                  {transaction.transactionId}
                </td>
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
                  {serviceReport?.location || clientSnapshot.address}
                </td>
                <td className="py-1.5 px-2 border-r border-black"></td>
                <td className="py-1.5 px-2"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* MIDDLE SECTION: MAIN ITEMIZED SCOPE TABLE (Expands to fill vertical space) */}
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
              {invoice.items.map((item, index) => (
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

              {/* Total Amount Before Tax */}
              <tr className="border-b border-black font-bold">
                <td colSpan={5} className="py-1 px-3 text-right border-r border-black text-slate-900">
                  Total Amount Before Tax
                </td>
                <td className="py-1 px-3 text-right font-mono font-bold text-slate-900">
                  {subtotalBeforeTax.toFixed(2)}
                </td>
              </tr>

              {/* GST Tax Breakdown */}
              {invoice.gstMode === 'CGST_SGST' ? (
                <>
                  <tr className="border-b border-black font-bold">
                    <td colSpan={5} className="py-1 px-3 text-right border-r border-black text-slate-900">
                      CGST @ 9%
                    </td>
                    <td className="py-1 px-3 text-right font-mono font-bold text-slate-900">
                      {invoice.cgst.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="border-b border-black font-bold">
                    <td colSpan={5} className="py-1 px-3 text-right border-r border-black text-slate-900">
                      SGST @ 9%
                    </td>
                    <td className="py-1 px-3 text-right font-mono font-bold text-slate-900">
                      {invoice.sgst.toFixed(2)}
                    </td>
                  </tr>
                </>
              ) : (
                <tr className="border-b border-black font-bold">
                  <td colSpan={5} className="py-1 px-3 text-right border-r border-black text-slate-900">
                    IGST @ 18%
                  </td>
                  <td className="py-1 px-3 text-right font-mono font-bold text-slate-900">
                    {invoice.igst.toFixed(2)}
                  </td>
                </tr>
              )}

              {/* TOTAL AMOUNT (Gold Row) */}
              <tr className="bg-[#F7E1A0] font-bold text-xs">
                <td colSpan={5} className="py-1.5 px-3 text-right border-r border-black text-slate-900">
                  Total Amount
                </td>
                <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-900">
                  {invoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* BOTTOM SECTION: IN WORDS, TERMS & CONDITIONS, SIGN-OFF / BANK DETAILS (Pinned at bottom) */}
        <div className="flex-none text-[11px]">
          {/* IN WORDS ROW */}
          <div className="border-b border-black p-2 font-bold bg-white text-slate-900">
            <span>IN WORDS : </span>
            <span className="font-semibold">{numberToIndianWords(invoice.grandTotal)}</span>
          </div>

          {/* TERMS & CONDITIONS BOX */}
          <div className="border-b border-black p-2 bg-white text-slate-900">
            <div className="font-bold mb-0.5">
              Terms & Conditions:
            </div>
            <div className="text-slate-800">
              Payment should be clear immediately after invoice submission
            </div>
            {invoice.notes && invoice.notes !== 'Payment should be clear immediately after invoice submission' && (
              <div className="text-slate-700 text-[10px] mt-0.5">
                {invoice.notes}
              </div>
            )}
          </div>

          {/* Header Row (50% / 50%) */}
          <div className="flex border-b border-black font-bold">
            <div className="w-1/2 py-1.5 px-3 text-center border-r border-black text-slate-900">
              Taaskmate Facility Services Pvt Ltd
            </div>
            <div className="w-1/2 py-1.5 px-3 text-left pl-4 text-slate-900">
              Taaskmate Bank Account Details
            </div>
          </div>

          {/* Body Row */}
          <div className="flex">
            {/* Left Box: Blank for Stamp & Signature */}
            <div className="w-1/2 h-24 print:h-20 border-r border-black relative p-2 flex flex-col justify-end items-center">
              <div className="font-bold text-slate-900 text-center text-[10px] print:text-[9px]">
                Stamp & Signature
              </div>
            </div>

            {/* Right Box: Bank Details */}
            <div className="w-1/2 p-2 print:p-1.5 space-y-0.5 text-slate-900 leading-tight font-sans text-[10px] print:text-[9.5px]">
              <div>
                <span className="font-bold">Bank Account Number : </span>
                <span className="font-mono font-medium">{bank.accountNumber}</span>
              </div>
              <div>
                <span className="font-bold">Bank IFSC Code: </span>
                <span className="font-mono font-medium">{bank.ifsc}</span>
              </div>
              <div>
                <span className="font-bold">Bank Name: </span>
                <span className="font-bold">{bank.bankName}</span>
              </div>
              <div>
                <span className="font-bold">Branch Address: </span>
                <span>{bank.branch}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
