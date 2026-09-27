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
  branch: 'Nagole, HYD'
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
  {
    clientId: 'CLI-0006',
    clientName: 'Max Division - Landmark Group',
    address: 'Hyderabad, Telangana',
    email: 'vikram.chinthapalli@landmarkgroup.in',
    phone: '+91 40 4567 8900',
    gstin: 'NA',
    contactPerson: 'Vikram Chinthapalli',
    status: 'Active',
    createdAt: '2026-09-20',
    updatedAt: '2026-09-20',
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
  // TM260002: Full lifecycle (Quotation Approved -> Service Completed -> Invoice Issued & Partially Paid)
  {
    transactionId: 'TM260002',
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
      transactionId: 'TM260002',
      quotationId: 'TM260002',
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
      gstMode: 'CGST_SGST',
      subtotal: 135000,
      totalDiscount: 7000,
      cgst: 11520,
      sgst: 11520,
      igst: 0,
      totalTax: 23040,
      grandTotal: 151040,
      status: 'Approved',
      notes: 'Services executed over weekend night shifts to prevent corporate business disruption.',
      paymentTerms: '50% advance on PO, balance within 15 days of final testing sign-off.',
      createdAt: '2026-09-01T10:30:00Z',
      updatedAt: '2026-09-02T14:15:00Z',
    },
    serviceReport: {
      transactionId: 'TM260002',
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
      transactionId: 'TM260002',
      quotationId: 'TM260002',
      invoiceId: 'TMI2600001',
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

  // TM260003: Quotation Approved -> Service In Progress
  {
    transactionId: 'TM260003',
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
      transactionId: 'TM260003',
      quotationId: 'TM260003',
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
      gstMode: 'CGST_SGST',
      subtotal: 103400,
      totalDiscount: 1000,
      cgst: 9216,
      sgst: 9216,
      igst: 0,
      totalTax: 18432,
      grandTotal: 120832,
      status: 'Approved',
      notes: 'Materials comply with Green Building LEED Platinum guidelines.',
      paymentTerms: 'Net 30 days against monthly consolidated delivery challan.',
      createdAt: '2026-09-04T11:00:00Z',
      updatedAt: '2026-09-04T16:00:00Z',
    },
    serviceReport: {
      transactionId: 'TM260003',
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

  // TM260004: Quotation Sent -> Service Scheduled
  {
    transactionId: 'TM260004',
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
      transactionId: 'TM260004',
      quotationId: 'TM260004',
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
      gstMode: 'CGST_SGST',
      subtotal: 46250,
      totalDiscount: 2500,
      cgst: 3937.5,
      sgst: 3937.5,
      igst: 0,
      totalTax: 7875,
      grandTotal: 51625,
      status: 'Approved',
      notes: 'Includes certified safety stickers and compliance testing report.',
      paymentTerms: '100% on completion and issuance of safety certificate.',
      createdAt: '2026-09-05T15:20:00Z',
      updatedAt: '2026-09-05T15:20:00Z',
    },
    serviceReport: {
      transactionId: 'TM260004',
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

  // TM260005: Quotation Created (Draft)
  {
    transactionId: 'TM260005',
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
      transactionId: 'TM260005',
      quotationId: 'TM260005',
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
      gstMode: 'CGST_SGST',
      subtotal: 55000,
      totalDiscount: 2500,
      cgst: 4725,
      sgst: 4725,
      igst: 0,
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
  },
  // TM260001: Reference Quotation (Max Division - Landmark Group)
  {
    transactionId: 'TM260001',
    clientId: 'CLI-0006',
    clientSnapshot: {
      clientId: 'CLI-0006',
      clientName: 'Max Division - Landmark Group',
      address: 'Hyderabad, Telangana',
      email: 'vikram.chinthapalli@landmarkgroup.in',
      phone: '+91 40 4567 8900',
      gstin: 'NA',
      contactPerson: 'Vikram Chinthapalli',
    },
    overallStatus: 'Quotation Sent',
    quotation: {
      transactionId: 'TM260001',
      quotationId: 'TM260001',
      quotationDate: '2026-09-26',
      validUntil: '2026-10-03',
      clientId: 'CLI-0006',
      clientSnapshot: {
        clientId: 'CLI-0006',
        clientName: 'Max Division - Landmark Group',
        address: 'Hyderabad, Telangana',
        email: 'vikram.chinthapalli@landmarkgroup.in',
        phone: '+91 40 4567 8900',
        gstin: 'NA',
        contactPerson: 'Vikram Chinthapalli',
      },
      items: [
        {
          itemId: 'item-1',
          materialName: 'Supply and fixing Pop false ceiling sheets: -',
          description: 'Supply and fixing Pop false ceiling sheets: -\n• Removing of damaged pop sheet in ceiling of size (2x2)\n• According to the existing false ceiling lights wholes are made on the sheet and installed to the ceiling',
          uom: 'Sq. ft',
          quantity: 133,
          rate: 90.00,
          discount: 0,
          taxPercent: 18,
          taxAmount: 2154.60,
          amount: 14124.60,
        },
        {
          itemId: 'item-2',
          materialName: 'Painting of false ceiling sheets: -',
          description: 'Painting of false ceiling sheets: -\n• Post installation of sheets painting is done over those sheets (painting system – 2coats of lappam + One coat of Primer and 2coats of Asian paints tractor emulsion applied over it',
          uom: 'LS',
          quantity: 1,
          rate: 10500.00,
          discount: 0,
          taxPercent: 18,
          taxAmount: 1890.00,
          amount: 12390.00,
        },
        {
          itemId: 'item-3',
          materialName: 'Supply of Anti Skid Tape (width 50mm & length 18 mtr)',
          description: 'Supply of Anti Skid Tape (width 50mm & length 18 mtr)',
          uom: 'Bundles',
          quantity: 5,
          rate: 1116.00,
          discount: 0,
          taxPercent: 18,
          taxAmount: 1004.40,
          amount: 6584.40,
        }
      ],
      gstMode: 'CGST_SGST',
      subtotal: 28050,
      totalDiscount: 0,
      cgst: 2524.5,
      sgst: 2524.5,
      igst: 0,
      totalTax: 5049,
      grandTotal: 33099,
      status: 'Sent',
      paymentTerms: 'Payment Terms will be Net 7 days after Invoice date',
      createdAt: '2026-09-26T10:00:00Z',
      updatedAt: '2026-09-26T10:00:00Z',
    },
    createdAt: '2026-09-26T10:00:00Z',
    updatedAt: '2026-09-26T10:00:00Z',
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
        // Ensure Landmark client is present
        if (!this.clients.some(c => c.clientName.includes('Landmark Group'))) {
          const landmark = SEED_CLIENTS.find(c => c.clientName.includes('Landmark Group'));
          if (landmark) {
            this.clients.push(landmark);
            this.saveClients();
          }
        }
      } else {
        this.clients = SEED_CLIENTS;
        this.saveClients();
      }

      const storedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (storedTransactions) {
        try {
          let loaded = JSON.parse(storedTransactions) as MasterTransaction[];
          let dirty = false;
          loaded = loaded.map(t => {
            const updated = { ...t };
            if (updated.transactionId.startsWith('TM-2026-')) {
              dirty = true;
              const numPart = updated.transactionId.replace('TM-2026-', '');
              updated.transactionId = `TM26${numPart}`;
              if (updated.quotation) {
                updated.quotation.transactionId = updated.transactionId;
                updated.quotation.quotationId = updated.transactionId;
              }
              if (updated.serviceReport) {
                updated.serviceReport.transactionId = updated.transactionId;
                updated.serviceReport.quotationId = updated.transactionId;
              }
              if (updated.invoice) {
                updated.invoice.transactionId = updated.transactionId;
                updated.invoice.quotationId = updated.transactionId;
              }
            }
            // Only assign an invoiceId if an invoice already exists and was missing invoiceId
            if (updated.invoice && !updated.invoice.invoiceId) {
              dirty = true;
              updated.invoice.invoiceId = 'TMI2600001';
            }

            // Synchronize existing Service Report and Commercial Invoice if quotation items or pricing changed
            if (updated.quotation && (updated.serviceReport || updated.invoice)) {
              const quoteItemsKey = JSON.stringify(updated.quotation.items?.map(m => ({ n: m.description || m.materialName, q: m.quantity, r: m.rate, u: m.uom })));
              const srItemsKey = updated.serviceReport ? JSON.stringify(updated.serviceReport.materialsUsed?.map(m => ({ n: m.description || m.materialName, q: m.quantity, r: m.rate, u: m.uom }))) : null;
              const invItemsKey = updated.invoice ? JSON.stringify(updated.invoice.items?.map(m => ({ n: m.description || m.materialName, q: m.quantity, r: m.rate, u: m.uom }))) : null;

              const hasItemNameMismatch = updated.quotation.items?.some(it => it.description && it.materialName && it.description !== it.materialName);

              if ((srItemsKey && srItemsKey !== quoteItemsKey) || (invItemsKey && invItemsKey !== quoteItemsKey) || hasItemNameMismatch) {
                dirty = true;
                this.cascadeQuotationUpdates(updated);
              }
            }

            // Clean up false 'Ramesh Gowda' fallback if quotation had no technician assigned
            const hasQuoteTech = updated.quotation?.assignedTechnicianName || 
              (updated.quotation?.assignedTechnicianNames && updated.quotation.assignedTechnicianNames.length > 0);
            if (!hasQuoteTech && updated.serviceReport) {
              if (updated.serviceReport.assignedTechnician === 'Ramesh Gowda') {
                updated.serviceReport.assignedTechnician = '';
                updated.serviceReport.technicianName = '';
                updated.serviceReport.technicianSignature = '';
                dirty = true;
              }
            }

            return updated;
          });

          // Ensure TM260001 is present
          if (!loaded.some(t => t.transactionId === 'TM260001')) {
            const tm260001 = SEED_TRANSACTIONS.find(t => t.transactionId === 'TM260001');
            if (tm260001) {
              loaded.unshift(tm260001);
              dirty = true;
            }
          }

          this.transactions = loaded;
          if (dirty) {
            this.saveTransactions();
          }
        } catch (e) {
          this.transactions = SEED_TRANSACTIONS;
          this.saveTransactions();
        }
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
    const trimmedGstin = (clientData.gstin || '').trim().toUpperCase();

    if (trimmedGstin && trimmedGstin !== 'NA') {
      const duplicateGstin = this.clients.find(
        c => c.gstin && c.gstin.trim().toUpperCase() === trimmedGstin && c.clientId !== clientData.clientId
      );

      if (duplicateGstin) {
        return { success: false, message: `GSTIN "${trimmedGstin}" is already registered to client ${duplicateGstin.clientName}.` };
      }
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
  // ID GENERATORS & TRANSACTION MANAGEMENT
  // Quotation & Service Report share the SAME Quotation ID: TM260001 sequence
  // Commercial Invoice uses its own Invoice ID: TMI2600001 sequence (generated ONLY when invoice is created)
  // =========================================================================

  public getNextQuotationId(): string {
    const currentYear = new Date().getFullYear();
    const yearSuffix = String(currentYear).slice(-2); // e.g. "26"
    const prefix = `TM${yearSuffix}`;
    let maxNum = 0;

    this.transactions.forEach(t => {
      const qid = t.quotation?.quotationId || t.transactionId || '';
      // Match TM26XXXX
      const m1 = qid.match(new RegExp(`^TM${yearSuffix}(\\d+)`));
      if (m1) {
        const num = parseInt(m1[1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      } else {
        // Fallback for legacy format TM-YYYY-XXXX
        const m2 = qid.match(/^TM-\d{4}-(\d+)/);
        if (m2) {
          const num = parseInt(m2[1], 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      }
    });

    return `${prefix}${String(maxNum + 1).padStart(4, '0')}`;
  }

  public getNextTransactionId(): string {
    return this.getNextQuotationId();
  }

  public getNextInvoiceId(): string {
    const currentYear = new Date().getFullYear();
    const yearSuffix = String(currentYear).slice(-2); // e.g. "26"
    const prefix = `TMI${yearSuffix}`;
    let maxNum = 0;

    this.transactions.forEach(t => {
      const invId = t.invoice?.invoiceId || '';
      if (invId) {
        // Match TMI26XXXXX (5 digits)
        const m1 = invId.match(new RegExp(`^TMI${yearSuffix}(\\d+)`));
        if (m1) {
          const num = parseInt(m1[1], 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        } else {
          // Fallback legacy
          const m2 = invId.match(/^TMI-\d{4}-(\d+)/);
          if (m2) {
            const num = parseInt(m2[1], 10);
            if (!isNaN(num) && num > maxNum) maxNum = num;
          }
        }
      }
    });

    return `${prefix}${String(maxNum + 1).padStart(5, '0')}`;
  }

  public getTransactions(): MasterTransaction[] {
    return [...this.transactions];
  }

  public getTransactionById(transactionId: string): MasterTransaction | undefined {
    const t = this.transactions.find(item => item.transactionId === transactionId || item.quotation?.quotationId === transactionId);
    if (t && t.quotation && (t.serviceReport || t.invoice)) {
      const quoteItemsKey = JSON.stringify(t.quotation.items?.map(m => ({ n: m.description || m.materialName, q: m.quantity, r: m.rate, u: m.uom })));
      const srItemsKey = t.serviceReport ? JSON.stringify(t.serviceReport.materialsUsed?.map(m => ({ n: m.description || m.materialName, q: m.quantity, r: m.rate, u: m.uom }))) : null;
      const invItemsKey = t.invoice ? JSON.stringify(t.invoice.items?.map(m => ({ n: m.description || m.materialName, q: m.quantity, r: m.rate, u: m.uom }))) : null;

      const hasItemNameMismatch = t.quotation.items?.some(it => it.description && it.materialName && it.description !== it.materialName);

      if ((srItemsKey && srItemsKey !== quoteItemsKey) || (invItemsKey && invItemsKey !== quoteItemsKey) || hasItemNameMismatch) {
        this.cascadeQuotationUpdates(t);
        this.saveTransactions(t);
      }
    }
    return t;
  }

  /**
   * Public helper to synchronize a transaction's downstream documents (Service Report and Commercial Invoice)
   * with its latest quotation items and pricing, and persist the change.
   */
  public syncTransactionFromQuotation(transactionId: string): MasterTransaction | undefined {
    const t = this.transactions.find(item => item.transactionId === transactionId || item.quotation?.quotationId === transactionId);
    if (t && t.quotation) {
      this.cascadeQuotationUpdates(t);
      this.saveTransactions(t);
      return t;
    }
    return undefined;
  }

  /**
   * Cascades quotation updates to existing downstream documents (Service Report and Commercial Invoice).
   * Ensures that if items, quantities, rates, descriptions, or client details are modified in the quotation,
   * they automatically propagate to the linked Service Report and Commercial Invoice.
   */
  public cascadeQuotationUpdates(transaction: MasterTransaction): boolean {
    if (!transaction || !transaction.quotation) return false;
    let changed = false;
    const quote = transaction.quotation;
    const now = new Date().toISOString();

    // 0. Normalize quotation items so both description and materialName reflect any edited text accurately
    if (quote.items && quote.items.length > 0) {
      quote.items = quote.items.map(item => {
        const finalName = item.description || item.materialName || '';
        return {
          ...item,
          description: finalName,
          materialName: finalName,
        };
      });
    }

    // 1. Ensure transaction client snapshot matches quotation client snapshot
    if (quote.clientSnapshot) {
      transaction.clientSnapshot = { ...quote.clientSnapshot };
      transaction.clientId = quote.clientId || transaction.clientId;
    }

    // 2. Cascade to Service Report (if one already exists)
    if (transaction.serviceReport) {
      const sr = transaction.serviceReport;

      // Cascade technician from quotation
      const quoteTech = (quote.assignedTechnicianNames && quote.assignedTechnicianNames.length > 0)
        ? quote.assignedTechnicianNames.join(', ')
        : (quote.assignedTechnicianName || transaction.assignedTechnicianName || '');
      sr.assignedTechnician = quoteTech;
      sr.technicianName = quoteTech;
      if (!quoteTech) {
        sr.technicianSignature = '';
      }

      // Deep clone quotation items to materialsUsed with unified item name
      sr.materialsUsed = quote.items.map(item => {
        const finalName = item.description || item.materialName || '';
        return {
          ...item,
          description: finalName,
          materialName: finalName,
        };
      });

      // Update primary service type if quotation has items
      if (quote.items.length > 0 && (quote.items[0]?.description || quote.items[0]?.materialName)) {
        sr.serviceType = quote.items[0].description || quote.items[0].materialName || sr.serviceType;
      }

      // Update location if client serviceLocation or address is present
      if (transaction.clientSnapshot?.serviceLocation) {
        sr.location = transaction.clientSnapshot.serviceLocation;
      } else if (transaction.clientSnapshot?.address && (!sr.location || sr.location === 'Client Premises')) {
        sr.location = transaction.clientSnapshot.address.split(',')[0].trim() || transaction.clientSnapshot.address;
      }

      // Update customer name if client contact person is updated
      if (transaction.clientSnapshot?.contactPerson && !sr.customerName) {
        sr.customerName = transaction.clientSnapshot.contactPerson;
      }

      sr.updatedAt = now;
      changed = true;
    }

    // 3. Cascade to Invoice (if one already exists)
    if (transaction.invoice) {
      const inv = transaction.invoice;

      // Update client snapshot on invoice
      if (quote.clientSnapshot) {
        inv.clientSnapshot = { ...quote.clientSnapshot };
        inv.clientId = quote.clientId || inv.clientId;
      }

      // Synchronize invoice items with quotation items
      inv.items = quote.items.map(item => {
        const finalName = item.description || item.materialName || '';
        const qty = Number(item.quantity) || 0;
        const rate = Number(item.rate ?? item.clientRate) || 0;
        const discount = Number(item.discount) || 0;
        const baseAmt = Math.max(0, (qty * rate) - discount);
        return {
          ...item,
          description: finalName,
          materialName: finalName,
          taxPercent: 0,
          taxAmount: 0,
          amount: baseAmt,
        };
      });

      // Recompute invoice financial totals
      let invSubtotal = 0;
      let invDiscount = 0;

      quote.items.forEach(item => {
        const qty = Number(item.quantity) || 0;
        const rate = Number(item.rate ?? item.clientRate) || 0;
        const discount = Number(item.discount) || 0;

        invSubtotal += (qty * rate);
        invDiscount += discount;
      });

      const taxableAmount = Math.max(0, invSubtotal - invDiscount);

      const gstMode = quote.gstMode || inv.gstMode || 'CGST_SGST';
      inv.gstMode = gstMode;

      let cgst = 0;
      let sgst = 0;
      let igst = 0;
      let invTax = 0;

      if (gstMode === 'CGST_SGST') {
        cgst = Number((taxableAmount * 0.09).toFixed(2));
        sgst = Number((taxableAmount * 0.09).toFixed(2));
        invTax = Number((cgst + sgst).toFixed(2));
      } else {
        igst = Number((taxableAmount * 0.18).toFixed(2));
        invTax = igst;
      }

      const grandTotal = taxableAmount + invTax;

      inv.subtotal = invSubtotal;
      inv.totalDiscount = invDiscount;
      inv.cgst = cgst;
      inv.sgst = sgst;
      inv.igst = igst;
      inv.totalTax = invTax;
      inv.grandTotal = grandTotal;

      // Recompute payment balances
      const currentPaid = inv.payment?.amountPaid || 0;
      const balanceDue = Math.max(0, grandTotal - currentPaid);

      let paymentStatus: 'Pending' | 'Partial' | 'Paid' = 'Pending';
      if (currentPaid >= grandTotal && grandTotal > 0) {
        paymentStatus = 'Paid';
      } else if (currentPaid > 0) {
        paymentStatus = 'Partial';
      }

      inv.payment = {
        ...inv.payment,
        amountPaid: currentPaid,
        balanceDue,
        status: paymentStatus,
      };

      if (paymentStatus === 'Paid') {
        inv.status = 'Paid';
      } else if (paymentStatus === 'Partial') {
        inv.status = 'Partially Paid';
      } else if (inv.status === 'Paid' || inv.status === 'Partially Paid') {
        inv.status = 'Issued';
      }

      inv.updatedAt = now;
      changed = true;
    }

    if (changed) {
      transaction.overallStatus = this.computeOverallStatus(transaction);
      transaction.updatedAt = now;
    }

    return changed;
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
      if (t.quotation.status === 'Completed' || t.quotation.status === 'Approved') return 'Quotation Approved';
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
        assignedTechnicianId: quotationData.assignedTechnicianId !== undefined ? quotationData.assignedTechnicianId : existing.assignedTechnicianId,
        assignedTechnicianName: quotationData.assignedTechnicianName !== undefined ? quotationData.assignedTechnicianName : existing.assignedTechnicianName,
        assignedTechnicianIds: quotationData.assignedTechnicianIds !== undefined ? quotationData.assignedTechnicianIds : existing.assignedTechnicianIds,
        assignedTechnicianNames: quotationData.assignedTechnicianNames !== undefined ? quotationData.assignedTechnicianNames : existing.assignedTechnicianNames,
        assignedVendorId: quotationData.assignedVendorId !== undefined ? quotationData.assignedVendorId : existing.assignedVendorId,
        assignedVendorName: quotationData.assignedVendorName !== undefined ? quotationData.assignedVendorName : existing.assignedVendorName,
        assignedVendorIds: quotationData.assignedVendorIds !== undefined ? quotationData.assignedVendorIds : existing.assignedVendorIds,
        assignedVendorNames: quotationData.assignedVendorNames !== undefined ? quotationData.assignedVendorNames : existing.assignedVendorNames,
        updatedAt: now,
      };

      // Cascade quotation items and pricing to Service Report and Invoice
      this.cascadeQuotationUpdates(updatedTransaction);

      updatedTransaction.overallStatus = this.computeOverallStatus(updatedTransaction);
      this.transactions[existingIndex] = updatedTransaction;

      let cascadeMsg = '';
      if (updatedTransaction.serviceReport && updatedTransaction.invoice) {
        cascadeMsg = ' Linked Service Report and Commercial Invoice have been automatically updated.';
      } else if (updatedTransaction.serviceReport) {
        cascadeMsg = ' Linked Service Report has been automatically updated.';
      } else if (updatedTransaction.invoice) {
        cascadeMsg = ' Linked Commercial Invoice has been automatically updated.';
      }

      const savedTx = this.getTransactionById(tid);
      this.saveTransactions(savedTx);

      return {
        success: true,
        message: `Quotation ${tid} updated successfully.${cascadeMsg}`,
        transaction: savedTx,
        quotation: savedTx?.quotation
      };
    } else {
      // Create Brand New Master Transaction
      const newTransaction: MasterTransaction = {
        transactionId: tid,
        clientId: quotationData.clientId,
        clientSnapshot: quotationData.clientSnapshot,
        overallStatus: quotationData.status === 'Approved' ? 'Quotation Approved' :
                       quotationData.status === 'Sent' ? 'Quotation Sent' : 'Quotation Created',
        quotation: normalizedQuotation,
        assignedTechnicianId: quotationData.assignedTechnicianId,
        assignedTechnicianName: quotationData.assignedTechnicianName,
        assignedTechnicianIds: quotationData.assignedTechnicianIds,
        assignedTechnicianNames: quotationData.assignedTechnicianNames,
        assignedVendorId: quotationData.assignedVendorId,
        assignedVendorName: quotationData.assignedVendorName,
        assignedVendorIds: quotationData.assignedVendorIds,
        assignedVendorNames: quotationData.assignedVendorNames,
        createdAt: now,
        updatedAt: now,
      };

      this.transactions.unshift(newTransaction);

      const savedTx = this.getTransactionById(tid);
      this.saveTransactions(savedTx);

      return {
        success: true,
        message: `Quotation ${tid} saved successfully under Master Transaction ID ${tid}.`,
        transaction: savedTx,
        quotation: savedTx?.quotation
      };
    }
  }

  // 2. Save Service Report (Must be against existing Transaction ID)
  public saveServiceReport(
    reportData: Omit<ServiceReport, 'createdAt' | 'updatedAt'>,
    isEdit: boolean = false
  ): {
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

    // Prevent duplicate service reports for the same quotation ID
    if (existing.serviceReport && !isEdit) {
      return {
        success: false,
        message: `A Service Report already exists for Quotation ${tid}. You cannot create a duplicate service report for the same quotation.`
      };
    }

    // Single Source of Truth: Scope items and materials strictly sync from Quotation
    const syncedMaterials = (existing.quotation?.items && existing.quotation.items.length > 0)
      ? existing.quotation.items.map(it => ({ ...it }))
      : (reportData.materialsUsed || existing.serviceReport?.materialsUsed || []);

    const updatedReport: ServiceReport = {
      ...existing.serviceReport,
      ...reportData,
      transactionId: tid,
      materialsUsed: syncedMaterials,
      createdAt: existing.serviceReport?.createdAt || now,
      updatedAt: now,
    };

    const updatedTransaction: MasterTransaction = {
      ...existing,
      serviceReport: updatedReport,
      updatedAt: now,
    };

    let quoteShiftMsg = '';
    // If quotation was on Draft, shift its status to 'Sent'
    if (existing.quotation && existing.quotation.status === 'Draft') {
      const updatedQuote: Quotation = {
        ...existing.quotation,
        status: 'Sent',
        updatedAt: now,
      };
      existing.quotation = updatedQuote;
      updatedTransaction.quotation = updatedQuote;
      quoteShiftMsg = ' Quotation status automatically shifted from Draft to Sent.';
    }

    updatedTransaction.overallStatus = this.computeOverallStatus(updatedTransaction);
    this.transactions[existingIndex] = updatedTransaction;
    this.saveTransactions(updatedTransaction);

    return {
      success: true,
      message: `Service Report for ${tid} saved successfully (synced from Quotation).${quoteShiftMsg}`,
      transaction: updatedTransaction,
      serviceReport: updatedReport,
    };
  }

  // 3. Save Invoice (Must be against existing Transaction ID)
  public saveInvoice(
    invoiceData: Omit<Invoice, 'createdAt' | 'updatedAt'>,
    isEdit: boolean = false
  ): {
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

    // Prevent duplicate invoice generation for the same quotation ID
    if (existing.invoice && !isEdit) {
      return {
        success: false,
        message: `An Invoice already exists for Quotation ${tid} (Invoice ID: ${existing.invoice.invoiceId || tid}). You cannot create a duplicate invoice for the same quotation.`
      };
    }

    // Only generate an invoice ID if it hasn't been generated yet
    const invId = invoiceData.invoiceId || existing.invoice?.invoiceId || this.getNextInvoiceId();

    // Single Source of Truth: Invoice items and financial calculations strictly sync from Quotation
    const syncedItems = (existing.quotation?.items && existing.quotation.items.length > 0)
      ? existing.quotation.items.map(it => ({ ...it }))
      : (invoiceData.items || existing.invoice?.items || []);

    let invSubtotal = 0;
    let invDiscount = 0;
    syncedItems.forEach(it => {
      const qty = Number(it.quantity) || 0;
      const rate = Number(it.rate ?? it.clientRate) || 0;
      invSubtotal += (qty * rate);
      invDiscount += (it.discount || 0);
    });

    const taxable = Math.max(0, invSubtotal - invDiscount);
    const gstMode = invoiceData.gstMode || existing.quotation?.gstMode || existing.invoice?.gstMode || 'CGST_SGST';
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    let invTax = 0;
    if (gstMode === 'CGST_SGST') {
      cgst = Number((taxable * 0.09).toFixed(2));
      sgst = Number((taxable * 0.09).toFixed(2));
      invTax = Number((cgst + sgst).toFixed(2));
    } else {
      igst = Number((taxable * 0.18).toFixed(2));
      invTax = igst;
    }
    const grandTotal = taxable + invTax;

    const currentPaid = invoiceData.payment?.amountPaid ?? (existing.invoice?.payment?.amountPaid || 0);
    const balanceDue = Math.max(0, grandTotal - currentPaid);

    const updatedInvoice: Invoice = {
      ...existing.invoice,
      ...invoiceData,
      invoiceId: invId,
      transactionId: tid,
      quotationId: tid,
      items: syncedItems,
      subtotal: invSubtotal,
      totalDiscount: invDiscount,
      cgst,
      sgst,
      igst,
      totalTax: invTax,
      grandTotal,
      payment: {
        ...(invoiceData.payment || existing.invoice?.payment || { status: 'Pending', amountPaid: 0, balanceDue: grandTotal }),
        amountPaid: currentPaid,
        balanceDue,
      },
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
      message: `Invoice ${invId} for Quotation ${tid} issued successfully.`,
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
    return this.transactions.find(t => t.invoice?.invoiceId === id || t.transactionId === id)?.invoice;
  }

  // Filter transactions eligible for Service Report (Draft, Sent, Completed, Approved, without existing service report)
  public getEligibleTransactionsForServiceReport(): MasterTransaction[] {
    return this.transactions.filter(t => !!t.quotation && t.quotation.status !== 'Rejected' && !t.serviceReport);
  }

  // Filter transactions eligible for Invoice (has Completed Quotation, without existing invoice)
  public getEligibleTransactionsForInvoice(): MasterTransaction[] {
    return this.transactions.filter(t => !!t.quotation && (t.quotation.status === 'Completed' || t.quotation.status === 'Approved') && !t.invoice);
  }

  // Update Quotation Status
  public updateQuotationStatus(id: string, status: Quotation['status']): boolean {
    const t = this.transactions.find(item => item.transactionId === id || item.quotation?.quotationId === id);
    if (t && t.quotation) {
      t.quotation.status = status;
      this.cascadeQuotationUpdates(t);
      t.overallStatus = this.computeOverallStatus(t);
      t.updatedAt = new Date().toISOString();
      this.saveTransactions(t);
      return true;
    }
    return false;
  }

  // Update Service Report Status
  public updateServiceReportStatus(id: string, status: ServiceReport['status']): boolean {
    const t = this.transactions.find(item => item.transactionId === id || item.quotation?.quotationId === id);
    if (t && t.serviceReport) {
      t.serviceReport.status = status;
      t.overallStatus = this.computeOverallStatus(t);
      t.updatedAt = new Date().toISOString();
      this.saveTransactions(t);
      return true;
    }
    return false;
  }

  // Delete Service Report from a Transaction
  public deleteServiceReport(id: string): { success: boolean; message: string } {
    const t = this.transactions.find(item => item.transactionId === id || item.quotation?.quotationId === id);
    if (!t || !t.serviceReport) {
      return { success: false, message: `Service Report for ${id} not found.` };
    }
    t.serviceReport = undefined;
    t.overallStatus = this.computeOverallStatus(t);
    t.updatedAt = new Date().toISOString();
    this.saveTransactions(t);
    return { success: true, message: `Service Report for ${id} deleted successfully.` };
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
      t => t.quotation && (t.quotation.status === 'Completed' || t.quotation.status === 'Approved')
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
