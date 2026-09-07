export type UOMType = 
  | 'Nos'
  | 'Kg'
  | 'Gram'
  | 'Litre'
  | 'Meter'
  | 'Sq.Ft'
  | 'Sq.M'
  | 'Box'
  | 'Set'
  | 'Piece'
  | 'Hour'
  | 'Day'
  | 'Month'
  | 'Service'
  | 'Other';

export const UOM_OPTIONS: UOMType[] = [
  'Nos',
  'Kg',
  'Gram',
  'Litre',
  'Meter',
  'Sq.Ft',
  'Sq.M',
  'Box',
  'Set',
  'Piece',
  'Hour',
  'Day',
  'Month',
  'Service',
  'Other'
];

export type QuotationStatus = 'Draft' | 'Sent' | 'Approved' | 'Rejected' | 'Expired';
export type ServiceStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
export type ServiceReportStatus = ServiceStatus;
export type InvoiceStatus = 'Draft' | 'Issued' | 'Pending' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Cancelled';

export type MasterTransactionStatus = 
  | 'Draft'
  | 'Quotation Created'
  | 'Quotation Sent'
  | 'Quotation Approved'
  | 'Service Scheduled'
  | 'Service In Progress'
  | 'Service Completed'
  | 'Invoice Generated'
  | 'Partially Paid'
  | 'Paid'
  | 'Cancelled';

export type GSTMode = 'CGST_SGST' | 'IGST';

export interface Category {
  categoryId: string; // e.g. CAT-0001
  categoryName: string;
  description: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  clientId: string; // e.g. CLI-0001
  clientName: string;
  address: string;
  email: string;
  phone: string;
  gstin: string;
  contactPerson: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export interface ClientSnapshot {
  clientId: string;
  clientName: string;
  address: string;
  email: string;
  phone: string;
  gstin: string;
  contactPerson: string;
}

export interface QuotationItem {
  itemId: string;
  categoryId: string;
  materialName: string;
  uom: UOMType;
  quantity: number;
  rate: number;
  discount: number; // in currency amount
  taxPercent: number; // e.g. 18 for 18%
  taxAmount: number;
  amount: number; // (quantity * rate) - discount + taxAmount
  purpose?: string;
}

// 1. QUOTATION (Uses Master Transaction ID: TM-YYYY-XXXX)
export interface Quotation {
  transactionId: string; // e.g. TM-2026-0001 (Master ID)
  quotationId?: string; // alias for backward-compatibility
  quotationDate: string; // YYYY-MM-DD
  validUntil: string;
  clientId: string;
  clientSnapshot: ClientSnapshot;
  items: QuotationItem[];
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  grandTotal: number;
  status: QuotationStatus;
  notes?: string;
  paymentTerms?: string;
  createdAt: string;
  updatedAt: string;
}

// 2. SERVICE REPORT (Uses the SAME Master Transaction ID: TM-YYYY-XXXX)
export interface ServiceReport {
  transactionId: string; // e.g. TM-2026-0001 (Master ID)
  serviceDate: string; // YYYY-MM-DD
  assignedTechnician: string;
  serviceType: string;
  location: string;
  workDescription: string;
  materialsUsed: QuotationItem[];
  technicianRemarks?: string;
  customerRemarks?: string;
  status: ServiceStatus;
  customerName: string;
  customerSignature?: string; // signature data URL or typed mark
  technicianName: string;
  technicianSignature?: string;
  beforeImages?: string[];
  afterImages?: string[];
  supportingDocs?: string[];
  createdAt: string;
  updatedAt: string;
}

// 3. INVOICE (Uses the SAME Master Transaction ID: TM-YYYY-XXXX)
export interface InvoicePayment {
  status: 'Pending' | 'Partial' | 'Paid';
  date?: string;
  mode?: 'NEFT / RTGS' | 'UPI' | 'Cheque' | 'Corporate Card';
  referenceNumber?: string;
  amountPaid: number;
  balanceDue: number;
}

export interface InvoiceBankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
}

export interface Invoice {
  transactionId: string; // e.g. TM-2026-0001 (Master ID)
  invoiceDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  clientId: string;
  clientSnapshot: ClientSnapshot;
  items: QuotationItem[];
  gstMode: GSTMode; // CGST+SGST or IGST
  subtotal: number;
  totalDiscount: number;
  cgst: number; // CGST amount (e.g. 9%)
  sgst: number; // SGST amount (e.g. 9%)
  igst: number; // IGST amount (e.g. 18%)
  totalTax: number;
  grandTotal: number;
  status: InvoiceStatus;
  payment: InvoicePayment;
  bankDetails: InvoiceBankDetails;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// MASTER TRANSACTION (Unifies the entire service lifecycle)
export interface MasterTransaction {
  transactionId: string; // e.g. TM-2026-0001
  clientId: string;
  clientSnapshot: ClientSnapshot;
  overallStatus: MasterTransactionStatus;
  quotation?: Quotation;
  serviceReport?: ServiceReport;
  invoice?: Invoice;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: 'Administrator' | 'Staff';
  avatar?: string;
  lastLogin: string;
}
