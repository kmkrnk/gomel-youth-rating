import data from "@/data/gomel-2026.json";

export type Category = "A" | "B" | "C";
export type Sex = "М" | "Ж";
export interface Stage {
  id: string;
  title: string;
  dist: string;
  cat: string;
  source: "table" | "protocol" | "upcoming" | string;
  date?: string;
  url?: string;
}
export interface ProtocolRow {
  name: string;
  club: string;
  year: number;
  sec: number | null;
  gomel: boolean;
}
export type Cell = number | "снят" | null;
export interface Row {
  name: string;
  club: string;
  year: number | null;
  qual: string;
  cells: Record<string, Cell>;
  counted: Set<string>;
  total: number;
  place: number;
}

export const YEAR = 2026;
export const BEST_COUNT = 6;
export const MAX_POINTS: Record<Category, number> = { A: 500, B: 400, C: 400 };
export const GROUPS = ["М10", "М12", "М14", "М16", "М18", "М20", "Ж10", "Ж12", "Ж14", "Ж16", "Ж18", "Ж20"];

/** Rating age group by birth year (Положение, п. 3). */
export function ratingAge(year: number, season = YEAR): number | null {
  const a = season - year;
  if (a <= 10) return 10;
  if (a <= 12) return 12;
  if (a <= 14) return 14;
  if (a <= 16) return 16;
  if (a <= 18) return 18;
  if (a <= 20) return 20;
  return null;
}

/** Points only in own group; 18 also from 20/21; 20 also from 21. */
export function eligible(ratingGroupAge: number, ranAge: number): boolean {
  if (ranAge === ratingGroupAge) return true;
  if (ratingGroupAge === 18) return ranAge === 20 || ranAge === 21;
  if (ratingGroupAge === 20) return ranAge === 21;
  return false;
}

export function stagePoints(cat: Category, winnerSec: number, runnerSec: number | null): number {
  if (runnerSec == null || runnerSec <= 0) return 0;
  return Math.max(0, Math.round(MAX_POINTS[cat] * (2 * winnerSec / runnerSec - 1)));
}

export function bestTotal(cells: Record<string, Cell>, n = BEST_COUNT) {
  const nums = Object.entries(cells)
    .filter(([, v]) => typeof v === "number")
    .map(([k, v]) => [k, v as number] as const)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
  return { total: nums.reduce((s, [, v]) => s + v, 0), counted: new Set(nums.map(([k]) => k)) };
}

function parseGroup(g: string): { sex: Sex; age: number } | null {
  const m = g.replace(/M/g, "М").replace(/W/g, "Ж").match(/^([МЖ])\s?(\d{2})/);
  return m ? { sex: m[1] as Sex, age: Number(m[2]) } : null;
}

const norm = (s: string) => s.replace(/ё/g, "е").replace(/\s+/g, " ").trim().toLowerCase();

export const stages = data.stages as Stage[];

export function buildRating() {
  const groups: Record<string, Map<string, Omit<Row, "counted" | "total" | "place">>> = {};
  for (const g of GROUPS) groups[g] = new Map();
  const groupOf = new Map<string, string>();

  for (const a of data.athletes) {
    const cells: Record<string, Cell> = {};
    for (const [k, v] of Object.entries(a.points)) cells[k] = v as Cell;
    groups[a.group]?.set(norm(a.name), { name: a.name, club: a.club, year: a.year, qual: a.qual, cells });
    groupOf.set(norm(a.name), a.group);
  }

  const protocols = data.protocols as Record<string, Record<string, ProtocolRow[]>>;
  for (const st of stages.filter((s) => s.source === "protocol")) {
    const prot = protocols[st.id] ?? {};
    for (const [pg, rows] of Object.entries(prot)) {
      const ran = parseGroup(pg);
      if (!ran) continue;
      const times = rows.map((r) => r.sec).filter((s): s is number => s != null);
      if (!times.length) continue;
      const winner = Math.min(...times);
      for (const r of rows) {
        // Only athletes already in the regional table count; nobody new is added.
        const key = norm(r.name);
        const g = groupOf.get(key);
        if (!g) continue;
        const ga = parseGroup(g)!;
        if (ga.sex !== ran.sex || !eligible(ga.age, ran.age)) continue;
        const row = groups[g]?.get(key);
        if (!row) continue;
        const pts = stagePoints(st.cat as Category, winner, r.sec);
        const prev = row.cells[st.id];
        row.cells[st.id] = typeof prev === "number" ? Math.max(prev, pts) : pts;
      }
    }
  }

  const result: Record<string, Row[]> = {};
  for (const g of GROUPS) {
    const rows: Row[] = [...(groups[g]?.values() ?? [])].map((r) => ({ ...r, ...bestTotal(r.cells), place: 0 }));
    rows.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, "ru"));
    rows.forEach((r, i) => {
      const p = rows[i - 1];
      r.place = p && p.total === r.total ? p.place : i + 1;
    });
    result[g] = rows;
  }
  return result;
}
