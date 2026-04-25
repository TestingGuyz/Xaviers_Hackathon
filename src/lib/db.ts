// ============================================================
// SQLite Database Layer
// ============================================================
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { DEFAULT_STATUS, DEFAULT_DNA, type PetStatus, type PetDNA, type JournalEntry, type DailyTask, INTERACTION } from './types';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'tamago.db');

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;
  
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  
  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');
  
  // Create tables
  _db.exec(`
    CREATE TABLE IF NOT EXISTS pet_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    
    CREATE TABLE IF NOT EXISTS pet_dna (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dna TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    
    CREATE TABLE IF NOT EXISTS interactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      interaction_type INTEGER NOT NULL,
      metadata TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    
    CREATE TABLE IF NOT EXISTS memories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      metadata TEXT,
      keywords TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    
    CREATE TABLE IF NOT EXISTS journal (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      thought TEXT NOT NULL,
      sentiment TEXT NOT NULL DEFAULT 'neutral',
      unlock_level INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    
    CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    
    CREATE TABLE IF NOT EXISTS accessories_owned (
      id TEXT PRIMARY KEY,
      equipped INTEGER NOT NULL DEFAULT 0
    );
    
    CREATE TABLE IF NOT EXISTS daily_tasks (
      id TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      type TEXT NOT NULL,
      target INTEGER NOT NULL,
      current INTEGER NOT NULL DEFAULT 0,
      xp_reward INTEGER NOT NULL DEFAULT 10,
      completed INTEGER NOT NULL DEFAULT 0,
      created_date TEXT NOT NULL DEFAULT (date('now'))
    );
  `);
  
  // Seed initial state if empty
  const count = _db.prepare('SELECT COUNT(*) as count FROM pet_status').get() as { count: number };
  if (count.count === 0) {
    _db.prepare('INSERT INTO pet_status (status) VALUES (?)').run(JSON.stringify(DEFAULT_STATUS));
    _db.prepare('INSERT INTO pet_dna (dna) VALUES (?)').run(JSON.stringify(DEFAULT_DNA));
    seedDailyTasks(_db);
  }
  
  return _db;
}

function seedDailyTasks(db: Database.Database) {
  const tasks: Omit<DailyTask, 'current' | 'completed'>[] = [
    { id: 'feed_3', description: 'Feed your pet 3 times', type: 'feed', target: 3, xpReward: 15 },
    { id: 'play_2', description: 'Play with your pet 2 times', type: 'play', target: 2, xpReward: 20 },
    { id: 'chat_5', description: 'Send 5 messages to your pet', type: 'chat', target: 5, xpReward: 25 },
    { id: 'bath_1', description: 'Give your pet a bath', type: 'bath', target: 1, xpReward: 10 },
    { id: 'discipline_1', description: 'Discipline your pet once', type: 'discipline', target: 1, xpReward: 10 },
  ];
  
  const stmt = db.prepare(
    'INSERT OR REPLACE INTO daily_tasks (id, description, type, target, current, xp_reward, completed, created_date) VALUES (?, ?, ?, ?, 0, ?, 0, date(\'now\'))'
  );
  
  for (const t of tasks) {
    stmt.run(t.id, t.description, t.type, t.target, t.xpReward);
  }
}

// ============================================================
// Status Operations
// ============================================================

export function getLatestStatus(): PetStatus {
  const db = getDb();
  const row = db.prepare('SELECT status FROM pet_status ORDER BY id DESC LIMIT 1').get() as { status: string } | undefined;
  if (!row) return DEFAULT_STATUS;
  return JSON.parse(row.status);
}

export function updateStatus(status: PetStatus): void {
  const db = getDb();
  db.prepare('INSERT INTO pet_status (status) VALUES (?)').run(JSON.stringify(status));
}

// ============================================================
// DNA Operations
// ============================================================

export function getLatestDNA(): PetDNA {
  const db = getDb();
  const row = db.prepare('SELECT dna FROM pet_dna ORDER BY id DESC LIMIT 1').get() as { dna: string } | undefined;
  if (!row) return DEFAULT_DNA;
  return JSON.parse(row.dna);
}

export function updateDNA(dna: PetDNA): void {
  const db = getDb();
  db.prepare('INSERT INTO pet_dna (dna) VALUES (?)').run(JSON.stringify(dna));
}

// ============================================================
// Interaction Operations
// ============================================================

export function saveInteraction(type: INTERACTION, metadata: Record<string, unknown> = {}): void {
  const db = getDb();
  db.prepare('INSERT INTO interactions (interaction_type, metadata) VALUES (?, ?)').run(type, JSON.stringify(metadata));
}

export function getLastInteractions(limit: number = 10): { interaction_type: number; metadata: string; created_at: string }[] {
  const db = getDb();
  return db.prepare('SELECT * FROM interactions ORDER BY id DESC LIMIT ?').all(limit) as { interaction_type: number; metadata: string; created_at: string }[];
}

// ============================================================
// Memory Operations
// ============================================================

export function saveMemory(content: string, metadata: Record<string, unknown> = {}): void {
  const db = getDb();
  const keywords = content.toLowerCase().split(/\W+/).filter(w => w.length > 2).join(',');
  db.prepare('INSERT INTO memories (content, metadata, keywords) VALUES (?, ?, ?)').run(content, JSON.stringify(metadata), keywords);
}

export function searchMemories(query: string, limit: number = 5): { content: string; metadata: string }[] {
  const db = getDb();
  const queryWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  
  if (queryWords.length === 0) {
    return db.prepare('SELECT content, metadata FROM memories ORDER BY id DESC LIMIT ?').all(limit) as { content: string; metadata: string }[];
  }
  
  // Simple keyword-based similarity search
  const conditions = queryWords.map(() => "keywords LIKE ?").join(' OR ');
  const params = queryWords.map(w => `%${w}%`);
  params.push(String(limit));
  
  return db.prepare(`SELECT content, metadata FROM memories WHERE ${conditions} ORDER BY id DESC LIMIT ?`).all(...params) as { content: string; metadata: string }[];
}

// ============================================================
// Journal Operations
// ============================================================

export function addJournalEntry(thought: string, sentiment: string, unlockLevel: number): void {
  const db = getDb();
  db.prepare('INSERT INTO journal (thought, sentiment, unlock_level) VALUES (?, ?, ?)').run(thought, sentiment, unlockLevel);
}

export function getJournalEntries(currentSyncLevel: number): JournalEntry[] {
  const db = getDb();
  return db.prepare('SELECT id, thought, sentiment, created_at as createdAt, unlock_level as unlockLevel FROM journal WHERE unlock_level <= ? ORDER BY id DESC LIMIT 20').all(currentSyncLevel) as JournalEntry[];
}

export function getLockedJournalCount(currentSyncLevel: number): number {
  const db = getDb();
  const row = db.prepare('SELECT COUNT(*) as count FROM journal WHERE unlock_level > ?').get(currentSyncLevel) as { count: number };
  return row.count;
}

// ============================================================
// Chat Operations
// ============================================================

export function saveChatMessage(role: string, content: string): void {
  const db = getDb();
  db.prepare('INSERT INTO chat_history (role, content) VALUES (?, ?)').run(role, content);
}

export function getChatHistory(limit: number = 20): { role: string; content: string; created_at: string }[] {
  const db = getDb();
  return db.prepare('SELECT role, content, created_at FROM chat_history ORDER BY id DESC LIMIT ?').all(limit) as { role: string; content: string; created_at: string }[];
}

// ============================================================
// Accessories Operations
// ============================================================

export function getOwnedAccessories(): string[] {
  const db = getDb();
  const rows = db.prepare('SELECT id FROM accessories_owned').all() as { id: string }[];
  return rows.map(r => r.id);
}

export function getEquippedAccessories(): string[] {
  const db = getDb();
  const rows = db.prepare('SELECT id FROM accessories_owned WHERE equipped = 1').all() as { id: string }[];
  return rows.map(r => r.id);
}

export function buyAccessory(id: string): void {
  const db = getDb();
  db.prepare('INSERT OR IGNORE INTO accessories_owned (id, equipped) VALUES (?, 0)').run(id);
}

export function toggleAccessory(id: string): boolean {
  const db = getDb();
  const row = db.prepare('SELECT equipped FROM accessories_owned WHERE id = ?').get(id) as { equipped: number } | undefined;
  if (!row) return false;
  const newState = row.equipped ? 0 : 1;
  db.prepare('UPDATE accessories_owned SET equipped = ? WHERE id = ?').run(newState, id);
  return newState === 1;
}

// ============================================================
// Daily Tasks Operations
// ============================================================

export function getDailyTasks(): DailyTask[] {
  const db = getDb();
  // Check if tasks need reset (different date)
  const firstTask = db.prepare('SELECT created_date FROM daily_tasks LIMIT 1').get() as { created_date: string } | undefined;
  const today = new Date().toISOString().split('T')[0];
  
  if (firstTask && firstTask.created_date !== today) {
    db.prepare('DELETE FROM daily_tasks').run();
    seedDailyTasks(db);
  }
  
  return db.prepare('SELECT id, description, type, target, current, xp_reward as xpReward, completed FROM daily_tasks').all() as DailyTask[];
}

export function incrementTaskProgress(taskType: string): { completed: boolean; xpReward: number } | null {
  const db = getDb();
  const task = db.prepare('SELECT id, current, target, xp_reward, completed FROM daily_tasks WHERE type = ? AND completed = 0 LIMIT 1').get(taskType) as { id: string; current: number; target: number; xp_reward: number; completed: number } | undefined;
  
  if (!task) return null;
  
  const newCurrent = task.current + 1;
  const justCompleted = newCurrent >= task.target;
  
  db.prepare('UPDATE daily_tasks SET current = ?, completed = ? WHERE id = ?').run(newCurrent, justCompleted ? 1 : 0, task.id);
  
  return justCompleted ? { completed: true, xpReward: task.xp_reward } : { completed: false, xpReward: 0 };
}
