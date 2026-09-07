import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  ArrowUpDown, 
  Download, 
  RefreshCw,
  Phone,
  Mail,
  ShieldCheck,
  Check,
  Copy,
  UserCheck
} from 'lucide-react';
import { Client } from '../types';
import { db, validateGSTIN } from '../services/db';

export const ClientMasterPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [sortField, setSortField] = useState<'clientId' | 'clientName' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formData, setFormData] = useState<Omit<Client, 'createdAt' | 'updatedAt'>>({
    clientId: '',
    clientName: '',
    address: '',
    email: '',
    phone: '',
    gstin: '',
    contactPerson: '',
    status: 'Active',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Delete Modal State
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Notification Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedGstin, setCopiedGstin] = useState<string | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const loadClients = () => {
    setClients(db.getClients());
  };

  useEffect(() => {
    loadClients();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setFormData({
      clientId: db.getNextClientId(),
      clientName: '',
      address: '',
      email: '',
      phone: '',
      gstin: '',
      contactPerson: '',
      status: 'Active',
    });
    setFormErrors({});
    setShowFormModal(true);
  };

  const openEditModal = (client: Client) => {
    setIsEditing(true);
    setFormData({
      clientId: client.clientId,
      clientName: client.clientName,
      address: client.address,
      email: client.email,
      phone: client.phone,
      gstin: client.gstin,
      contactPerson: client.contactPerson,
      status: client.status,
    });
    setFormErrors({});
    setShowFormModal(true);
  };

  // Live GSTIN validation
  const isGstinValid = useMemo(() => {
    if (!formData.gstin) return false;
    return validateGSTIN(formData.gstin);
  }, [formData.gstin]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.clientName.trim()) {
      errors.clientName = 'Client / Company name is required.';
    } else if (formData.clientName.trim().length < 3) {
      errors.clientName = 'Client name must be at least 3 characters.';
    }

    if (!formData.address.trim()) {
      errors.address = 'Full registered billing address is required.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Billing email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Contact phone number is required.';
    } else if (formData.phone.trim().length < 8) {
      errors.phone = 'Please enter a valid phone number.';
    }

    if (!formData.gstin.trim()) {
      errors.gstin = 'GSTIN is required for tax invoicing.';
    } else if (!validateGSTIN(formData.gstin)) {
      errors.gstin = 'Invalid GSTIN format. Must be 15 alphanumeric characters (e.g. 29AABCP1234F1Z5).';
    }

    if (!formData.contactPerson.trim()) {
      errors.contactPerson = 'Contact person and designation is required.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const res = db.saveClient(formData);
    if (res.success) {
      showToast('success', res.message);
      setShowFormModal(false);
      loadClients();
    } else {
      showToast('error', res.message);
      setFormErrors(prev => ({ ...prev, general: res.message }));
    }
  };

  const handleDelete = () => {
    if (!clientToDelete) return;
    const res = db.deleteClient(clientToDelete.clientId);
    if (res.success) {
      showToast('success', res.message);
      setClientToDelete(null);
      setDeleteError(null);
      loadClients();
    } else {
      setDeleteError(res.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedGstin(text);
    setTimeout(() => setCopiedGstin(null), 2000);
  };

  const exportCSV = () => {
    const headers = ['Client ID', 'Client Name', 'Address', 'Email', 'Phone', 'GSTIN', 'Contact Person', 'Status', 'Created At'];
    const rows = clients.map(c => [
      c.clientId,
      `"${c.clientName.replace(/"/g, '""')}"`,
      `"${c.address.replace(/"/g, '""')}"`,
      c.email,
      c.phone,
      c.gstin,
      `"${c.contactPerson.replace(/"/g, '""')}"`,
      c.status,
      c.createdAt
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `taaskmate_clients_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Sort
  const filteredClients = useMemo(() => {
    return clients
      .filter(client => {
        const matchesSearch = 
          client.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.clientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.gstin.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'All' || client.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const factor = sortOrder === 'asc' ? 1 : -1;
        if (sortField === 'clientName') {
          return factor * a.clientName.localeCompare(b.clientName);
        } else if (sortField === 'clientId') {
          return factor * a.clientId.localeCompare(b.clientId);
        } else {
          return factor * a.createdAt.localeCompare(b.createdAt);
        }
      });
  }, [clients, searchTerm, statusFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredClients.length / pageSize) || 1;
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredClients.slice(start, start + pageSize);
  }, [filteredClients, currentPage, pageSize]);

  return (
    <div className="space-y-5">
      {/* Toast alert */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl transition-all duration-200 border ${
          toast.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-[#00C878]" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
          <span className="text-xs font-semibold">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner - Clean Professional SaaS Style */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#00C878] flex items-center justify-center shrink-0 border border-emerald-200/50">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Client Master</h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {clients.length} Registered
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Maintain customer profiles, billing addresses, contact persons, and validated GSTIN credentials.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
            title="Export clients as CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00C878] hover:bg-[#00B069] text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Client</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search client, GSTIN, email, person..."
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

        {/* Filter Controls */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
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
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </div>

          <button
            onClick={() => {
              if (sortField === 'clientName') {
                setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
              } else {
                setSortField('clientName');
                setSortOrder('asc');
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ArrowUpDown className="w-3 h-3 text-slate-500" />
            <span>Name ({sortOrder.toUpperCase()})</span>
          </button>

          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('All');
              loadClients();
            }}
            title="Reset & refresh"
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-[#00C878] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Modern Clean Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase font-semibold text-slate-500 tracking-wider">
              <tr>
                <th className="py-3 px-4 w-28">Client ID</th>
                <th className="py-3 px-4 min-w-[240px]">Company / Client Name</th>
                <th className="py-3 px-4 min-w-[200px]">Contact Details</th>
                <th className="py-3 px-4 min-w-[180px]">GSTIN Number</th>
                <th className="py-3 px-4 w-24">Status</th>
                <th className="py-3 px-4 w-28">Registered</th>
                <th className="py-3 px-4 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700 text-sm">No client records found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try clearing filters or register a new client.</p>
                  </td>
                </tr>
              ) : (
                paginatedClients.map((client) => (
                  <tr 
                    key={client.clientId} 
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Client ID */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {client.clientId}
                      </span>
                    </td>

                    {/* Company Name & Address */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 group-hover:text-[#00C878] transition-colors">
                        {client.clientName}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-600 mt-0.5">
                        <UserCheck className="w-3 h-3 text-[#00C878] shrink-0" />
                        <span className="truncate max-w-xs">{client.contactPerson}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-sm mt-0.5" title={client.address}>
                        {client.address}
                      </div>
                    </td>

                    {/* Contact Details */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{client.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{client.phone}</span>
                      </div>
                    </td>

                    {/* GSTIN */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-mono text-xs font-medium text-slate-800">
                          {client.gstin}
                        </span>
                        <button
                          onClick={() => copyToClipboard(client.gstin)}
                          className="text-slate-400 hover:text-slate-700 ml-1 p-0.5 transition-colors cursor-pointer"
                          title="Copy GSTIN"
                        >
                          {copiedGstin === client.gstin ? (
                            <Check className="w-3 h-3 text-[#00C878]" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                        client.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          client.status === 'Active' ? 'bg-[#00C878]' : 'bg-slate-400'
                        }`} />
                        {client.status}
                      </span>
                    </td>

                    {/* Registered Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500">
                      {client.createdAt}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(client)}
                          className="p-1 rounded text-slate-400 hover:text-[#00C878] hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Edit client"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setClientToDelete(client);
                            setDeleteError(null);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete client"
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

        {/* Pagination Bar */}
        {filteredClients.length > 0 && (
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
                Showing {Math.min((currentPage - 1) * pageSize + 1, filteredClients.length)} - {Math.min(currentPage * pageSize, filteredClients.length)} of {filteredClients.length} clients
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

      {/* CREATE / EDIT CLIENT MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-xl my-8 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#00C878] flex items-center justify-center border border-emerald-200/60">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {isEditing ? 'Edit Client Profile' : 'Register New Client'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isEditing ? `Modifying record for ${formData.clientId}` : 'Add a verified corporate or residential client'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {formErrors.general && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formErrors.general}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {/* Client ID */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Client ID <span className="text-slate-400 font-normal">(System Generated)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.clientId}
                    disabled
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 font-mono text-xs font-semibold cursor-not-allowed"
                  />
                </div>

                {/* Status Toggle */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Account Status
                  </label>
                  <div className="flex items-center gap-4 h-9">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={formData.status === 'Active'}
                        onChange={() => setFormData(prev => ({ ...prev, status: 'Active' }))}
                        className="text-[#00C878] focus:ring-[#00C878]"
                      />
                      <span className="text-xs font-medium text-slate-800">Active</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={formData.status === 'Inactive'}
                        onChange={() => setFormData(prev => ({ ...prev, status: 'Inactive' }))}
                        className="text-slate-400 focus:ring-slate-400"
                      />
                      <span className="text-xs font-medium text-slate-600">Inactive</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Company / Client Name */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Company / Client Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Prestige Cyber Park Management Pvt Ltd"
                  value={formData.clientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg bg-white border ${
                    formErrors.clientName ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-[#00C878]'
                  } text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1`}
                />
                {formErrors.clientName && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.clientName}
                  </p>
                )}
              </div>

              {/* Registered Address */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Billing & Registered Address <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Full physical billing address including PIN Code and State"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg bg-white border ${
                    formErrors.address ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-[#00C878]'
                  } text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 resize-none`}
                />
                {formErrors.address && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.address}
                  </p>
                )}
              </div>

              {/* Contact Person & GSTIN */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contact Person & Role <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Suresh Nambiar (Facility Director)"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg bg-white border ${
                      formErrors.contactPerson ? 'border-rose-400' : 'border-slate-200'
                    } text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00C878]`}
                  />
                  {formErrors.contactPerson && (
                    <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.contactPerson}
                    </p>
                  )}
                </div>

                {/* GSTIN Field with indicator */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">
                      GSTIN Number <span className="text-rose-500">*</span>
                    </label>
                    {formData.gstin && (
                      <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                        isGstinValid 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {isGstinValid ? 'Valid GSTIN' : 'Invalid format'}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. 29AABCP1234F1Z5"
                    maxLength={15}
                    value={formData.gstin}
                    onChange={(e) => setFormData(prev => ({ ...prev, gstin: e.target.value.toUpperCase() }))}
                    className={`w-full px-3 py-2 rounded-lg font-mono uppercase bg-white border ${
                      formErrors.gstin ? 'border-rose-400' : 'border-slate-200'
                    } text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00C878]`}
                  />
                  {formErrors.gstin && (
                    <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.gstin}
                    </p>
                  )}
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Billing Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="facilities@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg bg-white border ${
                      formErrors.email ? 'border-rose-400' : 'border-slate-200'
                    } text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00C878]`}
                  />
                  {formErrors.email && (
                    <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 80 6789 2200"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg bg-white border ${
                      formErrors.phone ? 'border-rose-400' : 'border-slate-200'
                    } text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00C878]`}
                  />
                  {formErrors.phone && (
                    <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#00C878] hover:bg-[#00B069] text-white font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {isEditing ? 'Update Client' : 'Save Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-sm p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900">Delete Client Record?</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to delete <span className="font-semibold text-slate-800">"{clientToDelete.clientName}"</span> ({clientToDelete.clientId})?
                </p>

                {deleteError && (
                  <div className="mt-2.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{deleteError}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setClientToDelete(null);
                  setDeleteError(null);
                }}
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
