import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, 
  Layers, 
  FileSpreadsheet, 
  Clock, 
  CheckCircle2, 
  Plus, 
  ArrowRight, 
  TrendingUp, 
  Eye, 
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Search,
  Wrench,
  Receipt,
  CreditCard,
  AlertCircle,
  FileText,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, formatINR } from '../services/db';
import { MasterTransaction } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<any>({
    totalTransactions: 0,
    pendingQuotations: 0,
    approvedQuotations: 0,
    servicesInProgress: 0,
    completedServices: 0,
    invoicesGenerated: 0,
    pendingPayments: 0,
    paidInvoices: 0,
    totalPipelineValue: 0,
    totalInvoicedValue: 0,
    totalCollectedValue: 0,
    totalClients: 0,
    totalCategories: 0,
  });

  const [transactions, setTransactions] = useState<MasterTransaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');

  const loadData = () => {
    setStats(db.getDashboardStats());
    setTransactions(db.getTransactions());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Global Transaction ID Jump handler
  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim().toUpperCase();
    const match = transactions.find(
      t => t.transactionId.toUpperCase() === query || 
           t.clientSnapshot.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (match) {
      setSearchError('');
      navigate(`/portal/transaction/${match.transactionId}`);
    } else {
      setSearchError(`No transaction matching "${searchQuery}" found.`);
      setTimeout(() => setSearchError(''), 4000);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
      case 'Completed':
      case 'Quotation Approved':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3 h-3" /> {status}</span>;
      case 'Service In Progress':
      case 'In Progress':
      case 'Partially Paid':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3 h-3" /> {status}</span>;
      case 'Service Scheduled':
      case 'Scheduled':
      case 'Quotation Sent':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200"><Clock className="w-3 h-3" /> {status}</span>;
      case 'Invoice Generated':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200"><Receipt className="w-3 h-3" /> {status}</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Executive Welcome Banner with Global Transaction Search */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0A1620] via-[#122838] to-[#0A1620] rounded-2xl p-6 text-white border border-slate-800 shadow-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00C878]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#00C878] text-[11px] font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>Unified Master Transaction Architecture</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Welcome back, {user?.name || 'Test Admin'}
            </h1>
            <p className="text-slate-400 text-xs leading-relaxed">
              One Master Transaction ID (<span className="font-mono text-[#00C878]">TM-YYYY-XXXX</span>) tracks the complete lifecycle from Quotation → Service Report → Commercial Tax Invoice.
            </p>
          </div>

          {/* Quick CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/portal/quotation"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#00C878] hover:bg-[#00B069] text-white font-semibold text-xs shadow-sm transition-all hover:scale-[1.01]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Quotation</span>
            </Link>
            <Link
              to="/portal/service-report"
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 backdrop-blur-xs transition-colors"
            >
              <Wrench className="w-3.5 h-3.5 text-[#00C878]" />
              <span>Service Report</span>
            </Link>
            <Link
              to="/portal/invoice"
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 backdrop-blur-xs transition-colors"
            >
              <Receipt className="w-3.5 h-3.5 text-purple-400" />
              <span>Issue Invoice</span>
            </Link>
          </div>
        </div>

        {/* Global Transaction Quick Lookup Bar */}
        <div className="relative z-10 mt-6 pt-5 border-t border-slate-800/80">
          <form onSubmit={handleGlobalSearch} className="flex flex-col sm:flex-row items-center gap-2 max-w-2xl">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Lookup Master Transaction ID (e.g. TM-2026-0001) or Client Name..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00C878] focus:border-transparent transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs font-semibold shrink-0 transition-colors cursor-pointer"
            >
              Jump to Transaction
            </button>
          </form>
          {searchError && (
            <p className="text-xs text-rose-400 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {searchError}
            </p>
          )}
        </div>
      </div>

      {/* 8 KPI Executive Metric Cards */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Operational & Financial Metrics
          </h2>
          <span className="text-[11px] text-slate-400">Live Enterprise State</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {/* 1. Total Transactions */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Jobs (Total)
            </div>
            <div className="text-lg font-bold text-slate-900 font-mono">
              {stats.totalTransactions}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-0.5">
              <span>Master IDs</span>
            </div>
          </div>

          {/* 2. Quotations Active */}
          <div 
            onClick={() => navigate('/portal/quotations')}
            className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs cursor-pointer hover:border-blue-400 transition-colors group"
          >
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Quotations
            </div>
            <div className="text-lg font-bold text-blue-700 font-mono">
              {stats.pendingQuotations + stats.approvedQuotations}
            </div>
            <div className="text-[10px] text-blue-600 mt-1 flex items-center gap-0.5">
              <span>{stats.approvedQuotations} Approved</span>
            </div>
          </div>

          {/* 3. Services Active */}
          <div 
            onClick={() => navigate('/portal/service-reports')}
            className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs cursor-pointer hover:border-amber-400 transition-colors group"
          >
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              In Service
            </div>
            <div className="text-lg font-bold text-amber-600 font-mono">
              {stats.servicesInProgress}
            </div>
            <div className="text-[10px] text-amber-600 mt-1 flex items-center gap-0.5">
              <span>Field Tasks</span>
            </div>
          </div>

          {/* 4. Service Completed */}
          <div 
            onClick={() => navigate('/portal/service-reports')}
            className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs cursor-pointer hover:border-emerald-400 transition-colors group"
          >
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Service Done
            </div>
            <div className="text-lg font-bold text-emerald-700 font-mono">
              {stats.completedServices}
            </div>
            <div className="text-[10px] text-emerald-600 mt-1 flex items-center gap-0.5">
              <span>Ready for Inv</span>
            </div>
          </div>

          {/* 5. Invoices Issued */}
          <div 
            onClick={() => navigate('/portal/invoices')}
            className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs cursor-pointer hover:border-purple-400 transition-colors group"
          >
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Invoiced
            </div>
            <div className="text-lg font-bold text-purple-700 font-mono">
              {stats.invoicesGenerated}
            </div>
            <div className="text-[10px] text-purple-600 mt-1 flex items-center gap-0.5">
              <span>Commercial</span>
            </div>
          </div>

          {/* 6. Collected Value */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Collected
            </div>
            <div className="text-sm font-bold text-emerald-700 font-mono truncate" title={formatINR(stats.totalCollectedValue)}>
              {formatINR(stats.totalCollectedValue)}
            </div>
            <div className="text-[10px] text-emerald-600 mt-1">
              Settled funds
            </div>
          </div>

          {/* 7. Balance Due */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Receivables
            </div>
            <div className="text-sm font-bold text-amber-700 font-mono truncate" title={formatINR(Math.max(0, stats.totalInvoicedValue - stats.totalCollectedValue))}>
              {formatINR(Math.max(0, stats.totalInvoicedValue - stats.totalCollectedValue))}
            </div>
            <div className="text-[10px] text-amber-600 mt-1">
              Pending due
            </div>
          </div>

          {/* 8. Active Clients */}
          <div 
            onClick={() => navigate('/portal/client-master')}
            className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs cursor-pointer hover:border-slate-400 transition-colors group"
          >
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Clients
            </div>
            <div className="text-lg font-bold text-slate-900 font-mono">
              {stats.totalClients}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Corporate / RWA
            </div>
          </div>
        </div>
      </div>

      {/* Main Table: Master Transactions Lifecycle Directory */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-[#00C878] flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">
                Active Master Transactions & Service Lifecycles
              </h2>
              <p className="text-[11px] text-slate-400">
                Single ID connecting Quotation → Service Report → Invoice progression.
              </p>
            </div>
          </div>

          <Link
            to="/portal/quotation"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00C878] hover:bg-[#00B069] text-white rounded-lg text-xs font-semibold shadow-xs transition-all self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" /> New Transaction
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase font-semibold text-slate-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Master ID</th>
                <th className="py-3 px-4">Client / Facility</th>
                <th className="py-3 px-3 text-center">1. Quotation</th>
                <th className="py-3 px-3 text-center">2. Service Report</th>
                <th className="py-3 px-3 text-center">3. Invoice</th>
                <th className="py-3 px-3 text-right">Total (₹)</th>
                <th className="py-3 px-3 text-center">Overall Stage</th>
                <th className="py-3 px-4 text-right">Cockpit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((t) => (
                <tr key={t.transactionId} className="hover:bg-slate-50/70 transition-colors">
                  {/* Master Transaction ID */}
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                    <Link
                      to={`/portal/transaction/${t.transactionId}`}
                      className="text-slate-900 hover:text-[#00C878] flex items-center gap-1 group"
                    >
                      <span className="bg-slate-100 group-hover:bg-emerald-50 px-2 py-0.5 rounded border border-slate-200">
                        {t.transactionId}
                      </span>
                      <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-[#00C878] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </td>

                  {/* Client */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800 truncate max-w-[200px]">
                      {t.clientSnapshot.clientName}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                      {t.clientSnapshot.contactPerson || t.clientSnapshot.address}
                    </div>
                  </td>

                  {/* Stage 1: Quotation */}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    {t.quotation ? (
                      <Link
                        to={`/portal/quotation/${t.transactionId}`}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          t.quotation.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          t.quotation.status === 'Sent' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        <FileText className="w-2.5 h-2.5" />
                        <span>{t.quotation.status}</span>
                      </Link>
                    ) : (
                      <span className="text-[10px] text-slate-400">—</span>
                    )}
                  </td>

                  {/* Stage 2: Service Report */}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    {t.serviceReport ? (
                      <Link
                        to={`/portal/service-report/${t.transactionId}`}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          t.serviceReport.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          t.serviceReport.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        <Wrench className="w-2.5 h-2.5" />
                        <span>{t.serviceReport.status}</span>
                      </Link>
                    ) : (
                      <Link
                        to={`/portal/service-report?tid=${t.transactionId}`}
                        className="text-[10px] text-slate-400 hover:text-blue-600 hover:underline"
                      >
                        + Create
                      </Link>
                    )}
                  </td>

                  {/* Stage 3: Invoice */}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    {t.invoice ? (
                      <Link
                        to={`/portal/invoice/${t.transactionId}`}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          t.invoice.payment.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          t.invoice.payment.status === 'Partial' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-purple-50 text-purple-700 border-purple-200'
                        }`}
                      >
                        <Receipt className="w-2.5 h-2.5" />
                        <span>{t.invoice.payment.status}</span>
                      </Link>
                    ) : (
                      <Link
                        to={`/portal/invoice?tid=${t.transactionId}`}
                        className="text-[10px] text-slate-400 hover:text-purple-600 hover:underline"
                      >
                        + Create
                      </Link>
                    )}
                  </td>

                  {/* Grand Total Value */}
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                    {formatINR(t.invoice?.grandTotal || t.quotation?.grandTotal || 0)}
                  </td>

                  {/* Overall Stage Badge */}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    {getStatusBadge(t.overallStatus)}
                  </td>

                  {/* Cockpit Action */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <Link
                      to={`/portal/transaction/${t.transactionId}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Operations & Architecture Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#00C878] flex items-center justify-center shrink-0 border border-emerald-100">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900">Step 1: Quotation</div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Generates Master Transaction ID (`TM-YYYY-XXXX`) once upon creation.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900">Step 2: Service Report</div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Carries the same Master ID. Field verification, spares used, and customer sign-off.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900">Step 3: Commercial Invoice</div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Uses identical Master ID. Auto-populates line items, CGST/SGST taxes, and payments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
