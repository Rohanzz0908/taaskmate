import React, { useState, useMemo } from 'react';
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
  Building2, 
  Calendar, 
  FileText,
  ArrowUpRight
} from 'lucide-react';
import { db } from '../services/db';

export const ServiceReportListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const transactions = db.getTransactions().filter(t => !!t.serviceReport);

  const filteredReports = useMemo(() => {
    return transactions.filter(t => {
      const sr = t.serviceReport!;
      const matchesSearch = 
        t.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.clientSnapshot.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sr.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sr.assignedTechnician.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'All' || sr.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
      case 'In Progress':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3 h-3" /> In Progress</span>;
      case 'Scheduled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"><Clock className="w-3 h-3" /> Scheduled</span>;
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
            <Wrench className="w-6 h-6 text-[#00C878]" />
            <span>Service Reports Directory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Technician field execution sheets, work verification, and client sign-offs linked to Master Transaction IDs.
          </p>
        </div>

        <Link
          to="/portal/service-report"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00C878] hover:bg-[#00B069] text-white rounded-lg text-xs font-semibold shadow-sm transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> New Service Report
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
            placeholder="Search by Transaction ID (e.g. TM-2026-0001), Client, or Technician..."
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
                <th className="py-3 px-4">Master Transaction ID</th>
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
                    <tr key={t.transactionId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        <Link 
                          to={`/portal/transaction/${t.transactionId}`}
                          className="text-slate-900 hover:text-[#00C878] flex items-center gap-1 group"
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
                          <span>{sr.serviceDate}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 truncate max-w-[220px]">{sr.serviceType}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[220px]">{sr.location}</div>
                      </td>

                      <td className="py-3 px-3 text-slate-700 font-medium whitespace-nowrap">
                        {sr.assignedTechnician}
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {getStatusBadge(sr.status)}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
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
    </div>
  );
};
