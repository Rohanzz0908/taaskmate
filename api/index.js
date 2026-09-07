import app, { ensureConnected } from '../server/index.js';

export default async function handler(req, res) {
  try {
    await ensureConnected();
    return app(req, res);
  } catch (error) {
    console.error('[Vercel Serverless Error]:', error);
    return res.status(500).json({ error: 'Database connection error', details: error.message });
  }
}
