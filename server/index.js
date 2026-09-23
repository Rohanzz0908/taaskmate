import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  connectDB, 
  getCategoriesCollection, 
  getClientsCollection, 
  getTransactionsCollection,
  getTechniciansCollection,
  getVendorsCollection
} from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initial Mock Seed Data
const INITIAL_CATEGORIES = [
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
    categoryName: 'Fire Fighting Systems & Hydrants',
    description: 'CO2 extinguishers, sprinkler heads, wet riser valves, and fire alarm panels.',
    status: 'Active',
    createdAt: '2026-08-20',
    updatedAt: '2026-08-20',
  }
];

const INITIAL_CLIENTS = [
  {
    clientId: 'CLI-0001',
    clientName: 'PRESTIGE CYBER PARK MANAGEMENT',
    address: 'Block B, Outer Ring Road, Kadubeesanahalli, Bengaluru, Karnataka 560103',
    email: 'facilities@prestigecyber.com',
    phone: '+91 80 6789 2200',
    gstin: '29AABCP1234F1Z5',
    contactPerson: 'Suresh Nambiar (Facility Director)',
    status: 'Active',
    createdAt: '2026-08-10',
    updatedAt: '2026-09-01',
  },
  {
    clientId: 'CLI-0002',
    clientName: 'Embassy GolfLinks Business Park',
    address: 'Intermediate Ring Road, Domlur, Bengaluru, Karnataka 560071',
    email: 'operations@embassygolflinks.in',
    phone: '+91 80 4010 3000',
    gstin: '29AABCE5678M1Z9',
    contactPerson: 'Kavita Menon (Estate Manager)',
    status: 'Active',
    createdAt: '2026-08-12',
    updatedAt: '2026-09-02',
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
    updatedAt: '2026-09-04',
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
    createdAt: '2026-08-18',
    updatedAt: '2026-09-05',
  }
];

const INITIAL_TRANSACTIONS = [
  {
    transactionId: 'TM-2026-0001',
    clientId: 'CLI-0001',
    clientSnapshot: {
      clientId: 'CLI-0001',
      clientName: 'PRESTIGE CYBER PARK MANAGEMENT',
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
      validUntil: '2026-09-20',
      clientId: 'CLI-0001',
      clientSnapshot: {
        clientId: 'CLI-0001',
        clientName: 'PRESTIGE CYBER PARK MANAGEMENT',
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
          materialName: 'HVAC Descaling Chemicals & Condenser Gaskets',
          uom: 'Set',
          quantity: 1,
          rate: 85000,
          discount: 5000,
          taxPercent: 18,
          taxAmount: 14400,
          amount: 94400,
          purpose: 'Chiller chemical flushing',
        },
        {
          itemId: 'item-2',
          categoryId: 'CAT-0002',
          materialName: 'Schneider 63A 4-Pole MCB & Busbar links',
          uom: 'Set',
          quantity: 4,
          rate: 12500,
          discount: 2000,
          taxPercent: 18,
          taxAmount: 8640,
          amount: 56640,
          purpose: 'LT Distribution panel retrofit',
        }
      ],
      subtotal: 135000,
      totalDiscount: 7000,
      totalTax: 23040,
      grandTotal: 151040,
      status: 'Approved',
      notes: 'Includes comprehensive testing & commissioning of both electrical busbars and HVAC chillers.',
      paymentTerms: '50% advance against service kickoff, balance within 15 days of invoice.',
      createdAt: '2026-09-01T10:30:00Z',
      updatedAt: '2026-09-02T16:00:00Z',
    },
    serviceReport: {
      transactionId: 'TM-2026-0001',
      serviceDate: '2026-09-03',
      assignedTechnician: 'Ramesh Gowda (Senior HVAC & Electrical Specialist)',
      serviceType: 'HVAC Overhaul & Electrical Panel Servicing',
      location: 'Basement Level 2 Chiller Plant Room & Tower A LT Panel',
      workDescription: 'Executed chemical flushing and descaling of 300 TR chiller condenser coils. Replaced 4 faulty MCBs in main LT distribution board with busbar links. Performed insulation resistance and megger tests. All parameters normal.',
      materialsUsed: [
        {
          itemId: 'item-1',
          categoryId: 'CAT-0003',
          materialName: 'HVAC Descaling Chemicals & Condenser Gaskets',
          uom: 'Set',
          quantity: 1,
          rate: 85000,
          discount: 5000,
          taxPercent: 18,
          taxAmount: 14400,
          amount: 94400,
          purpose: 'Chiller chemical flushing',
        },
        {
          itemId: 'item-2',
          categoryId: 'CAT-0002',
          materialName: 'Schneider 63A 4-Pole MCB & Busbar links',
          uom: 'Set',
          quantity: 4,
          rate: 12500,
          discount: 2000,
          taxPercent: 18,
          taxAmount: 8640,
          amount: 56640,
          purpose: 'LT Distribution panel retrofit',
        }
      ],
      technicianRemarks: 'Chiller inlet-outlet delta T reached optimal 5.2 deg C. LT panel load balancing verified under full operating conditions.',
      customerRemarks: 'Completed ahead of schedule with zero business disruption.',
      status: 'Completed',
      customerName: 'Suresh Nambiar',
      technicianName: 'Ramesh Gowda',
      createdAt: '2026-09-03T18:00:00Z',
      updatedAt: '2026-09-03T18:00:00Z',
    },
    invoice: {
      transactionId: 'TM-2026-0001',
      invoiceDate: '2026-09-04',
      dueDate: '2026-09-19',
      clientId: 'CLI-0001',
      clientSnapshot: {
        clientId: 'CLI-0001',
        clientName: 'PRESTIGE CYBER PARK MANAGEMENT',
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
          materialName: 'HVAC Descaling Chemicals & Condenser Gaskets',
          uom: 'Set',
          quantity: 1,
          rate: 85000,
          discount: 5000,
          taxPercent: 18,
          taxAmount: 14400,
          amount: 94400,
          purpose: 'Chiller chemical flushing',
        },
        {
          itemId: 'item-2',
          categoryId: 'CAT-0002',
          materialName: 'Schneider 63A 4-Pole MCB & Busbar links',
          uom: 'Set',
          quantity: 4,
          rate: 12500,
          discount: 2000,
          taxPercent: 18,
          taxAmount: 8640,
          amount: 56640,
          purpose: 'LT Distribution panel retrofit',
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
      bankDetails: {
        bankName: 'HDFC Bank Ltd',
        accountName: 'Taaskmate Facility Services Pvt Ltd',
        accountNumber: '50200088991122',
        ifsc: 'HDFC0000456',
        branch: 'Brookefield, Outer Ring Road, Bengaluru'
      },
      notes: '50% advance received via NEFT. Balance 50% due within 15 days of job sign-off.',
      createdAt: '2026-09-04T10:00:00Z',
      updatedAt: '2026-09-05T14:30:00Z',
    },
    createdAt: '2026-09-01T10:30:00Z',
    updatedAt: '2026-09-05T14:30:00Z',
  }
];

const INITIAL_TECHNICIANS = [
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

const INITIAL_VENDORS = [
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

// Helper to seed initial data if collections are completely empty
async function seedDatabaseIfEmpty() {
  try {
    const catCol = getCategoriesCollection();
    const cliCol = getClientsCollection();
    const txCol = getTransactionsCollection();
    const techCol = getTechniciansCollection();
    const venCol = getVendorsCollection();

    const catCount = await catCol.countDocuments();
    if (catCount === 0) {
      console.log('[MongoDB] Seeding default categories...');
      await catCol.insertMany(INITIAL_CATEGORIES);
    }

    const cliCount = await cliCol.countDocuments();
    if (cliCount === 0) {
      console.log('[MongoDB] Seeding default clients...');
      await cliCol.insertMany(INITIAL_CLIENTS);
    }

    const txCount = await txCol.countDocuments();
    if (txCount === 0) {
      console.log('[MongoDB] Seeding default master transactions...');
      await txCol.insertMany(INITIAL_TRANSACTIONS);
    }

    const techCount = await techCol.countDocuments();
    if (techCount === 0) {
      console.log('[MongoDB] Seeding default technicians...');
      await techCol.insertMany(INITIAL_TECHNICIANS);
    }

    const venCount = await venCol.countDocuments();
    if (venCount === 0) {
      console.log('[MongoDB] Seeding default vendors...');
      await venCol.insertMany(INITIAL_VENDORS);
    }
  } catch (err) {
    console.error('[MongoDB] Seeding error:', err.message);
  }
}

// ============================================================================
// API ROUTES
// ============================================================================

// 1. Health check
app.get('/api/health', async (req, res) => {
  try {
    const txCol = getTransactionsCollection();
    const count = await txCol.countDocuments();
    res.json({ ok: true, database: 'MongoDB Atlas', count, status: 'connected' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 2. Full Bootstrap Data (All in one call)
app.get('/api/bootstrap', async (req, res) => {
  try {
    const [categories, clients, transactions, technicians, vendors] = await Promise.all([
      getCategoriesCollection().find({}).toArray(),
      getClientsCollection().find({}).toArray(),
      getTransactionsCollection().find({}).toArray(),
      getTechniciansCollection().find({}).toArray(),
      getVendorsCollection().find({}).toArray()
    ]);
    res.json({ categories, clients, transactions, technicians, vendors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Categories CRUD
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await getCategoriesCollection().find({}).toArray();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const category = req.body;
    await getCategoriesCollection().updateOne(
      { categoryId: category.categoryId },
      { $set: category },
      { upsert: true }
    );
    res.json({ success: true, category });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    await getCategoriesCollection().deleteOne({ categoryId: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Clients CRUD
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await getClientsCollection().find({}).toArray();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const client = req.body;
    await getClientsCollection().updateOne(
      { clientId: client.clientId },
      { $set: client },
      { upsert: true }
    );
    res.json({ success: true, client });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  try {
    await getClientsCollection().deleteOne({ clientId: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Master Transactions CRUD
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await getTransactionsCollection().find({}).toArray();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/transactions/:id', async (req, res) => {
  try {
    const transaction = await getTransactionsCollection().findOne({ transactionId: req.params.id });
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const transaction = req.body;
    await getTransactionsCollection().updateOne(
      { transactionId: transaction.transactionId },
      { $set: transaction },
      { upsert: true }
    );
    res.json({ success: true, transaction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    await getTransactionsCollection().deleteOne({ transactionId: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Technicians CRUD
app.get('/api/technicians', async (req, res) => {
  try {
    const technicians = await getTechniciansCollection().find({}).toArray();
    res.json(technicians);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/technicians', async (req, res) => {
  try {
    const technician = req.body;
    await getTechniciansCollection().updateOne(
      { technicianId: technician.technicianId },
      { $set: technician },
      { upsert: true }
    );
    res.json({ success: true, technician });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/technicians/:id', async (req, res) => {
  try {
    await getTechniciansCollection().deleteOne({ technicianId: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Vendors CRUD
app.get('/api/vendors', async (req, res) => {
  try {
    const vendors = await getVendorsCollection().find({}).toArray();
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vendors', async (req, res) => {
  try {
    const vendor = req.body;
    await getVendorsCollection().updateOne(
      { vendorId: vendor.vendorId },
      { $set: vendor },
      { upsert: true }
    );
    res.json({ success: true, vendor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/vendors/:id', async (req, res) => {
  try {
    await getVendorsCollection().deleteOne({ vendorId: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Connection & Seed helper for Serverless & Local
let isInitialized = false;
export async function ensureConnected() {
  if (!isInitialized) {
    await connectDB();
    await seedDatabaseIfEmpty();
    isInitialized = true;
  }
}

// Start Server locally (ignored when running on Vercel serverless)
async function start() {
  try {
    await ensureConnected();
    app.listen(PORT, () => {
      console.log(`[API Server] Running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[API Server] Startup failed:', err.message);
  }
}

if (!process.env.VERCEL) {
  start();
}

export default app;
