import initSqlJs, { Database } from 'sql.js';

export type KnowledgeUnitType =
  | 'definition'
  | 'law'
  | 'formula'
  | 'diagram'
  | 'example'
  | 'question'
  | 'quiz'
  | 'note'
  | 'deepnote'
  | 'relationship';

export interface KnowledgeUnit {
  topic: string;
  type: KnowledgeUnitType;
  content: string;
  metadata?: string;
}

export interface TopicInfo {
  name: string;
  subject: string;
  coverage: number;
  units: KnowledgeUnit[];
}

let db: Database | null = null;

const SQL_WASM_URL = 'https://sql.js.org/dist/sql-wasm.wasm';
const DB_NAME = 'examply_knowledge_db_v1';
const STORE_NAME = 'db_store';

async function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveToIndexedDB(data: Uint8Array) {
  const idb = await openIndexedDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = idb.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(data, 'sqlite_db');
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function loadFromIndexedDB(): Promise<Uint8Array | null> {
  const idb = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = idb.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('sqlite_db');
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

import { physicsStarterData } from './physicsStarterData';

export async function initKnowledgeDB() {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: (file) => file.endsWith('.wasm') ? SQL_WASM_URL : `https://sql.js.org/dist/${file}`
  });

  const savedDb = await loadFromIndexedDB();
  if (savedDb) {
    db = new SQL.Database(savedDb);
  } else {
    db = new SQL.Database();
    db.run(`CREATE TABLE topics (
      name TEXT PRIMARY KEY,
      subject TEXT,
      coverage INTEGER
    )`);
    db.run(`CREATE TABLE units (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic TEXT,
      type TEXT,
      content TEXT,
      metadata TEXT,
      FOREIGN KEY(topic) REFERENCES topics(name)
    )`);

    // Seed with Physics data
    for (const topic of physicsStarterData) {
      db.run(`INSERT INTO topics (name, subject, coverage) VALUES (?, ?, ?)`,
        [topic.name, topic.subject, topic.coverage]);
      for (const unit of topic.units) {
        db.run(`INSERT INTO units (topic, type, content, metadata) VALUES (?, ?, ?, ?)`,
          [topic.name, unit.type, unit.content, unit.metadata || null]);
      }
    }
    await saveKnowledgeDB();
  }

  return db;
}

export async function saveKnowledgeDB() {
  if (!db) return;
  const data = db.export();
  await saveToIndexedDB(data);
}

export function addTopic(topic: Omit<TopicInfo, 'units'>) {
  if (!db) return;
  db.run(`INSERT OR REPLACE INTO topics (name, subject, coverage) VALUES (?, ?, ?)`,
    [topic.name, topic.subject, topic.coverage]);
}

export function addUnit(unit: KnowledgeUnit) {
  if (!db) return;
  db.run(`INSERT INTO units (topic, type, content, metadata) VALUES (?, ?, ?, ?)`,
    [unit.topic, unit.type, unit.content, unit.metadata || null]);
}

export function getKnowledge(topic: string, type?: KnowledgeUnitType) {
  if (!db) return [];
  let query = `SELECT type, content, metadata FROM units WHERE topic = ?`;
  const params: any[] = [topic.toLowerCase().replace(/\s+/g, '_')];

  if (type) {
    query += ` AND type = ?`;
    params.push(type);
  }

  const res = db.exec(query, params);
  if (res.length === 0) return [];

  return res[0].values.map(row => ({
    type: row[0] as KnowledgeUnitType,
    content: row[1] as string,
    metadata: row[2] as string
  }));
}

export function getTopicInfo(topicName: string) {
  if (!db) return null;
  const normalized = topicName.toLowerCase().replace(/\s+/g, '_');
  const res = db.exec(`SELECT name, subject, coverage FROM topics WHERE name = ?`, [normalized]);
  if (res.length === 0) return null;

  const row = res[0].values[0];
  return {
    name: row[0] as string,
    subject: row[1] as string,
    coverage: row[2] as number
  };
}

export function searchTopics(keyword: string) {
  if (!db) return [];
  const res = db.exec(`SELECT name FROM topics WHERE name LIKE ?`, [`%${keyword}%`]);
  if (res.length === 0) return [];
  return res[0].values.map(row => row[0] as string);
}

export function parseCommand(input: string) {
  const parts = input.trim().split(/\s+/);
  if (parts.length < 2) return null;

  const command = parts[0].toLowerCase();
  const topic = parts.slice(1).join('_').toLowerCase();

  const commandMap: Record<string, KnowledgeUnitType | 'all' | 'search' | 'roadmap' | 'compare'> = {
    '/explain': 'definition',
    '/define': 'definition',
    '/law': 'law',
    '/formula': 'formula',
    '/diagram': 'diagram',
    '/example': 'example',
    '/question': 'question',
    '/quiz': 'quiz',
    '/note': 'note',
    '/deepnote': 'all',
    '/related': 'relationship',
    '/search': 'search',
    '/roadmap': 'roadmap',
    '/compare': 'compare'
  };

  const targetType = commandMap[command];
  if (!targetType) return null;

  if (targetType === 'search') {
    const results = searchTopics(parts.slice(1).join(' '));
    return {
      type: 'search',
      topic: parts.slice(1).join(' '),
      results
    };
  }

  if (targetType === 'roadmap') {
    const results = getAllTopics(parts.slice(1).join(' '));
    return {
      type: 'roadmap',
      subject: parts.slice(1).join(' '),
      topics: results
    };
  }

  if (targetType === 'compare') {
    const topicParts = parts.slice(1).join(' ').split(/\s+vs\s+/i);
    if (topicParts.length < 2) return { error: "Format: /compare <topic1> vs <topic2>" };

    const t1 = topicParts[0].toLowerCase().replace(/\s+/g, '_');
    const t2 = topicParts[1].toLowerCase().replace(/\s+/g, '_');

    const info1 = getTopicInfo(t1);
    const info2 = getTopicInfo(t2);

    if (!info1 || !info2) return { error: "One or both topics not found for comparison." };

    return {
      type: 'compare',
      topics: [
        { name: info1.name, units: getKnowledge(t1) },
        { name: info2.name, units: getKnowledge(t2) }
      ]
    };
  }

  const info = getTopicInfo(topic);
  if (!info) return { error: `Topic '${topic}' not found in Knowledge Core.` };

  const units = targetType === 'all'
    ? getKnowledge(topic)
    : getKnowledge(topic, targetType as KnowledgeUnitType);

  return {
    type: 'report',
    command,
    topic,
    subject: info.subject,
    coverage: info.coverage,
    units
  };
}

export function getAllTopics(subject?: string) {
  if (!db) return [];
  let query = `SELECT name FROM topics`;
  const params: any[] = [];
  if (subject) {
    query += ` WHERE subject = ?`;
    params.push(subject);
  }
  const res = db.exec(query, params);
  if (res.length === 0) return [];
  return res[0].values.map(row => row[0] as string);
}
