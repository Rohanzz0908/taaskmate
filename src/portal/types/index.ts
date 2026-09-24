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
  categoryId?: string;
  materialName?: string;
  description?: string;
  itemType?: 'Material' | 'Service';
  uom: UOMType | string;
  quantity: number;
  rate: number; // client rate
  vendorCost?: number;
  vendorAmount?: number;
  profitPercent?: number;
  discount?: number; // in currency amount
  taxPercent: number; // e.g. 18 for 18%
  taxAmount: number;
  clientRate?: number;
  clientAmount?: number;
  amount: number; // net client total
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

// ===================================================
// 4. TECHNICIAN MASTER TYPES
// ===================================================
export type TechnicianSpecialization = 
  | 'HVAC & MEP'
  | 'Electrical Switchgear'
  | 'Plumbing & Fire Safety'
  | 'Carpentry & Hardware'
  | 'Janitorial & Sanitization'
  | 'Civil & Painting'
  | 'General Facility';

export const TECHNICIAN_SPECIALIZATIONS: TechnicianSpecialization[] = [
  'HVAC & MEP',
  'Electrical Switchgear',
  'Plumbing & Fire Safety',
  'Carpentry & Hardware',
  'Janitorial & Sanitization',
  'Civil & Painting',
  'General Facility'
];

export type TechnicianStatus = 'Active' | 'On Leave' | 'Inactive';
export type EmploymentType = 'Full-Time' | 'Contractor' | 'On-Demand';
export type IdProofType = 'Aadhaar' | 'PAN' | 'Voter ID' | 'Driving License';

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface Technician {
  technicianId: string; // e.g. TECH-0001
  name: string;
  specialization: TechnicianSpecialization;
  phone: string;
  email: string;
  experienceYears: number;
  employmentType: EmploymentType;
  idProofType: IdProofType;
  idProofNumber: string;
  emergencyContact: EmergencyContact;
  skills: string[];
  rating: number; // 1 to 5
  address: string;
  status: TechnicianStatus;
  createdAt: string;
  updatedAt: string;
}

// ===================================================
// 5. VENDOR MASTER TYPES
// ===================================================
export type VendorCategory = 
  | 'Electrical & Lighting'
  | 'HVAC & Refrigeration'
  | 'Plumbing & Pumps'
  | 'Safety & Fire Fighting'
  | 'Hardware & Tools'
  | 'Chemicals & Janitorial'
  | 'Civil & Paints'
  | 'General Spares';

export const VENDOR_CATEGORIES: VendorCategory[] = [
  'Electrical & Lighting',
  'HVAC & Refrigeration',
  'Plumbing & Pumps',
  'Safety & Fire Fighting',
  'Hardware & Tools',
  'Chemicals & Janitorial',
  'Civil & Paints',
  'General Spares'
];

export type VendorStatus = 'Active' | 'Inactive' | 'Blacklisted';
export type VendorTier = 'Preferred Partner' | 'Standard Supplier' | 'Under Review';
export type VendorPaymentTerms = 'Immediate / Net 0' | 'Net 15' | 'Net 30' | 'Net 45' | '50% Advance';

export const VENDOR_PAYMENT_TERMS: VendorPaymentTerms[] = [
  'Immediate / Net 0',
  'Net 15',
  'Net 30',
  'Net 45',
  '50% Advance'
];

export interface Vendor {
  vendorId: string; // e.g. VEN-0001
  vendorName: string;
  tradeCategory: VendorCategory;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  gstin: string;
  pan: string;
  bankDetails: InvoiceBankDetails;
  paymentTerms: VendorPaymentTerms;
  tier: VendorTier;
  status: VendorStatus;
  createdAt: string;
  updatedAt: string;
}

