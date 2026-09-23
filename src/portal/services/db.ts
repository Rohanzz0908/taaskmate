import { 
  Category, 
  Client, 
  MasterTransaction, 
  Quotation, 
  ServiceReport, 
  Invoice, 
  QuotationItem, 
  MasterTransactionStatus, 
  InvoiceBankDetails,
  InvoicePayment,
  Technician,
  Vendor
} from '../types';

// Storage keys
const STORAGE_KEYS = {
  CATEGORIES: 'tm_portal_categories_v2',
  CLIENTS: 'tm_portal_clients_v2',
  TRANSACTIONS: 'tm_portal_master_transactions_v2',
  TECHNICIANS: 'tm_portal_technicians_v2',
  VENDORS: 'tm_portal_vendors_v2',
};

// Indian Currency Formatter (e.g. ₹ 1,25,000.00)
export const formatINR = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return '₹ 0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Indian GSTIN Validator (15 alphanumeric characters standard)
export const validateGSTIN = (gstin: string): boolean => {
  if (!gstin) return false;
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return regex.test(gstin.trim().toUpperCase());
};

// Indian PAN Validator (10 alphanumeric characters standard: ABCDE1234F)
export const validatePAN = (pan: string): boolean => {
  if (!pan) return false;
  const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return regex.test(pan.trim().toUpperCase());
};

// Default Company Bank Details
export const DEFAULT_BANK_DETAILS: InvoiceBankDetails = {
  bankName: 'HDFC Bank Ltd',
  accountName: 'Taaskmate Facility Services Pvt Ltd',
  accountNumber: '50200088991122',
  ifsc: 'HDFC0000456',
  branch: 'Brookefield, Outer Ring Road, Bengaluru'
};

// Initial Categories Seed Data
const SEED_CATEGORIES: Category[] = [
  {
    categoryId: 'CAT-0001',
    categoryName: 'Plumbing & Pipeline Spares',
    description: 'CPVC/UPVC pipes, brass valves, booster pump parts, and sanitaryware fixtures.',
    status: 'Active',
    createdAt: '2026-08-15',
    updatedAt: '2026-08-15',
  },
  {
    categoryId: 'CAT-0002',
    categoryName: 'Electrical Switchgear & Cabling',
    description: 'MCBs, industrial distribution boards, 3-phase copper cables, and LED troffers.',
    status: 'Active',
    createdAt: '2026-08-16',
    updatedAt: '2026-08-16',
  },
  {
    categoryId: 'CAT-0003',
    categoryName: 'HVAC & Central Chiller Maintenance',
    description: 'AHU air filters, R-410A refrigerant gas, condensing coils, and duct insulation.',
    status: 'Active',
    createdAt: '2026-08-18',
    updatedAt: '2026-08-18',
  },
  {
    categoryId: 'CAT-0004',
    categoryName: 'Mechanized Janitorial Consumables',
    description: 'Hospital-grade disinfectant solutions, single-disc floor scrub pads, microfiber mops.',
    status: 'Active',
    createdAt: '2026-08-20',
    updatedAt: '2026-08-20',
  },
  {
    categoryId: 'CAT-0005',
    categoryName: 'Carpentry & Modular Fit-out Hardware',
    description: 'Soft-close hydraulic hinges, telescopic channel slides, and architectural laminates.',
    status: 'Active',
    createdAt: '2026-08-22',
    updatedAt: '2026-08-22',
  },
  {
    categoryId: 'CAT-0006',
    categoryName: 'Fire Safety & Hydrant Spares',
    description: 'ABC dry powder extinguishers, smoke sensor heads, and brass fire nozzles.',
    status: 'Active',
    createdAt: '2026-08-25',
    updatedAt: '2026-08-25',
  },
];

// Initial Clients Seed Data
const SEED_CLIENTS: Client[] = [
  {
    clientId: 'CLI-0001',
    clientName: 'Prestige Cyber Park Management',
    address: 'Block B, Outer Ring Road, Kadubeesanahalli, Bengaluru, Karnataka 560103',
    email: 'facilities@prestigecyber.com',
    phone: '+91 80 6789 2200',
    gstin: '29AABCP1234F1Z5',
    contactPerson: 'Suresh Nambiar (Facility Director)',
    status: 'Active',
    createdAt: '2026-08-10',
    updatedAt: '2026-08-10',
  },
  {
    clientId: 'CLI-0002',
    clientName: 'Embassy GolfLinks Business Park',
    address: 'Challaghatta, Domlur, Bengaluru, Karnataka 560071',
    email: 'admin@egl-techpark.in',
    phone: '+91 80 4123 5500',
    gstin: '29AAACE4567G1Z8',
    contactPerson: 'Kavita Menon (Head of Real Estate)',
    status: 'Active',
    createdAt: '2026-08-12',
    updatedAt: '2026-08-12',
  },
  {
    clientId: 'CLI-0003',
    clientName: 'Infosys BPM Campus Operations',
    address: 'Electronics City, Phase 1, Hosur Road, Bengaluru, Karnataka 560100',
    email: 'procurement@infosysbpm.com',
    phone: '+91 80 2852 0261',
    gstin: '29AAACI8899K1Z2',
    contactPerson: 'Arun Varma (Infrastructure Manager)',
    status: 'Active',
    createdAt: '2026-08-14',
    updatedAt: '2026-08-14',
  },
  {
    clientId: 'CLI-0004',
    clientName: 'Brigade Gateway Residents Welfare Association',
    address: '26/1, Dr. Rajkumar Road, Malleshwaram West, Bengaluru, Karnataka 560055',
    email: 'rwa.gateway@brigadegateway.org',
    phone: '+91 98450 11223',
    gstin: '29AABTB9988C1Z3',
    contactPerson: 'Col. Ranjit Roy (RWA Secretary)',
    status: 'Active',
    createdAt: '2026-08-20',
    updatedAt: '2026-08-20',
  },
  {
    clientId: 'CLI-0005',
    clientName: 'Apollo Specialty Hospitals Facilities',
    address: '154/11, Opp. IIM-B, Bannerghatta Road, Bengaluru, Karnataka 560076',
    email: 'ehs.apolloblr@apollohospitals.com',
    phone: '+91 80 2630 4050',
    gstin: '29AAACA2100H1Z9',
    contactPerson: 'Dr. Meenakshi Sundaram (VP Operations)',
    status: 'Active',
    createdAt: '2026-08-24',
    updatedAt: '2026-08-24',
  },
];

// Initial Technicians Seed Data
const SEED_TECHNICIANS: Technician[] = [
  {
    technicianId: 'TECH-0001',
    name: 'Ramesh Gowda',
    specialization: 'HVAC & MEP',
    phone: '+91 98451 22334',
    email: 'ramesh.gowda@taaskmate.com',
    experienceYears: 9,
    employmentType: 'Full-Time',
    idProofType: 'Aadhaar',
    idProofNumber: 'XXXX-XXXX-4821',
    emergencyContact: {
      name: 'Sunita Gowda',
      phone: '+91 98451 99887',
      relation: 'Spouse'
    },
    skills: ['Chiller Descaling', 'Condenser Overhaul', 'R-410A Refrigeration', 'AHU Balancing'],
    rating: 5,
    address: 'Indiranagar, Bengaluru, Karnataka 560038',
    status: 'Active',
    createdAt: '2026-08-01',
    updatedAt: '2026-09-01'
  },
  {
    technicianId: 'TECH-0002',
    name: 'Anand Prakash',
    specialization: 'Plumbing & Fire Safety',
    phone: '+91 99160 55443',
    email: 'anand.prakash@taaskmate.com',
    experienceYears: 7,
    employmentType: 'Full-Time',
    idProofType: 'Aadhaar',
    idProofNumber: 'XXXX-XXXX-7712',
    emergencyContact: {
      name: 'Prakash K',
      phone: '+91 99160 11223',
      relation: 'Father'
    },
    skills: ['Fire Hydrant Inspection', 'CO2 Nitrogen Refill', 'Sprinkler Testing', 'CPVC Line Pressure Test'],
    rating: 5,
    address: 'BTM Layout 2nd Stage, Bengaluru, Karnataka 560076',
    status: 'Active',
    createdAt: '2026-08-05',
    updatedAt: '2026-09-03'
  },
  {
    technicianId: 'TECH-0003',
    name: 'Mohammed Farooq',
    specialization: 'Electrical Switchgear',
    phone: '+91 97402 88990',
    email: 'm.farooq@taaskmate.com',
    experienceYears: 11,
    employmentType: 'Full-Time',
    idProofType: 'PAN',
    idProofNumber: 'ABCPE1234F',
    emergencyContact: {
      name: 'Amina Farooq',
      phone: '+91 97402 44556',
      relation: 'Spouse'
    },
    skills: ['LT/HT Panel Retrofitting', 'Schneider MCB Banks', 'Megger Insulation Testing', '3-Phase Busbar Balancing'],
    rating: 4,
    address: 'Shivajinagar, Bengaluru, Karnataka 560051',
    status: 'Active',
    createdAt: '2026-08-10',
    updatedAt: '2026-09-02'
  },
  {
    technicianId: 'TECH-0004',
    name: 'Karthik Raja',
    specialization: 'Carpentry & Hardware',
    phone: '+91 98860 33445',
    email: 'karthik.raja@taaskmate.com',
    experienceYears: 5,
    employmentType: 'Contractor',
    idProofType: 'Aadhaar',
    idProofNumber: 'XXXX-XXXX-3390',
    emergencyContact: {
      name: 'Raja Sundaram',
      phone: '+91 98860 88776',
      relation: 'Brother'
    },
    skills: ['Hydraulic Door Closers', 'Telescopic Channels', 'Acoustic Partitioning', 'Modular Furniture Repair'],
    rating: 4,
    address: 'Whitefield Main Road, Bengaluru, Karnataka 560066',
    status: 'Active',
    createdAt: '2026-08-15',
    updatedAt: '2026-09-04'
  },
  {
    technicianId: 'TECH-0005',
    name: 'Sunil Mahajan',
    specialization: 'Janitorial & Sanitization',
    phone: '+91 96200 44112',
    email: 'sunil.m@taaskmate.com',
    experienceYears: 4,
    employmentType: 'Full-Time',
    idProofType: 'Voter ID',
    idProofNumber: 'KA/02/123/456789',
    emergencyContact: {
      name: 'Rekha Mahajan',
      phone: '+91 96200 77889',
      relation: 'Spouse'
    },
    skills: ['Industrial Scrubbing', 'High-Rise Façade Cleaning', 'Cleanroom Disinfection', 'Waste Management Protocol'],
    rating: 5,
    address: 'Koramangala 4th Block, Bengaluru, Karnataka 560034',
    status: 'On Leave',
    createdAt: '2026-08-20',
    updatedAt: '2026-09-05'
  }
];

// Initial Vendors Seed Data
const SEED_VENDORS: Vendor[] = [
  {
    vendorId: 'VEN-0001',
    vendorName: 'Schneider Electric Industrial Spares Depot',
    tradeCategory: 'Electrical & Lighting',
    contactPerson: 'Vikas Agarwal (Key Account Mgr)',
    phone: '+91 80 4112 8800',
    email: 'orders.blr@schneider-distributor.in',
    address: 'Plot 42, Peenya Industrial Area, 2nd Phase, Bengaluru, Karnataka 560058',
    gstin: '29AABCS1234F1Z1',
    pan: 'AABCS1234F',
    bankDetails: {
      bankName: 'HDFC Bank Ltd',
      accountName: 'Schneider Electric Industrial Spares Depot',
      accountNumber: '50200044556677',
      ifsc: 'HDFC0000123',
      branch: 'Peenya Industrial Area, Bengaluru'
    },
    paymentTerms: 'Net 30',
    tier: 'Preferred Partner',
    status: 'Active',
    createdAt: '2026-08-01',
    updatedAt: '2026-09-01'
  },
  {
    vendorId: 'VEN-0002',
    vendorName: 'Astral Pipes & Sanitary Solutions Pvt Ltd',
    tradeCategory: 'Plumbing & Pumps',
    contactPerson: 'Maheshwari R (Institutional Sales)',
    phone: '+91 80 2221 4455',
    email: 'bangalore.sales@astralpipesdepot.com',
    address: '15/2, Lalbagh Fort Road, Doddamavalli, Bengaluru, Karnataka 560004',
    gstin: '29AABCA9876K1Z4',
    pan: 'AABCA9876K',
    bankDetails: {
      bankName: 'State Bank of India',
      accountName: 'Astral Pipes & Sanitary Solutions',
      accountNumber: '31098877665',
      ifsc: 'SBIN0001244',
      branch: 'Lalbagh Road, Bengaluru'
    },
    paymentTerms: 'Net 15',
    tier: 'Preferred Partner',
    status: 'Active',
    createdAt: '2026-08-04',
    updatedAt: '2026-09-02'
  },
  {
    vendorId: 'VEN-0003',
    vendorName: 'Daikin Central Chiller & HVAC Components',
    tradeCategory: 'HVAC & Refrigeration',
    contactPerson: 'Chetan Deshmukh (Regional Spares Head)',
    phone: '+91 80 6677 3300',
    email: 'spares.south@daikinservice-hub.in',
    address: 'Survey 108, Bommasandra Industrial Area, Hosur Road, Bengaluru, Karnataka 560099',
    gstin: '29AABCD5544E1Z7',
    pan: 'AABCD5544E',
    bankDetails: {
      bankName: 'ICICI Bank Ltd',
      accountName: 'Daikin Central Chiller Components',
      accountNumber: '000205012345',
      ifsc: 'ICIC0000002',
      branch: 'Hosur Road, Bengaluru'
    },
    paymentTerms: '50% Advance',
    tier: 'Preferred Partner',
    status: 'Active',
    createdAt: '2026-08-10',
    updatedAt: '2026-09-03'
  },
  {
    vendorId: 'VEN-0004',
    vendorName: 'Ceasefire Extinguishers & Fire Safety Systems',
    tradeCategory: 'Safety & Fire Fighting',
    contactPerson: 'Deepak Bhatt (Safety Compliance Mgr)',
    phone: '+91 80 2558 9911',
    email: 'commercial.blr@ceasefiresafety.in',
    address: '74, Richmond Road, Shanthala Nagar, Bengaluru, Karnataka 560025',
    gstin: '29AAACC7788M1Z2',
    pan: 'AAACC7788M',
    bankDetails: {
      bankName: 'Axis Bank Ltd',
      accountName: 'Ceasefire Safety Systems Depot',
      accountNumber: '918020033445566',
      ifsc: 'UTIB0000115',
      branch: 'Richmond Town, Bengaluru'
    },
    paymentTerms: 'Immediate / Net 0',
    tier: 'Standard Supplier',
    status: 'Active',
    createdAt: '2026-08-15',
    updatedAt: '2026-09-04'
  },
  {
    vendorId: 'VEN-0005',
    vendorName: 'Diversey Hygiene & Janitorial Solutions',
    tradeCategory: 'Chemicals & Janitorial',
    contactPerson: 'Sunayana Hegde (Client Relations)',
    phone: '+91 80 4321 6789',
    email: 'orders.karnataka@diversey-supplies.com',
    address: 'Sy No 56, Electronic City Phase 2, Bengaluru, Karnataka 560100',
    gstin: '29AABCD1122P1Z9',
    pan: 'AABCD1122P',
    bankDetails: {
      bankName: 'Kotak Mahindra Bank',
      accountName: 'Diversey Hygiene Facility Supplies',
      accountNumber: '7711223344',
      ifsc: 'KKBK0008012',
      branch: 'Electronic City, Bengaluru'
    },
    paymentTerms: 'Net 30',
    tier: 'Standard Supplier',
    status: 'Active',
    createdAt: '2026-08-20',
    updatedAt: '2026-09-05'
  }
];

// Seed Master Transactions (All sharing ONE Master Transaction ID per lifecycle)
const SEED_TRANSACTIONS: MasterTransaction[] = [
  // TM-2026-0001: Full lifecycle (Quotation Approved -> Service Completed -> Invoice Issued & Partially Paid)
  {
    transactionId: 'TM-2026-0001',
    clientId: 'CLI-0001',
    clientSnapshot: {
      clientId: 'CLI-0001',
      clientName: 'Prestige Cyber Park Management',
      address: 'Block B, Outer Ring Road, Kadubeesanahalli, Bengaluru, Karnataka 560103',
      email: 'facilities@prestigecyber.com',
      phone: '+91 80 6789 2200',
      gstin: '29AABCP1234F1Z5',
      contactPerson: 'Suresh Nambiar (Facility Director)',
    },
    overallStatus: 'Partially Paid',
    quotation: {
      transactionId: 'TM-2026-0001',
      quotationId: 'TM-2026-0001',
      quotationDate: '2026-09-01',
      validUntil: '2026-09-30',
      clientId: 'CLI-0001',
      clientSnapshot: {
        clientId: 'CLI-0001',
        clientName: 'Prestige Cyber Park Management',
        address: 'Block B, Outer Ring Road, Kadubeesanahalli, Bengaluru, Karnataka 560103',
        email: 'facilities@prestigecyber.com',
        phone: '+91 80 6789 2200',
        gstin: '29AABCP1234F1Z5',
        contactPerson: 'Suresh Nambiar (Facility Director)',
      },
      items: [
        {
          itemId: 'item-1',
          categoryId: 'CAT-0003',
          materialName: 'HVAC & Central Chiller Maintenance',
          uom: 'Service',
          quantity: 1,
          rate: 85000,
          discount: 5000,
          taxPercent: 18,
          taxAmount: 14400,
          amount: 94400,
          purpose: 'Quarterly overhaul of 300 TR centrifugal chiller & condenser descaling',
        },
        {
          itemId: 'item-2',
          categoryId: 'CAT-0002',
          materialName: 'Electrical Switchgear & Cabling',
          uom: 'Set',
          quantity: 4,
          rate: 12500,
          discount: 2000,
          taxPercent: 18,
          taxAmount: 8640,
          amount: 56640,
          purpose: 'Replacement of LT panel busbar connectors & Schneider MCB banks',
        }
      ],
      subtotal: 135000,
      totalDiscount: 7000,
      totalTax: 23040,
      grandTotal: 151040,
      status: 'Approved',
      notes: 'Services executed over weekend night shifts to prevent corporate business disruption.',
      paymentTerms: '50% advance on PO, balance within 15 days of final testing sign-off.',
      createdAt: '2026-09-01T10:30:00Z',
      updatedAt: '2026-09-02T14:15:00Z',
    },
    serviceReport: {
      transactionId: 'TM-2026-0001',
      serviceDate: '2026-09-03',
      assignedTechnician: 'Ramesh Gowda (Sr. HVAC & MEP Engineer)',
      serviceType: 'HVAC Overhaul & Electrical Panel Servicing',
      location: 'Basement Level 2 Chiller Plant Room & Tower A LT Panel',
      workDescription: 'Completed centrifugal chiller chemical descaling, replaced 4x condenser water sensor probes, and swapped Schneider 63A MCB banks in Tower A electrical room. Pressure testing passed at 12 bar.',
      materialsUsed: [
        {
          itemId: 'mat-1',
          categoryId: 'CAT-0003',
          materialName: 'HVAC Descaling Chemicals & Condenser Gaskets',
          uom: 'Set',
          quantity: 1,
          rate: 22000,
          discount: 0,
          taxPercent: 18,
          taxAmount: 3960,
          amount: 25960,
          purpose: 'Chiller chemical flushing',
        },
        {
          itemId: 'mat-2',
          categoryId: 'CAT-0002',
          materialName: 'Schneider 63A 4-Pole MCB & Busbar links',
          uom: 'Set',
          quantity: 4,
          rate: 8500,
          discount: 0,
          taxPercent: 18,
          taxAmount: 6120,
          amount: 40120,
          purpose: 'LT Distribution panel retrofit',
        }
      ],
      technicianRemarks: 'Chiller operating delta T verified at 5.2 deg C. Panel thermal imaging shows nominal temperature under full load.',
      customerRemarks: 'Work completed on schedule with zero downtime during business hours. Satisfied with execution.',
      status: 'Completed',
      customerName: 'Suresh Nambiar',
      customerSignature: 'Suresh Nambiar [Signed & Verified]',
      technicianName: 'Ramesh Gowda',
      technicianSignature: 'Ramesh Gowda [Signed]',
      beforeImages: [
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80'
      ],
      afterImages: [
        'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=400&q=80'
      ],
      createdAt: '2026-09-03T18:00:00Z',
      updatedAt: '2026-09-03T18:30:00Z',
    },
    invoice: {
      transactionId: 'TM-2026-0001',
      invoiceDate: '2026-09-04',
      dueDate: '2026-09-19',
      clientId: 'CLI-0001',
      clientSnapshot: {
        clientId: 'CLI-0001',
        clientName: 'Prestige Cyber Park Management',
        address: 'Block B, Outer Ring Road, Kadubeesanahalli, Bengaluru, Karnataka 560103',
        email: 'facilities@prestigecyber.com',
        phone: '+91 80 6789 2200',
        gstin: '29AABCP1234F1Z5',
        contactPerson: 'Suresh Nambiar (Facility Director)',
      },
      items: [
        {
          itemId: 'item-1',
          categoryId: 'CAT-0003',
          materialName: 'HVAC & Central Chiller Maintenance',
          uom: 'Service',
          quantity: 1,
          rate: 85000,
          discount: 5000,
          taxPercent: 18,
          taxAmount: 14400,
          amount: 94400,
          purpose: 'Quarterly overhaul of 300 TR centrifugal chiller & condenser descaling',
        },
        {
          itemId: 'item-2',
          categoryId: 'CAT-0002',
          materialName: 'Electrical Switchgear & Cabling',
          uom: 'Set',
          quantity: 4,
          rate: 12500,
          discount: 2000,
          taxPercent: 18,
          taxAmount: 8640,
          amount: 56640,
          purpose: 'Replacement of LT panel busbar connectors & Schneider MCB banks',
        }
      ],
      gstMode: 'CGST_SGST',
      subtotal: 135000,
      totalDiscount: 7000,
      cgst: 11520,
      sgst: 11520,
      igst: 0,
      totalTax: 23040,
      grandTotal: 151040,
      status: 'Partially Paid',
      payment: {
        status: 'Partial',
        date: '2026-09-05',
        mode: 'NEFT / RTGS',
        referenceNumber: 'HDFCR52026090500192',
        amountPaid: 75520,
        balanceDue: 75520,
      },
      bankDetails: DEFAULT_BANK_DETAILS,
      notes: '50% advance received via NEFT. Balance 50% due within 15 days of job sign-off.',
      createdAt: '2026-09-04T10:00:00Z',
      updatedAt: '2026-09-05T14:30:00Z',
    },
    createdAt: '2026-09-01T10:30:00Z',
    updatedAt: '2026-09-05T14:30:00Z',
  },

  // TM-2026-0002: Quotation Approved -> Service In Progress
  {
    transactionId: 'TM-2026-0002',
    clientId: 'CLI-0002',
    clientSnapshot: {
      clientId: 'CLI-0002',
      clientName: 'Embassy GolfLinks Business Park',
      address: 'Challaghatta, Domlur, Bengaluru, Karnataka 560071',
      email: 'admin@egl-techpark.in',
      phone: '+91 80 4123 5500',
      gstin: '29AAACE4567G1Z8',
      contactPerson: 'Kavita Menon (Head of Real Estate)',
    },
    overallStatus: 'Service In Progress',
    quotation: {
      transactionId: 'TM-2026-0002',
      quotationId: 'TM-2026-0002',
      quotationDate: '2026-09-04',
      validUntil: '2026-10-04',
      clientId: 'CLI-0002',
      clientSnapshot: {
        clientId: 'CLI-0002',
        clientName: 'Embassy GolfLinks Business Park',
        address: 'Challaghatta, Domlur, Bengaluru, Karnataka 560071',
        email: 'admin@egl-techpark.in',
        phone: '+91 80 4123 5500',
        gstin: '29AAACE4567G1Z8',
        contactPerson: 'Kavita Menon (Head of Real Estate)',
      },
      items: [
        {
          itemId: 'item-1',
          categoryId: 'CAT-0004',
          materialName: 'Mechanized Janitorial Consumables',
          uom: 'Month',
          quantity: 1,
          rate: 65000,
          discount: 0,
          taxPercent: 18,
          taxAmount: 11700,
          amount: 76700,
          purpose: 'Monthly supply of green hospital-grade chemical sanitizers and floor pads',
        },
        {
          itemId: 'item-2',
          categoryId: 'CAT-0001',
          materialName: 'Plumbing & Pipeline Spares',
          uom: 'Nos',
          quantity: 12,
          rate: 3200,
          discount: 1000,
          taxPercent: 18,
          taxAmount: 6732,
          amount: 44132,
          purpose: 'Sensor flush valve replacement across Tower A common restrooms',
        }
      ],
      subtotal: 103400,
      totalDiscount: 1000,
      totalTax: 18432,
      grandTotal: 120832,
      status: 'Approved',
      notes: 'Materials comply with Green Building LEED Platinum guidelines.',
      paymentTerms: 'Net 30 days against monthly consolidated delivery challan.',
      createdAt: '2026-09-04T11:00:00Z',
      updatedAt: '2026-09-04T16:00:00Z',
    },
    serviceReport: {
      transactionId: 'TM-2026-0002',
      serviceDate: '2026-09-06',
      assignedTechnician: 'Vijay Kumar (Lead Plumber & Sanitization Tech)',
      serviceType: 'Sensor Flush Valves Retrofit & Sanitizer Supply',
      location: 'Tower A Restrooms, Floors 1 to 4',
      workDescription: 'Installation of 8 out of 12 sensor flush valves completed in Restrooms 1A and 2A. Remaining 4 units scheduled for tomorrow morning.',
      materialsUsed: [
        {
          itemId: 'item-2',
          categoryId: 'CAT-0001',
          materialName: 'Sensor Flush Valves',
          uom: 'Nos',
          quantity: 8,
          rate: 3200,
          discount: 0,
          taxPercent: 18,
          taxAmount: 4608,
          amount: 30208,
          purpose: 'Floors 1 & 2 retrofit',
        }
      ],
      technicianRemarks: 'Water pressure stable at 2.8 bar. Solenoid valves calibrated successfully.',
      status: 'In Progress',
      customerName: 'Kavita Menon',
      technicianName: 'Vijay Kumar',
      createdAt: '2026-09-06T09:00:00Z',
      updatedAt: '2026-09-06T15:00:00Z',
    },
    createdAt: '2026-09-04T11:00:00Z',
    updatedAt: '2026-09-06T15:00:00Z',
  },

  // TM-2026-0003: Quotation Sent -> Service Scheduled
  {
    transactionId: 'TM-2026-0003',
    clientId: 'CLI-0004',
    clientSnapshot: {
      clientId: 'CLI-0004',
      clientName: 'Brigade Gateway Residents Welfare Association',
      address: '26/1, Dr. Rajkumar Road, Malleshwaram West, Bengaluru, Karnataka 560055',
      email: 'rwa.gateway@brigadegateway.org',
      phone: '+91 98450 11223',
      gstin: '29AABTB9988C1Z3',
      contactPerson: 'Col. Ranjit Roy (RWA Secretary)',
    },
    overallStatus: 'Service Scheduled',
    quotation: {
      transactionId: 'TM-2026-0003',
      quotationId: 'TM-2026-0003',
      quotationDate: '2026-09-05',
      validUntil: '2026-09-25',
      clientId: 'CLI-0004',
      clientSnapshot: {
        clientId: 'CLI-0004',
        clientName: 'Brigade Gateway Residents Welfare Association',
        address: '26/1, Dr. Rajkumar Road, Malleshwaram West, Bengaluru, Karnataka 560055',
        email: 'rwa.gateway@brigadegateway.org',
        phone: '+91 98450 11223',
        gstin: '29AABTB9988C1Z3',
        contactPerson: 'Col. Ranjit Roy (RWA Secretary)',
      },
      items: [
        {
          itemId: 'item-1',
          categoryId: 'CAT-0006',
          materialName: 'Fire Safety & Hydrant Spares',
          uom: 'Nos',
          quantity: 25,
          rate: 1850,
          discount: 2500,
          taxPercent: 18,
          taxAmount: 7875,
          amount: 51625,
          purpose: 'Hydrostatic pressure testing and ABC extinguisher nitrogen refill',
        }
      ],
      subtotal: 46250,
      totalDiscount: 2500,
      totalTax: 7875,
      grandTotal: 51625,
      status: 'Approved',
      notes: 'Includes certified safety stickers and compliance testing report.',
      paymentTerms: '100% on completion and issuance of safety certificate.',
      createdAt: '2026-09-05T15:20:00Z',
      updatedAt: '2026-09-05T15:20:00Z',
    },
    serviceReport: {
      transactionId: 'TM-2026-0003',
      serviceDate: '2026-09-10',
      assignedTechnician: 'Anand Prakash (Certified Fire Safety Specialist)',
      serviceType: 'Annual Fire Extinguisher Refill & Hydrant Testing',
      location: 'Residential Blocks A to D - Fire Escapes',
      workDescription: 'Scheduled for complete site inspection, pressure gauge replacement, and nitrogen refilling across 25 units.',
      materialsUsed: [],
      status: 'Scheduled',
      customerName: 'Col. Ranjit Roy',
      technicianName: 'Anand Prakash',
      createdAt: '2026-09-06T10:00:00Z',
      updatedAt: '2026-09-06T10:00:00Z',
    },
    createdAt: '2026-09-05T15:20:00Z',
    updatedAt: '2026-09-06T10:00:00Z',
  },

  // TM-2026-0004: Quotation Created (Draft)
  {
    transactionId: 'TM-2026-0004',
    clientId: 'CLI-0003',
    clientSnapshot: {
      clientId: 'CLI-0003',
      clientName: 'Infosys BPM Campus Operations',
      address: 'Electronics City, Phase 1, Hosur Road, Bengaluru, Karnataka 560100',
      email: 'procurement@infosysbpm.com',
      phone: '+91 80 2852 0261',
      gstin: '29AAACI8899K1Z2',
      contactPerson: 'Arun Varma (Infrastructure Manager)',
    },
    overallStatus: 'Quotation Created',
    quotation: {
      transactionId: 'TM-2026-0004',
      quotationId: 'TM-2026-0004',
      quotationDate: '2026-09-07',
      validUntil: '2026-10-07',
      clientId: 'CLI-0003',
      clientSnapshot: {
        clientId: 'CLI-0003',
        clientName: 'Infosys BPM Campus Operations',
        address: 'Electronics City, Phase 1, Hosur Road, Bengaluru, Karnataka 560100',
        email: 'procurement@infosysbpm.com',
        phone: '+91 80 2852 0261',
        gstin: '29AAACI8899K1Z2',
        contactPerson: 'Arun Varma (Infrastructure Manager)',
      },
      items: [
        {
          itemId: 'item-1',
          categoryId: 'CAT-0002',
          materialName: 'Electrical Switchgear & Cabling',
          uom: 'Meter',
          quantity: 250,
          rate: 220,
          discount: 2500,
          taxPercent: 18,
          taxAmount: 9450,
          amount: 61950,
          purpose: 'Emergency backup power cable run for server farm expansion',
        }
      ],
      subtotal: 55000,
      totalDiscount: 2500,
      totalTax: 9450,
      grandTotal: 61950,
      status: 'Draft',
      notes: 'Fire-retardant FRLS 4-core copper armored cable specification.',
      paymentTerms: '30 days credit upon delivery of ISI test certificate.',
      createdAt: '2026-09-07T11:00:00Z',
      updatedAt: '2026-09-07T11:00:00Z',
    },
    createdAt: '2026-09-07T11:00:00Z',
    updatedAt: '2026-09-07T11:00:00Z',
  }
];

class DatabaseService {
  private categories: Category[] = [];
  private clients: Client[] = [];
  private transactions: MasterTransaction[] = [];
  private technicians: Technician[] = [];
  private vendors: Vendor[] = [];

  constructor() {
    this.init();
    this.syncFromBackend();
  }

  private init() {
    try {
      const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (storedCategories) {
        this.categories = JSON.parse(storedCategories);
      } else {
        this.categories = SEED_CATEGORIES;
        this.saveCategories();
      }

      const storedClients = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      if (storedClients) {
        this.clients = JSON.parse(storedClients);
      } else {
        this.clients = SEED_CLIENTS;
        this.saveClients();
      }

      const storedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (storedTransactions) {
        this.transactions = JSON.parse(storedTransactions);
      } else {
        this.transactions = SEED_TRANSACTIONS;
        this.saveTransactions();
      }

      const storedTechnicians = localStorage.getItem(STORAGE_KEYS.TECHNICIANS);
      if (storedTechnicians) {
        this.technicians = JSON.parse(storedTechnicians);
      } else {
        this.technicians = SEED_TECHNICIANS;
        this.saveTechnicians();
      }

      const storedVendors = localStorage.getItem(STORAGE_KEYS.VENDORS);
      if (storedVendors) {
        this.vendors = JSON.parse(storedVendors);
      } else {
        this.vendors = SEED_VENDORS;
        this.saveVendors();
      }
    } catch (e) {
      console.error('Error initializing portal database:', e);
      this.categories = SEED_CATEGORIES;
      this.clients = SEED_CLIENTS;
      this.transactions = SEED_TRANSACTIONS;
      this.technicians = SEED_TECHNICIANS;
      this.vendors = SEED_VENDORS;
    }
  }

  // --- Sync with MongoDB Atlas ---
  public async syncFromBackend(): Promise<boolean> {
    try {
      const res = await fetch('/api/bootstrap');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          this.categories = data.categories.map(({ _id, ...rest }: any) => rest);
          localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(this.categories));
        }
        if (Array.isArray(data.clients) && data.clients.length > 0) {
          this.clients = data.clients.map(({ _id, ...rest }: any) => rest);
          localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(this.clients));
        }
        if (Array.isArray(data.transactions) && data.transactions.length > 0) {
          this.transactions = data.transactions.map(({ _id, ...rest }: any) => rest);
          localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions));
        }
        if (Array.isArray(data.technicians) && data.technicians.length > 0) {
          this.technicians = data.technicians.map(({ _id, ...rest }: any) => rest);
          localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(this.technicians));
        }
        if (Array.isArray(data.vendors) && data.vendors.length > 0) {
          this.vendors = data.vendors.map(({ _id, ...rest }: any) => rest);
          localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(this.vendors));
        }
        console.log('[DatabaseService] Successfully synced with MongoDB Atlas');
        return true;
      }
    } catch (e) {
      console.warn('[DatabaseService] Backend unreachable, using offline storage cache:', e);
    }
    return false;
  }

  private async apiSaveCategory(category: Category) {
    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
    } catch (e) {
      console.warn('[DatabaseService] Sync category to MongoDB failed:', e);
    }
  }

  private async apiDeleteCategory(id: string) {
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('[DatabaseService] Delete category from MongoDB failed:', e);
    }
  }

  private async apiSaveClient(client: Client) {
    try {
      await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client),
      });
    } catch (e) {
      console.warn('[DatabaseService] Sync client to MongoDB failed:', e);
    }
  }

  private async apiDeleteClient(id: string) {
    try {
      await fetch(`/api/clients/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('[DatabaseService] Delete client from MongoDB failed:', e);
    }
  }

  private async apiSaveTransaction(tx: MasterTransaction) {
    try {
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tx),
      });
    } catch (e) {
      console.warn('[DatabaseService] Sync transaction to MongoDB failed:', e);
    }
  }

  private async apiDeleteTransaction(id: string) {
    try {
      await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('[DatabaseService] Delete transaction from MongoDB failed:', e);
    }
  }

  private async apiSaveTechnician(technician: Technician) {
    try {
      await fetch('/api/technicians', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(technician),
      });
    } catch (e) {
      console.warn('[DatabaseService] Sync technician to MongoDB failed:', e);
    }
  }

  private async apiDeleteTechnician(id: string) {
    try {
      await fetch(`/api/technicians/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('[DatabaseService] Delete technician from MongoDB failed:', e);
    }
  }

  private async apiSaveVendor(vendor: Vendor) {
    try {
      await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendor),
      });
    } catch (e) {
      console.warn('[DatabaseService] Sync vendor to MongoDB failed:', e);
    }
  }

  private async apiDeleteVendor(id: string) {
    try {
      await fetch(`/api/vendors/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('[DatabaseService] Delete vendor from MongoDB failed:', e);
    }
  }

  // --- Persistence Helpers with MongoDB Sync ---
  private saveCategories(changedCat?: Category, deletedId?: string) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(this.categories));
    if (changedCat) {
      this.apiSaveCategory(changedCat);
    } else if (deletedId) {
      this.apiDeleteCategory(deletedId);
    }
  }

  private saveClients(changedClient?: Client, deletedId?: string) {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(this.clients));
    if (changedClient) {
      this.apiSaveClient(changedClient);
    } else if (deletedId) {
      this.apiDeleteClient(deletedId);
    }
  }

  private saveTransactions(changedTx?: MasterTransaction, deletedId?: string) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions));
    if (changedTx) {
      this.apiSaveTransaction(changedTx);
    } else if (deletedId) {
      this.apiDeleteTransaction(deletedId);
    }
  }

  private saveTechnicians(changedTech?: Technician, deletedId?: string) {
    localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(this.technicians));
    if (changedTech) {
      this.apiSaveTechnician(changedTech);
    } else if (deletedId) {
      this.apiDeleteTechnician(deletedId);
    }
  }

  private saveVendors(changedVen?: Vendor, deletedId?: string) {
    localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(this.vendors));
    if (changedVen) {
      this.apiSaveVendor(changedVen);
    } else if (deletedId) {
      this.apiDeleteVendor(deletedId);
    }
  }

  // --- Category Methods ---
  public getCategories(): Category[] {
    return [...this.categories];
  }

  public getCategoryById(id: string): Category | undefined {
    return this.categories.find(c => c.categoryId === id);
  }

  public getNextCategoryId(): string {
    const maxNum = this.categories.reduce((max, cat) => {
      const numPart = parseInt(cat.categoryId.replace('CAT-', ''), 10);
      return !isNaN(numPart) && numPart > max ? numPart : max;
    }, 0);
    return `CAT-${String(maxNum + 1).padStart(4, '0')}`;
  }

  public saveCategory(categoryData: Omit<Category, 'createdAt' | 'updatedAt'>): { success: boolean; message: string; category?: Category } {
    const isEdit = this.categories.some(c => c.categoryId === categoryData.categoryId);
    const trimmedName = categoryData.categoryName.trim();

    const duplicate = this.categories.find(
      c => c.categoryName.toLowerCase() === trimmedName.toLowerCase() && c.categoryId !== categoryData.categoryId
    );

    if (duplicate) {
      return { success: false, message: `Category "${trimmedName}" already exists.` };
    }

    const now = new Date().toISOString().split('T')[0];

    if (isEdit) {
      this.categories = this.categories.map(c => {
        if (c.categoryId === categoryData.categoryId) {
          return {
            ...c,
            ...categoryData,
            categoryName: trimmedName,
            updatedAt: now,
          };
        }
        return c;
      });
    } else {
      const newCat: Category = {
        ...categoryData,
        categoryName: trimmedName,
        createdAt: now,
        updatedAt: now,
      };
      this.categories.unshift(newCat);
    }

    const savedCat = this.getCategoryById(categoryData.categoryId);
    this.saveCategories(savedCat);
    return { 
      success: true, 
      message: `Category ${isEdit ? 'updated' : 'created'} successfully.`,
      category: savedCat
    };
  }

  public deleteCategory(id: string): { success: boolean; message: string } {
    const isUsedInTransactions = this.transactions.some(t => 
      t.quotation?.items.some(item => item.categoryId === id)
    );

    if (isUsedInTransactions) {
      return { 
        success: false, 
        message: 'Cannot delete this category because it is linked to existing transactions. Mark it as Inactive instead.' 
      };
    }

    this.categories = this.categories.filter(c => c.categoryId !== id);
    this.saveCategories(undefined, id);
    return { success: true, message: 'Category deleted successfully.' };
  }

  public toggleCategoryStatus(id: string): Category | undefined {
    const cat = this.categories.find(c => c.categoryId === id);
    if (cat) {
      cat.status = cat.status === 'Active' ? 'Inactive' : 'Active';
      cat.updatedAt = new Date().toISOString().split('T')[0];
      this.saveCategories(cat);
    }
    return cat;
  }

  // --- Client Methods ---
  public getClients(): Client[] {
    return [...this.clients];
  }

  public getClientById(id: string): Client | undefined {
    return this.clients.find(c => c.clientId === id);
  }

  public getNextClientId(): string {
    const maxNum = this.clients.reduce((max, client) => {
      const numPart = parseInt(client.clientId.replace('CLI-', ''), 10);
      return !isNaN(numPart) && numPart > max ? numPart : max;
    }, 0);
    return `CLI-${String(maxNum + 1).padStart(4, '0')}`;
  }

  public saveClient(clientData: Omit<Client, 'createdAt' | 'updatedAt'>): { success: boolean; message: string; client?: Client } {
    const isEdit = this.clients.some(c => c.clientId === clientData.clientId);
    const trimmedGstin = clientData.gstin.trim().toUpperCase();

    const duplicateGstin = this.clients.find(
      c => c.gstin.toUpperCase() === trimmedGstin && c.clientId !== clientData.clientId
    );

    if (duplicateGstin) {
      return { success: false, message: `GSTIN "${trimmedGstin}" is already registered to client ${duplicateGstin.clientName}.` };
    }

    const now = new Date().toISOString().split('T')[0];

    if (isEdit) {
      this.clients = this.clients.map(c => {
        if (c.clientId === clientData.clientId) {
          return {
            ...c,
            ...clientData,
            gstin: trimmedGstin,
            updatedAt: now,
          };
        }
        return c;
      });
    } else {
      const newClient: Client = {
        ...clientData,
        gstin: trimmedGstin,
        createdAt: now,
        updatedAt: now,
      };
      this.clients.unshift(newClient);
    }

    const savedClient = this.getClientById(clientData.clientId);
    this.saveClients(savedClient);
    return { 
      success: true, 
      message: `Client ${isEdit ? 'updated' : 'created'} successfully.`,
      client: savedClient
    };
  }

  public deleteClient(id: string): { success: boolean; message: string } {
    const linkedTransactions = this.transactions.filter(t => t.clientId === id);
    if (linkedTransactions.length > 0) {
      return {
        success: false,
        message: `Cannot delete client because ${linkedTransactions.length} transaction(s) are associated with this client. Mark as Inactive instead.`
      };
    }

    this.clients = this.clients.filter(c => c.clientId !== id);
    this.saveClients(undefined, id);
    return { success: true, message: 'Client deleted successfully.' };
  }

  // --- Technician Methods ---
  public getTechnicians(): Technician[] {
    return [...this.technicians];
  }

  public getTechnicianById(id: string): Technician | undefined {
    return this.technicians.find(t => t.technicianId === id);
  }

  public getNextTechnicianId(): string {
    const maxNum = this.technicians.reduce((max, tech) => {
      const numPart = parseInt(tech.technicianId.replace('TECH-', ''), 10);
      return !isNaN(numPart) && numPart > max ? numPart : max;
    }, 0);
    return `TECH-${String(maxNum + 1).padStart(4, '0')}`;
  }

  public saveTechnician(technicianData: Omit<Technician, 'createdAt' | 'updatedAt'>): { success: boolean; message: string; technician?: Technician } {
    const isEdit = this.technicians.some(t => t.technicianId === technicianData.technicianId);
    const trimmedName = technicianData.name.trim();

    const duplicate = this.technicians.find(
      t => t.phone.trim() === technicianData.phone.trim() && t.technicianId !== technicianData.technicianId
    );

    if (duplicate) {
      return { success: false, message: `Phone number "${technicianData.phone}" is already associated with ${duplicate.name}.` };
    }

    const now = new Date().toISOString().split('T')[0];

    if (isEdit) {
      this.technicians = this.technicians.map(t => {
        if (t.technicianId === technicianData.technicianId) {
          return {
            ...t,
            ...technicianData,
            name: trimmedName,
            updatedAt: now,
          };
        }
        return t;
      });
    } else {
      const newTech: Technician = {
        ...technicianData,
        name: trimmedName,
        createdAt: now,
        updatedAt: now,
      };
      this.technicians.unshift(newTech);
    }

    const savedTech = this.getTechnicianById(technicianData.technicianId);
    this.saveTechnicians(savedTech);
    return { 
      success: true, 
      message: `Technician "${trimmedName}" ${isEdit ? 'updated' : 'created'} successfully.`,
      technician: savedTech
    };
  }

  public deleteTechnician(id: string): { success: boolean; message: string } {
    const tech = this.getTechnicianById(id);
    const nameToCheck = tech ? tech.name.toLowerCase() : '';

    const isAssigned = this.transactions.some(t => 
      t.serviceReport && (
        t.serviceReport.assignedTechnician.toLowerCase().includes(nameToCheck) ||
        t.serviceReport.technicianName.toLowerCase().includes(nameToCheck)
      )
    );

    if (isAssigned && nameToCheck) {
      return { 
        success: false, 
        message: `Cannot delete technician "${tech?.name}" because they are assigned to existing service reports. Change status to Inactive instead.` 
      };
    }

    this.technicians = this.technicians.filter(t => t.technicianId !== id);
    this.saveTechnicians(undefined, id);
    return { success: true, message: 'Technician removed successfully.' };
  }

  public toggleTechnicianStatus(id: string): Technician | undefined {
    const tech = this.technicians.find(t => t.technicianId === id);
    if (tech) {
      tech.status = tech.status === 'Active' ? 'Inactive' : 'Active';
      tech.updatedAt = new Date().toISOString().split('T')[0];
      this.saveTechnicians(tech);
    }
    return tech;
  }

  // --- Vendor Methods ---
  public getVendors(): Vendor[] {
    return [...this.vendors];
  }

  public getVendorById(id: string): Vendor | undefined {
    return this.vendors.find(v => v.vendorId === id);
  }

  public getNextVendorId(): string {
    const maxNum = this.vendors.reduce((max, ven) => {
      const numPart = parseInt(ven.vendorId.replace('VEN-', ''), 10);
      return !isNaN(numPart) && numPart > max ? numPart : max;
    }, 0);
    return `VEN-${String(maxNum + 1).padStart(4, '0')}`;
  }

  public saveVendor(vendorData: Omit<Vendor, 'createdAt' | 'updatedAt'>): { success: boolean; message: string; vendor?: Vendor } {
    const isEdit = this.vendors.some(v => v.vendorId === vendorData.vendorId);
    const trimmedGstin = vendorData.gstin.trim().toUpperCase();
    const trimmedPan = vendorData.pan.trim().toUpperCase();

    if (trimmedGstin) {
      const duplicateGstin = this.vendors.find(
        v => v.gstin.toUpperCase() === trimmedGstin && v.vendorId !== vendorData.vendorId
      );

      if (duplicateGstin) {
        return { success: false, message: `GSTIN "${trimmedGstin}" is already registered to vendor "${duplicateGstin.vendorName}".` };
      }
    }

    const now = new Date().toISOString().split('T')[0];

    if (isEdit) {
      this.vendors = this.vendors.map(v => {
        if (v.vendorId === vendorData.vendorId) {
          return {
            ...v,
            ...vendorData,
            gstin: trimmedGstin,
            pan: trimmedPan,
            updatedAt: now,
          };
        }
        return v;
      });
    } else {
      const newVendor: Vendor = {
        ...vendorData,
        gstin: trimmedGstin,
        pan: trimmedPan,
        createdAt: now,
        updatedAt: now,
      };
      this.vendors.unshift(newVendor);
    }

    const savedVendor = this.getVendorById(vendorData.vendorId);
    this.saveVendors(savedVendor);
    return { 
      success: true, 
      message: `Vendor "${vendorData.vendorName}" ${isEdit ? 'updated' : 'created'} successfully.`,
      vendor: savedVendor
    };
  }

  public deleteVendor(id: string): { success: boolean; message: string } {
    this.vendors = this.vendors.filter(v => v.vendorId !== id);
    this.saveVendors(undefined, id);
    return { success: true, message: 'Vendor removed successfully.' };
  }

  public toggleVendorStatus(id: string): Vendor | undefined {
    const ven = this.vendors.find(v => v.vendorId === id);
    if (ven) {
      ven.status = ven.status === 'Active' ? 'Inactive' : 'Active';
      ven.updatedAt = new Date().toISOString().split('T')[0];
      this.saveVendors(ven);
    }
    return ven;
  }

  // =========================================================================
  // MASTER TRANSACTION ID GENERATOR & LIFECYCLE MANAGEMENT
  // Format: TM-YYYY-XXXX (Generated ONCE upon Quotation, never changes)
  // =========================================================================

  public getNextTransactionId(): string {
    const currentYear = new Date().getFullYear();
    const prefix = `TM-${currentYear}-`;
    const maxNum = this.transactions.reduce((max, t) => {
      if (t.transactionId.startsWith(prefix)) {
        const numPart = parseInt(t.transactionId.replace(prefix, ''), 10);
        return !isNaN(numPart) && numPart > max ? numPart : max;
      }
      return max;
    }, 0);
    return `${prefix}${String(maxNum + 1).padStart(4, '0')}`;
  }

  // Backward compatibility alias: Quotation generation assigns the Master Transaction ID
  public getNextQuotationId(): string {
    return this.getNextTransactionId();
  }

  public getTransactions(): MasterTransaction[] {
    return [...this.transactions];
  }

  public getTransactionById(transactionId: string): MasterTransaction | undefined {
    return this.transactions.find(t => t.transactionId === transactionId);
  }

  // Compute Overall Lifecycle Status
  private computeOverallStatus(t: MasterTransaction): MasterTransactionStatus {
    if (t.invoice) {
      if (t.invoice.payment.status === 'Paid') return 'Paid';
      if (t.invoice.payment.status === 'Partial') return 'Partially Paid';
      return 'Invoice Generated';
    }

    if (t.serviceReport) {
      if (t.serviceReport.status === 'Completed') return 'Service Completed';
      if (t.serviceReport.status === 'In Progress') return 'Service In Progress';
      if (t.serviceReport.status === 'Scheduled') return 'Service Scheduled';
      if (t.serviceReport.status === 'Cancelled') return 'Cancelled';
    }

    if (t.quotation) {
      if (t.quotation.status === 'Approved') return 'Quotation Approved';
      if (t.quotation.status === 'Sent') return 'Quotation Sent';
      if (t.quotation.status === 'Rejected') return 'Cancelled';
      return 'Quotation Created';
    }

    return 'Draft';
  }

  // 1. Save Quotation (Creates or Updates the Master Transaction with TM-YYYY-XXXX)
  public saveQuotation(quotationData: Omit<Quotation, 'createdAt' | 'updatedAt'>): { 
    success: boolean; 
    message: string; 
    transaction?: MasterTransaction;
    quotation?: Quotation;
  } {
    const tid = quotationData.transactionId || quotationData.quotationId || this.getNextTransactionId();
    const now = new Date().toISOString();
    
    // Normalize quotation object
    const normalizedQuotation: Quotation = {
      ...quotationData,
      transactionId: tid,
      quotationId: tid, // backward-compat alias
      createdAt: now,
      updatedAt: now,
    };

    const existingIndex = this.transactions.findIndex(t => t.transactionId === tid);

    if (existingIndex >= 0) {
      // Update existing transaction
      const existing = this.transactions[existingIndex];
      const updatedQuote: Quotation = {
        ...existing.quotation,
        ...normalizedQuotation,
        createdAt: existing.quotation?.createdAt || now,
        updatedAt: now,
      };

      const updatedTransaction: MasterTransaction = {
        ...existing,
        clientId: quotationData.clientId,
        clientSnapshot: quotationData.clientSnapshot,
        quotation: updatedQuote,
        updatedAt: now,
      };

      updatedTransaction.overallStatus = this.computeOverallStatus(updatedTransaction);
      this.transactions[existingIndex] = updatedTransaction;
    } else {
      // Create Brand New Master Transaction
      const newTransaction: MasterTransaction = {
        transactionId: tid,
        clientId: quotationData.clientId,
        clientSnapshot: quotationData.clientSnapshot,
        overallStatus: quotationData.status === 'Approved' ? 'Quotation Approved' :
                       quotationData.status === 'Sent' ? 'Quotation Sent' : 'Quotation Created',
        quotation: normalizedQuotation,
        createdAt: now,
        updatedAt: now,
      };

      this.transactions.unshift(newTransaction);
    }

    const savedTx = this.getTransactionById(tid);
    this.saveTransactions(savedTx);

    return {
      success: true,
      message: `Quotation ${tid} saved successfully under Master Transaction ID ${tid}.`,
      transaction: savedTx,
      quotation: savedTx?.quotation
    };
  }

  // 2. Save Service Report (Must be against existing Transaction ID)
  public saveServiceReport(reportData: Omit<ServiceReport, 'createdAt' | 'updatedAt'>): {
    success: boolean;
    message: string;
    transaction?: MasterTransaction;
    serviceReport?: ServiceReport;
  } {
    const tid = reportData.transactionId;
    const existingIndex = this.transactions.findIndex(t => t.transactionId === tid);

    if (existingIndex < 0) {
      return {
        success: false,
        message: `Transaction ${tid} does not exist. A Service Report can only be created against an existing Master Transaction.`
      };
    }

    const now = new Date().toISOString();
    const existing = this.transactions[existingIndex];

    const updatedReport: ServiceReport = {
      ...existing.serviceReport,
      ...reportData,
      transactionId: tid,
      createdAt: existing.serviceReport?.createdAt || now,
      updatedAt: now,
    };

    const updatedTransaction: MasterTransaction = {
      ...existing,
      serviceReport: updatedReport,
      updatedAt: now,
    };

    updatedTransaction.overallStatus = this.computeOverallStatus(updatedTransaction);
    this.transactions[existingIndex] = updatedTransaction;
    this.saveTransactions(updatedTransaction);

    return {
      success: true,
      message: `Service Report for ${tid} saved successfully.`,
      transaction: updatedTransaction,
      serviceReport: updatedReport,
    };
  }

  // 3. Save Invoice (Must be against existing Transaction ID)
  public saveInvoice(invoiceData: Omit<Invoice, 'createdAt' | 'updatedAt'>): {
    success: boolean;
    message: string;
    transaction?: MasterTransaction;
    invoice?: Invoice;
  } {
    const tid = invoiceData.transactionId;
    const existingIndex = this.transactions.findIndex(t => t.transactionId === tid);

    if (existingIndex < 0) {
      return {
        success: false,
        message: `Transaction ${tid} does not exist. An Invoice can only be created against an existing Master Transaction.`
      };
    }

    const now = new Date().toISOString();
    const existing = this.transactions[existingIndex];

    const updatedInvoice: Invoice = {
      ...existing.invoice,
      ...invoiceData,
      transactionId: tid,
      createdAt: existing.invoice?.createdAt || now,
      updatedAt: now,
    };

    const updatedTransaction: MasterTransaction = {
      ...existing,
      invoice: updatedInvoice,
      updatedAt: now,
    };

    updatedTransaction.overallStatus = this.computeOverallStatus(updatedTransaction);
    this.transactions[existingIndex] = updatedTransaction;
    this.saveTransactions(updatedTransaction);

    return {
      success: true,
      message: `Invoice for ${tid} issued successfully.`,
      transaction: updatedTransaction,
      invoice: updatedInvoice,
    };
  }

  // Record Payment against an Invoice
  public recordInvoicePayment(transactionId: string, payment: InvoicePayment): boolean {
    const t = this.transactions.find(item => item.transactionId === transactionId);
    if (!t || !t.invoice) return false;

    t.invoice.payment = payment;
    if (payment.status === 'Paid') {
      t.invoice.status = 'Paid';
    } else if (payment.status === 'Partial') {
      t.invoice.status = 'Partially Paid';
    }

    t.overallStatus = this.computeOverallStatus(t);
    t.updatedAt = new Date().toISOString();
    this.saveTransactions(t);
    return true;
  }

  // Delete Transaction (Cascades full lifecycle)
  public deleteTransaction(transactionId: string): { success: boolean; message: string } {
    this.transactions = this.transactions.filter(t => t.transactionId !== transactionId);
    this.saveTransactions(undefined, transactionId);
    return { success: true, message: `Transaction ${transactionId} and all associated records deleted successfully.` };
  }

  // --- Document Query Helpers ---
  public getQuotations(): Quotation[] {
    return this.transactions
      .filter(t => !!t.quotation)
      .map(t => t.quotation!);
  }

  public getQuotationById(id: string): Quotation | undefined {
    const t = this.transactions.find(item => item.transactionId === id || item.quotation?.quotationId === id);
    return t?.quotation;
  }

  public getServiceReports(): ServiceReport[] {
    return this.transactions
      .filter(t => !!t.serviceReport)
      .map(t => t.serviceReport!);
  }

  public getServiceReportById(id: string): ServiceReport | undefined {
    return this.transactions.find(t => t.transactionId === id)?.serviceReport;
  }

  public getInvoices(): Invoice[] {
    return this.transactions
      .filter(t => !!t.invoice)
      .map(t => t.invoice!);
  }

  public getInvoiceById(id: string): Invoice | undefined {
    return this.transactions.find(t => t.transactionId === id)?.invoice;
  }

  // Filter transactions eligible for Service Report (has Quotation)
  public getEligibleTransactionsForServiceReport(): MasterTransaction[] {
    return this.transactions.filter(t => !!t.quotation);
  }

  // Filter transactions eligible for Invoice (has Quotation or completed Service)
  public getEligibleTransactionsForInvoice(): MasterTransaction[] {
    return this.transactions.filter(t => !!t.quotation);
  }

  // Update Quotation Status
  public updateQuotationStatus(id: string, status: Quotation['status']): boolean {
    const t = this.transactions.find(item => item.transactionId === id || item.quotation?.quotationId === id);
    if (t && t.quotation) {
      t.quotation.status = status;
      t.overallStatus = this.computeOverallStatus(t);
      t.updatedAt = new Date().toISOString();
      this.saveTransactions(t);
      return true;
    }
    return false;
  }

  // Backward compatible alias
  public deleteQuotation(id: string) {
    return this.deleteTransaction(id);
  }

  // =========================================================================
  // 8 EXECUTIVE DASHBOARD KPI METRICS
  // =========================================================================
  public getDashboardStats() {
    const totalTransactions = this.transactions.length;

    // 1. Quotations
    const pendingQuotations = this.transactions.filter(
      t => t.quotation && (t.quotation.status === 'Draft' || t.quotation.status === 'Sent')
    ).length;

    const approvedQuotations = this.transactions.filter(
      t => t.quotation && t.quotation.status === 'Approved'
    ).length;

    // 2. Service Reports
    const servicesInProgress = this.transactions.filter(
      t => t.serviceReport && (t.serviceReport.status === 'Scheduled' || t.serviceReport.status === 'In Progress')
    ).length;

    const completedServices = this.transactions.filter(
      t => t.serviceReport && t.serviceReport.status === 'Completed'
    ).length;

    // 3. Invoices
    const invoicesGenerated = this.transactions.filter(t => !!t.invoice).length;

    const pendingPayments = this.transactions.filter(
      t => t.invoice && (t.invoice.payment.status === 'Pending' || t.invoice.payment.status === 'Partial')
    ).length;

    const paidInvoices = this.transactions.filter(
      t => t.invoice && t.invoice.payment.status === 'Paid'
    ).length;

    // Financial Values
    const totalPipelineValue = this.transactions.reduce((sum, t) => sum + (t.quotation?.grandTotal || 0), 0);
    const totalInvoicedValue = this.transactions.reduce((sum, t) => sum + (t.invoice?.grandTotal || 0), 0);
    const totalCollectedValue = this.transactions.reduce((sum, t) => sum + (t.invoice?.payment?.amountPaid || 0), 0);

    return {
      totalTransactions,
      pendingQuotations,
      approvedQuotations,
      servicesInProgress,
      completedServices,
      invoicesGenerated,
      pendingPayments,
      paidInvoices,
      totalPipelineValue,
      totalInvoicedValue,
      totalCollectedValue,
      totalClients: this.clients.length,
      totalCategories: this.categories.length,
      totalTechnicians: this.technicians.length,
      totalVendors: this.vendors.length,
      activeTechnicians: this.technicians.filter(t => t.status === 'Active').length,
      activeVendors: this.vendors.filter(v => v.status === 'Active').length,
    };
  }
}

// Singleton database instance
export const db = new DatabaseService();
