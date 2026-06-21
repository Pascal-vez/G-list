import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'data', 'db.json');

const DEFAULT_DB = {
  waitlist: [],
  contact: [],
  reports: [],
  reviews: {},
  passwordResets: {},
  emailVerifications: {},
};

function readDb() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DB, null, 2));
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return { ...DEFAULT_DB };
  }
}

function writeDb(db) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

export function getCollection(name) {
  const db = readDb();
  return db[name] ?? (Array.isArray(DEFAULT_DB[name]) ? [] : {});
}

export function pushToCollection(name, item) {
  const db = readDb();
  if (!Array.isArray(db[name])) db[name] = [];
  db[name].unshift(item);
  writeDb(db);
  return item;
}

export function setNested(collection, key, value) {
  const db = readDb();
  if (!db[collection]) db[collection] = {};
  if (value == null) {
    delete db[collection][key];
  } else {
    db[collection][key] = value;
  }
  writeDb(db);
  return value;
}

export function getNested(collection, key) {
  const db = readDb();
  return db[collection]?.[key] ?? null;
}
