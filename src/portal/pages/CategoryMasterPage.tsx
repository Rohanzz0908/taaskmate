import React, { useState, useEffect, useMemo } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowUpDown, 
  RotateCcw, 
  Sparkles, 
  Check, 
  X, 
  ArrowLeft,
  Eye
} from 'lucide-react';
import { db } from '../services/db';
import { Category } from '../types';

export const CategoryMasterPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // View Modal & Context Menu State
  const [viewCategory, setViewCategory] = useState<Category | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    category: Category;
  } | null>(null);

  // Search, sort & pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [sortField, setSortField] = useState<keyof Category>('categoryId');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Toast / feedback & Delete Modal
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);

  const loadData = () => {
    setCategories(db.getCategories());
    if (!isEditing) {
      setCategoryId(db.getNextCategoryId());
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
        setViewCategory(null);
      }
    };
    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleContextMenu = (e: React.MouseEvent, cat: Category) => {
    e.preventDefault();
    const menuWidth = 200;
    const menuHeight = 180;
    const x = e.clientX + menuWidth > window.innerWidth ? window.innerWidth - menuWidth - 10 : e.clientX;
    const y = e.clientY + menuHeight > window.innerHeight ? window.innerHeight - menuHeight - 10 : e.clientY;
    setContextMenu({ x, y, category: cat });
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleClear = () => {
    setIsEditing(false);
    setCategoryId(db.getNextCategoryId());
    setCategoryName('');
    setDescription('');
    setStatus('Active');
  };

  const handleEdit = (cat: Category) => {
    setIsEditing(true);
    setCategoryId(cat.categoryId);
    setCategoryName(cat.categoryName);
    setDescription(cat.description || '');
    setStatus(cat.status);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      showToast('error', 'Category Name is mandatory.');
      return;
    }

    const res = db.saveCategory({
      categoryId,
      categoryName,
      description,
      status,
    });

    if (res.success) {
      showToast('success', res.message);
      handleClear();
      setShowForm(false);
      loadData();
    } else {
      showToast('error', res.message);
    }
  };

  const handleToggleStatus = (id: string) => {
    const updated = db.toggleCategoryStatus(id);
    if (updated) {
      showToast('success', `Status changed to ${updated.status}.`);
      loadData();
    }
  };

  const confirmDelete = () => {
    if (!deleteModalId) return;
    const res = db.deleteCategory(deleteModalId);
    if (res.success) {
      showToast('success', res.message);
      loadData();
      if (categoryId === deleteModalId) {
        handleClear();
      }
    } else {
      showToast('error', res.message);
    }
    setDeleteModalId(null);
  };

  // Filtered & sorted categories
  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        const matchesSearch = 
          cat.categoryId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || cat.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const aVal = a[sortField] || '';
        const bVal = b[sortField] || '';
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [categories, searchQuery, statusFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1;
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = (field: keyof Category) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div 
          className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-semibold text-white animate-fadeIn ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {showForm ? (
        /* Full Page Form View */
        <div className="space-y-6 animate-fadeIn">
          {/* Form Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  handleClear();
                  setShowForm(false);
                }}
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                title="Back to Categories"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <FolderKanban className="w-6 h-6 text-brand-green" />
                  <span>{isEditing ? `Edit Category (${categoryId})` : 'Create New Category'}</span>
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  handleClear();
                  setShowForm(false);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>

          {/* Full Form Card */}
          <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <div className="flex items-center gap-2 pb-4 mb-6 border-b border-slate-100">
              <span className={`w-2.5 h-2.5 rounded-full ${isEditing ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
              <h3 className="text-base font-bold text-slate-800">
                {isEditing ? 'Category Details' : 'New Category Details'}
              </h3>
              {isEditing && (
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 ml-auto">
                  Editing Mode Active
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Auto Category ID */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    CATEGORY ID
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={categoryId}
                    className="w-full px-3.5 py-2.5 bg-slate-100 text-slate-600 rounded-xl border border-slate-200 text-sm font-mono font-bold cursor-not-allowed"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Auto-generated sequence</span>
                </div>

                {/* Category Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    CATEGORY NAME <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Plumbing Spares & Fittings"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white text-slate-800 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    STATUS
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                    className="w-full px-3.5 py-2.5 bg-white text-slate-800 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  DESCRIPTION (OPTIONAL)
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide a brief summary of materials, equipment, or service items falling under this category..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white text-slate-800 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 resize-none"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? 'Update Category' : 'Save Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : viewCategory ? (
        /* Full Page View Category Details */
        <div className="space-y-6 animate-fadeIn">
          {/* View Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewCategory(null)}
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                title="Back to Categories"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <FolderKanban className="w-6 h-6 text-brand-green" />
                  <span>Category Details</span>
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    {viewCategory.categoryId}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Viewing category classification, description, and status
                </p>
              </div>
            </div>
          </div>

          {/* Full View Card */}
          <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
            {/* Top Bar with Name and Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Category Name</span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{viewCategory.categoryName}</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-medium">Status:</span>
                <span 
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    viewCategory.status === 'Active' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {viewCategory.status === 'Active' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>{viewCategory.status}</span>
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Description</span>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-sm leading-relaxed min-h-[80px]">
                {viewCategory.description || (
                  <span className="italic text-slate-400">No description provided for this category.</span>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
              <div>
                <span className="text-slate-400">Created Date: </span>
                <span className="font-mono font-semibold text-slate-700">
                  {viewCategory.createdAt ? viewCategory.createdAt.split('T')[0] : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Last Modified: </span>
                <span className="font-mono font-semibold text-slate-700">
                  {viewCategory.updatedAt ? viewCategory.updatedAt.split('T')[0] : 'N/A'}
                </span>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* Full Table List View */
        <div className="space-y-6 animate-fadeIn">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <FolderKanban className="w-6 h-6 text-brand-green" />
                <span>Category Master</span>
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  handleClear();
                  setShowForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white font-bold text-xs shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>
          </div>

          {/* Category Table Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Table Filters & Search */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search category name or ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-brand-green"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs text-slate-700 focus:outline-none focus:border-brand-green cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </div>

          <div className="text-xs text-slate-500">
            Showing <strong>{filteredCategories.length}</strong> categories
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <th className="py-3 px-4 cursor-pointer" onClick={() => toggleSort('categoryId')}>
                  <div className="flex items-center gap-1">
                    <span>Category ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer" onClick={() => toggleSort('categoryName')}>
                  <div className="flex items-center gap-1">
                    <span>Category Name</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 hidden md:table-cell">Description</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 hidden sm:table-cell cursor-pointer" onClick={() => toggleSort('createdAt')}>
                  <div className="flex items-center gap-1">
                    <span>Created Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No categories found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((cat) => (
                  <tr 
                    key={cat.categoryId} 
                    onContextMenu={(e) => handleContextMenu(e, cat)}
                    className="hover:bg-slate-50/80 transition-colors group cursor-context-menu"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {cat.categoryId}
                    </td>
                    <td className="py-3 px-4 font-semibold text-brand-navy">
                      {cat.categoryName}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate hidden md:table-cell">
                      {cat.description || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleStatus(cat.categoryId)}
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                          cat.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {cat.status === 'Active' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <XCircle className="w-3 h-3 text-slate-400" />
                        )}
                        <span>{cat.status}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-slate-500 hidden sm:table-cell">
                      {cat.createdAt}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewCategory(cat)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEdit(cat)}
                          className="p-1.5 text-slate-400 hover:text-brand-green hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteModalId(cat.categoryId)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Category"
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
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold ${
                    currentPage === i + 1 ? 'bg-brand-navy text-white' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )}

      {/* Right Click Context Menu */}
      {contextMenu && (
        <div 
          className="fixed z-50 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 w-48 text-xs font-medium text-slate-700 animate-fadeIn"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
            {contextMenu.category.categoryId}
          </div>
          <button
            onClick={() => {
              setViewCategory(contextMenu.category);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 hover:text-brand-navy transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>View Details</span>
          </button>
          <button
            onClick={() => {
              handleEdit(contextMenu.category);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 hover:text-brand-green transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Edit Category</span>
          </button>
          <button
            onClick={() => {
              handleToggleStatus(contextMenu.category.categoryId);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 hover:text-brand-green transition-colors cursor-pointer"
          >
            {contextMenu.category.status === 'Active' ? (
              <XCircle className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>Set as {contextMenu.category.status === 'Active' ? 'Inactive' : 'Active'}</span>
          </button>
          <div className="h-px bg-slate-100 my-1" />
          <button
            onClick={() => {
              setDeleteModalId(contextMenu.category.categoryId);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
            <span>Delete Category</span>
          </button>
        </div>
      )}



      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-center text-slate-900 mb-2">Delete Category?</h4>
            <p className="text-xs text-center text-slate-600 mb-6">
              Are you sure you want to permanently delete category <strong>{deleteModalId}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteModalId(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow"
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
