import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  Receipt, 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Plus, 
  Trash2, 
  FileText, 
  CreditCard, 
  Landmark,
  Calculator,
  ShieldCheck,
  Calendar,
  Lock,
  RefreshCw,
  Edit3,
  Edit2,
  Eye,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import { 
  MasterTransaction, 
  Invoice, 
  QuotationItem, 
  GSTMode, 
  InvoiceBankDetails, 
  InvoicePayment,
  UOM_OPTIONS 
} from '../types';
import { db, formatINR, DEFAULT_BANK_DETAILS } from '../services/db';

export const InvoicePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedTid = searchParams.get('tid') || '';
  const isExplicitEdit = searchParams.get('edit') === 'true';

  // Eligible Transactions
  const [eligibleTransactions, setEligibleTransactions] = useState<MasterTransaction[]>([]);
  const [selectedTid, setSelectedTid] = useState<string>(preselectedTid);
  const [selectedTransaction, setSelectedTransaction] = useState<MasterTransaction | null>(null);

  // Form Fields
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [gstMode, setGstMode] = useState<GSTMode>('CGST_SGST');
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [notes, setNotes] = useState<string>('Payment due within 15 days of invoice date. 18% interest per annum applicable on delayed payments.');
  const [hsnCode, setHsnCode] = useState<string>('998451');
  const [poNumber, setPoNumber] = useState<string>('');
  const [poDate, setPoDate] = useState<string>('');

  // Payment Recording
  const [paymentStatus, setPaymentStatus] = useState<'Pending' | 'Partial' | 'Paid'>('Pending');
  const [paymentMode, setPaymentMode] = useState<string>('NEFT / RTGS');
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Bank Details
  const [bankDetails, setBankDetails] = useState<InvoiceBankDetails>(DEFAULT_BANK_DETAILS);

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [alreadyHasInvoice, setAlreadyHasInvoice] = useState<boolean>(false);

  const isQuoteCompleted = !selectedTransaction?.quotation || selectedTransaction.quotation.status === 'Completed' || (selectedTransaction.quotation.status as string) === 'Approved';

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    let list = db.getEligibleTransactionsForInvoice();
    if (preselectedTid && isExplicitEdit) {
      const existing = db.getTransactionById(preselectedTid);
      if (existing && !list.some(t => t.transactionId === preselectedTid)) {
        list = [existing, ...list];
      }
    }
    setEligibleTransactions(list);

    if (preselectedTid) {
      handleSelectTransaction(preselectedTid, list, isExplicitEdit);
    }
  }, [preselectedTid, isExplicitEdit]);

  const handleSelectTransaction = (tid: string, list = eligibleTransactions, isEdit = isExplicitEdit) => {
    setSelectedTid(tid);
    if (!tid) {
      setSelectedTransaction(null);
      setIsEditMode(false);
      setAlreadyHasInvoice(false);
      setItems([]);
      return;
    }
    const found = list.find(t => t.transactionId === tid) || db.getTransactionById(tid);

    if (found) {
      setSelectedTransaction(found);

      // Check if invoice already exists
      if (found.invoice) {
        if (!isEdit) {
          // Duplicate creation attempt! Block and display warning
          setIsEditMode(false);
          setAlreadyHasInvoice(true);
          showToast('error', `An Invoice (${found.invoice.invoiceId || tid}) already exists for Quotation ${tid}. Duplicate creation is not allowed.`);
          return;
        }

        // Explicit edit mode
        setAlreadyHasInvoice(false);
        setIsEditMode(true);
        const inv = found.invoice;
        setInvoiceDate(inv.invoiceDate);
        setDueDate(inv.dueDate);
        setGstMode(inv.gstMode);
        setItems(inv.items || []);
        setNotes(inv.notes || '');
        setHsnCode(inv.hsnCode || '998451');
        setPoNumber(inv.poNumber || '');
        setPoDate(inv.poDate || '');
        setBankDetails({
          bankName: inv.bankDetails?.bankName || DEFAULT_BANK_DETAILS.bankName,
          accountNumber: inv.bankDetails?.accountNumber || DEFAULT_BANK_DETAILS.accountNumber,
          ifsc: inv.bankDetails?.ifsc || DEFAULT_BANK_DETAILS.ifsc,
          branch: inv.bankDetails?.branch || DEFAULT_BANK_DETAILS.branch,
          accountName: inv.bankDetails?.accountName || DEFAULT_BANK_DETAILS.accountName,
        });
        setPaymentStatus(inv.payment.status);
        setPaymentMode(inv.payment.mode || 'NEFT / RTGS');
        setPaymentRef(inv.payment.referenceNumber || '');
        setAmountPaid(inv.payment.amountPaid || 0);
        setPaymentDate(inv.payment.date || new Date().toISOString().split('T')[0]);
      } else {
        // Brand new invoice for this transaction
        setAlreadyHasInvoice(false);
        setIsEditMode(false);
        setInvoiceDate(new Date().toISOString().split('T')[0]);
        setDueDate(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
        setHsnCode('998451');
        setPoNumber('');
        setPoDate('');

        // Inherit GST mode from quotation, or auto-detect based on client GSTIN
        if (found.quotation?.gstMode) {
          setGstMode(found.quotation.gstMode);
        } else {
          const clientGstin = found.clientSnapshot.gstin || '';
          if (clientGstin.startsWith('29') || clientGstin.startsWith('36')) {
            setGstMode('CGST_SGST');
          } else if (clientGstin.length >= 2) {
            setGstMode('IGST');
          } else {
            setGstMode('CGST_SGST');
          }
        }

        // Auto-populate line items from quotation
        if (found.quotation?.items && found.quotation.items.length > 0) {
          setItems([...found.quotation.items]);
        } else {
          setItems([
            {
              itemId: `inv-item-${Date.now()}`,
              categoryId: 'CAT-0001',
              materialName: 'Facility Maintenance & Operational Services',
              uom: 'Service',
              quantity: 1,
              rate: 50000,
              discount: 0,
              taxPercent: 18,
              taxAmount: 9000,
              amount: 59000,
              purpose: 'Facility Services Execution'
            }
          ]);
        }

        setPaymentStatus('Pending');
        setAmountPaid(0);
        setBankDetails(DEFAULT_BANK_DETAILS);
      }
    } else {
      setSelectedTransaction(null);
    }
  };

  const handleSyncFromQuotation = () => {
    if (selectedTransaction?.quotation) {
      if (selectedTransaction.quotation.gstMode) {
        setGstMode(selectedTransaction.quotation.gstMode);
      }
      if (selectedTransaction.quotation.items && selectedTransaction.quotation.items.length > 0) {
        setItems(selectedTransaction.quotation.items.map(it => {
          const name = it.description || it.materialName || '';
          const q = Number(it.quantity) || 1;
          const r = Number(it.rate ?? it.clientRate) || 0;
          const d = Number(it.discount) || 0;
          const baseAmt = Math.max(0, (q * r) - d);
          return {
            ...it,
            description: name,
            materialName: name,
            taxPercent: 0,
            taxAmount: 0,
            amount: baseAmt,
          };
        }));
      }
      showToast('success', 'Line items, rates, and GST structure synced from latest quotation.');
    } else {
      showToast('error', 'No quotation items found to sync.');
    }
  };

  const handleAddItemRow = () => {
    const newItem: QuotationItem = {
      itemId: `item-${Date.now()}`,
      categoryId: 'CAT-0001',
      materialName: '',
      description: '',
      uom: 'Nos',
      quantity: 1,
      rate: 0,
      discount: 0,
      taxPercent: 0,
      taxAmount: 0,
      amount: 0,
      purpose: ''
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length <= 1) {
      showToast('error', 'An invoice must have at least one line item.');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof QuotationItem, value: any) => {
    const updated = [...items];
    const row = { ...updated[index], [field]: value };

    if (field === 'materialName') {
      row.description = value;
    } else if (field === 'description') {
      row.materialName = value;
    }

    if (field === 'quantity' || field === 'rate' || field === 'discount') {
      const q = field === 'quantity' ? Number(value) : row.quantity;
      const r = field === 'rate' ? Number(value) : row.rate;
      const d = field === 'discount' ? Number(value) : (row.discount || 0);

      const taxable = Math.max(0, (q * r) - d);
      row.taxPercent = 0;
      row.taxAmount = 0;
      row.amount = taxable;
    }

    updated[index] = row;
    setItems(updated);
  };

  // Financial Computations
  const calculations = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;

    items.forEach(item => {
      const itemSubtotal = (item.quantity || 0) * (item.rate || 0);
      subtotal += itemSubtotal;
      totalDiscount += item.discount || 0;
    });

    const taxableAmount = Math.max(0, subtotal - totalDiscount);
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    let totalTax = 0;

    if (gstMode === 'CGST_SGST') {
      cgst = parseFloat((taxableAmount * 0.09).toFixed(2));
      sgst = parseFloat((taxableAmount * 0.09).toFixed(2));
      totalTax = parseFloat((cgst + sgst).toFixed(2));
    } else {
      igst = parseFloat((taxableAmount * 0.18).toFixed(2));
      totalTax = igst;
    }

    const grandTotal = parseFloat((taxableAmount + totalTax).toFixed(2));
    const currentPaid = Number(amountPaid) || 0;
    const balanceDue = Math.max(0, grandTotal - currentPaid);

    return {
      subtotal,
      totalDiscount,
      taxableAmount,
      cgst,
      sgst,
      igst,
      totalTax,
      grandTotal,
      balanceDue,
    };
  }, [items, amountPaid, gstMode]);

  // Adjust paid amount if status changes
  const handlePaymentStatusChange = (status: 'Pending' | 'Partial' | 'Paid') => {
    setPaymentStatus(status);
    if (status === 'Paid') {
      setAmountPaid(calculations.grandTotal);
    } else if (status === 'Pending') {
      setAmountPaid(0);
    } else if (status === 'Partial' && amountPaid === 0) {
      setAmountPaid(Math.round(calculations.grandTotal / 2));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTid) {
      showToast('error', 'Please select a Master Transaction ID.');
      return;
    }

    if (!isEditMode && (selectedTransaction?.invoice || alreadyHasInvoice)) {
      showToast('error', `An Invoice already exists for Quotation ${selectedTid}. Duplicate invoices cannot be created.`);
      return;
    }

    if (selectedTransaction?.quotation && !isQuoteCompleted) {
      showToast('error', `Quotation ${selectedTransaction.transactionId} must be set to Completed before creating an Invoice.`);
      return;
    }

    if (items.length === 0 || !items[0].materialName.trim()) {
      showToast('error', 'Please provide at least one valid invoice line item.');
      return;
    }

    const currentPaid = Number(amountPaid) || 0;
    const calcBalance = Math.max(0, calculations.grandTotal - currentPaid);

    const paymentData: InvoicePayment = {
      status: calcBalance === 0 ? 'Paid' : (currentPaid > 0 ? 'Partial' : 'Pending'),
      date: currentPaid > 0 ? paymentDate : undefined,
      mode: currentPaid > 0 ? (paymentMode as any) : undefined,
      referenceNumber: paymentRef.trim() || undefined,
      amountPaid: currentPaid,
      balanceDue: calcBalance,
    };

    const invoiceData: Omit<Invoice, 'createdAt' | 'updatedAt'> = {
      transactionId: selectedTid,
      invoiceDate,
      dueDate,
      clientId: selectedTransaction?.clientId || '',
      clientSnapshot: selectedTransaction!.clientSnapshot,
      items,
      gstMode,
      subtotal: calculations.subtotal,
      totalDiscount: calculations.totalDiscount,
      cgst: calculations.cgst,
      sgst: calculations.sgst,
      igst: calculations.igst,
      totalTax: calculations.totalTax,
      grandTotal: calculations.grandTotal,
      status: paymentData.status === 'Paid' ? 'Paid' : (paymentData.status === 'Partial' ? 'Partially Paid' : 'Pending'),
      payment: paymentData,
      bankDetails,
      notes: notes.trim(),
      hsnCode: hsnCode.trim() || undefined,
      poNumber: poNumber.trim() || undefined,
      poDate: poDate || undefined,
    };

    const res = db.saveInvoice(invoiceData, isEditMode);
    if (res.success) {
      showToast('success', res.message);
      setTimeout(() => {
        navigate(`/portal/transaction/${selectedTid}`);
      }, 1000);
    } else {
      showToast('error', res.message);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-lg text-sm font-medium border animate-in slide-in-from-bottom-2 ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-purple-600" />
            <span>{isEditMode ? 'Edit Commercial Tax Invoice' : 'Generate Commercial Tax Invoice'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Generates sequential Invoice ID (e.g. TMI2600001) linked to the Quotation ID. Computes GST and tracks payment settlement.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedTid && (
            <Link
              to={`/portal/transaction/${selectedTid}`}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              View Quotation Hub
            </Link>
          )}
          <button
            onClick={handleSave}
            disabled={alreadyHasInvoice}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all ${
              alreadyHasInvoice
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                : 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer'
            }`}
          >
            <Save className="w-4 h-4" /> {alreadyHasInvoice ? 'Invoice Already Exists' : 'Save & Issue Invoice'}
          </button>
        </div>
      </div>

      {/* Warning if Invoice already exists */}
      {alreadyHasInvoice && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-sm text-amber-900">Commercial Tax Invoice Already Generated</p>
              <p className="text-amber-800 mt-0.5 leading-relaxed">
                A Commercial Tax Invoice ({selectedTransaction?.invoice?.invoiceId || selectedTid}) has already been generated for Quotation <strong className="font-mono">{selectedTid}</strong>. Once an invoice is generated for a quotation, generating a duplicate invoice is not permitted.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to={`/portal/invoice/${selectedTransaction?.invoice?.invoiceId || selectedTid}`}
              className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" /> View Invoice
            </Link>
            <Link
              to={`/portal/invoice?tid=${selectedTid}&edit=true`}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Invoice
            </Link>
            <button
              type="button"
              onClick={() => handleSelectTransaction('', eligibleTransactions, false)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Select Another
            </button>
          </div>
        </div>
      )}

      {/* Warning banner if quotation is not completed */}
      {selectedTransaction?.quotation && !isQuoteCompleted && !alreadyHasInvoice && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900">Quotation Not Completed ({selectedTransaction.quotation.status})</p>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Commercial tax invoices can only be generated once the quotation is finalized and marked as <strong>Completed</strong>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                db.updateQuotationStatus(selectedTransaction.transactionId, 'Completed');
                const refreshed = db.getTransactionById(selectedTransaction.transactionId);
                if (refreshed) setSelectedTransaction(refreshed);
                showToast('success', `Quotation ${selectedTransaction.transactionId} marked as Completed! Invoice generation unlocked.`);
              }}
              className="px-3.5 py-2 rounded-lg bg-[#00C878] hover:bg-[#00B069] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Mark Quotation as Completed & Unlock
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} noValidate className="space-y-6">
        {/* Step 1: Quotation Association & Invoice ID */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              1. Quotation Association & Invoice Details
            </h2>
            <div className="flex items-center gap-2">
              {selectedTransaction?.invoice?.invoiceId ? (
                <span className="text-[11px] font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
                  Invoice ID: {selectedTransaction.invoice.invoiceId}
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Invoice ID: Auto-Generated (e.g. TMI2600001)
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Quotation ID <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedTid}
              onChange={(e) => handleSelectTransaction(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white cursor-pointer"
            >
              <option value="">-- Select Quotation ID --</option>
              {eligibleTransactions.map(t => (
                <option key={t.transactionId} value={t.transactionId}>
                  {t.transactionId} — {t.clientSnapshot.clientName} ({t.overallStatus})
                </option>
              ))}
            </select>
          </div>

          {/* HSN Code & Purchase Order Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                HSN / SAC Code
              </label>
              <input
                type="text"
                value={hsnCode}
                onChange={(e) => setHsnCode(e.target.value)}
                placeholder="e.g. 998451 (or blank for N/A)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                PO / WO Number
              </label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                placeholder="e.g. PO-2026-001 (or blank for N/A)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                PO / WO Date
              </label>
              <input
                type="date"
                value={poDate}
                onChange={(e) => setPoDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white cursor-pointer"
              />
            </div>
          </div>

          {/* Auto-populated Client Snapshot */}
          {selectedTransaction ? (
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 text-xs grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Billed To (Client)</span>
                <div className="font-bold text-slate-900 mt-0.5">{selectedTransaction.clientSnapshot.clientName}</div>
                <div className="text-slate-500 text-[11px] mt-0.5">{selectedTransaction.clientSnapshot.address}</div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Client GSTIN & Contact</span>
                <div className="font-mono font-bold text-slate-800 mt-0.5">
                  {selectedTransaction.clientSnapshot.gstin || 'Unregistered Client'}
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  {selectedTransaction.clientSnapshot.contactPerson} ({selectedTransaction.clientSnapshot.phone})
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Quotation Total</span>
                <div className="font-mono font-bold text-slate-900 mt-0.5">
                  {selectedTransaction.quotation ? formatINR(selectedTransaction.quotation.grandTotal) : 'No Quote'}
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  Service Execution: <span className="font-semibold text-emerald-700">{selectedTransaction.serviceReport?.status || 'Awaiting'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg border border-dashed border-slate-200 text-center text-slate-400 text-xs">
              Select a Master Transaction ID above to preview client billing details and quotation totals.
            </div>
          )}
        </div>

        {/* Step 2: Invoice Dates & Commercial Terms */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              2. Invoice Dates & Terms
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Invoice Issue Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Due Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                GST
              </label>
              <select
                value={gstMode}
                onChange={(e) => setGstMode(e.target.value as GSTMode)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
              >
                <option value="CGST_SGST">Intrastate</option>
                <option value="IGST">Interstate</option>
              </select>
            </div>
          </div>
        </div>

        {/* Step 3: Taxable Line Items Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  3. Commercial Items & Financials
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                  Synced from Quotation
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                All commercial items, quantities, rates, and GST calculations are strictly synced from the quotation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedTransaction?.quotation && (
                <Link
                  to={`/portal/quotation/${selectedTransaction.transactionId}?edit=true`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors"
                  title="Update line items or pricing in the quotation"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Quotation
                </Link>
              )}
              {selectedTransaction?.quotation?.items && selectedTransaction.quotation.items.length > 0 && (
                <button
                  type="button"
                  onClick={handleSyncFromQuotation}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  title="Reload items and rates directly from the latest quotation"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Re-Sync
                </button>
              )}
            </div>
          </div>

          {selectedTransaction?.quotation && (
            <div className="flex items-center justify-between p-3 bg-purple-50/80 border border-purple-200 rounded-lg text-xs text-purple-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  Items, rates, and taxes are synchronized from Quotation <strong className="font-mono">{selectedTransaction.transactionId}</strong>. All line item additions, deletions, rate changes, or tax adjustments must be made through the quotation.
                </span>
              </div>
              <Link
                to={`/portal/quotation/${selectedTransaction.transactionId}`}
                className="shrink-0 ml-3 inline-flex items-center gap-1 text-purple-700 hover:text-purple-900 font-semibold underline text-[11px]"
              >
                View Quotation <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 min-w-[220px]">Item / Description</th>
                  <th className="py-2.5 px-2 w-16 text-center">Qty</th>
                  <th className="py-2.5 px-2 w-20">UOM</th>
                  <th className="py-2.5 px-3 w-28 text-right">Rate (₹)</th>
                  <th className="py-2.5 px-2 w-24 text-right">Disc (₹)</th>
                  <th className="py-2.5 px-3 w-32 text-right">Amount (₹)</th>
                  <th className="py-2.5 px-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((row, index) => (
                  <tr key={row.itemId || index} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={row.description || row.materialName || ''}
                        onChange={(e) => handleItemChange(index, 'materialName', e.target.value)}
                        placeholder="Service description or item"
                        className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-purple-500 outline-none"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={row.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-14 px-1.5 py-1.5 border border-slate-200 rounded text-xs text-center font-mono focus:ring-1 focus:ring-purple-500 outline-none"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <select
                        value={row.uom}
                        onChange={(e) => handleItemChange(index, 'uom', e.target.value)}
                        className="w-full px-1 py-1.5 border border-slate-200 rounded text-xs bg-white focus:ring-1 focus:ring-purple-500 outline-none"
                      >
                        {UOM_OPTIONS.map(u => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={row.rate}
                        onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1.5 border border-slate-200 rounded text-xs text-right font-mono focus:ring-1 focus:ring-purple-500 outline-none"
                      />
                    </td>
                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={row.discount || 0}
                        onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1.5 border border-slate-200 rounded text-xs text-right font-mono focus:ring-1 focus:ring-purple-500 outline-none"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      {formatINR(row.amount)}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(index)}
                        className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                        title="Delete line"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tax Breakdown Summary Box */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <div className="w-full sm:w-80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Sum of Items):</span>
                <span className="font-mono font-medium text-slate-800">{formatINR(calculations.subtotal)}</span>
              </div>

              {calculations.totalDiscount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Total Discount:</span>
                  <span className="font-mono font-medium">-{formatINR(calculations.totalDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-700 font-semibold border-t border-slate-100 pt-1">
                <span>Taxable Amount:</span>
                <span className="font-mono">{formatINR(calculations.taxableAmount)}</span>
              </div>

              {gstMode === 'CGST_SGST' ? (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>CGST (9%):</span>
                    <span className="font-mono">{formatINR(calculations.cgst)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>SGST (9%):</span>
                    <span className="font-mono">{formatINR(calculations.sgst)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-slate-600">
                  <span>IGST (18%):</span>
                  <span className="font-mono">{formatINR(calculations.igst)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 font-medium">
                <span>Total GST ({gstMode === 'CGST_SGST' ? 'Intrastate 18%' : 'Interstate 18%'}):</span>
                <span className="font-mono font-bold text-slate-800">{formatINR(calculations.totalTax)}</span>
              </div>

              <div className="flex justify-between text-sm font-bold text-slate-900 border-t-2 border-slate-900 pt-2">
                <span>Grand Total:</span>
                <span className="font-mono text-purple-700">{formatINR(calculations.grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Payment Recording & Settlement */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              4. Payment Status & Initial Settlement
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePaymentStatusChange('Pending')}
                className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  paymentStatus === 'Pending' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Unpaid / Pending
              </button>
              <button
                type="button"
                onClick={() => handlePaymentStatusChange('Partial')}
                className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  paymentStatus === 'Partial' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Partially Paid
              </button>
              <button
                type="button"
                onClick={() => handlePaymentStatusChange('Paid')}
                className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  paymentStatus === 'Paid' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Fully Paid
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount Paid (₹)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                max={calculations.grandTotal}
                value={amountPaid || ''}
                onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Mode
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                disabled={amountPaid === 0}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-50"
              >
                <option value="NEFT / RTGS">NEFT / RTGS</option>
                <option value="IMPS">IMPS</option>
                <option value="Cheque">Cheque</option>
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bank Ref / UTR / Cheque No
              </label>
              <input
                type="text"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                disabled={amountPaid === 0}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-50"
                placeholder="e.g. HDFC20260901..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Received Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                disabled={amountPaid === 0}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-50"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
            <div>
              <span className="text-slate-500">Calculated Outstanding Due:</span>
              <span className="font-mono font-bold text-amber-700 text-sm ml-2">
                {formatINR(calculations.balanceDue)}
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              {calculations.balanceDue === 0 ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Fully Settled
                </span>
              ) : (
                <span>
                  Due on or before {(() => {
                    const match = dueDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
                    return match ? `${match[3]}-${match[2]}-${match[1]}` : dueDate;
                  })()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Step 5: Company Bank Account & Notes */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              5. Official Remittance Bank Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Beneficiary Bank</label>
              <input
                type="text"
                value={bankDetails.bankName}
                onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded"
                placeholder="e.g. HDFC Bank Ltd"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Account Number</label>
              <input
                type="text"
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                placeholder="e.g. 502000888991122"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">IFSC Code</label>
              <input
                type="text"
                value={bankDetails.ifsc}
                onChange={(e) => setBankDetails({ ...bankDetails, ifsc: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                placeholder="e.g. HDFC0000456"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Branch Address</label>
              <input
                type="text"
                value={bankDetails.branch || ''}
                onChange={(e) => setBankDetails({ ...bankDetails, branch: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded"
                placeholder="e.g. Nagole, HYD"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Terms & Conditions / Invoice Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={alreadyHasInvoice}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
              alreadyHasInvoice
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                : 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer'
            }`}
          >
            <Save className="w-4 h-4" /> {alreadyHasInvoice ? 'Invoice Already Exists' : 'Save & Issue Commercial Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
};
