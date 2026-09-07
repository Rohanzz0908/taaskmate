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
  X
} from 'lucide-react';
import { Quotation, QuotationStatus } from '../types';
import { db, formatINR } from '../services/db';

export const QuotationListPage: React.FC = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | QuotationStatus>('All');
  const [clientFilter, setClientFilter] = useState('All');
  const [sortField, setSortField] = useState<'quotationDate' | 'grandTotal' | 'quotationId'>('quotationDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Delete modal state
  const [quoteToDelete, setQuoteToDelete] = useState<Quotation | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const loadQuotations = () => {
    setQuotations(db.getQuotations());
  };

  useEffect(() => {
    loadQuotations();
  }, []);

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
      q.quotationDate,
      q.validUntil,
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

        const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
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
              Browse, track client PO statuses, modify scopes, and generate print-ready PDFs.
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
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Expired">Expired</option>
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
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* Quotation ID */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/portal/quotation/${quote.quotationId}`)}
                        className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-emerald-50 hover:text-[#00C878] px-2 py-0.5 rounded border border-slate-200 transition-colors cursor-pointer"
                      >
                        {quote.quotationId}
                      </button>
                    </td>

                    {/* Dates */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-800">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{quote.quotationDate}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Valid till: {quote.validUntil}
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

                    {/* Status Badge & Quick Change */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        value={quote.status}
                        onChange={(e) => handleStatusChange(quote.quotationId, e.target.value as QuotationStatus)}
                        className={`text-[11px] font-medium rounded-full px-2 py-0.5 border cursor-pointer focus:outline-none ${
                          quote.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          quote.status === 'Sent' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          quote.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          quote.status === 'Expired' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Sent">Sent</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Expired">Expired</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/portal/quotation/${quote.quotationId}`)}
                          className="p-1 rounded text-slate-400 hover:text-[#00C878] hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="View & Preview Print"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => navigate(`/portal/quotation/${quote.quotationId}?print=true`)}
                          className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Quick Print"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => navigate(`/portal/quotation/edit/${quote.quotationId}`)}
                          className="p-1 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                          title="Edit Quotation"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => navigate(`/portal/transaction/${quote.quotationId}`)}
                          className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                          title="View Master Transaction Lifecycle"
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
    </div>
  );
};
