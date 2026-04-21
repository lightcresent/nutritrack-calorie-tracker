import fs from "fs";
import path from "path";
import { LogEntry } from "@/types";

const IS_POSTGRES = !!process.env.POSTGRES_URL;

// ─── Postgres (production on Vercel) ────────────────────────────────────────

let _tableInit: Promise<void> | null = null;

async function ensureTable(): Promise<void> {
  if (_tableInit) return _tableInit;
  _tableInit = (async () => {
    const { sql } = await import("@vercel/postgres");
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
        meal          TEXT
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_log_date ON log_entries(date)`;
  })();
  return _tableInit;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToEntry(row: any): LogEntry {
  return {
    id: row.id,
    foodId: row.food_id,
    foodName: row.food_name,
    calories: Number(row.calories),
    protein: Number(row.protein),
    carbs: Number(row.carbs),
    fat: Number(row.fat),
    servingSize: Number(row.serving_size),
    servingUnit: row.serving_unit,
    quantity: Number(row.quantity),
    date: row.date,
    timestamp: Number(row.timestamp),
    meal: row.meal ?? undefined,
  };
}

async function pgGetEntries(date: string): Promise<LogEntry[]> {
  await ensureTable();
  const { sql } = await import("@vercel/postgres");
  const { rows } = await sql`
    SELECT * FROM log_entries WHERE date = ${date} ORDER BY timestamp ASC
  `;
  return rows.map(rowToEntry);
}

async function pgAddEntry(entry: LogEntry): Promise<void> {
  await ensureTable();
  const { sql } = await import("@vercel/postgres");
  await sql`
    INSERT INTO log_entries
      (id, food_id, food_name, calories, protein, carbs, fat,
       serving_size, serving_unit, quantity, date, timestamp, meal)
    VALUES
      (${entry.id}, ${entry.foodId}, ${entry.foodName},
       ${entry.calories}, ${entry.protein}, ${entry.carbs}, ${entry.fat},
       ${entry.servingSize}, ${entry.servingUnit}, ${entry.quantity},
       ${entry.date}, ${entry.timestamp}, ${entry.meal ?? null})
  `;
}

async function pgDeleteEntry(id: string): Promise<void> {
  const { sql } = await import("@vercel/postgres");
  await sql`DELETE FROM log_entries WHERE id = ${id}`;
}

// ─── JSON file (local development) ──────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "log.json");

function readData(): LogEntry[] {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]", "utf-8");
    return [];
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")) as LogEntry[];
}

function writeData(data: LogEntry[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function getEntries(date: string): Promise<LogEntry[]> {
  if (IS_POSTGRES) return pgGetEntries(date);
  return readData().filter((e) => e.date === date);
}

export async function addEntry(entry: LogEntry): Promise<void> {
  if (IS_POSTGRES) return pgAddEntry(entry);
  const data = readData();
  data.push(entry);
  writeData(data);
}

export async function deleteEntry(id: string): Promise<void> {
  if (IS_POSTGRES) return pgDeleteEntry(id);
  writeData(readData().filter((e) => e.id !== id));
}
