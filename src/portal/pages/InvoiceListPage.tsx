import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Receipt, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ArrowUpRight,
  AlertCircle,
  FileSpreadsheet,
  Edit3,
  Printer,
  Copy,
  FileText
} from 'lucide-react';
import { db, formatINR } from '../services/db';
import { MasterTransaction } from '../types';
import { downloadInvoiceXLSX } from '../utils/invoiceExport';

export const InvoiceListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [refreshKey, setRefreshKey] = useState(0);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    tx: MasterTransaction;
  } | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('success', `Copied "${text}" to clipboard.`);
  };

  const handleContextMenu = (e: React.MouseEvent, tx: MasterTransaction) => {
    e.preventDefault();
    const menuWidth = 260;
    const menuHeight = 380;
    const x = e.clientX + menuWidth > window.innerWidth ? window.innerWidth - menuWidth - 12 : e.clientX;
    const y = e.clientY + menuHeight > window.innerHeight ? window.innerHeight - menuHeight - 12 : e.clientY;
    setContextMenu({ x, y, tx });
  };

  // Close context menu on outside click, escape, or scroll
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
      }
    };
    const handleScroll = () => {
      if (contextMenu) setContextMenu(null);
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [contextMenu]);

  // Format date helper: strictly DD-MM-YYYY
  const formatDateDMY = (dateStr?: string) => {
    if (!dateStr) return '—';
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, y, m, d] = match;
      return `${d}-${m}-${y}`;
    }
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      return dateStr;
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    }
    return dateStr;
  };

  const transactions = useMemo(() => {
    return db.getTransactions().filter(t => !!t.invoice);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const filteredInvoices = useMemo(() => {
    return transactions.filter(t => {
      const inv = t.invoice!;
      const matchesSearch = 
        (inv.invoiceId && inv.invoiceId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        t.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.clientSnapshot.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.payment.referenceNumber && inv.payment.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'All' || inv.payment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchTerm, statusFilter]);

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3 h-3" /> Paid</span>;
      case 'Partial':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3 h-3" /> Partially Paid</span>;
      case 'Pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"><AlertCircle className="w-3 h-3" /> Payment Due</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all transform animate-in fade-in slide-in-from-top-2 ${
          toast.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
            : 'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200/50">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Tax Invoices</h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {transactions.length} Total
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              GST compliant tax invoices (e.g. TMI2600001) linked to Quotations with real-time settlement tracking. Right-click any row for quick actions.
            </p>
          </div>
        </div>

        <Link
          to="/portal/invoice"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00C878] hover:bg-[#00B069] text-white font-semibold text-xs shadow-xs transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Invoice</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Invoice ID (e.g. TMI2600001), Quotation ID, Client, or Reference No..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-white focus:ring-2 focus:ring-purple-500 outline-none"
          >
            <option value="All">All Payment Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partially Paid</option>
            <option value="Pending">Payment Due</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Invoice ID</th>
                <th className="py-3 px-3">Quotation ID</th>
                <th className="py-3 px-4">Client Name</th>
                <th className="py-3 px-3">Invoice Date</th>
                <th className="py-3 px-3">Due Date</th>
                <th className="py-3 px-3 text-right">Grand Total</th>
                <th className="py-3 px-3 text-right">Balance Due</th>
                <th className="py-3 px-3 text-center">Settlement Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((t) => {
                  const inv = t.invoice!;
                  return (
                    <tr 
                      key={t.transactionId} 
                      onContextMenu={(e) => handleContextMenu(e, t)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-purple-700 whitespace-nowrap">
                        <Link 
                          to={`/portal/invoice/${t.transactionId}`}
                          className="text-purple-700 hover:text-purple-900 flex items-center gap-1 group"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-mono font-bold">
                            {inv.invoiceId || 'Issued'}
                          </span>
                          <ArrowUpRight className="w-3 h-3 text-purple-400 group-hover:text-purple-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </td>

                      <td className="py-3 px-3 font-mono font-semibold text-slate-700 whitespace-nowrap">
                        <Link 
                          to={`/portal/transaction/${t.transactionId}`}
                          className="hover:text-purple-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {t.transactionId}
                        </Link>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{t.clientSnapshot.clientName}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[200px]">{t.clientSnapshot.gstin || 'Unregistered'}</div>
                      </td>

                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium text-slate-700">{formatDateDMY(inv.invoiceDate)}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        <span className="font-medium text-slate-700">{formatDateDMY(inv.dueDate)}</span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {formatINR(inv.grandTotal)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-semibold whitespace-nowrap">
                        <span className={inv.payment.balanceDue > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                          {formatINR(inv.payment.balanceDue)}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {getPaymentBadge(inv.payment.status)}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/portal/invoice/${t.transactionId}`}
                            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-slate-100 rounded-md transition-colors"
                            title="View Printable Commercial Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/portal/invoice?tid=${t.transactionId}&edit=true`}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                            title="Edit Commercial Invoice"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/portal/transaction/${t.transactionId}`}
                            className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                          >
                            Hub
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs">No invoices found matching criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Context Menu */}
      {contextMenu && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 w-64 bg-white rounded-xl shadow-2xl border border-slate-200/90 py-1.5 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100 select-none overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-purple-700">{contextMenu.tx.invoice?.invoiceId || 'Invoice'}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                contextMenu.tx.invoice?.payment.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                contextMenu.tx.invoice?.payment.status === 'Partial' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {contextMenu.tx.invoice?.payment.status === 'Paid' ? 'Paid' : contextMenu.tx.invoice?.payment.status === 'Partial' ? 'Partial' : 'Due'}
              </span>
            </div>
            <div className="text-[11px] text-slate-600 font-medium truncate mt-0.5" title={contextMenu.tx.clientSnapshot.clientName}>
              {contextMenu.tx.clientSnapshot.clientName}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              Total: {formatINR(contextMenu.tx.invoice?.grandTotal || 0)} • Due: {formatDateDMY(contextMenu.tx.invoice?.dueDate)}
            </div>
          </div>

          <div className="p-1 space-y-0.5">
            {/* View Printable Invoice */}
            <button
              onClick={() => {
                navigate(`/portal/invoice/${contextMenu.tx.transactionId}`);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-purple-50 hover:text-purple-800 transition-colors cursor-pointer group"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600" />
              <div className="flex-1 flex items-center justify-between">
                <span className="font-semibold text-slate-800 group-hover:text-purple-800">View Tax Invoice</span>
                <span className="text-[10px] text-slate-400 font-normal">Print View</span>
              </div>
            </button>

            {/* Print / Download PDF */}
            <button
              onClick={() => {
                navigate(`/portal/invoice/${contextMenu.tx.transactionId}?print=true`);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-blue-50 hover:text-blue-800 transition-colors cursor-pointer group"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
              <span>Print / Download PDF</span>
            </button>

            {/* Edit Invoice */}
            <button
              onClick={() => {
                navigate(`/portal/invoice?tid=${contextMenu.tx.transactionId}&edit=true`);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-amber-50 hover:text-amber-800 transition-colors cursor-pointer group"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
              <span>Edit Invoice</span>
            </button>

            {/* Record / Manage Settlement */}
            <button
              onClick={() => {
                navigate(`/portal/transaction/${contextMenu.tx.transactionId}?payment=true`);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-emerald-50 hover:text-emerald-800 transition-colors cursor-pointer group"
            >
              <CreditCard className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
              <span>Record Payment / Settlement</span>
            </button>

            {/* Export as Excel in context menu */}
            <button
              onClick={() => {
                downloadInvoiceXLSX(contextMenu.tx);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-emerald-50 hover:text-emerald-800 transition-colors cursor-pointer group"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700" />
              <span>Export as Excel (.xlsx)</span>
            </button>

            <div className="h-px bg-slate-100 my-1" />

            {/* Transaction Hub */}
            <button
              onClick={() => {
                navigate(`/portal/transaction/${contextMenu.tx.transactionId}`);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer group"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
              <span>Open Transaction Hub</span>
            </button>

            {/* Linked Quotation */}
            <button
              onClick={() => {
                navigate(`/portal/quotation/${contextMenu.tx.transactionId}`);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer group"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
              <span>View Linked Quotation</span>
            </button>

            <div className="h-px bg-slate-100 my-1" />

            {/* Copy Invoice ID */}
            {contextMenu.tx.invoice?.invoiceId && (
              <button
                onClick={() => {
                  copyToClipboard(contextMenu.tx.invoice!.invoiceId);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer group"
              >
                <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
                <span>Copy Invoice ID ({contextMenu.tx.invoice.invoiceId})</span>
              </button>
            )}

            {/* Copy Quotation ID */}
            <button
              onClick={() => {
                copyToClipboard(contextMenu.tx.transactionId);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer group"
            >
              <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
              <span>Copy Quotation ID</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
