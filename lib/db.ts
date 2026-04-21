import fs from "fs";
import path from "path";
import { LogEntry } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "log.json");

function readData(): LogEntry[] {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]", "utf-8");
    return [];
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")) as LogEntry[];
}

function writeData(data: LogEntry[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export function getEntries(date: string): LogEntry[] {
  return readData().filter((e) => e.date === date);
}

export function addEntry(entry: LogEntry): void {
  const data = readData();
  data.push(entry);
  writeData(data);
}

export function deleteEntry(id: string): void {
  writeData(readData().filter((e) => e.id !== id));
}
