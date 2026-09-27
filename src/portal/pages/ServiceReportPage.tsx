import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  Wrench, 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  Building2, 
  Plus, 
  Image as ImageIcon, 
  FileText,
  UserCheck,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  Lock,
  RefreshCw,
  ArrowUpRight,
  Eye,
  Edit2
} from 'lucide-react';
import { 
  MasterTransaction, 
  ServiceReport, 
  QuotationItem, 
  ServiceReportStatus,
  Technician
} from '../types';
import { db, formatINR } from '../services/db';

export const ServiceReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedTid = searchParams.get('tid') || '';
  const isExplicitEdit = searchParams.get('edit') === 'true';

  // Eligible Transactions
  const [eligibleTransactions, setEligibleTransactions] = useState<MasterTransaction[]>([]);
  const [selectedTid, setSelectedTid] = useState<string>(preselectedTid);
  const [selectedTransaction, setSelectedTransaction] = useState<MasterTransaction | null>(null);
  const [techniciansList, setTechniciansList] = useState<Technician[]>([]);

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
  const [alreadyHasReport, setAlreadyHasReport] = useState<boolean>(false);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    let list = db.getEligibleTransactionsForServiceReport();
    if (preselectedTid && isExplicitEdit) {
      const current = db.getTransactionById(preselectedTid);
      if (current && !list.some(t => t.transactionId === preselectedTid)) {
        list = [current, ...list];
      }
    }
    setEligibleTransactions(list);
    setTechniciansList(db.getTechnicians());

    if (preselectedTid) {
      handleSelectTransaction(preselectedTid, list, isExplicitEdit);
    }
  }, [preselectedTid, isExplicitEdit]);

  const handleSelectTransaction = (tid: string, list = eligibleTransactions, isEdit = isExplicitEdit) => {
    setSelectedTid(tid);
    if (!tid) {
      setSelectedTransaction(null);
      setIsEditMode(false);
      setAlreadyHasReport(false);
      setMaterialsUsed([]);
      setCustomerName('');
      setLocation('');
      setServiceType('');
      return;
    }
    const found = list.find(t => t.transactionId === tid) || db.getTransactionById(tid);
    
    if (found) {
      setSelectedTransaction(found);

      // Extract technician(s) assigned in quotation
      const quoteTech = (found.quotation?.assignedTechnicianNames && found.quotation.assignedTechnicianNames.length > 0)
        ? found.quotation.assignedTechnicianNames.join(', ')
        : (found.quotation?.assignedTechnicianName || found.assignedTechnicianName || '');

      // Check if service report already exists for this transaction
      if (found.serviceReport) {
        if (!isEdit) {
          // Duplicate creation attempt! Block and display warning
          setIsEditMode(false);
          setAlreadyHasReport(true);
          showToast('error', `A Service Report already exists for Quotation ${tid}. Duplicate creation is not allowed.`);
          return;
        }

        // Explicit edit mode
        setAlreadyHasReport(false);
        setIsEditMode(true);
        const sr = found.serviceReport;
        setServiceDate(sr.serviceDate);

        let resolvedTech = quoteTech;
        if (!resolvedTech && sr.assignedTechnician && sr.assignedTechnician !== 'Ramesh Gowda') {
          resolvedTech = sr.assignedTechnician;
        }

        setAssignedTechnician(resolvedTech);
        setServiceType(sr.serviceType);
        setLocation(sr.location || found.clientSnapshot.serviceLocation || found.clientSnapshot.address.split(',')[0] || 'Client Premises');
        setWorkDescription(sr.workDescription);
        setMaterialsUsed(sr.materialsUsed || []);
        setTechnicianRemarks(sr.technicianRemarks || '');
        setCustomerRemarks(sr.customerRemarks || '');
        setStatus(sr.status);
        setCustomerName(sr.customerName || found.clientSnapshot.contactPerson || '');
        setCustomerSignature(sr.customerSignature || '');
        setTechnicianName(resolvedTech);
        setTechnicianSignature(resolvedTech ? (sr.technicianSignature || `${resolvedTech} [Signed & Verified]`) : '');
      } else {
        // Brand new service report for this transaction
        setAlreadyHasReport(false);
        setIsEditMode(false);
        setServiceDate(new Date().toISOString().split('T')[0]);
        setCustomerName(found.clientSnapshot.contactPerson || found.clientSnapshot.clientName);
        setLocation(found.clientSnapshot.serviceLocation || found.clientSnapshot.address.split(',')[0] || 'Client Premises');
        
        // Auto populate materials used from quotation items
        if (found.quotation?.items) {
          setMaterialsUsed([...found.quotation.items]);
          setServiceType(found.quotation.items[0]?.materialName || 'Facility Maintenance & Repair');
        } else {
          setMaterialsUsed([]);
          setServiceType('General Facility Maintenance');
        }

        setWorkDescription('Executed scheduled preventive & corrective maintenance according to quotation specification.');
        setAssignedTechnician(quoteTech);
        setTechnicianName(quoteTech);
        setTechnicianSignature(quoteTech ? `${quoteTech} [Signed & Verified]` : '');
        setCustomerSignature(`${found.clientSnapshot.contactPerson || 'Client Rep'} [Signed]`);
        setStatus('Completed');
      }
    } else {
      setSelectedTransaction(null);
      setAlreadyHasReport(false);
    }
  };

  const handleSyncFromQuotation = () => {
    if (selectedTransaction?.quotation?.items && selectedTransaction.quotation.items.length > 0) {
      setMaterialsUsed(selectedTransaction.quotation.items.map(it => {
        const name = it.description || it.materialName || '';
        return {
          ...it,
          description: name,
          materialName: name
        };
      }));
      const firstName = selectedTransaction.quotation.items[0]?.description || selectedTransaction.quotation.items[0]?.materialName;
      if (firstName) {
        setServiceType(firstName);
      }
      showToast('success', 'Materials and service scope synced from latest quotation.');
    } else {
      showToast('error', 'No quotation items found to sync.');
    }
  };



  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTid) {
      showToast('error', 'Please select a Master Transaction ID.');
      return;
    }

    if (!isEditMode && (selectedTransaction?.serviceReport || alreadyHasReport)) {
      showToast('error', `A Service Report already exists for Quotation ${selectedTid}. Duplicate reports cannot be created.`);
      return;
    }

    if (selectedTransaction?.quotation && selectedTransaction.quotation.status === 'Rejected') {
      showToast('error', `Cannot create a Service Report for a ${selectedTransaction.quotation.status} quotation.`);
      return;
    }

    const quoteTech = (selectedTransaction?.quotation?.assignedTechnicianNames && selectedTransaction.quotation.assignedTechnicianNames.length > 0)
      ? selectedTransaction.quotation.assignedTechnicianNames.join(', ')
      : (selectedTransaction?.quotation?.assignedTechnicianName || selectedTransaction?.assignedTechnicianName || '');

    const finalTech = (technicianName || assignedTechnician || quoteTech || '').trim();

    const reportData: Omit<ServiceReport, 'createdAt' | 'updatedAt'> = {
      transactionId: selectedTid,
      serviceDate,
      assignedTechnician: finalTech,
      serviceType: (serviceType || selectedTransaction?.quotation?.items?.[0]?.description || selectedTransaction?.quotation?.items?.[0]?.materialName || 'Facility Service').trim(),
      location: (location || selectedTransaction?.clientSnapshot?.address || 'Client Premises').trim(),
      workDescription: (workDescription || 'Executed scheduled preventive & corrective maintenance according to quotation specification.').trim(),
      materialsUsed,
      technicianRemarks: technicianRemarks.trim(),
      customerRemarks: customerRemarks.trim(),
      status,
      customerName: (customerName || selectedTransaction?.clientSnapshot?.contactPerson || 'Client Representative').trim(),
      customerSignature: customerSignature.trim(),
      technicianName: (technicianName || finalTech).trim(),
      technicianSignature: technicianSignature.trim(),
      beforeImages: [],
      afterImages: []
    };

    const res = db.saveServiceReport(reportData, isEditMode);
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
            disabled={alreadyHasReport}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all ${
              alreadyHasReport
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                : 'bg-[#00C878] hover:bg-[#00B069] text-white cursor-pointer'
            }`}
          >
            <Save className="w-4 h-4" /> {alreadyHasReport ? 'Report Already Exists' : 'Save Service Report'}
          </button>
        </div>
      </div>

      {/* Warning if Service Report already exists */}
      {alreadyHasReport && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-sm text-amber-900">Service Report Already Exists</p>
              <p className="text-amber-800 mt-0.5 leading-relaxed">
                A Service Report has already been created for Quotation <strong className="font-mono">{selectedTid}</strong>. Once a service report is created for a quotation, creating a duplicate report is not permitted.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to={`/portal/service-report/${selectedTid}`}
              className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" /> View Report
            </Link>
            <Link
              to={`/portal/service-report?tid=${selectedTid}&edit=true`}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Report
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

      {/* Notice if quotation is on Draft */}
      {selectedTransaction?.quotation && selectedTransaction.quotation.status === 'Draft' && !alreadyHasReport && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs text-slate-900">Quotation Status: Draft</p>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Saving this Service Report will automatically shift the linked Quotation status from <strong>Draft</strong> to <strong>Sent</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} noValidate className="space-y-6">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Quotation ID <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedTid}
                onChange={(e) => handleSelectTransaction(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#00C878] focus:border-transparent outline-none bg-white cursor-pointer"
              >
                <option value="">-- Select Quotation ID --</option>
                {eligibleTransactions.map(t => (
                  <option key={t.transactionId} value={t.transactionId}>
                    {t.transactionId} — {t.clientSnapshot.clientName} ({t.overallStatus})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Service reports use the same Quotation ID (e.g. TM260001) as the approved quotation.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Service Execution Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#00C878] focus:border-transparent outline-none bg-white"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Date when site work/execution was completed.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Execution Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ServiceReportStatus)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#00C878] focus:border-transparent outline-none bg-white cursor-pointer"
              >
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Hold">Hold</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Execution status (Completed, In Progress, Hold).
              </p>
            </div>
          </div>

          {/* Auto-populated Client Snapshot */}
          {selectedTransaction ? (
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
          ) : (
            <div className="p-4 rounded-lg border border-dashed border-slate-200 text-center text-slate-400 text-xs">
              Select a Master Transaction ID above to preview client details and quotation scope.
            </div>
          )}
        </div>

        {/* Step 2: Scope & Materials Installed */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  2. Scope & Materials Installed
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Synced from Quotation
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                All line items, quantities, and descriptions are strictly synced from the quotation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedTransaction?.quotation && (
                <button
                  type="button"
                  onClick={handleSyncFromQuotation}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  title="Reload items and quantities directly from the latest quotation"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Re-Sync
                </button>
              )}
            </div>
          </div>

          {selectedTransaction?.quotation && (
            <div className="flex items-center justify-between p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg text-xs text-emerald-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Items are synchronized from Quotation <strong className="font-mono">{selectedTransaction.transactionId}</strong>. All item additions, removals, or quantity changes must be made through the quotation.
                </span>
              </div>
              <Link
                to={`/portal/quotation/${selectedTransaction.transactionId}`}
                className="shrink-0 ml-3 inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-semibold underline text-[11px]"
              >
                View Quotation <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 min-w-[220px]">Material / Description</th>
                  <th className="py-2.5 px-3 w-20 text-center">Qty</th>
                  <th className="py-2.5 px-3 w-24">UOM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {materialsUsed.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-400 text-xs">
                      No line items found. Select a Quotation above or click Re-Sync.
                    </td>
                  </tr>
                ) : (
                  materialsUsed.map((row, index) => (
                    <tr key={row.itemId || index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-3 font-medium text-slate-800">
                        {row.description || row.materialName || '—'}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                        {row.quantity}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
                          {row.uom || 'Nos'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
            disabled={alreadyHasReport}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
              alreadyHasReport
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                : 'bg-[#00C878] hover:bg-[#00B069] text-white cursor-pointer'
            }`}
          >
            <Save className="w-4 h-4" /> {alreadyHasReport ? 'Report Already Exists' : 'Save Service Report'}
          </button>
        </div>
      </form>
    </div>
  );
};
