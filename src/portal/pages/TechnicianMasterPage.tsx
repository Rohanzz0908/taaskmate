import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wrench, 
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
  UserCheck, 
  Award, 
  Clock, 
  MapPin, 
  Copy, 
  Check, 
  Eye, 
  Briefcase, 
  Star,
  Users,
  HardHat,
  ArrowLeft
} from 'lucide-react';
import { 
  Technician, 
  TechnicianSpecialization, 
  TECHNICIAN_SPECIALIZATIONS, 
  TechnicianStatus, 
  EmploymentType, 
  IdProofType 
} from '../types';
import { db } from '../services/db';

export const TechnicianMasterPage: React.FC = () => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | TechnicianStatus>('All');
  const [specializationFilter, setSpecializationFilter] = useState<'All' | TechnicianSpecialization>('All');
  const [sortField, setSortField] = useState<'technicianId' | 'name' | 'experienceYears' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Add / Edit Form State
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<{
    technicianId: string;
    name: string;
    specialization: TechnicianSpecialization;
    phone: string;
    email: string;
    experienceYears: number;
    employmentType: EmploymentType;
    idProofType: IdProofType;
    idProofNumber: string;
    emergencyContact: {
      name: string;
      phone: string;
      relation: string;
    };
    skills: string[];
    rating: number;
    address: string;
    status: TechnicianStatus;
  }>({
    technicianId: '',
    name: '',
    specialization: 'HVAC & MEP',
    phone: '',
    email: '',
    experienceYears: 3,
    employmentType: 'Full-Time',
    idProofType: 'Aadhaar',
    idProofNumber: '',
    emergencyContact: {
      name: '',
      phone: '',
      relation: 'Spouse'
    },
    skills: [],
    rating: 5,
    address: '',
    status: 'Active',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [skillInput, setSkillInput] = useState('');

  // View Details State
  const [technicianToView, setTechnicianToView] = useState<Technician | null>(null);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    technician: Technician;
  } | null>(null);

  // Delete Modal State
  const [technicianToDelete, setTechnicianToDelete] = useState<Technician | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Notification Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const loadTechnicians = () => {
    setTechnicians(db.getTechnicians());
  };

  useEffect(() => {
    loadTechnicians();
  }, []);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
        setTechnicianToView(null);
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

  const handleContextMenu = (e: React.MouseEvent, tech: Technician) => {
    e.preventDefault();
    const menuWidth = 200;
    const menuHeight = 160;
    const x = e.clientX + menuWidth > window.innerWidth ? window.innerWidth - menuWidth - 10 : e.clientX;
    const y = e.clientY + menuHeight > window.innerHeight ? window.innerHeight - menuHeight - 10 : e.clientY;
    setContextMenu({ x, y, technician: tech });
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setFormData({
      technicianId: db.getNextTechnicianId(),
      name: '',
      specialization: 'HVAC & MEP',
      phone: '',
      email: '',
      experienceYears: 3,
      employmentType: 'Full-Time',
      idProofType: 'Aadhaar',
      idProofNumber: '',
      emergencyContact: {
        name: '',
        phone: '',
        relation: 'Spouse'
      },
      skills: ['General Maintenance'],
      rating: 5,
      address: '',
      status: 'Active',
    });
    setSkillInput('');
    setFormErrors({});
    setShowFormModal(true);
  };

  const openEditModal = (tech: Technician) => {
    setIsEditing(true);
    setFormData({
      technicianId: tech.technicianId,
      name: tech.name,
      specialization: tech.specialization,
      phone: tech.phone,
      email: tech.email,
      experienceYears: tech.experienceYears,
      employmentType: tech.employmentType,
      idProofType: tech.idProofType,
      idProofNumber: tech.idProofNumber,
      emergencyContact: { ...tech.emergencyContact },
      skills: [...(tech.skills || [])],
      rating: tech.rating,
      address: tech.address,
      status: tech.status,
    });
    setSkillInput('');
    setFormErrors({});
    setShowFormModal(true);
  };

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (!formData.skills.includes(trimmed)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Technician name is required.';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters.';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Mobile number is required.';
    } else if (formData.phone.trim().length < 10) {
      errors.phone = 'Please enter a valid 10-digit mobile number.';
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.address.trim()) {
      errors.address = 'Base city / location address is required.';
    }

    if (!formData.idProofNumber.trim()) {
      errors.idProofNumber = 'Government ID reference number is required.';
    }

    if (formData.emergencyContact.phone.trim() && formData.emergencyContact.phone.trim().length < 8) {
      errors.emergencyPhone = 'Please enter a valid emergency contact phone.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const res = db.saveTechnician(formData);
    if (res.success) {
      showToast('success', res.message);
      setShowFormModal(false);
      loadTechnicians();
    } else {
      showToast('error', res.message);
      setFormErrors(prev => ({ ...prev, general: res.message }));
    }
  };

  const handleDelete = () => {
    if (!technicianToDelete) return;
    const res = db.deleteTechnician(technicianToDelete.technicianId);
    if (res.success) {
      showToast('success', res.message);
      setTechnicianToDelete(null);
      setDeleteError(null);
      loadTechnicians();
    } else {
      setDeleteError(res.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportCSV = () => {
    const headers = [
      'Technician ID', 
      'Name', 
      'Specialization', 
      'Phone', 
      'Email', 
      'Experience (Yrs)', 
      'Employment Type', 
      'Govt ID Type', 
      'Govt ID Number', 
      'Emergency Contact', 
      'Emergency Phone',
      'Skills', 
      'Rating', 
      'Base Location', 
      'Status'
    ];

    const rows = filteredTechnicians.map(t => [
      t.technicianId,
      `"${t.name.replace(/"/g, '""')}"`,
      `"${t.specialization}"`,
      `"${t.phone}"`,
      `"${t.email || ''}"`,
      t.experienceYears,
      `"${t.employmentType}"`,
      `"${t.idProofType}"`,
      `"${t.idProofNumber}"`,
      `"${t.emergencyContact?.name || ''}"`,
      `"${t.emergencyContact?.phone || ''}"`,
      `"${(t.skills || []).join('; ')}"`,
      t.rating,
      `"${(t.address || '').replace(/"/g, '""')}"`,
      `"${t.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Technician_Master_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', `Exported ${filteredTechnicians.length} technician records.`);
  };

  // Filter & Sort
  const filteredTechnicians = useMemo(() => {
    return technicians
      .filter(tech => {
        const matchesSearch = 
          tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tech.technicianId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tech.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tech.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (tech.skills && tech.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())));
        
        const matchesStatus = statusFilter === 'All' || tech.status === statusFilter;
        const matchesSpec = specializationFilter === 'All' || tech.specialization === specializationFilter;

        return matchesSearch && matchesStatus && matchesSpec;
      })
      .sort((a, b) => {
        const factor = sortOrder === 'asc' ? 1 : -1;
        if (sortField === 'name') {
          return factor * a.name.localeCompare(b.name);
        } else if (sortField === 'technicianId') {
          return factor * a.technicianId.localeCompare(b.technicianId);
        } else if (sortField === 'experienceYears') {
          return factor * (a.experienceYears - b.experienceYears);
        } else {
          return factor * a.createdAt.localeCompare(b.createdAt);
        }
      });
  }, [technicians, searchTerm, statusFilter, specializationFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredTechnicians.length / pageSize) || 1;
  const paginatedTechnicians = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTechnicians.slice(start, start + pageSize);
  }, [filteredTechnicians, currentPage, pageSize]);

  // Specialization Badge Color
  const getSpecializationBadge = (spec: TechnicianSpecialization) => {
    switch (spec) {
      case 'HVAC & MEP':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Electrical Switchgear':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Plumbing & Fire Safety':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Carpentry & Hardware':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Janitorial & Sanitization':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Civil & Painting':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status: TechnicianStatus) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case 'On Leave':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            On Leave
          </span>
        );
      case 'Inactive':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Inactive
          </span>
        );
    }
  };

  // KPI Metrics
  const activeCount = technicians.filter(t => t.status === 'Active').length;
  const onLeaveCount = technicians.filter(t => t.status === 'On Leave').length;
  const fullTimeCount = technicians.filter(t => t.employmentType === 'Full-Time').length;

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
                title="Back to Technicians"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                  <HardHat className="w-6 h-6 text-[#00C878]" />
                  <span>{isEditing ? `Edit Technician (${formData.technicianId})` : 'Register New Technician'}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isEditing ? 'Modifying credentials, MEP discipline, verified ID, and skills' : 'Fill in personal credentials, MEP discipline, verified ID, and emergency contact'}
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
                {isEditing ? 'Technician Profile Details' : 'New Technician Details'}
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

              {/* Section 1: Basic Profile */}
              <div className="space-y-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <HardHat className="w-3.5 h-3.5 text-slate-400" />
                  <span>1. Profile & Professional Specialization</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {/* Technician ID */}
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Technician ID
                    </label>
                    <input
                      type="text"
                      disabled
                      value={formData.technicianId}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-mono font-bold cursor-not-allowed"
                    />
                  </div>

                  {/* Name */}
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Gowda"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                        formErrors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                      } focus:outline-none focus:ring-2 focus:ring-[#00C878]`}
                    />
                    {formErrors.name && (
                      <p className="text-[11px] text-rose-500 mt-1">{formErrors.name}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Specialization */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Primary Discipline <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.specialization}
                      onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value as any }))}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00C878]"
                    >
                      {TECHNICIAN_SPECIALIZATIONS.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={formData.experienceYears}
                      onChange={(e) => setFormData(prev => ({ ...prev, experienceYears: parseInt(e.target.value, 10) || 0 }))}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00C878]"
                    />
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Skill Rating
                    </label>
                    <select
                      value={formData.rating}
                      onChange={(e) => setFormData(prev => ({ ...prev, rating: parseInt(e.target.value, 10) || 5 }))}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00C878]"
                    >
                      <option value={5}>5 Stars (Master Tech)</option>
                      <option value={4}>4 Stars (Sr. Specialist)</option>
                      <option value={3}>3 Stars (Competent)</option>
                      <option value={2}>2 Stars (Apprentice)</option>
                      <option value={1}>1 Star (Trainee)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Contact & Address */}
              <div className="space-y-4 pt-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>2. Contact & City Base</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +91 98451 22334"
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
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. tech.name@taaskmate.com"
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
                    Operating City / Residential Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Indiranagar, Bengaluru, Karnataka 560038"
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

              {/* Section 3: Employment & Government Verification */}
              <div className="space-y-4 pt-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>3. Employment Contract & National ID</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Employment Type
                    </label>
                    <select
                      value={formData.employmentType}
                      onChange={(e) => setFormData(prev => ({ ...prev, employmentType: e.target.value as any }))}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00C878]"
                    >
                      <option value="Full-Time">Full-Time Staff</option>
                      <option value="Contractor">Contractor (Retainer)</option>
                      <option value="On-Demand">On-Demand Freelancer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      ID Proof Document
                    </label>
                    <select
                      value={formData.idProofType}
                      onChange={(e) => setFormData(prev => ({ ...prev, idProofType: e.target.value as any }))}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00C878]"
                    >
                      <option value="Aadhaar">Aadhaar Card</option>
                      <option value="PAN">PAN Card</option>
                      <option value="Voter ID">Voter ID</option>
                      <option value="Driving License">Driving License</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      ID Document Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. XXXX-XXXX-4821"
                      value={formData.idProofNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, idProofNumber: e.target.value }))}
                      className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                        formErrors.idProofNumber ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                      } focus:outline-none focus:ring-2 focus:ring-[#00C878]`}
                    />
                    {formErrors.idProofNumber && (
                      <p className="text-[11px] text-rose-500 mt-1">{formErrors.idProofNumber}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Deployment Availability Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00C878]"
                  >
                    <option value="Active">Active (Ready for Jobs)</option>
                    <option value="On Leave">On Leave / Scheduled Off</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Section 4: Emergency Contact */}
              <div className="space-y-4 pt-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>4. Emergency Contact Person</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sunita Gowda"
                      value={formData.emergencyContact.name}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                      }))}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00C878]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Relationship
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Spouse / Brother / Father"
                      value={formData.emergencyContact.relation}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        emergencyContact: { ...prev.emergencyContact, relation: e.target.value }
                      }))}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00C878]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Emergency Phone
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +91 98451 99887"
                      value={formData.emergencyContact.phone}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                      }))}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00C878]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Skills Tagging */}
              <div className="space-y-4 pt-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-slate-400" />
                  <span>5. Skills & Specialized Equipment Tags</span>
                </div>

                <div className="flex gap-2.5">
                  <input
                    type="text"
                    placeholder="Type skill tag (e.g. Chiller Descaling, Megger Test) & press Add"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00C878]"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Add Skill
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  {formData.skills.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No skills added yet.</span>
                  ) : (
                    formData.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 shadow-2xs"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-slate-400 hover:text-rose-500 ml-0.5 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))
                  )}
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
                  {isEditing ? 'Save Changes' : 'Register Technician'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : technicianToView ? (
        /* Full Page View Details */
        <div className="space-y-6 animate-fadeIn">
          {/* View Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setTechnicianToView(null)}
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                title="Back to Technicians"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                  <HardHat className="w-6 h-6 text-[#00C878]" />
                  <span>Technician Profile</span>
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    {technicianToView.technicianId}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Viewing full field technician credentials, discipline, verified IDs, and emergency contact
                </p>
              </div>
            </div>
          </div>

          {/* Full View Card */}
          <div className="w-full bg-white rounded-2xl shadow-xs border border-slate-200/90 p-6 sm:p-8 space-y-6">
            {/* Top Bar with Profile Info & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#00C878] flex items-center justify-center font-bold text-xl border border-emerald-200/70 shadow-2xs shrink-0">
                  {technicianToView.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{technicianToView.name}</h3>
                    <button
                      onClick={() => copyToClipboard(technicianToView.technicianId)}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 font-mono text-xs transition-colors cursor-pointer"
                      title="Copy Technician ID"
                    >
                      <span>{technicianToView.technicianId}</span>
                      {copiedId === technicianToView.technicianId ? (
                        <Check className="w-3 h-3 text-[#00C878]" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSpecializationBadge(technicianToView.specialization)}`}>
                      {technicianToView.specialization}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{technicianToView.rating} Stars</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-medium">Status:</span>
                {getStatusBadge(technicianToView.status)}
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  {technicianToView.employmentType}
                </span>
              </div>
            </div>

            {/* Grid Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Contact Information */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Contact Details</span>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-slate-800">
                    <a href={`tel:${technicianToView.phone}`} className="hover:text-[#00C878] transition-colors">
                      {technicianToView.phone}
                    </a>
                  </div>
                  {technicianToView.email ? (
                    <div className="text-xs text-slate-600">
                      <a href={`mailto:${technicianToView.email}`} className="hover:text-[#00C878] transition-colors">
                        {technicianToView.email}
                      </a>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic">No email registered</div>
                  )}
                </div>
              </div>

              {/* Operating Base / Address */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Base Location / Address</span>
                </div>
                <div className="text-sm font-semibold text-slate-800 line-clamp-2">
                  {technicianToView.address || 'Location not specified'}
                </div>
              </div>

              {/* Experience & Employment */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <Briefcase className="w-4 h-4 text-purple-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Experience & Engagement</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-slate-900">{technicianToView.experienceYears}</span>
                  <span className="text-xs text-slate-500 font-medium">Years Practical Experience</span>
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  {technicianToView.employmentType} Crew
                </div>
              </div>

              {/* Government ID & Compliance */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Identity Verification</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">{technicianToView.idProofType} Card</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-[#00C878]" /> Verified
                  </span>
                </div>
                <div className="font-mono text-xs font-bold text-slate-800 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                  {technicianToView.idProofNumber}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <UserCheck className="w-4 h-4 text-rose-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Emergency Contact</span>
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  {technicianToView.emergencyContact?.name || 'Not Listed'}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{technicianToView.emergencyContact?.relation || 'Relation'}</span>
                  {technicianToView.emergencyContact?.phone && (
                    <a
                      href={`tel:${technicianToView.emergencyContact.phone}`}
                      className="font-semibold text-rose-600 hover:underline"
                    >
                      {technicianToView.emergencyContact.phone}
                    </a>
                  )}
                </div>
              </div>

              {/* Registration Record */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">System Records</span>
                </div>
                <div className="text-xs text-slate-600">
                  Registered Date: <span className="font-semibold text-slate-800">{new Date(technicianToView.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="text-xs text-slate-500">
                  Last Updated: <span className="font-mono text-[11px]">{new Date(technicianToView.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            {/* Skills & Specialization Tags */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Certified Skills & Field Proficiencies ({technicianToView.skills?.length || 0})
                </h4>
              </div>
              <div className="flex flex-wrap gap-2 p-4 bg-slate-50/70 rounded-xl border border-slate-200/80">
                {(!technicianToView.skills || technicianToView.skills.length === 0) ? (
                  <span className="text-xs text-slate-400 italic">No specific skill tags entered.</span>
                ) : (
                  technicianToView.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-200 shadow-2xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00C878]" />
                      <span>{skill}</span>
                    </span>
                  ))
                )}
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
                <HardHat className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight">Technician Master</h1>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    {technicians.length} Registered
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage in-house engineers, facility field crew, skill specializations, credentials, and job allocations.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={exportCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
                title="Export technicians as CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={openCreateModal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00C878] hover:bg-[#00B069] text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Technician</span>
              </button>
            </div>
          </div>

          {/* 4 Summary KPI Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Crew</div>
                <div className="text-lg font-bold text-slate-900 font-mono">{technicians.length}</div>
                <div className="text-[10px] text-slate-500">Across 7 disciplines</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active On Duty</div>
                <div className="text-lg font-bold text-blue-700 font-mono">{activeCount}</div>
                <div className="text-[10px] text-blue-600 font-medium">Ready for deployment</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Full-Time Staff</div>
                <div className="text-lg font-bold text-purple-700 font-mono">{fullTimeCount}</div>
                <div className="text-[10px] text-slate-500">{technicians.length - fullTimeCount} Contractors</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">On Leave / Idle</div>
                <div className="text-lg font-bold text-amber-700 font-mono">{onLeaveCount}</div>
                <div className="text-[10px] text-amber-600 font-medium">Shift scheduled</div>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, ID, phone, skill..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00C878] focus:border-transparent text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              {/* Specialization Filter */}
              <select
                value={specializationFilter}
                onChange={(e) => {
                  setSpecializationFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00C878]"
              >
                <option value="All">All Disciplines</option>
                {TECHNICIAN_SPECIALIZATIONS.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
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
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>

              {/* Sort Field */}
              <div className="flex items-center gap-1">
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as any)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00C878]"
                >
                  <option value="createdAt">Date Joined</option>
                  <option value="name">Name</option>
                  <option value="technicianId">Technician ID</option>
                  <option value="experienceYears">Experience</option>
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

          {/* Main Technicians Table */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Technician</th>
                    <th className="py-3 px-4">Specialization</th>
                    <th className="py-3 px-4">Contact Info</th>
                    <th className="py-3 px-4">Experience & Skills</th>
                    <th className="py-3 px-4">Employment</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedTechnicians.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <HardHat className="w-8 h-8 text-slate-300 stroke-1" />
                          <p className="font-medium text-slate-600">No technicians found</p>
                          <p className="text-[11px] text-slate-400 max-w-xs">
                            Try modifying your search query or discipline filter, or add a new technician.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedTechnicians.map((tech) => (
                      <tr 
                        key={tech.technicianId} 
                        onContextMenu={(e) => handleContextMenu(e, tech)}
                        className="hover:bg-slate-50/70 transition-colors group cursor-default"
                      >
                        {/* Technician Name & ID */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#00C878] font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-200/60 uppercase">
                              {tech.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                <span>{tech.name}</span>
                                <span className="flex items-center text-[10px] font-bold text-amber-500">
                                  ★ {tech.rating || 5}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                  {tech.technicianId}
                                </span>
                                <button
                                  onClick={() => copyToClipboard(tech.technicianId)}
                                  className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                                  title="Copy Technician ID"
                                >
                                  {copiedId === tech.technicianId ? (
                                    <Check className="w-3 h-3 text-[#00C878]" />
                                  ) : (
                                    <Copy className="w-3 h-3 text-slate-400" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Specialization */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${getSpecializationBadge(tech.specialization)}`}>
                            <Wrench className="w-3 h-3" />
                            {tech.specialization}
                          </span>
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <a 
                              href={`tel:${tech.phone}`}
                              className="text-slate-800 hover:text-[#00C878] flex items-center gap-1 font-medium"
                            >
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{tech.phone}</span>
                            </a>
                            {tech.email && (
                              <a 
                                href={`mailto:${tech.email}`}
                                className="text-slate-500 hover:text-slate-700 flex items-center gap-1 text-[11px] truncate max-w-[160px]"
                              >
                                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{tech.email}</span>
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Experience & Skills */}
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-semibold text-slate-800 text-[11px]">
                              {tech.experienceYears} Years Exp
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1 max-w-[200px]">
                              {(tech.skills || []).slice(0, 2).map((skill, idx) => (
                                <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200 truncate">
                                  {skill}
                                </span>
                              ))}
                              {(tech.skills || []).length > 2 && (
                                <span className="text-[10px] text-slate-400">
                                  +{tech.skills.length - 2} more
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Employment */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <span className="text-[11px] font-semibold text-slate-700 block">
                              {tech.employmentType}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                              <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                              {tech.idProofType} Verified
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getStatusBadge(tech.status)}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setTechnicianToView(tech)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                              title="View Full Profile"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openEditModal(tech)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                              title="Edit Technician"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setTechnicianToDelete(tech);
                                setDeleteError(null);
                              }}
                              className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                              title="Delete Technician"
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

            {/* Pagination Footer */}
            <div className="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Showing <span className="font-semibold text-slate-800">{filteredTechnicians.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to{' '}
                <span className="font-semibold text-slate-800">{Math.min(currentPage * pageSize, filteredTechnicians.length)}</span> of{' '}
                <span className="font-semibold text-slate-800">{filteredTechnicians.length}</span> technicians
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
            {contextMenu.technician.technicianId} — {contextMenu.technician.name}
          </div>
          <button
            onClick={() => {
              setTechnicianToView(contextMenu.technician);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>View Details</span>
          </button>
          <button
            onClick={() => {
              openEditModal(contextMenu.technician);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 hover:text-[#00C878] transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Edit Technician</span>
          </button>
          <div className="h-px bg-slate-100 my-1" />
          <button
            onClick={() => {
              setTechnicianToDelete(contextMenu.technician);
              setDeleteError(null);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>Delete Technician</span>
          </button>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {technicianToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <Trash2 className="w-5 h-5" />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-sm">Delete Technician Profile</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <span className="font-semibold text-slate-800">"{technicianToDelete.name}"</span> ({technicianToDelete.technicianId})?
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
                  setTechnicianToDelete(null);
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
