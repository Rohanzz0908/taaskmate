import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Wrench, 
  Receipt, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  ExternalLink, 
  Printer, 
  Edit3, 
  Plus, 
  DollarSign, 
  Calendar, 
  User, 
  ShieldCheck, 
  AlertCircle,
  CreditCard,
  CheckCircle,
  Eye
} from 'lucide-react';
import { MasterTransaction, InvoicePayment } from '../types';
import { db, formatINR } from '../services/db';

export const TransactionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState<MasterTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Payment Form state
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<string>('NEFT / RTGS');
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = () => {
    if (!id) return;
    const item = db.getTransactionById(id);
    if (item) {
      setTransaction(item);
      if (item.invoice?.payment) {
        setPaymentAmount(item.invoice.payment.balanceDue || 0);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#00C878] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Transaction Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">
          The requested Master Transaction ID <span className="font-semibold text-slate-700">{id}</span> does not exist or has been removed.
        </p>
        <button
          onClick={() => navigate('/portal')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const { quotation, serviceReport, invoice, clientSnapshot } = transaction;

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    if (paymentAmount <= 0) {
      showToast('error', 'Please enter a valid payment amount greater than zero.');
      return;
    }

    const prevPaid = invoice.payment.amountPaid || 0;
    const newPaid = prevPaid + Number(paymentAmount);
    const totalDue = invoice.grandTotal;
    const newBalance = Math.max(0, totalDue - newPaid);

    const paymentData: InvoicePayment = {
      status: newBalance === 0 ? 'Paid' : 'Partial',
      date: paymentDate,
      mode: paymentMode as any,
      referenceNumber: paymentRef.trim() || `REF-${Date.now().toString().slice(-6)}`,
      amountPaid: newPaid,
      balanceDue: newBalance,
    };

    const success = db.recordInvoicePayment(transaction.transactionId, paymentData);
    if (success) {
      showToast('success', `Payment of ${formatINR(paymentAmount)} recorded successfully.`);
      setIsPaymentModalOpen(false);
      loadData();
    } else {
      showToast('error', 'Failed to record payment.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
      case 'Completed':
      case 'Approved':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> {status}</span>;
      case 'Service In Progress':
      case 'In Progress':
      case 'Partially Paid':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3.5 h-3.5" /> {status}</span>;
      case 'Service Scheduled':
      case 'Scheduled':
      case 'Quotation Sent':
      case 'Sent':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"><Clock className="w-3.5 h-3.5" /> {status}</span>;
      case 'Invoice Generated':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200"><Receipt className="w-3.5 h-3.5" /> {status}</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200"><FileText className="w-3.5 h-3.5" /> {status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-lg text-sm font-medium border animate-in slide-in-from-bottom-2 ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          {toast.message}
        </div>
      )}

      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Transaction</span>
              <span className="font-mono bg-slate-100 text-slate-800 px-3 py-1 rounded-lg border border-slate-200 text-lg">
                {transaction.transactionId}
              </span>
            </h1>
            {getStatusBadge(transaction.overallStatus)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Single Master Transaction ID linking Quotation, Service Execution Report, and Final Commercial Tax Invoice.
          </p>
        </div>

        {/* Quick Lifecycle Action Buttons */}
        <div className="flex items-center gap-2">
          {!serviceReport && quotation && (
            <Link
              to={`/portal/service-report?tid=${transaction.transactionId}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#00C878] hover:bg-[#00B069] text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Create Service Report
            </Link>
          )}
          {!invoice && (
            <Link
              to={`/portal/invoice?tid=${transaction.transactionId}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Create Invoice
            </Link>
          )}
        </div>
      </div>

      {/* Top 4 KPI Metrics for this Transaction */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">Quotation Value</div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {quotation ? formatINR(quotation.grandTotal) : '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <FileText className="w-3 h-3" /> {quotation ? `Status: ${quotation.status}` : 'Not created'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">Service Execution</div>
          <div className="text-xl font-bold text-slate-900">
            {serviceReport ? serviceReport.status : 'Pending'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <Wrench className="w-3 h-3" /> {serviceReport ? (serviceReport.technicianName || 'Assigned') : 'Awaiting assignment'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">Invoiced Amount</div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {invoice ? formatINR(invoice.grandTotal) : '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <Receipt className="w-3 h-3" /> {invoice ? `GST: ${invoice.gstMode === 'IGST' ? 'IGST 18%' : 'CGST+SGST 18%'}` : 'Not invoiced'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">Balance Due</div>
          <div className={`text-xl font-bold font-mono ${
            invoice?.payment?.balanceDue && invoice.payment.balanceDue > 0 ? 'text-amber-600' : 'text-emerald-600'
          }`}>
            {invoice?.payment ? formatINR(invoice.payment.balanceDue) : (invoice ? formatINR(invoice.grandTotal) : '—')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <CreditCard className="w-3 h-3" /> {invoice?.payment ? `Paid: ${formatINR(invoice.payment.amountPaid)}` : 'Payment not logged'}
          </div>
        </div>
      </div>

      {/* Visual Service Lifecycle Stepper */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Service Lifecycle Progression</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Step 1: Quotation */}
          <div className={`relative p-5 rounded-xl border transition-all ${
            quotation 
              ? 'bg-slate-50/50 border-emerald-200 ring-1 ring-emerald-500/10' 
              : 'bg-white border-slate-200 opacity-60'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                {quotation?.status || 'Draft'}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-800">Quotation</h3>
            <p className="text-xs text-slate-500 mt-0.5">Initial scope & price estimation</p>
            
            {quotation ? (
              <div className="mt-4 pt-3 border-t border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Date:</span>
                  <span className="font-medium text-slate-800">{quotation.quotationDate}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Items:</span>
                  <span className="font-medium text-slate-800">{quotation.items.length} materials/services</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Amount:</span>
                  <span className="font-bold text-slate-900 font-mono">{formatINR(quotation.grandTotal)}</span>
                </div>
                
                <div className="mt-4 pt-2 flex items-center gap-2">
                  <Link
                    to={`/portal/quotation/${transaction.transactionId}`}
                    className="flex-1 text-center py-1.5 px-2 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3 h-3" /> View / Print
                  </Link>
                  <Link
                    to={`/portal/quotation/edit/${transaction.transactionId}`}
                    className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold flex items-center justify-center transition-colors"
                    title="Edit Quotation"
                  >
                    <Edit3 className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-6 text-center text-xs text-slate-400 py-3">
                Not yet generated
              </div>
            )}
          </div>

          {/* Step 2: Service Report */}
          <div className={`relative p-5 rounded-xl border transition-all ${
            serviceReport 
              ? 'bg-slate-50/50 border-blue-200 ring-1 ring-blue-500/10' 
              : 'bg-white border-dashed border-slate-300'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                serviceReport ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'
              }`}>
                2
              </div>
              {serviceReport ? (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  {serviceReport.status}
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">Awaiting Service</span>
              )}
            </div>
            <h3 className="text-sm font-bold text-slate-800">Service Report</h3>
            <p className="text-xs text-slate-500 mt-0.5">Technician field execution & proof</p>
            
            {serviceReport ? (
              <div className="mt-4 pt-3 border-t border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Date:</span>
                  <span className="font-medium text-slate-800">{serviceReport.serviceDate}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Technician:</span>
                  <span className="font-medium text-slate-800 truncate max-w-[120px]">{serviceReport.technicianName || 'Assigned'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Status:</span>
                  <span className="font-semibold text-emerald-700">{serviceReport.status}</span>
                </div>

                <div className="mt-4 pt-2 flex items-center gap-2">
                  <Link
                    to={`/portal/service-report/${transaction.transactionId}`}
                    className="flex-1 text-center py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3 h-3" /> View / Print
                  </Link>
                  <Link
                    to={`/portal/service-report?tid=${transaction.transactionId}&edit=true`}
                    className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold flex items-center justify-center transition-colors"
                    title="Edit Service Report"
                  >
                    <Edit3 className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-6 text-center py-3">
                <p className="text-xs text-slate-400 mb-3">No service report created yet</p>
                <Link
                  to={`/portal/service-report?tid=${transaction.transactionId}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <Plus className="w-3 h-3" /> Create Service Report
                </Link>
              </div>
            )}
          </div>

          {/* Step 3: Invoice */}
          <div className={`relative p-5 rounded-xl border transition-all ${
            invoice 
              ? 'bg-slate-50/50 border-purple-200 ring-1 ring-purple-500/10' 
              : 'bg-white border-dashed border-slate-300'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                invoice ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-400'
              }`}>
                3
              </div>
              {invoice ? (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                  {invoice.status}
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">Awaiting Invoice</span>
              )}
            </div>
            <h3 className="text-sm font-bold text-slate-800">Commercial Tax Invoice</h3>
            <p className="text-xs text-slate-500 mt-0.5">GST billing & payment clearance</p>
            
            {invoice ? (
              <div className="mt-4 pt-3 border-t border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Invoice Date:</span>
                  <span className="font-medium text-slate-800">{invoice.invoiceDate}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Grand Total:</span>
                  <span className="font-bold text-slate-900 font-mono">{formatINR(invoice.grandTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Balance Due:</span>
                  <span className={`font-mono font-semibold ${
                    invoice.payment?.balanceDue && invoice.payment.balanceDue > 0 ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {formatINR(invoice.payment?.balanceDue ?? invoice.grandTotal)}
                  </span>
                </div>

                <div className="mt-4 pt-2 flex items-center gap-2">
                  <Link
                    to={`/portal/invoice/${transaction.transactionId}`}
                    className="flex-1 text-center py-1.5 px-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3 h-3" /> View / Print
                  </Link>
                  <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="py-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="Record Payment"
                  >
                    <CreditCard className="w-3 h-3" /> Pay
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 text-center py-3">
                <p className="text-xs text-slate-400 mb-3">Invoice not yet issued</p>
                <Link
                  to={`/portal/invoice?tid=${transaction.transactionId}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <Plus className="w-3 h-3" /> Create Invoice
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Client Snapshot & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Profile Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Client Information</h3>
            <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {clientSnapshot.clientId}
            </span>
          </div>

          <div>
            <h4 className="text-base font-bold text-slate-900">{clientSnapshot.clientName}</h4>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <User className="w-3 h-3 text-slate-400" /> {clientSnapshot.contactPerson || 'Point of Contact'}
            </p>
          </div>

          <div className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{clientSnapshot.address}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{clientSnapshot.email}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{clientSnapshot.phone}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-mono font-medium text-slate-700">GSTIN: {clientSnapshot.gstin || 'Not provided'}</span>
            </div>
          </div>
        </div>

        {/* Payment / Financial Summary */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment & Transaction Settlement</h3>
            {invoice?.payment && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                invoice.payment.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {invoice.payment.status.toUpperCase()}
              </span>
            )}
          </div>

          {invoice?.payment ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-semibold">Payment Mode</div>
                  <div className="font-semibold text-slate-800 mt-1">{invoice.payment.mode}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-semibold">Reference / UTR</div>
                  <div className="font-mono text-slate-800 mt-1 truncate">{invoice.payment.referenceNumber || '—'}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-semibold">Amount Received</div>
                  <div className="font-mono font-bold text-emerald-700 mt-1">{formatINR(invoice.payment.amountPaid)}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-semibold">Outstanding Due</div>
                  <div className="font-mono font-bold text-amber-700 mt-1">{formatINR(invoice.payment.balanceDue)}</div>
                </div>
              </div>

              {invoice.payment.balanceDue > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs">
                  <div className="text-amber-800">
                    <span className="font-semibold">Pending Balance:</span> {formatINR(invoice.payment.balanceDue)} remaining on Invoice {transaction.transactionId}.
                  </div>
                  <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-semibold transition-colors cursor-pointer"
                  >
                    Record Payment
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              <Receipt className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p>No invoice has been generated for this transaction yet.</p>
              <p className="text-[11px] text-slate-400 mt-1">Once generated, payment logs and balance tracking will appear here.</p>
            </div>
          )}

          {/* Quotation Line Items Table Preview */}
          {quotation && quotation.items.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-700 mb-2">Quotation Scope Overview</div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Item / Material</th>
                      <th className="py-2 px-2 text-center">Qty</th>
                      <th className="py-2 px-2 text-center">UOM</th>
                      <th className="py-2 px-3 text-right">Rate</th>
                      <th className="py-2 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quotation.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-medium text-slate-800">{item.materialName}</td>
                        <td className="py-2 px-2 text-center text-slate-600">{item.quantity}</td>
                        <td className="py-2 px-2 text-center text-slate-500">{item.uom}</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-600">{formatINR(item.rate)}</td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">{formatINR(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Record Payment Modal */}
      {isPaymentModalOpen && invoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Record Payment</h3>
                  <p className="text-[11px] text-slate-500">Transaction ID: {transaction.transactionId}</p>
                </div>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs flex justify-between">
                <span className="text-slate-500">Outstanding Balance:</span>
                <span className="font-mono font-bold text-amber-700">
                  {formatINR(invoice.payment?.balanceDue ?? invoice.grandTotal)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Amount Received (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#00C878] focus:border-transparent outline-none"
                  placeholder="e.g. 50000"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#00C878] focus:border-transparent outline-none bg-white"
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
                    Payment Date
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#00C878] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bank Reference / UTR / Cheque No
                </label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#00C878] focus:border-transparent outline-none"
                  placeholder="e.g. HDFC12345678"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#00C878] hover:bg-[#00B069] rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Confirm & Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
