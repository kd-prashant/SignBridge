import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '..', 'db.json');

// Initialize DB if not exists
async function initDb() {
  try {
    await fs.access(DB_FILE);
  } catch (e) {
    const defaultData = {
      users: [],
      progress: [],
      transcripts: []
    };
    await fs.writeFile(DB_FILE, JSON.stringify(defaultData, null, 2));
  }
}

async function readDb() {
  const data = await fs.readFile(DB_FILE, 'utf-8');
  return JSON.parse(data);
}

async function writeDb(data) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

export const db = {
  initDb,
  readDb,
  writeDb
};
