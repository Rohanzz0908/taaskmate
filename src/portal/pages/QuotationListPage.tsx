import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Eye, 
  Edit2, 
  Trash2, 
  Printer, 
  Download, 
  RefreshCw, 
  Calendar, 
  ArrowUpDown, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Copy,
  ExternalLink,
  Wrench,
  FileText,
  ChevronDown,
  Lock,
  Send,
  XCircle,
  Clock,
  Check,
  ArrowRight
} from 'lucide-react';
import { Quotation, QuotationStatus } from '../types';
import { db, formatINR } from '../services/db';
import { downloadQuotationXLSX, formatQuotationDate } from '../utils/quotationExport';

export const QuotationListPage: React.FC = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Draft' | 'Sent' | 'Completed' | 'Rejected'>('All');
  const [clientFilter, setClientFilter] = useState('All');
  const [sortField, setSortField] = useState<'quotationDate' | 'grandTotal' | 'quotationId'>('quotationDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Status Modal state
  const [quoteForStatusModal, setQuoteForStatusModal] = useState<Quotation | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<QuotationStatus>('Draft');

  const isQuoteCompleted = (quote: Quotation) => {
    return quote.status === 'Completed' || (quote.status as string) === 'Approved';
  };

  const openStatusModal = (quote: Quotation) => {
    setQuoteForStatusModal(quote);
    const normalized = quote.status === 'Approved' ? 'Completed' : quote.status;
    setSelectedStatus(normalized);
  };

  const handleConfirmStatusChange = () => {
    if (!quoteForStatusModal) return;
    db.updateQuotationStatus(quoteForStatusModal.quotationId, selectedStatus);
    showToast('success', `Quotation ${quoteForStatusModal.quotationId} status changed to ${selectedStatus}.`);
    setQuoteForStatusModal(null);
    loadQuotations();
  };

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    quote: Quotation;
  } | null>(null);

  // Delete modal state
  const [quoteToDelete, setQuoteToDelete] = useState<Quotation | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('success', `Copied "${text}" to clipboard.`);
  };

  const handleContextMenu = (e: React.MouseEvent, quote: Quotation) => {
    e.preventDefault();
    const menuWidth = 240;
    const menuHeight = 410;
    const x = e.clientX + menuWidth > window.innerWidth ? window.innerWidth - menuWidth - 12 : e.clientX;
    const y = e.clientY + menuHeight > window.innerHeight ? window.innerHeight - menuHeight - 12 : e.clientY;
    setContextMenu({ x, y, quote });
  };

  const loadQuotations = () => {
    setQuotations(db.getQuotations());
  };

  useEffect(() => {
    loadQuotations();
  }, []);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
        setQuoteToDelete(null);
        setQuoteForStatusModal(null);
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

  // Unique clients for filter dropdown
  const clientOptions = useMemo(() => {
    const map = new Map<string, string>();
    quotations.forEach(q => {
      map.set(q.clientId, q.clientSnapshot.clientName);
    });
    return Array.from(map.entries());
  }, [quotations]);

  const handleDelete = () => {
    if (!quoteToDelete) return;
    const res = db.deleteQuotation(quoteToDelete.quotationId);
    if (res.success) {
      showToast('success', res.message);
      setQuoteToDelete(null);
      loadQuotations();
    } else {
      showToast('error', res.message);
    }
  };

  const handleStatusChange = (id: string, newStatus: QuotationStatus) => {
    db.updateQuotationStatus(id, newStatus);
    showToast('success', `Quotation ${id} marked as ${newStatus}.`);
    loadQuotations();
  };

  const exportCSV = () => {
    const headers = [
      'Quotation ID',
      'Date',
      'Valid Until',
      'Client Name',
      'Client GSTIN',
      'Items Count',
      'Subtotal (INR)',
      'Discount (INR)',
      'Tax (INR)',
      'Grand Total (INR)',
      'Status'
    ];

    const rows = quotations.map(q => [
      q.quotationId,
      formatQuotationDate(q.quotationDate),
      formatQuotationDate(q.validUntil),
      `"${q.clientSnapshot.clientName.replace(/"/g, '""')}"`,
      q.clientSnapshot.gstin,
      q.items.length,
      q.subtotal,
      q.totalDiscount,
      q.totalTax,
      q.grandTotal,
      q.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `taaskmate_quotations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Sort
  const filteredQuotations = useMemo(() => {
    return quotations
      .filter(q => {
        const matchesSearch = 
          q.quotationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.clientSnapshot.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.clientSnapshot.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.clientSnapshot.gstin.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'All' || 
          q.status === statusFilter || 
          (statusFilter === 'Completed' && (q.status as string) === 'Approved');
        const matchesClient = clientFilter === 'All' || q.clientId === clientFilter;

        return matchesSearch && matchesStatus && matchesClient;
      })
      .sort((a, b) => {
        const factor = sortOrder === 'asc' ? 1 : -1;
        if (sortField === 'grandTotal') {
          return factor * (a.grandTotal - b.grandTotal);
        } else if (sortField === 'quotationId') {
          return factor * a.quotationId.localeCompare(b.quotationId);
        } else {
          return factor * a.quotationDate.localeCompare(b.quotationDate);
        }
      });
  }, [quotations, searchTerm, statusFilter, clientFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredQuotations.length / pageSize) || 1;
  const paginatedQuotes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredQuotations.slice(start, start + pageSize);
  }, [filteredQuotations, currentPage, pageSize]);

  return (
    <div className="space-y-5">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl transition-all duration-200 border ${
          toast.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-[#00C878]" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#00C878] flex items-center justify-center shrink-0 border border-emerald-200/50">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Commercial Quotations</h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {quotations.length} Total
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Browse, track client PO statuses, and generate print-ready PDFs. Click any quotation to open view mode, or right-click for quick actions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
            title="Export quotations as CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => navigate('/portal/quotation')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00C878] hover:bg-[#00B069] text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Quotation</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search quote ID, client name, GSTIN..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00C878] focus:border-[#00C878] transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#00C878] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Client Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-500">Client:</span>
            <select
              value={clientFilter}
              onChange={(e) => {
                setClientFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#00C878] max-w-[150px] truncate cursor-pointer"
            >
              <option value="All">All Clients</option>
              {clientOptions.map(([cid, cname]) => (
                <option key={cid} value={cid}>{cname}</option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <button
            onClick={() => {
              if (sortField === 'grandTotal') {
                setSortField('quotationDate');
                setSortOrder('desc');
              } else {
                setSortField('grandTotal');
                setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowUpDown className="w-3 h-3 text-slate-500" />
            <span>
              {sortField === 'grandTotal' ? `Value (${sortOrder.toUpperCase()})` : 'Date (Latest)'}
            </span>
          </button>

          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('All');
              setClientFilter('All');
              loadQuotations();
            }}
            title="Reset filters"
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-[#00C878] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase font-semibold text-slate-500 tracking-wider">
              <tr>
                <th className="py-3 px-4 w-36">Transaction ID</th>
                <th className="py-3 px-4 w-36">Date & Validity</th>
                <th className="py-3 px-4 min-w-[220px]">Client Name</th>
                <th className="py-3 px-3 text-center w-20">Items</th>
                <th className="py-3 px-4 text-right w-32">Grand Total (₹)</th>
                <th className="py-3 px-4 w-28">Status</th>
                <th className="py-3 px-4 text-right w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedQuotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700 text-sm">No quotations found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try resetting filters or generate a new quotation proposal.</p>
                  </td>
                </tr>
              ) : (
                paginatedQuotes.map((quote) => (
                  <tr 
                    key={quote.quotationId} 
                    onClick={() => navigate(`/portal/quotation/${quote.quotationId}`)}
                    onContextMenu={(e) => handleContextMenu(e, quote)}
                    className="hover:bg-emerald-50/30 transition-colors group cursor-pointer"
                    title="Click to open in view mode • Right-click for quick actions"
                  >
                    {/* Quotation ID */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/portal/quotation/${quote.quotationId}`);
                        }}
                        className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 group-hover:bg-emerald-100/70 group-hover:text-[#00C878] px-2 py-0.5 rounded border border-slate-200 transition-colors cursor-pointer"
                      >
                        {quote.quotationId}
                      </button>
                    </td>

                    {/* Dates */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-800">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{formatQuotationDate(quote.quotationDate)}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Valid till: {formatQuotationDate(quote.validUntil)}
                      </div>
                    </td>

                    {/* Client Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 group-hover:text-[#00C878] transition-colors truncate max-w-xs">
                        {quote.clientSnapshot.clientName}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                        Attn: {quote.clientSnapshot.contactPerson}
                      </div>
                    </td>

                    {/* Item count */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                        {quote.items.length} {quote.items.length === 1 ? 'item' : 'items'}
                      </span>
                    </td>

                    {/* Financial Grand Total */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="font-mono font-bold text-xs text-slate-900">
                        {formatINR(quote.grandTotal)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        GST: {formatINR(quote.totalTax)}
                      </div>
                    </td>

                    {/* Status Badge & Update Status Trigger */}
                    <td 
                      className="py-3.5 px-4 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          isQuoteCompleted(quote)
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          quote.status === 'Sent'
                            ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          quote.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isQuoteCompleted(quote) ? 'bg-[#00C878]' :
                            quote.status === 'Sent' ? 'bg-blue-500' :
                            quote.status === 'Rejected' ? 'bg-rose-500' :
                            'bg-amber-500'
                          }`} />
                          <span>{quote.status === 'Approved' ? 'Completed' : quote.status}</span>
                        </span>
                        <button
                          onClick={() => openStatusModal(quote)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-[#00C878] hover:border-emerald-200 border border-slate-200 transition-all cursor-pointer shadow-2xs"
                          title="Click to shift quotation status"
                        >
                          <RefreshCw className="w-3 h-3 text-[#00C878]" />
                          <span>Update Status</span>
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td 
                      className="py-3.5 px-4 whitespace-nowrap text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/portal/quotation/${quote.quotationId}`)}
                          className="p-1 rounded text-slate-400 hover:text-[#00C878] hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="View Quotation (Preview Mode)"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {isQuoteCompleted(quote) ? (
                          <button
                            onClick={() => {
                              showToast('error', `Quotation ${quote.quotationId} is marked as Completed and locked. Change status to Draft or Sent to edit.`);
                              openStatusModal(quote);
                            }}
                            className="p-1 rounded text-slate-300 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Quotation is Completed (Locked) — Change status to edit"
                          >
                            <Lock className="w-3.5 h-3.5 text-amber-500" />
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/portal/quotation/edit/${quote.quotationId}`)}
                            className="p-1 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Edit Quotation"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/portal/transaction/${quote.quotationId}`)}
                          className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                          title="View Quotation Hub"
                        >
                          Hub
                        </button>
                        <button
                          onClick={() => setQuoteToDelete(quote)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Quotation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {filteredQuotations.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded px-2 py-0.5 text-slate-700 focus:outline-none"
              >
                <option value={4}>4</option>
                <option value={6}>6</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
              <span className="ml-1 text-slate-400">
                Showing {Math.min((currentPage - 1) * pageSize + 1, filteredQuotations.length)} - {Math.min(currentPage * pageSize, filteredQuotations.length)} of {filteredQuotations.length} records
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded border border-slate-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-medium transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-6 h-6 rounded text-xs font-semibold transition-colors ${
                    currentPage === page
                      ? 'bg-[#00C878] text-white'
                      : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded border border-slate-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-medium transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {quoteToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-sm p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900">Delete Quotation?</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to delete quotation <span className="font-semibold text-slate-800">"{quoteToDelete.quotationId}"</span> for {quoteToDelete.clientSnapshot.clientName}?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setQuoteToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RIGHT CLICK CONTEXT MENU */}
      {contextMenu && (
        <div 
          className="fixed z-50 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-200 py-1.5 w-60 text-xs font-medium text-slate-700 animate-fadeIn"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50/70 rounded-t-xl">
            <div className="flex items-center justify-between gap-1">
              <span className="font-mono font-bold text-xs text-slate-900">{contextMenu.quote.quotationId}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                contextMenu.quote.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                contextMenu.quote.status === 'Sent' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                contextMenu.quote.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                contextMenu.quote.status === 'Expired' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {contextMenu.quote.status}
              </span>
            </div>
            <div className="text-[11px] text-slate-600 font-medium truncate mt-0.5" title={contextMenu.quote.clientSnapshot.clientName}>
              {contextMenu.quote.clientSnapshot.clientName}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              {formatINR(contextMenu.quote.grandTotal)} • {contextMenu.quote.items.length} {contextMenu.quote.items.length === 1 ? 'item' : 'items'}
            </div>
          </div>

          <div className="p-1 space-y-0.5">
            {/* View */}
            <button
              onClick={() => {
                navigate(`/portal/quotation/${contextMenu.quote.quotationId}`);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-emerald-50 hover:text-emerald-800 transition-colors cursor-pointer group"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#00C878]" />
              <div className="flex-1 flex items-center justify-between">
                <span className="font-semibold text-slate-800 group-hover:text-emerald-800">View Quotation</span>
                <span className="text-[10px] text-slate-400 font-normal">View mode</span>
              </div>
            </button>

            {/* Change Status Modal trigger */}
            <button
              onClick={() => {
                const quoteToChange = contextMenu.quote;
                setContextMenu(null);
                openStatusModal(quoteToChange);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer group"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#00C878]" />
              <div className="flex-1 flex items-center justify-between">
                <span>Change Status...</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                  isQuoteCompleted(contextMenu.quote) ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  contextMenu.quote.status === 'Sent' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  contextMenu.quote.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                  'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {contextMenu.quote.status === 'Approved' ? 'Completed' : contextMenu.quote.status}
                </span>
              </div>
            </button>

            {/* Edit */}
            {isQuoteCompleted(contextMenu.quote) ? (
              <button
                onClick={() => {
                  const q = contextMenu.quote;
                  setContextMenu(null);
                  showToast('error', `Quotation ${q.quotationId} is Completed and locked. Change status to Draft or Sent to edit.`);
                  openStatusModal(q);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left text-slate-400 hover:bg-amber-50 hover:text-amber-800 transition-colors cursor-pointer group"
                title="Locked: Change status to edit"
              >
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <div className="flex-1 flex items-center justify-between">
                  <span>Edit Quotation</span>
                  <span className="text-[10px] text-amber-600 font-medium">Locked</span>
                </div>
              </button>
            ) : (
              <button
                onClick={() => {
                  navigate(`/portal/quotation/edit/${contextMenu.quote.quotationId}`);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-amber-50 hover:text-amber-800 transition-colors cursor-pointer group"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
                <span>Edit Quotation</span>
              </button>
            )}

            <button
              onClick={() => {
                navigate(`/portal/quotation/${contextMenu.quote.quotationId}?print=true`);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-blue-50 hover:text-blue-800 transition-colors cursor-pointer group"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
              <span>Print / Download PDF</span>
            </button>

            <button
              onClick={() => {
                downloadQuotationXLSX(contextMenu.quote);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-emerald-50 hover:text-emerald-800 transition-colors cursor-pointer group"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700" />
              <span>Export as Excel (.xlsx)</span>
            </button>

            <div className="h-px bg-slate-100 my-1" />

            <button
              onClick={() => {
                navigate(`/portal/transaction/${contextMenu.quote.quotationId}`);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer group"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
              <span>Open Transaction Hub</span>
            </button>

            {/* Service Report Action */}
            {(() => {
              const tx = db.getTransactionById(contextMenu.quote.quotationId);
              const hasReport = !!tx?.serviceReport;

              if (hasReport) {
                return (
                  <button
                    onClick={() => {
                      navigate(`/portal/service-report/${contextMenu.quote.quotationId}`);
                      setContextMenu(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-emerald-50 hover:text-emerald-900 transition-colors cursor-pointer group"
                  >
                    <Wrench className="w-3.5 h-3.5 text-emerald-600 group-hover:text-emerald-700" />
                    <div className="flex-1 flex items-center justify-between">
                      <span className="font-semibold text-emerald-800">View Service Report</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">Created</span>
                    </div>
                  </button>
                );
              }

              if (contextMenu.quote.status === 'Rejected') {
                return (
                  <button
                    onClick={() => {
                      setContextMenu(null);
                      showToast('error', `Cannot create a Service Report for a Rejected quotation.`);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer group"
                    title="Cannot create report for Rejected quotation"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-300" />
                    <div className="flex-1 flex items-center justify-between">
                      <span>Create Service Report</span>
                      <span className="text-[10px] text-slate-400">Rejected</span>
                    </div>
                  </button>
                );
              }

              return (
                <button
                  onClick={() => {
                    navigate(`/portal/service-report?tid=${contextMenu.quote.quotationId}`);
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer group"
                >
                  <Wrench className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
                  <span>Create Service Report</span>
                </button>
              );
            })()}

            {/* Tax Invoice Action */}
            {(() => {
              const tx = db.getTransactionById(contextMenu.quote.quotationId);
              const hasInvoice = !!tx?.invoice;

              if (hasInvoice) {
                return (
                  <button
                    onClick={() => {
                      navigate(`/portal/invoice/${tx.invoice?.invoiceId || contextMenu.quote.quotationId}`);
                      setContextMenu(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-purple-50 hover:text-purple-900 transition-colors cursor-pointer group"
                  >
                    <FileText className="w-3.5 h-3.5 text-purple-600 group-hover:text-purple-700" />
                    <div className="flex-1 flex items-center justify-between">
                      <span className="font-semibold text-purple-800">View Tax Invoice</span>
                      <span className="text-[10px] bg-purple-100 text-purple-800 font-semibold px-1.5 py-0.5 rounded">Generated</span>
                    </div>
                  </button>
                );
              }

              if (isQuoteCompleted(contextMenu.quote)) {
                return (
                  <button
                    onClick={() => {
                      navigate(`/portal/invoice?tid=${contextMenu.quote.quotationId}`);
                      setContextMenu(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer group"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
                    <span>Create Tax Invoice</span>
                  </button>
                );
              }

              return (
                <button
                  onClick={() => {
                    const q = contextMenu.quote;
                    setContextMenu(null);
                    showToast('error', `Quotation ${q.quotationId} must be set to Completed to create a Tax Invoice.`);
                    openStatusModal(q);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer group"
                  title="Requires Completed status"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-300" />
                  <div className="flex-1 flex items-center justify-between">
                    <span>Create Tax Invoice</span>
                    <span className="text-[10px] text-slate-400">Needs Completed</span>
                  </div>
                </button>
              );
            })()}

            <div className="h-px bg-slate-100 my-1" />

            <button
              onClick={() => {
                copyToClipboard(contextMenu.quote.quotationId);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer group"
            >
              <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
              <span>Copy Quotation ID</span>
            </button>

            <div className="h-px bg-slate-100 my-1" />

            <button
              onClick={() => {
                const quoteToDel = contextMenu.quote;
                setContextMenu(null);
                setQuoteToDelete(quoteToDel);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer group"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Delete Quotation</span>
            </button>
          </div>
        </div>
      )}

      {/* STATUS CHANGE POPUP MODAL */}
      {quoteForStatusModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
          onClick={() => setQuoteForStatusModal(null)}
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
                    <span className="font-mono font-semibold text-slate-700">{quoteForStatusModal.quotationId}</span>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">{quoteForStatusModal.clientSnapshot.clientName}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setQuoteForStatusModal(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Options */}
            <div className="p-5 space-y-3.5">
              <div className="flex items-center justify-between bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-600">
                  Current Status: <span className="font-bold text-slate-900">{quoteForStatusModal.status === 'Approved' ? 'Completed' : quoteForStatusModal.status}</span>
                </div>
                {selectedStatus !== (quoteForStatusModal.status === 'Approved' ? 'Completed' : quoteForStatusModal.status) && (
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

              {/* Informative Rule Notice */}
              {selectedStatus === 'Completed' ? (
                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00C878] shrink-0 mt-0.5" />
                  <span>
                    Setting to <strong>Completed</strong> will lock this quote from editing and permit creating the field Service Report and GST Invoice.
                  </span>
                </div>
              ) : isQuoteCompleted(quoteForStatusModal) ? (
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
                onClick={() => setQuoteForStatusModal(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusChange}
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
