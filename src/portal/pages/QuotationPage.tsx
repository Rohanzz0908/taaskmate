import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FileSpreadsheet, 
  Plus, 
  Trash2, 
  Save, 
  Printer, 
  ArrowLeft, 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  ShieldCheck
} from 'lucide-react';
import { 
  Category, 
  Client, 
  ClientSnapshot, 
  Quotation, 
  QuotationItem, 
  QuotationStatus, 
  UOM_OPTIONS, 
  UOMType 
} from '../types';
import { db, formatINR } from '../services/db';

export const QuotationPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Master Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  // Form State
  const [quotationId, setQuotationId] = useState('');
  const [quotationDate, setQuotationDate] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [status, setStatus] = useState<QuotationStatus>('Draft');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientSnapshot, setClientSnapshot] = useState<ClientSnapshot | null>(null);
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [notes, setNotes] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');

  // UI state
  const [isEditMode, setIsEditMode] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Load initial data
  useEffect(() => {
    const cats = db.getCategories();
    const clis = db.getClients();
    setCategories(cats);
    setClients(clis);

    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    if (id) {
      // Edit mode
      const existingQuote = db.getQuotationById(id);
      if (existingQuote) {
        setIsEditMode(true);
        setQuotationId(existingQuote.quotationId);
        setQuotationDate(existingQuote.quotationDate);
        setValidUntil(existingQuote.validUntil);
        setStatus(existingQuote.status);
        setSelectedClientId(existingQuote.clientId);
        setClientSnapshot(existingQuote.clientSnapshot);
        setItems(existingQuote.items);
        setNotes(existingQuote.notes || '');
        setPaymentTerms(existingQuote.paymentTerms || '');
      } else {
        showToast('error', `Quotation ${id} not found.`);
        navigate('/portal/quotations');
      }
    } else {
      // New quote
      setIsEditMode(false);
      setQuotationId(db.getNextQuotationId());
      setQuotationDate(today);
      setValidUntil(thirtyDaysLater);
      setStatus('Draft');
      setNotes('1. All materials supplied conform strictly to Indian ISI/ISO and LEED safety benchmarks.\n2. Work will be executed by certified and insured Taaskmate facility specialists.\n3. Any structural civil changes outside the scope will require additional estimation.');
      setPaymentTerms('50% mobilization advance along with signed Purchase Order, balance 50% upon successful joint inspection and sign-off within 15 days.');

      // Default first row
      const firstCat = cats[0];
      setItems([
        {
          itemId: `item-${Date.now()}-1`,
          categoryId: firstCat ? firstCat.categoryId : '',
          materialName: firstCat ? firstCat.categoryName : 'Plumbing & Pipeline Spares',
          uom: 'Nos',
          quantity: 1,
          rate: 1500,
          discount: 0,
          taxPercent: 18,
          taxAmount: 270,
          amount: 1770,
          purpose: 'Scheduled preventive inspection & fixture tuning',
        }
      ]);
    }
  }, [id, navigate]);

  // Handle Client Change & Freeze Snapshot
  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find(c => c.clientId === clientId);
    if (client) {
      setClientSnapshot({
        clientId: client.clientId,
        clientName: client.clientName,
        address: client.address,
        email: client.email,
        phone: client.phone,
        gstin: client.gstin,
        contactPerson: client.contactPerson,
      });
      setFormErrors(prev => ({ ...prev, client: '' }));
    } else {
      setClientSnapshot(null);
    }
  };

  // Recalculate row amounts
  const updateItemField = (
    index: number, 
    field: keyof QuotationItem, 
    value: any
  ) => {
    setItems(prevItems => {
      const updated = [...prevItems];
      const item = { ...updated[index], [field]: value };

      if (field === 'categoryId') {
        const cat = categories.find(c => c.categoryId === value);
        if (cat) {
          item.materialName = cat.categoryName;
        }
      }

      // Calculations
      const qty = Math.max(0, Number(item.quantity) || 0);
      const rate = Math.max(0, Number(item.rate) || 0);
      const discount = Math.max(0, Number(item.discount) || 0);
      const taxPercent = Math.max(0, Number(item.taxPercent) || 0);

      const baseAmount = Math.max(0, (qty * rate) - discount);
      const taxAmount = (baseAmount * taxPercent) / 100;
      const totalAmount = baseAmount + taxAmount;

      item.quantity = qty;
      item.rate = rate;
      item.discount = discount;
      item.taxPercent = taxPercent;
      item.taxAmount = parseFloat(taxAmount.toFixed(2));
      item.amount = parseFloat(totalAmount.toFixed(2));

      updated[index] = item;
      return updated;
    });
  };

  const addItemRow = () => {
    const firstCat = categories[0];
    const newItem: QuotationItem = {
      itemId: `item-${Date.now()}-${items.length + 1}`,
      categoryId: firstCat ? firstCat.categoryId : '',
      materialName: firstCat ? firstCat.categoryName : 'General Maintenance Item',
      uom: 'Nos',
      quantity: 1,
      rate: 1000,
      discount: 0,
      taxPercent: 18,
      taxAmount: 180,
      amount: 1180,
      purpose: '',
    };
    setItems(prev => [...prev, newItem]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) {
      showToast('error', 'A quotation must contain at least one line item.');
      return;
    }
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Summary Totals
  const totals = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    let grandTotal = 0;

    items.forEach(item => {
      const lineSubtotal = item.quantity * item.rate;
      subtotal += lineSubtotal;
      totalDiscount += item.discount;
      totalTax += item.taxAmount;
      grandTotal += item.amount;
    });

    return {
      subtotal,
      totalDiscount,
      totalTax,
      grandTotal,
    };
  }, [items]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!selectedClientId || !clientSnapshot) {
      errors.client = 'Please select a valid client from the directory.';
    }

    if (!quotationDate) {
      errors.date = 'Quotation date is required.';
    }

    if (items.length === 0) {
      errors.items = 'Please add at least one line item to the quotation.';
    }

    for (let i = 0; i < items.length; i++) {
      if (!items[i].materialName.trim()) {
        errors.items = `Row #${i + 1}: Material item name is required.`;
        break;
      }
      if (items[i].quantity <= 0) {
        errors.items = `Row #${i + 1}: Quantity must be greater than 0.`;
        break;
      }
      if (items[i].rate < 0) {
        errors.items = `Row #${i + 1}: Rate cannot be negative.`;
        break;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = (andPrint: boolean = false) => {
    if (!validate() || !clientSnapshot) return;

    const payload: Omit<Quotation, 'createdAt' | 'updatedAt'> = {
      transactionId: quotationId,
      quotationId,
      quotationDate,
      validUntil,
      clientId: selectedClientId,
      clientSnapshot,
      items,
      subtotal: totals.subtotal,
      totalDiscount: totals.totalDiscount,
      totalTax: totals.totalTax,
      grandTotal: totals.grandTotal,
      status,
      notes,
      paymentTerms,
    };

    const res = db.saveQuotation(payload);
    if (res.success) {
      showToast('success', res.message);
      if (andPrint) {
        navigate(`/portal/quotation/${quotationId}?print=true`);
      } else {
        setTimeout(() => {
          navigate(`/portal/transaction/${quotationId}`);
        }, 500);
      }
    } else {
      showToast('error', res.message);
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Toast */}
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

      {/* Header Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => navigate('/portal/quotations')}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Back to quotations list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                {isEditMode ? `Edit Quotation ${quotationId}` : 'Create Commercial Quotation'}
              </h1>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                status === 'Sent' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Draft material estimates, assign recipient, and calculate tax schedules.
            </p>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => handleSave(false)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-[#00C878]" />
            <span>Save Quotation</span>
          </button>

          <button
            onClick={() => handleSave(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00C878] hover:bg-[#00B069] text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Save & Preview PDF</span>
          </button>
        </div>
      </div>

      {formErrors.items && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formErrors.items}</span>
        </div>
      )}

      {/* Top Metadata Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quotation Identity Details */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-3.5 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2.5">
            <FileSpreadsheet className="w-4 h-4 text-[#00C878]" />
            <span>Quotation Particulars</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-slate-700 text-xs">
                Master Transaction ID
              </label>
              <span className="text-[10px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                LIFECYCLE ID
              </span>
            </div>
            <input
              type="text"
              value={quotationId}
              disabled
              className="w-full px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-900 font-mono text-xs font-bold cursor-not-allowed shadow-inner"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Generated once. Shared across Quotation, Service Report, and Invoice.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Date Issued <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={quotationDate}
                onChange={(e) => setQuotationDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00C878]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Valid Until <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00C878]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              Approval Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as QuotationStatus)}
              className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00C878] cursor-pointer"
            >
              <option value="Draft">Draft (Internal Review)</option>
              <option value="Sent">Sent (Awaiting PO)</option>
              <option value="Approved">Approved & Confirmed</option>
              <option value="Rejected">Rejected / Cancelled</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Client Selection & Snapshot */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between text-xs">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3.5">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Building2 className="w-4 h-4 text-[#00C878]" />
                <span>Client & Billing Recipient</span>
              </div>
              <button
                type="button"
                onClick={() => navigate('/portal/client-master')}
                className="text-xs text-[#00C878] hover:underline font-medium cursor-pointer"
              >
                + Register New Client
              </button>
            </div>

            <div className="mb-3">
              <label className="block font-semibold text-slate-600 mb-1">
                Select Client <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => handleClientSelect(e.target.value)}
                className={`w-full px-3 py-1.5 rounded-lg bg-white border ${
                  formErrors.client ? 'border-rose-400' : 'border-slate-200'
                } text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00C878] cursor-pointer`}
              >
                <option value="">-- Choose Client from Master Directory --</option>
                {clients.map(client => (
                  <option key={client.clientId} value={client.clientId}>
                    {client.clientName} ({client.clientId})
                  </option>
                ))}
              </select>
              {formErrors.client && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {formErrors.client}
                </p>
              )}
            </div>

            {/* Client Snapshot Card */}
            {clientSnapshot ? (
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-bold text-slate-900 text-xs">
                    {clientSnapshot.clientName}
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 font-mono text-[11px] text-slate-700">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>GSTIN: {clientSnapshot.gstin}</span>
                  </div>
                </div>
                <p className="text-slate-500 text-[11px]">
                  <span className="font-medium text-slate-700">Address:</span> {clientSnapshot.address}
                </p>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-0.5 text-[11px] text-slate-600 pt-1 border-t border-slate-200/70">
                  <span><strong>Contact:</strong> {clientSnapshot.contactPerson}</span>
                  <span><strong>Email:</strong> {clientSnapshot.email}</span>
                  <span><strong>Phone:</strong> {clientSnapshot.phone}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg border border-dashed border-slate-200 text-center text-slate-400 text-xs">
                Select a client above to preview their official registered address and GSTIN credentials.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Line Items Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#00C878]" />
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Material & Scope Line Items</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-[#00C878] border border-emerald-200/60">
              {items.length} item{items.length > 1 ? 's' : ''}
            </span>
          </div>
          <button
            type="button"
            onClick={addItemRow}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00C878] hover:bg-[#00B069] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add Row</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200 uppercase font-semibold text-slate-500 text-[11px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3 text-center w-10">#</th>
                <th className="py-2.5 px-4 min-w-[220px]">Material Item / Category</th>
                <th className="py-2.5 px-3 min-w-[90px]">UOM</th>
                <th className="py-2.5 px-3 w-20">Qty</th>
                <th className="py-2.5 px-3 w-24">Rate (₹)</th>
                <th className="py-2.5 px-3 w-20">Disc (₹)</th>
                <th className="py-2.5 px-3 w-20">GST %</th>
                <th className="py-2.5 px-4 text-right min-w-[110px]">Net Total (₹)</th>
                <th className="py-2.5 px-3 text-center w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, idx) => (
                <tr key={item.itemId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-3 text-center font-bold text-slate-400">
                    {idx + 1}
                  </td>

                  {/* Category / Material */}
                  <td className="py-3 px-4">
                    <select
                      value={item.categoryId}
                      onChange={(e) => updateItemField(idx, 'categoryId', e.target.value)}
                      className="w-full px-2 py-1 rounded bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00C878] mb-1 cursor-pointer"
                    >
                      {categories.map(c => (
                        <option key={c.categoryId} value={c.categoryId}>
                          {c.categoryName} ({c.categoryId})
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Detailed work scope / item notes..."
                      value={item.purpose || ''}
                      onChange={(e) => updateItemField(idx, 'purpose', e.target.value)}
                      className="w-full px-2 py-1 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-600 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00C878]"
                    />
                  </td>

                  {/* UOM */}
                  <td className="py-3 px-3">
                    <select
                      value={item.uom}
                      onChange={(e) => updateItemField(idx, 'uom', e.target.value as UOMType)}
                      className="w-full px-2 py-1 rounded bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00C878] cursor-pointer"
                    >
                      {UOM_OPTIONS.map(uom => (
                        <option key={uom} value={uom}>{uom}</option>
                      ))}
                    </select>
                  </td>

                  {/* Quantity */}
                  <td className="py-3 px-3">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={(e) => updateItemField(idx, 'quantity', e.target.value)}
                      className="w-full px-2 py-1 rounded bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00C878] text-right"
                    />
                  </td>

                  {/* Rate */}
                  <td className="py-3 px-3">
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={item.rate}
                      onChange={(e) => updateItemField(idx, 'rate', e.target.value)}
                      className="w-full px-2 py-1 rounded bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00C878] text-right"
                    />
                  </td>

                  {/* Discount */}
                  <td className="py-3 px-3">
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={item.discount}
                      onChange={(e) => updateItemField(idx, 'discount', e.target.value)}
                      className="w-full px-2 py-1 rounded bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00C878] text-right"
                    />
                  </td>

                  {/* Tax % */}
                  <td className="py-3 px-3">
                    <select
                      value={item.taxPercent}
                      onChange={(e) => updateItemField(idx, 'taxPercent', e.target.value)}
                      className="w-full px-2 py-1 rounded bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00C878] text-right cursor-pointer"
                    >
                      <option value={0}>0%</option>
                      <option value={5}>5%</option>
                      <option value={12}>12%</option>
                      <option value={18}>18%</option>
                      <option value={28}>28%</option>
                    </select>
                  </td>

                  {/* Net Total */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {formatINR(item.amount)}
                    </span>
                    <div className="text-[10px] text-slate-400">
                      GST: {formatINR(item.taxAmount)}
                    </div>
                  </td>

                  {/* Delete button */}
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => removeItemRow(idx)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove line"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom add action */}
        <div className="p-3 bg-slate-50/60 border-t border-slate-200 flex justify-between items-center text-xs">
          <button
            type="button"
            onClick={addItemRow}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#00C878]" />
            <span>Add Item Row</span>
          </button>
          <span className="text-slate-400 text-[11px]">
            {items.length} line item{items.length > 1 ? 's' : ''} configured
          </span>
        </div>
      </div>

      {/* Summary Calculation & Terms */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs">
        {/* Notes & Terms */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-3.5">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Work Execution Scope & Special Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Work will be carried out over weekend night shifts..."
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00C878]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Commercial Terms & Payment Milestones
            </label>
            <textarea
              rows={3}
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              placeholder="e.g. 50% advance on PO, 50% against work completion..."
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00C878]"
            />
          </div>
        </div>

        {/* Calculation Totals Card */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2.5 mb-3 text-xs uppercase tracking-wider">
              Financial Summary (INR)
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Subtotal (Base Value):</span>
                <span className="font-mono font-medium text-slate-800">{formatINR(totals.subtotal)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>Commercial Discount:</span>
                <span className="font-mono font-medium text-emerald-600">
                  - {formatINR(totals.totalDiscount)}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>GST Tax (CGST + SGST):</span>
                <span className="font-mono font-medium text-slate-800">{formatINR(totals.totalTax)}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900 block text-sm">Grand Total:</span>
                  <span className="text-[10px] text-slate-400">Inclusive of all taxes</span>
                </div>
                <span className="text-xl font-bold font-mono text-[#00C878]">
                  {formatINR(totals.grandTotal)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/portal/quotations')}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00C878] hover:bg-[#00B069] text-white font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isEditMode ? 'Update Quotation' : 'Save Quotation'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
