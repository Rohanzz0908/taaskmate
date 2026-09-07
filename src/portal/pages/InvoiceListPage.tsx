import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
  AlertCircle
} from 'lucide-react';
import { db, formatINR } from '../services/db';

export const InvoiceListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const transactions = db.getTransactions().filter(t => !!t.invoice);

  const filteredInvoices = useMemo(() => {
    return transactions.filter(t => {
      const inv = t.invoice!;
      const matchesSearch = 
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-purple-600" />
            <span>Commercial Tax Invoices</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            GST compliant tax invoices issued under Master Transaction IDs with real-time settlement tracking.
          </p>
        </div>

        <Link
          to="/portal/invoice"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Invoice
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
            placeholder="Search by Transaction ID (e.g. TM-2026-0001), Client, or Reference No..."
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
                <th className="py-3 px-4">Master Transaction ID</th>
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
                    <tr key={t.transactionId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        <Link 
                          to={`/portal/transaction/${t.transactionId}`}
                          className="text-slate-900 hover:text-purple-600 flex items-center gap-1 group"
                        >
                          <span>{t.transactionId}</span>
                          <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{t.clientSnapshot.clientName}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[200px]">{t.clientSnapshot.gstin || 'Unregistered'}</div>
                      </td>

                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{inv.invoiceDate}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        <span>{inv.dueDate}</span>
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

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/portal/invoice/${t.transactionId}`}
                            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-slate-100 rounded-md transition-colors"
                            title="View Printable Commercial Invoice"
                          >
                            <Eye className="w-4 h-4" />
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
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs">No invoices found matching criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
