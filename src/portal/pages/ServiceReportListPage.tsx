import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Wrench, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  FileText,
  ArrowUpRight,
  Printer,
  Copy,
  Trash2,
  AlertCircle,
  X,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { db } from '../services/db';
import { MasterTransaction, ServiceStatus } from '../types';
import { downloadServiceReportXLSX } from '../utils/serviceReportExport';

export const ServiceReportListPage: React.FC = () => {
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

  // Modals & Toast State
  const [statusModalTx, setStatusModalTx] = useState<MasterTransaction | null>(null);
  const [reportToDelete, setReportToDelete] = useState<MasterTransaction | null>(null);
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
    const menuHeight = 390;
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
        setStatusModalTx(null);
        setReportToDelete(null);
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
  const formatServiceDate = (dateStr?: string) => {
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
    return db.getTransactions().filter(t => !!t.serviceReport);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const filteredReports = useMemo(() => {
    return transactions.filter(t => {
      const sr = t.serviceReport!;
      const techDisplay = (t.quotation?.assignedTechnicianNames && t.quotation.assignedTechnicianNames.length > 0)
        ? t.quotation.assignedTechnicianNames.join(' ')
        : (t.quotation?.assignedTechnicianName || sr.assignedTechnician || '');

      const matchesSearch = 
        t.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.clientSnapshot.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sr.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        techDisplay.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'All' || sr.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchTerm, statusFilter]);

  const handleUpdateStatus = (txId: string, newStatus: ServiceStatus) => {
    const success = db.updateServiceReportStatus(txId, newStatus);
    if (success) {
      showToast('success', `Service Report status updated to ${newStatus}.`);
      setStatusModalTx(null);
      setRefreshKey(k => k + 1);
    } else {
      showToast('error', `Failed to update status for ${txId}.`);
    }
  };

  const handleDeleteServiceReport = (txId: string) => {
    const res = db.deleteServiceReport(txId);
    if (res.success) {
      showToast('success', res.message);
      setReportToDelete(null);
      setRefreshKey(k => k + 1);
    } else {
      showToast('error', res.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
      case 'In Progress':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3 h-3" /> In Progress</span>;
      case 'Hold':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"><AlertCircle className="w-3 h-3" /> Hold</span>;
      case 'Scheduled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"><Clock className="w-3 h-3" /> Scheduled</span>;
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
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/50">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Transactions & Service Reports</h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {transactions.length} Total
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Technician field execution sheets, work verification, and client sign-offs sharing Quotation ID. Right-click any row for quick actions.
            </p>
          </div>
        </div>

        <Link
          to="/portal/service-report"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00C878] hover:bg-[#00B069] text-white font-semibold text-xs shadow-xs transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Service Report</span>
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
            placeholder="Search by Quotation ID (e.g. TM260001), Client, or Technician..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#00C878] focus:border-transparent outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-white focus:ring-2 focus:ring-[#00C878] outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Hold">Hold</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Quotation ID</th>
                <th className="py-3 px-4">Client & Premises</th>
                <th className="py-3 px-3">Execution Date</th>
                <th className="py-3 px-4">Service Type & Scope</th>
                <th className="py-3 px-3">Technician</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.length > 0 ? (
                filteredReports.map((t) => {
                  const sr = t.serviceReport!;
                  return (
                    <tr 
                      key={t.transactionId} 
                      onContextMenu={(e) => handleContextMenu(e, t)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        <Link 
                          to={`/portal/transaction/${t.transactionId}`}
                          className="text-slate-900 hover:text-[#00C878] flex items-center gap-1 group"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>{t.transactionId}</span>
                          <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-[#00C878] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{t.clientSnapshot.clientName}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[200px]">{t.clientSnapshot.address}</div>
                      </td>

                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium text-slate-700">{formatServiceDate(sr.serviceDate)}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 truncate max-w-[220px]">{sr.serviceType}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[220px]">{sr.location}</div>
                      </td>

                      <td className="py-3 px-3 text-slate-700 font-medium whitespace-nowrap">
                        {(() => {
                          const hasQuoteTech = t.quotation?.assignedTechnicianName || (t.quotation?.assignedTechnicianNames && t.quotation.assignedTechnicianNames.length > 0);
                          const tech = (t.quotation?.assignedTechnicianNames && t.quotation.assignedTechnicianNames.length > 0)
                            ? t.quotation.assignedTechnicianNames.join(', ')
                            : (t.quotation?.assignedTechnicianName || (hasQuoteTech ? sr.assignedTechnician : (sr.assignedTechnician && sr.assignedTechnician !== 'Ramesh Gowda' ? sr.assignedTechnician : '')));

                          return tech && tech.trim() !== '' && tech !== 'Technician Not Assigned' ? (
                            <span className="font-medium text-slate-800">{tech}</span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px] font-normal">Technician Not Assigned</span>
                          );
                        })()}
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {getStatusBadge(sr.status)}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/portal/service-report/${t.transactionId}`}
                            className="p-1.5 text-slate-500 hover:text-[#00C878] hover:bg-slate-100 rounded-md transition-colors"
                            title="View Printable Service Report"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/portal/service-report?tid=${t.transactionId}&edit=true`}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                            title="Edit Service Report"
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
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <Wrench className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs">No service reports match the selected filters.</p>
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
              <span className="font-mono font-bold text-slate-900">{contextMenu.tx.transactionId}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                contextMenu.tx.serviceReport?.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                contextMenu.tx.serviceReport?.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                contextMenu.tx.serviceReport?.status === 'Hold' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                {contextMenu.tx.serviceReport?.status}
              </span>
            </div>
            <div className="text-[11px] text-slate-600 font-medium truncate mt-0.5" title={contextMenu.tx.clientSnapshot.clientName}>
              {contextMenu.tx.clientSnapshot.clientName}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              {formatServiceDate(contextMenu.tx.serviceReport?.serviceDate)} • {contextMenu.tx.serviceReport?.serviceType}
            </div>
          </div>

          <div className="p-1 space-y-0.5">
            {/* View Printable Report */}
            <button
              onClick={() => {
                navigate(`/portal/service-report/${contextMenu.tx.transactionId}`);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-emerald-50 hover:text-emerald-800 transition-colors cursor-pointer group"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#00C878]" />
              <div className="flex-1 flex items-center justify-between">
                <span className="font-semibold text-slate-800 group-hover:text-emerald-800">View Service Report</span>
                <span className="text-[10px] text-slate-400 font-normal">Print View</span>
              </div>
            </button>

            {/* Print / Download PDF */}
            <button
              onClick={() => {
                navigate(`/portal/service-report/${contextMenu.tx.transactionId}?print=true`);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-blue-50 hover:text-blue-800 transition-colors cursor-pointer group"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
              <span>Print / Download PDF</span>
            </button>

            {/* Edit Report */}
            <button
              onClick={() => {
                navigate(`/portal/service-report?tid=${contextMenu.tx.transactionId}&edit=true`);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-amber-50 hover:text-amber-800 transition-colors cursor-pointer group"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
              <span>Edit Service Report</span>
            </button>

            {/* Change Status Modal trigger */}
            <button
              onClick={() => {
                const targetTx = contextMenu.tx;
                setContextMenu(null);
                setStatusModalTx(targetTx);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer group"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#00C878]" />
              <div className="flex-1 flex items-center justify-between">
                <span>Execution Status...</span>
                <span className="text-[10px] text-slate-400">Change</span>
              </div>
            </button>

            {/* Export as Excel in context menu */}
            <button
              onClick={() => {
                downloadServiceReportXLSX(contextMenu.tx);
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

            <div className="h-px bg-slate-100 my-1" />

            {/* Delete Service Report */}
            <button
              onClick={() => {
                const target = contextMenu.tx;
                setContextMenu(null);
                setReportToDelete(target);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer group"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Delete Service Report</span>
            </button>
          </div>
        </div>
      )}

      {/* Execution Status Modal */}
      {statusModalTx && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setStatusModalTx(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Change Execution Status</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Quotation ID: <span className="font-mono font-semibold text-slate-700">{statusModalTx.transactionId}</span>
                </p>
              </div>
              <button
                onClick={() => setStatusModalTx(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-2">
              {(['Completed', 'In Progress', 'Hold'] as ServiceStatus[]).map((statusOption) => {
                const isSelected = statusModalTx.serviceReport?.status === statusOption;
                return (
                  <button
                    key={statusOption}
                    type="button"
                    onClick={() => handleUpdateStatus(statusModalTx.transactionId, statusOption)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-[#00C878] bg-emerald-50/50 text-[#00C878] shadow-xs' 
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {statusOption === 'Completed' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      {statusOption === 'In Progress' && <Clock className="w-4 h-4 text-amber-500" />}
                      {statusOption === 'Hold' && <AlertCircle className="w-4 h-4 text-rose-500" />}
                      <span>{statusOption}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#00C878]" />}
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setStatusModalTx(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {reportToDelete && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setReportToDelete(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm p-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Delete Service Report?</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Are you sure you want to remove the Service Report for transaction <span className="font-mono font-bold text-slate-700">{reportToDelete.transactionId}</span> ({reportToDelete.clientSnapshot.clientName})? The linked quotation and customer records will not be deleted.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setReportToDelete(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteServiceReport(reportToDelete.transactionId)}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Delete Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
