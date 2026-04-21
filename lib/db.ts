import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";
import { LogEntry } from "@/types";

const IS_POSTGRES = !!(process.env.POSTGRES_URL || process.env.DATABASE_URL);

function getSql() {
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL!;
  return neon(url);
}

let _tableInit: Promise<void> | null = null;

async function ensureTable(): Promise<void> {
  if (_tableInit) return _tableInit;
  _tableInit = (async () => {
    const sql = getSql();
    await sql`
      CREATE TABLE IF NOT EXISTS log_entries (
        id            TEXT    PRIMARY KEY,
        food_id       TEXT    NOT NULL,
        food_name     TEXT    NOT NULL,
        calories      NUMERIC NOT NULL,
        protein       NUMERIC NOT NULL,
        carbs         NUMERIC NOT NULL,
        fat           NUMERIC NOT NULL,
        serving_size  NUMERIC NOT NULL,
        serving_unit  TEXT    NOT NULL,
        quantity      NUMERIC NOT NULL,
        date          TEXT    NOT NULL,
        timestamp     BIGINT  NOT NULL,
        meal          TEXT,
        session_id    TEXT    NOT NULL DEFAULT 'default'
      )
    `;
    await sql`ALTER TABLE log_entries ADD COLUMN IF NOT EXISTS session_id TEXT NOT NULL DEFAULT 'default'`;
    await sql`CREATE INDEX IF NOT EXISTS idx_log_date ON log_entries(date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_log_session ON log_entries(session_id, date)`;
  })();
  return _tableInit;
}

type PgRow = Record<string, unknown>;

function rowToEntry(row: PgRow): LogEntry {
  return {
    id: String(row.id),
    foodId: String(row.food_id),
    foodName: String(row.food_name),
    calories: Number(row.calories),
    protein: Number(row.protein),
    carbs: Number(row.carbs),
    fat: Number(row.fat),
    servingSize: Number(row.serving_size),
    servingUnit: String(row.serving_unit),
    quantity: Number(row.quantity),
    date: String(row.date),
    timestamp: Number(row.timestamp),
    meal: row.meal ? (row.meal as LogEntry["meal"]) : undefined,
  };
}

async function pgGetEntries(date: string, sessionId: string): Promise<LogEntry[]> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM log_entries
    WHERE date = ${date} AND session_id = ${sessionId}
    ORDER BY timestamp ASC
  `;
  return rows.map((r) => rowToEntry(r as PgRow));
}

async function pgAddEntry(entry: LogEntry, sessionId: string): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`
    INSERT INTO log_entries
      (id, food_id, food_name, calories, protein, carbs, fat,
       serving_size, serving_unit, quantity, date, timestamp, meal, session_id)
    VALUES
      (${entry.id}, ${entry.foodId}, ${entry.foodName},
       ${entry.calories}, ${entry.protein}, ${entry.carbs}, ${entry.fat},
       ${entry.servingSize}, ${entry.servingUnit}, ${entry.quantity},
       ${entry.date}, ${entry.timestamp}, ${entry.meal ?? null}, ${sessionId})
  `;
}

async function pgDeleteEntry(id: string, sessionId: string): Promise<void> {
  const sql = getSql();
  // session_id check prevents deleting another session's entries
  await sql`DELETE FROM log_entries WHERE id = ${id} AND session_id = ${sessionId}`;
}

// ─── JSON file (local development) ──────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "log.json");

type StoredEntry = LogEntry & { _sessionId: string };

function readData(): StoredEntry[] {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]", "utf-8");
    return [];
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")) as StoredEntry[];
}

function writeData(data: StoredEntry[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function getEntries(date: string, sessionId: string): Promise<LogEntry[]> {
  if (IS_POSTGRES) return pgGetEntries(date, sessionId);
  return readData().filter(
    (e) => e.date === date && (e._sessionId ?? "default") === sessionId
  );
}

export async function addEntry(entry: LogEntry, sessionId: string): Promise<void> {
  if (IS_POSTGRES) return pgAddEntry(entry, sessionId);
  const data = readData();
  data.push({ ...entry, _sessionId: sessionId });
  writeData(data);
}

export async function deleteEntry(id: string, sessionId: string): Promise<void> {
  if (IS_POSTGRES) return pgDeleteEntry(id, sessionId);
  writeData(
    readData().filter(
      (e) => !(e.id === id && (e._sessionId ?? "default") === sessionId)
    )
  );
}
