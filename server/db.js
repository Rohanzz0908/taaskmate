import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from workspace root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI environment variable is missing. Please check your .env file or Vercel environment variables.');
}
const client = new MongoClient(uri);

let db = null;

export async function connectDB() {
  if (db) return db;
  try {
    await client.connect();
    db = client.db('taaskmate');
    console.log('[MongoDB] Connected successfully to Atlas database: taaskmate');
    return db;
  } catch (error) {
    console.error('[MongoDB] Connection error:', error.message);
    throw error;
  }
}

export function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
}

export function getCategoriesCollection() {
  return getDB().collection('categories');
}

export function getClientsCollection() {
  return getDB().collection('clients');
}

export function getTransactionsCollection() {
  return getDB().collection('transactions');
}
