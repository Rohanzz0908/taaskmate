import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  connectDB, 
  getCategoriesCollection, 
  getClientsCollection, 
  getTransactionsCollection 
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

// --- SEED DATABASE IF EMPTY ---
async function seedDatabaseIfEmpty() {
  try {
    const catCol = getCategoriesCollection();
    const cliCol = getClientsCollection();
    const txCol = getTransactionsCollection();

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
    const [categories, clients, transactions] = await Promise.all([
      getCategoriesCollection().find({}).toArray(),
      getClientsCollection().find({}).toArray(),
      getTransactionsCollection().find({}).toArray()
    ]);
    res.json({ categories, clients, transactions });
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
