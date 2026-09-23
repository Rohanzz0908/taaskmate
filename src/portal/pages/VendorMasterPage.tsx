import React, { useState, useEffect, useMemo } from 'react';
import { 
  Store, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  ArrowUpDown, 
  Download, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Building2, 
  CreditCard, 
  Landmark, 
  Copy, 
  Check, 
  Eye, 
  Award, 
  Truck, 
  MapPin, 
  Clock,
  ArrowLeft
} from 'lucide-react';
import { 
  Vendor, 
  VendorCategory, 
  VENDOR_CATEGORIES, 
  VendorStatus, 
  VendorTier, 
  VendorPaymentTerms, 
  VENDOR_PAYMENT_TERMS 
} from '../types';
import { db, validateGSTIN, validatePAN } from '../services/db';

export const VendorMasterPage: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | VendorStatus>('All');
  const [categoryFilter, setCategoryFilter] = useState<'All' | VendorCategory>('All');
  const [tierFilter, setTierFilter] = useState<'All' | VendorTier>('All');
  const [sortField, setSortField] = useState<'vendorId' | 'vendorName' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formData, setFormData] = useState<Omit<Vendor, 'createdAt' | 'updatedAt'>>({
    vendorId: '',
    vendorName: '',
    tradeCategory: 'Electrical & Lighting',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    gstin: '',
    pan: '',
    bankDetails: {
      bankName: 'HDFC Bank Ltd',
      accountName: '',
      accountNumber: '',
      ifsc: '',
      branch: ''
    },
    paymentTerms: 'Net 30',
    tier: 'Preferred Partner',
    status: 'Active',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // View Details State
  const [vendorToView, setVendorToView] = useState<Vendor | null>(null);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    vendor: Vendor;
  } | null>(null);

  // Delete Modal State
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Notification Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const loadVendors = () => {
    setVendors(db.getVendors());
  };

  useEffect(() => {
    loadVendors();
  }, []);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
        setVendorToView(null);
        setShowFormModal(false);
      }
    };
    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleContextMenu = (e: React.MouseEvent, vendor: Vendor) => {
    e.preventDefault();
    const menuWidth = 200;
    const menuHeight = 160;
    const x = e.clientX + menuWidth > window.innerWidth ? window.innerWidth - menuWidth - 10 : e.clientX;
    const y = e.clientY + menuHeight > window.innerHeight ? window.innerHeight - menuHeight - 10 : e.clientY;
    setContextMenu({ x, y, vendor });
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setFormData({
      vendorId: db.getNextVendorId(),
      vendorName: '',
      tradeCategory: 'Electrical & Lighting',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      gstin: '',
      pan: '',
      bankDetails: {
        bankName: 'HDFC Bank Ltd',
        accountName: '',
        accountNumber: '',
        ifsc: '',
        branch: ''
      },
      paymentTerms: 'Net 30',
      tier: 'Preferred Partner',
      status: 'Active',
    });
    setFormErrors({});
    setShowFormModal(true);
  };

  const openEditModal = (vendor: Vendor) => {
    setIsEditing(true);
    setFormData({
      vendorId: vendor.vendorId,
      vendorName: vendor.vendorName,
      tradeCategory: vendor.tradeCategory,
      contactPerson: vendor.contactPerson,
      phone: vendor.phone,
      email: vendor.email,
      address: vendor.address,
      gstin: vendor.gstin,
      pan: vendor.pan,
      bankDetails: { ...vendor.bankDetails },
      paymentTerms: vendor.paymentTerms,
      tier: vendor.tier,
      status: vendor.status,
    });
    setFormErrors({});
    setShowFormModal(true);
  };

  // Live GSTIN and PAN validations
  const isGstinValid = useMemo(() => {
    if (!formData.gstin) return false;
    return validateGSTIN(formData.gstin);
  }, [formData.gstin]);

  const isPanValid = useMemo(() => {
    if (!formData.pan) return false;
    return validatePAN(formData.pan);
  }, [formData.pan]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.vendorName.trim()) {
      errors.vendorName = 'Vendor / Company name is required.';
    } else if (formData.vendorName.trim().length < 3) {
      errors.vendorName = 'Vendor name must be at least 3 characters.';
    }

    if (!formData.contactPerson.trim()) {
      errors.contactPerson = 'Contact person and designation is required.';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Contact phone number is required.';
    } else if (formData.phone.trim().length < 8) {
      errors.phone = 'Please enter a valid phone number.';
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.address.trim()) {
      errors.address = 'Warehouse or office billing address is required.';
    }

    if (formData.gstin.trim() && !validateGSTIN(formData.gstin)) {
      errors.gstin = 'Invalid GSTIN format. Must be 15 alphanumeric characters (e.g. 29AABCS1234F1Z1).';
    }

    if (formData.pan.trim() && !validatePAN(formData.pan)) {
      errors.pan = 'Invalid PAN format. Must be 10 characters (e.g. AABCS1234F).';
    }

    if (!formData.bankDetails.accountNumber.trim()) {
      errors.accountNumber = 'Bank account number is required for PO settlements.';
    }

    if (!formData.bankDetails.ifsc.trim()) {
      errors.ifsc = 'Bank IFSC code is required.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Auto-populate account name if left blank
    const submissionData = {
      ...formData,
      bankDetails: {
        ...formData.bankDetails,
        accountName: formData.bankDetails.accountName.trim() || formData.vendorName.trim(),
        ifsc: formData.bankDetails.ifsc.trim().toUpperCase(),
      }
    };

    const res = db.saveVendor(submissionData);
    if (res.success) {
      showToast('success', res.message);
      setShowFormModal(false);
      loadVendors();
    } else {
      showToast('error', res.message);
      setFormErrors(prev => ({ ...prev, general: res.message }));
    }
  };

  const handleDelete = () => {
    if (!vendorToDelete) return;
    const res = db.deleteVendor(vendorToDelete.vendorId);
    if (res.success) {
      showToast('success', res.message);
      setVendorToDelete(null);
      setDeleteError(null);
      loadVendors();
    } else {
      setDeleteError(res.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const exportCSV = () => {
    const headers = [
      'Vendor ID', 
      'Vendor Name', 
      'Trade Category', 
      'Contact Person', 
      'Phone', 
      'Email', 
      'Address', 
      'GSTIN', 
      'PAN', 
      'Bank Name', 
      'Account Number', 
      'IFSC', 
      'Payment Terms', 
      'Supplier Tier', 
      'Status', 
      'Created At'
    ];
    const rows = vendors.map(v => [
      v.vendorId,
      `"${v.vendorName.replace(/"/g, '""')}"`,
      `"${v.tradeCategory}"`,
      `"${v.contactPerson.replace(/"/g, '""')}"`,
      v.phone,
      v.email,
      `"${v.address.replace(/"/g, '""')}"`,
      v.gstin,
      v.pan,
      `"${v.bankDetails.bankName}"`,
      v.bankDetails.accountNumber,
      v.bankDetails.ifsc,
      v.paymentTerms,
      v.tier,
      v.status,
      v.createdAt
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `taaskmate_vendors_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Sort
  const filteredVendors = useMemo(() => {
    return vendors
      .filter(vendor => {
        const matchesSearch = 
          vendor.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vendor.vendorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vendor.gstin.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vendor.phone.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'All' || vendor.status === statusFilter;
        const matchesCat = categoryFilter === 'All' || vendor.tradeCategory === categoryFilter;
        const matchesTier = tierFilter === 'All' || vendor.tier === tierFilter;

        return matchesSearch && matchesStatus && matchesCat && matchesTier;
      })
      .sort((a, b) => {
        const factor = sortOrder === 'asc' ? 1 : -1;
        if (sortField === 'vendorName') {
          return factor * a.vendorName.localeCompare(b.vendorName);
        } else if (sortField === 'vendorId') {
          return factor * a.vendorId.localeCompare(b.vendorId);
        } else {
          return factor * a.createdAt.localeCompare(b.createdAt);
        }
      });
  }, [vendors, searchTerm, statusFilter, categoryFilter, tierFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredVendors.length / pageSize) || 1;
  const paginatedVendors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredVendors.slice(start, start + pageSize);
  }, [filteredVendors, currentPage, pageSize]);

  // Category Badge Helper
  const getCategoryBadge = (cat: VendorCategory) => {
    switch (cat) {
      case 'Electrical & Lighting':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'HVAC & Refrigeration':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Plumbing & Pumps':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Safety & Fire Fighting':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Chemicals & Janitorial':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Hardware & Tools':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTierBadge = (tier: VendorTier) => {
    switch (tier) {
      case 'Preferred Partner':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Award className="w-2.5 h-2.5" />
            Preferred
          </span>
        );
      case 'Standard Supplier':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Standard
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Under Review
          </span>
        );
    }
  };

  const getStatusBadge = (status: VendorStatus) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case 'Inactive':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Inactive
          </span>
        );
      case 'Blacklisted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Blacklisted
          </span>
        );
    }
  };

  // KPI Metrics
  const activeVendors = vendors.filter(v => v.status === 'Active').length;
  const preferredCount = vendors.filter(v => v.tier === 'Preferred Partner').length;
  const verifiedGstinCount = vendors.filter(v => validateGSTIN(v.gstin)).length;

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
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {showFormModal ? (
        /* Full Page Form View */
        <div className="space-y-6 animate-fadeIn">
          {/* Form Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowFormModal(false);
                  setFormErrors({});
                }}
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                title="Back to Vendors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                  <Store className="w-6 h-6 text-[#00C878]" />
                  <span>{isEditing ? `Edit Vendor (${formData.vendorId})` : 'Register New Vendor / Supplier'}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isEditing ? 'Modifying vendor credentials, trade category, and settlement bank coordinates' : 'Maintain commercial distributor details, tax registrations, and bank settlement coordinates'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowFormModal(false);
                  setFormErrors({});
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>

          {/* Full Form Card */}
          <div className="w-full bg-white rounded-2xl shadow-xs border border-slate-200/90 p-6 sm:p-8">
            <div className="flex items-center gap-2 pb-4 mb-6 border-b border-slate-100">
              <span className={`w-2.5 h-2.5 rounded-full ${isEditing ? 'bg-amber-500' : 'bg-[#00C878]'}`}></span>
              <h3 className="text-base font-bold text-slate-800">
                {isEditing ? 'Vendor Profile Details' : 'New Vendor Details'}
              </h3>
              {isEditing && (
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 ml-auto">
                  Editing Mode Active
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {formErrors.general && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formErrors.general}</span>
                </div>
              )}

              {/* Section 1: Company Profile */}
              <div className="space-y-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>1. Company & Trade Classification</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {/* Vendor ID */}
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Vendor ID
                    </label>
                    <input
                      type="text"
                      disabled
                      value={formData.vendorId}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-mono font-bold cursor-not-allowed"
                    />
                  </div>

                  {/* Vendor Name */}
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Company / Vendor Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Schneider Electric Industrial Depot"
                      value={formData.vendorName}
                      onChange={(e) => setFormData(prev => ({ ...prev, vendorName: e.target.value }))}
                      className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                        formErrors.vendorName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                      } focus:outline-none focus:ring-2 focus:ring-[#00C878] transition-all`}
                    />
                    {formErrors.vendorName && (
                      <p className="text-[11px] text-rose-500 mt-1">{formErrors.vendorName}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Trade Category */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Trade Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.tradeCategory}
                      onChange={(e) => setFormData(prev => ({ ...prev, tradeCategory: e.target.value as any }))}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00C878]"
                    >
                      {VENDOR_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Supplier Tier */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Supplier Tier
                    </label>
                    <select
                      value={formData.tier}
                      onChange={(e) => setFormData(prev => ({ ...prev, tier: e.target.value as any }))}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00C878]"
                    >
                      <option value="Preferred Partner">Preferred Partner (Direct OEM/Authorized)</option>
                      <option value="Standard Supplier">Standard Supplier</option>
                      <option value="Under Review">Under Review</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Active Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00C878]"
                    >
                      <option value="Active">Active (Ready for Procurement)</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Blacklisted">Blacklisted</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Contact & Warehouse Location */}
              <div className="space-y-4 pt-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>2. Contact Person & Depot Address</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Contact Person <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Vikas Agarwal (Key Account Mgr)"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                      className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                        formErrors.contactPerson ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                      } focus:outline-none focus:ring-2 focus:ring-[#00C878]`}
                    />
                    {formErrors.contactPerson && (
                      <p className="text-[11px] text-rose-500 mt-1">{formErrors.contactPerson}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +91 80 4112 8800"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                        formErrors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                      } focus:outline-none focus:ring-2 focus:ring-[#00C878]`}
                    />
                    {formErrors.phone && (
                      <p className="text-[11px] text-rose-500 mt-1">{formErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Procurement Email
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. orders@schneider-distributor.in"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                        formErrors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                      } focus:outline-none focus:ring-2 focus:ring-[#00C878]`}
                    />
                    {formErrors.email && (
                      <p className="text-[11px] text-rose-500 mt-1">{formErrors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Warehouse / Registered Office Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Plot 42, Peenya Industrial Area, 2nd Phase, Bengaluru, Karnataka 560058"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                      formErrors.address ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                    } focus:outline-none focus:ring-2 focus:ring-[#00C878]`}
                  />
                  {formErrors.address && (
                    <p className="text-[11px] text-rose-500 mt-1">{formErrors.address}</p>
                  )}
                </div>
              </div>

              {/* Section 3: Tax Credentials */}
              <div className="space-y-4 pt-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>3. Indian Tax Registrations & Compliance</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* GSTIN */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      GSTIN (15 Alphanumeric)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={15}
                        placeholder="e.g. 29AABCS1234F1Z1"
                        value={formData.gstin}
                        onChange={(e) => setFormData(prev => ({ ...prev, gstin: e.target.value.toUpperCase() }))}
                        className={`w-full px-3.5 py-2.5 text-xs font-mono uppercase rounded-xl border ${
                          formErrors.gstin ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                        } focus:outline-none focus:ring-2 focus:ring-[#00C878]`}
                      />
                      {formData.gstin && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {isGstinValid ? (
                            <span className="flex items-center text-[10px] text-emerald-600 font-semibold gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Valid GSTIN
                            </span>
                          ) : (
                            <span className="flex items-center text-[10px] text-amber-600 font-semibold gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <AlertCircle className="w-3.5 h-3.5" /> Invalid Format
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {formErrors.gstin && (
                      <p className="text-[11px] text-rose-500 mt-1">{formErrors.gstin}</p>
                    )}
                  </div>

                  {/* PAN */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      PAN Number (10 Characters)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={10}
                        placeholder="e.g. AABCS1234F"
                        value={formData.pan}
                        onChange={(e) => setFormData(prev => ({ ...prev, pan: e.target.value.toUpperCase() }))}
                        className={`w-full px-3.5 py-2.5 text-xs font-mono uppercase rounded-xl border ${
                          formErrors.pan ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                        } focus:outline-none focus:ring-2 focus:ring-[#00C878]`}
                      />
                      {formData.pan && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {isPanValid ? (
                            <span className="flex items-center text-[10px] text-emerald-600 font-semibold gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Valid PAN
                            </span>
                          ) : (
                            <span className="flex items-center text-[10px] text-amber-600 font-semibold gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <AlertCircle className="w-3.5 h-3.5" /> Invalid Format
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {formErrors.pan && (
                      <p className="text-[11px] text-rose-500 mt-1">{formErrors.pan}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 4: Bank Settlement & Payment Terms */}
              <div className="space-y-4 pt-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-slate-400" />
                  <span>4. Bank Settlement Coordinates & Payment Terms</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC Bank Ltd"
                      value={formData.bankDetails.bankName}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        bankDetails: { ...prev.bankDetails, bankName: e.target.value }
                      }))}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00C878]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Account Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 50200044556677"
                      value={formData.bankDetails.accountNumber}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        bankDetails: { ...prev.bankDetails, accountNumber: e.target.value }
                      }))}
                      className={`w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border ${
                        formErrors.accountNumber ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                      } focus:outline-none focus:ring-2 focus:ring-[#00C878]`}
                    />
                    {formErrors.accountNumber && (
                      <p className="text-[11px] text-rose-500 mt-1">{formErrors.accountNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      IFSC Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC0000123"
                      value={formData.bankDetails.ifsc}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        bankDetails: { ...prev.bankDetails, ifsc: e.target.value.toUpperCase() }
                      }))}
                      className={`w-full px-3.5 py-2.5 text-xs font-mono uppercase rounded-xl border ${
                        formErrors.ifsc ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                      } focus:outline-none focus:ring-2 focus:ring-[#00C878]`}
                    />
                    {formErrors.ifsc && (
                      <p className="text-[11px] text-rose-500 mt-1">{formErrors.ifsc}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Branch Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Peenya Industrial Area, Bengaluru"
                      value={formData.bankDetails.branch}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        bankDetails: { ...prev.bankDetails, branch: e.target.value }
                      }))}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00C878]"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Commercial Payment Terms
                    </label>
                    <select
                      value={formData.paymentTerms}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value as any }))}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00C878]"
                    >
                      {VENDOR_PAYMENT_TERMS.map(term => (
                        <option key={term} value={term}>{term}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowFormModal(false);
                    setFormErrors({});
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#00C878] hover:bg-[#00B069] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  {isEditing ? 'Save Changes' : 'Register Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : vendorToView ? (
        /* Full Page View Details */
        <div className="space-y-6 animate-fadeIn">
          {/* View Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setVendorToView(null)}
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                title="Back to Vendors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                  <Store className="w-6 h-6 text-[#00C878]" />
                  <span>Vendor Dossier</span>
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    {vendorToView.vendorId}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Viewing full commercial supplier profile, verified tax compliance, and bank coordinates
                </p>
              </div>
            </div>
          </div>

          {/* Full View Card */}
          <div className="w-full bg-white rounded-2xl shadow-xs border border-slate-200/90 p-6 sm:p-8 space-y-6">
            {/* Top Bar with Profile Info & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#00C878] flex items-center justify-center font-bold text-xl border border-emerald-200/70 shadow-2xs shrink-0 uppercase">
                  {vendorToView.vendorName.slice(0, 2)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{vendorToView.vendorName}</h3>
                    <button
                      onClick={() => copyToClipboard(vendorToView.vendorId)}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 font-mono text-xs transition-colors cursor-pointer"
                      title="Copy Vendor ID"
                    >
                      <span>{vendorToView.vendorId}</span>
                      {copiedText === vendorToView.vendorId ? (
                        <Check className="w-3 h-3 text-[#00C878]" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryBadge(vendorToView.tradeCategory)}`}>
                      {vendorToView.tradeCategory}
                    </span>
                    {getTierBadge(vendorToView.tier)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-medium">Status:</span>
                {getStatusBadge(vendorToView.status)}
              </div>
            </div>

            {/* Grid Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Contact Person */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Contact Details</span>
                </div>
                <div className="text-sm font-semibold text-slate-800">{vendorToView.contactPerson}</div>
                <div className="space-y-1">
                  <div className="text-xs text-slate-700">
                    <a href={`tel:${vendorToView.phone}`} className="hover:text-[#00C878] transition-colors">
                      {vendorToView.phone}
                    </a>
                  </div>
                  {vendorToView.email ? (
                    <div className="text-xs text-slate-500">
                      <a href={`mailto:${vendorToView.email}`} className="hover:text-[#00C878] transition-colors">
                        {vendorToView.email}
                      </a>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic">No email on file</div>
                  )}
                </div>
              </div>

              {/* Depot / Billing Address */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Depot / Billing Address</span>
                </div>
                <div className="text-sm font-semibold text-slate-800 line-clamp-3">
                  {vendorToView.address || 'Address not registered'}
                </div>
              </div>

              {/* Commercial Terms & Tier */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Commercial Terms</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-bold text-slate-900">{vendorToView.paymentTerms}</span>
                  <span className="text-xs text-slate-500 font-medium">Credit Window</span>
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  Tier: <span className="font-semibold text-slate-800">{vendorToView.tier}</span>
                </div>
              </div>

              {/* Tax & GSTIN Registration */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tax Registration</span>
                </div>
                <div className="space-y-1.5">
                  <div>
                    <span className="text-[10px] text-slate-400 block">GSTIN:</span>
                    <div className="flex items-center justify-between font-mono text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded border border-slate-200">
                      <span>{vendorToView.gstin || 'Not Provided'}</span>
                      {vendorToView.gstin && (
                        <button
                          onClick={() => copyToClipboard(vendorToView.gstin)}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                          title="Copy GSTIN"
                        >
                          {copiedText === vendorToView.gstin ? (
                            <Check className="w-3 h-3 text-[#00C878]" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">PAN:</span>
                    <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {vendorToView.pan || '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bank Settlement Coordinates */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <Landmark className="w-4 h-4 text-amber-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Bank Settlement</span>
                </div>
                <div className="text-sm font-semibold text-slate-800">{vendorToView.bankDetails.bankName}</div>
                <div className="text-xs text-slate-600">
                  Branch: <span className="font-medium text-slate-800">{vendorToView.bankDetails.branch || '—'}</span>
                </div>
                <div className="space-y-1 pt-1 font-mono text-xs text-slate-700">
                  <div>A/C: <span className="font-bold text-slate-900">{vendorToView.bankDetails.accountNumber}</span></div>
                  <div>IFSC: <span className="font-bold text-slate-900">{vendorToView.bankDetails.ifsc}</span></div>
                </div>
              </div>

              {/* System Audit */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">System Records</span>
                </div>
                <div className="text-xs text-slate-600">
                  Registered: <span className="font-semibold text-slate-800">{new Date(vendorToView.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="text-xs text-slate-500">
                  Last Updated: <span className="font-mono text-[11px]">{new Date(vendorToView.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header Banner */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#00C878] flex items-center justify-center shrink-0 border border-emerald-200/50">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight">Vendor Master</h1>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    {vendors.length} Suppliers
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Maintain hardware suppliers, spare parts distributors, GSTIN compliance, banking details, and credit terms.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={exportCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
                title="Export vendors as CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={openCreateModal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00C878] hover:bg-[#00B069] text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Vendor</span>
              </button>
            </div>
          </div>

          {/* 4 Summary KPI Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Suppliers</div>
                <div className="text-lg font-bold text-slate-900 font-mono">{vendors.length}</div>
                <div className="text-[10px] text-slate-500">Hardware & Spares</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Suppliers</div>
                <div className="text-lg font-bold text-blue-700 font-mono">{activeVendors}</div>
                <div className="text-[10px] text-blue-600 font-medium">Ready for procurement</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Preferred Tier</div>
                <div className="text-lg font-bold text-purple-700 font-mono">{preferredCount}</div>
                <div className="text-[10px] text-purple-600 font-medium">Discount pre-negotiated</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 border border-cyan-100">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Verified GSTINs</div>
                <div className="text-lg font-bold text-cyan-700 font-mono">{verifiedGstinCount}</div>
                <div className="text-[10px] text-cyan-600 font-medium">Input Tax Credit compliant</div>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search vendor, GSTIN, contact person..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00C878] focus:border-transparent text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00C878]"
              >
                <option value="All">All Categories</option>
                {VENDOR_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Tier Filter */}
              <select
                value={tierFilter}
                onChange={(e) => {
                  setTierFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00C878]"
              >
                <option value="All">All Tiers</option>
                <option value="Preferred Partner">Preferred Partner</option>
                <option value="Standard Supplier">Standard Supplier</option>
                <option value="Under Review">Under Review</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00C878]"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Blacklisted">Blacklisted</option>
              </select>

              {/* Sort Field */}
              <div className="flex items-center gap-1">
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as any)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00C878]"
                >
                  <option value="createdAt">Date Created</option>
                  <option value="vendorName">Vendor Name</option>
                  <option value="vendorId">Vendor ID</option>
                </select>
                <button
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                  title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Vendors Table */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Vendor & ID</th>
                    <th className="py-3 px-4">Trade Category</th>
                    <th className="py-3 px-4">Contact Person</th>
                    <th className="py-3 px-4">GSTIN & PAN</th>
                    <th className="py-3 px-4">Settlement & Terms</th>
                    <th className="py-3 px-4">Tier & Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedVendors.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Store className="w-8 h-8 text-slate-300 stroke-1" />
                          <p className="font-medium text-slate-600">No vendors found</p>
                          <p className="text-[11px] text-slate-400 max-w-xs">
                            Try modifying your search or filters, or click "Add New Vendor" to register a supplier.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedVendors.map((vendor) => {
                      const isGstinOk = validateGSTIN(vendor.gstin);
                      return (
                        <tr 
                          key={vendor.vendorId} 
                          onContextMenu={(e) => handleContextMenu(e, vendor)}
                          className="hover:bg-slate-50/70 transition-colors group cursor-default"
                        >
                          {/* Vendor Name & ID */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#00C878] font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-200/60 uppercase">
                                {vendor.vendorName.slice(0, 2)}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 line-clamp-1 max-w-[200px]" title={vendor.vendorName}>
                                  {vendor.vendorName}
                                </div>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                    {vendor.vendorId}
                                  </span>
                                  <button
                                    onClick={() => copyToClipboard(vendor.vendorId)}
                                    className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                                    title="Copy Vendor ID"
                                  >
                                    {copiedText === vendor.vendorId ? (
                                      <Check className="w-3 h-3 text-[#00C878]" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Trade Category */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${getCategoryBadge(vendor.tradeCategory)}`}>
                              <Store className="w-3 h-3" />
                              {vendor.tradeCategory}
                            </span>
                          </td>

                          {/* Contact Person & Direct Info */}
                          <td className="py-3.5 px-4">
                            <div>
                              <div className="font-semibold text-slate-800 text-[11px] line-clamp-1 max-w-[180px]">
                                {vendor.contactPerson}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <a 
                                  href={`tel:${vendor.phone}`}
                                  className="text-slate-600 hover:text-[#00C878] flex items-center gap-0.5 text-[11px]"
                                >
                                  <Phone className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                  <span>{vendor.phone}</span>
                                </a>
                              </div>
                              {vendor.email && (
                                <a 
                                  href={`mailto:${vendor.email}`}
                                  className="text-slate-400 hover:text-slate-600 flex items-center gap-0.5 text-[10px] truncate max-w-[180px] mt-0.5"
                                >
                                  <Mail className="w-2.5 h-2.5 shrink-0" />
                                  <span className="truncate">{vendor.email}</span>
                                </a>
                              )}
                            </div>
                          </td>

                          {/* GSTIN & PAN */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1 font-mono text-[11px] font-semibold text-slate-700">
                                <span>{vendor.gstin || 'No GSTIN'}</span>
                                {vendor.gstin && (
                                  <>
                                    <button
                                      onClick={() => copyToClipboard(vendor.gstin)}
                                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                                      title="Copy GSTIN"
                                    >
                                      <Copy className="w-2.5 h-2.5" />
                                    </button>
                                    <span title={isGstinOk ? 'Valid GSTIN' : 'Unverified Format'}>
                                      {isGstinOk ? (
                                        <CheckCircle2 className="w-3 h-3 text-[#00C878]" />
                                      ) : (
                                        <AlertCircle className="w-3 h-3 text-amber-500" />
                                      )}
                                    </span>
                                  </>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                PAN: {vendor.pan || '—'}
                              </div>
                            </div>
                          </td>

                          {/* Bank & Payment Terms */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1 text-[11px] font-medium text-slate-800">
                                <Landmark className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="line-clamp-1">{vendor.bankDetails.bankName}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                <CreditCard className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                <span>{vendor.paymentTerms}</span>
                              </div>
                            </div>
                          </td>

                          {/* Tier & Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <div>{getTierBadge(vendor.tier)}</div>
                              <div>{getStatusBadge(vendor.status)}</div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setVendorToView(vendor)}
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                                title="View Full Dossier"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openEditModal(vendor)}
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                                title="Edit Vendor"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setVendorToDelete(vendor);
                                  setDeleteError(null);
                                }}
                                className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                                title="Delete Vendor"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Showing <span className="font-semibold text-slate-800">{filteredVendors.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to{' '}
                <span className="font-semibold text-slate-800">{Math.min(currentPage * pageSize, filteredVendors.length)}</span> of{' '}
                <span className="font-semibold text-slate-800">{filteredVendors.length}</span> suppliers
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium cursor-pointer"
                >
                  Previous
                </button>
                <div className="px-2 font-mono text-xs font-semibold text-slate-700">
                  {currentPage} / {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* RIGHT CLICK CONTEXT MENU */}
      {contextMenu && (
        <div 
          className="fixed z-50 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 w-48 text-xs font-medium text-slate-700 animate-fadeIn"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 truncate">
            {contextMenu.vendor.vendorId} — {contextMenu.vendor.vendorName}
          </div>
          <button
            onClick={() => {
              setVendorToView(contextMenu.vendor);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>View Details</span>
          </button>
          <button
            onClick={() => {
              openEditModal(contextMenu.vendor);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 hover:text-[#00C878] transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Edit Vendor</span>
          </button>
          <div className="h-px bg-slate-100 my-1" />
          <button
            onClick={() => {
              setVendorToDelete(contextMenu.vendor);
              setDeleteError(null);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>Delete Vendor</span>
          </button>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {vendorToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <Trash2 className="w-5 h-5" />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-sm">Delete Vendor</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <span className="font-semibold text-slate-800">"{vendorToDelete.vendorName}"</span> ({vendorToDelete.vendorId})?
              </p>
            </div>

            {deleteError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => {
                  setVendorToDelete(null);
                  setDeleteError(null);
                }}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
