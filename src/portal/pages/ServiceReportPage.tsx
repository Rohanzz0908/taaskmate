import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  Wrench, 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  FileText,
  UserCheck,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { 
  MasterTransaction, 
  ServiceReport, 
  QuotationItem, 
  UOM_OPTIONS,
  ServiceReportStatus 
} from '../types';
import { db, formatINR } from '../services/db';

export const ServiceReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedTid = searchParams.get('tid') || '';

  // Eligible Transactions
  const [eligibleTransactions, setEligibleTransactions] = useState<MasterTransaction[]>([]);
  const [selectedTid, setSelectedTid] = useState<string>(preselectedTid);
  const [selectedTransaction, setSelectedTransaction] = useState<MasterTransaction | null>(null);

  // Form Fields
  const [serviceDate, setServiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [assignedTechnician, setAssignedTechnician] = useState<string>('');
  const [serviceType, setServiceType] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [workDescription, setWorkDescription] = useState<string>('');
  const [materialsUsed, setMaterialsUsed] = useState<QuotationItem[]>([]);
  const [technicianRemarks, setTechnicianRemarks] = useState<string>('');
  const [customerRemarks, setCustomerRemarks] = useState<string>('');
  const [status, setStatus] = useState<ServiceReportStatus>('Completed');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerSignature, setCustomerSignature] = useState<string>('');
  const [technicianName, setTechnicianName] = useState<string>('');
  const [technicianSignature, setTechnicianSignature] = useState<string>('');

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const list = db.getEligibleTransactionsForServiceReport();
    setEligibleTransactions(list);

    if (preselectedTid) {
      handleSelectTransaction(preselectedTid, list);
    } else if (list.length > 0) {
      handleSelectTransaction(list[0].transactionId, list);
    }
  }, [preselectedTid]);

  const handleSelectTransaction = (tid: string, list = eligibleTransactions) => {
    setSelectedTid(tid);
    const found = list.find(t => t.transactionId === tid) || db.getTransactionById(tid);
    
    if (found) {
      setSelectedTransaction(found);

      // Check if service report already exists for this transaction (Edit mode)
      if (found.serviceReport) {
        setIsEditMode(true);
        const sr = found.serviceReport;
        setServiceDate(sr.serviceDate);
        setAssignedTechnician(sr.assignedTechnician);
        setServiceType(sr.serviceType);
        setLocation(sr.location);
        setWorkDescription(sr.workDescription);
        setMaterialsUsed(sr.materialsUsed || []);
        setTechnicianRemarks(sr.technicianRemarks || '');
        setCustomerRemarks(sr.customerRemarks || '');
        setStatus(sr.status);
        setCustomerName(sr.customerName || found.clientSnapshot.contactPerson || '');
        setCustomerSignature(sr.customerSignature || '');
        setTechnicianName(sr.technicianName || '');
        setTechnicianSignature(sr.technicianSignature || '');
      } else {
        // Brand new service report for this transaction
        setIsEditMode(false);
        setServiceDate(new Date().toISOString().split('T')[0]);
        setCustomerName(found.clientSnapshot.contactPerson || found.clientSnapshot.clientName);
        setLocation(found.clientSnapshot.address.split(',')[0] || 'Client Premises');
        
        // Auto populate materials used from quotation items
        if (found.quotation?.items) {
          setMaterialsUsed([...found.quotation.items]);
          setServiceType(found.quotation.items[0]?.materialName || 'Facility Maintenance & Repair');
        } else {
          setMaterialsUsed([]);
          setServiceType('General Facility Maintenance');
        }

        setWorkDescription('Executed scheduled preventive & corrective maintenance according to quotation specification.');
        setAssignedTechnician('Ramesh Gowda (Senior Facility Specialist)');
        setTechnicianName('Ramesh Gowda');
        setTechnicianSignature('Ramesh Gowda [Signed & Verified]');
        setCustomerSignature(`${found.clientSnapshot.contactPerson || 'Client Rep'} [Signed]`);
        setStatus('Completed');
      }
    } else {
      setSelectedTransaction(null);
    }
  };

  const handleAddMaterialRow = () => {
    const newItem: QuotationItem = {
      itemId: `mat-${Date.now()}`,
      categoryId: 'CAT-0001',
      materialName: '',
      uom: 'Nos',
      quantity: 1,
      rate: 0,
      discount: 0,
      taxPercent: 18,
      taxAmount: 0,
      amount: 0,
      purpose: 'Field installation / replacement'
    };
    setMaterialsUsed([...materialsUsed, newItem]);
  };

  const handleRemoveMaterialRow = (index: number) => {
    const updated = materialsUsed.filter((_, i) => i !== index);
    setMaterialsUsed(updated);
  };

  const handleMaterialChange = (index: number, field: keyof QuotationItem, value: any) => {
    const updated = [...materialsUsed];
    const row = { ...updated[index], [field]: value };

    if (field === 'quantity' || field === 'rate' || field === 'taxPercent' || field === 'discount') {
      const q = field === 'quantity' ? Number(value) : row.quantity;
      const r = field === 'rate' ? Number(value) : row.rate;
      const d = field === 'discount' ? Number(value) : row.discount;
      const tp = field === 'taxPercent' ? Number(value) : row.taxPercent;

      const taxable = Math.max(0, (q * r) - d);
      const taxAmt = (taxable * tp) / 100;
      row.taxAmount = taxAmt;
      row.amount = taxable + taxAmt;
    }

    updated[index] = row;
    setMaterialsUsed(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTid) {
      showToast('error', 'Please select a Master Transaction ID.');
      return;
    }

    if (!assignedTechnician.trim()) {
      showToast('error', 'Please enter assigned technician name.');
      return;
    }

    const reportData: Omit<ServiceReport, 'createdAt' | 'updatedAt'> = {
      transactionId: selectedTid,
      serviceDate,
      assignedTechnician: assignedTechnician.trim(),
      serviceType: serviceType.trim(),
      location: location.trim(),
      workDescription: workDescription.trim(),
      materialsUsed,
      technicianRemarks: technicianRemarks.trim(),
      customerRemarks: customerRemarks.trim(),
      status,
      customerName: customerName.trim(),
      customerSignature: customerSignature.trim(),
      technicianName: technicianName.trim(),
      technicianSignature: technicianSignature.trim(),
      beforeImages: [],
      afterImages: []
    };

    const res = db.saveServiceReport(reportData);
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
            <Wrench className="w-6 h-6 text-[#00C878]" />
            <span>{isEditMode ? 'Edit Service Report' : 'Create Service Report'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Linked directly to the unified Master Transaction ID. Field report, materials used, and sign-off.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedTid && (
            <Link
              to={`/portal/transaction/${selectedTid}`}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              View Transaction Hub
            </Link>
          )}
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00C878] hover:bg-[#00B069] text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Service Report
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Step 1: Master Transaction Selector */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              1. Master Transaction Association
            </h2>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              MANDATORY TRANSACTION LINK
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Master Transaction ID <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedTid}
                onChange={(e) => handleSelectTransaction(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#00C878] focus:border-transparent outline-none bg-white"
              >
                {eligibleTransactions.map(t => (
                  <option key={t.transactionId} value={t.transactionId}>
                    {t.transactionId} — {t.clientSnapshot.clientName} ({t.overallStatus})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Every service report must be linked to an existing Master Transaction ID (`TM-YYYY-XXXX`).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Execution Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ServiceReportStatus)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#00C878] focus:border-transparent outline-none bg-white"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed (Ready for Invoicing)</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Auto-populated Client Snapshot */}
          {selectedTransaction && (
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 text-xs grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Client / Premises</span>
                <div className="font-bold text-slate-900 mt-0.5">{selectedTransaction.clientSnapshot.clientName}</div>
                <div className="text-slate-500 text-[11px] mt-0.5">{selectedTransaction.clientSnapshot.address}</div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Contact Person</span>
                <div className="font-medium text-slate-800 mt-0.5">{selectedTransaction.clientSnapshot.contactPerson}</div>
                <div className="text-slate-500 text-[11px] mt-0.5">{selectedTransaction.clientSnapshot.phone} | {selectedTransaction.clientSnapshot.email}</div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Quotation Baseline</span>
                <div className="font-mono font-bold text-slate-900 mt-0.5">
                  {selectedTransaction.quotation ? formatINR(selectedTransaction.quotation.grandTotal) : 'No Quote'}
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  Quotation Status: <span className="font-medium text-slate-700">{selectedTransaction.quotation?.status || '—'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Service Details & Field Assignment */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              2. Field Service & Technician Assignment
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Service Execution Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#00C878] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Technician / Lead <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={assignedTechnician}
                onChange={(e) => setAssignedTechnician(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#00C878] focus:border-transparent outline-none"
                placeholder="e.g. Ramesh Gowda (HVAC Lead)"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Service Type / Category <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#00C878] focus:border-transparent outline-none"
                placeholder="e.g. Chiller Flushing & MCB Retrofit"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specific Location / Area
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#00C878] focus:border-transparent outline-none"
                placeholder="e.g. Basement 1 - Chiller Plant & LT Electrical Room"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Work Scope Executed
              </label>
              <input
                type="text"
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#00C878] focus:border-transparent outline-none"
                placeholder="Summary of actual repairs and maintenance executed"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Materials & Consumables Deployed */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                3. Materials, Spares & Consumables Installed
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Populated from quotation items. Can be modified based on actual field consumption.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddMaterialRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Material
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 min-w-[200px]">Material / Description</th>
                  <th className="py-2.5 px-2 w-20 text-center">Qty</th>
                  <th className="py-2.5 px-2 w-24">UOM</th>
                  <th className="py-2.5 px-3 min-w-[180px]">Purpose / Location</th>
                  <th className="py-2.5 px-2 w-12 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materialsUsed.map((row, index) => (
                  <tr key={row.itemId || index} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={row.materialName}
                        onChange={(e) => handleMaterialChange(index, 'materialName', e.target.value)}
                        placeholder="Material name or spare description"
                        className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-[#00C878] outline-none"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input
                        type="number"
                        min="1"
                        value={row.quantity}
                        onChange={(e) => handleMaterialChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-16 px-2 py-1.5 border border-slate-200 rounded text-xs text-center font-mono focus:ring-1 focus:ring-[#00C878] outline-none"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <select
                        value={row.uom}
                        onChange={(e) => handleMaterialChange(index, 'uom', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-white focus:ring-1 focus:ring-[#00C878] outline-none"
                      >
                        {UOM_OPTIONS.map(u => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={row.purpose || ''}
                        onChange={(e) => handleMaterialChange(index, 'purpose', e.target.value)}
                        placeholder="e.g. Tower B AHU replacement"
                        className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-[#00C878] outline-none"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterialRow(index)}
                        className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                        title="Remove row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Step 4: Dual Sign-off & Remarks */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              4. Joint Sign-off & Remarks
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Technician Sign-off */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#00C878]" /> Technician Sign-off
              </span>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Technician Name</label>
                <input
                  type="text"
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  placeholder="Technician full name"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Technician Signature Verification</label>
                <input
                  type="text"
                  value={technicianSignature}
                  onChange={(e) => setTechnicianSignature(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-mono bg-white"
                  placeholder="e.g. Ramesh Gowda [Verified]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Technician Technical Remarks</label>
                <textarea
                  rows={2}
                  value={technicianRemarks}
                  onChange={(e) => setTechnicianRemarks(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white outline-none"
                  placeholder="Operational readings, pressure tests, or technical observations"
                />
              </div>
            </div>

            {/* Customer Sign-off */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" /> Customer Representative Sign-off
              </span>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Representative Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  placeholder="Client manager name"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Digital Acknowledgement Signature</label>
                <input
                  type="text"
                  value={customerSignature}
                  onChange={(e) => setCustomerSignature(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-mono bg-white"
                  placeholder="e.g. Suresh Nambiar [Signed & Accepted]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Customer Feedback / Remarks</label>
                <textarea
                  rows={2}
                  value={customerRemarks}
                  onChange={(e) => setCustomerRemarks(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white outline-none"
                  placeholder="Client feedback on promptness and work quality"
                />
              </div>
            </div>
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
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#00C878] hover:bg-[#00B069] text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Service Report
          </button>
        </div>
      </form>
    </div>
  );
};
