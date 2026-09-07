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
  X
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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-brand-green" />
            <span>Category Master</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure service domains, materials catalog, and operational category taxonomy.
          </p>
        </div>

        <div className="text-xs text-slate-500 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
          <span>Total Categories:</span>
          <span className="font-bold text-brand-navy">{categories.length}</span>
        </div>
      </div>

      {/* Creation / Edit Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isEditing ? 'bg-amber-500' : 'bg-brand-green'}`}></span>
            <h3 className="text-base font-bold text-slate-800">
              {isEditing ? `Edit Category (${categoryId})` : 'Create New Category'}
            </h3>
          </div>
          {isEditing && (
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Editing Mode Active
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Auto Category ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Category ID
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
                Category Name <span className="text-red-500">*</span>
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
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                className="w-full px-3.5 py-2.5 bg-white text-slate-800 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Provide a brief summary of materials, equipment, or service items falling under this category..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white text-slate-800 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 resize-none"
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
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
              className="px-6 py-2.5 bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Update Category' : 'Save Category'}</span>
            </button>
          </div>
        </form>
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
                  <tr key={cat.categoryId} className="hover:bg-slate-50/80 transition-colors group">
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
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="p-1.5 text-slate-500 hover:text-brand-green hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteModalId(cat.categoryId)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
