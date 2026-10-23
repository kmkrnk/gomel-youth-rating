import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BEST_COUNT, GROUPS, buildRating, stages, type Stage } from "@/lib/rating";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Юношеский рейтинг Гомельской области 2026 — ориентирование" },
      { name: "description", content: "Неофициальный юношеский рейтинг Гомельской области по спортивному ориентированию, МЖ10–20, 2026 год." },
      { property: "og:title", content: "Юношеский рейтинг Гомельской области 2026" },
      { property: "og:description", content: "Рейтинг МЖ10–20 по ориентированию: очки по стартам и сумма 6 лучших." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const rating = buildRating();

function StageHead({ s }: { s: Stage }) {
  const label = (
    <>
      <div className="font-bold">{s.id}</div>
      <div className="text-[10px] font-normal text-muted-foreground">{s.source === "upcoming" ? "впереди" : `кат. ${s.cat}`}</div>
    </>
  );
  return (
    <th title={`${s.title}${s.dist ? ", " + s.dist.toLowerCase() : ""}`} className="px-2 py-2 text-center">
      {s.url ? <a href={s.url} target="_blank" rel="noreferrer" className="hover:text-primary">{label}</a> : label}
    </th>
  );
}

function Index() {
  const [group, setGroup] = useState("М10");
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    const n = q.trim().toLowerCase();
    return (rating[group] ?? []).filter((r) => !n || r.name.toLowerCase().includes(n) || r.club.toLowerCase().includes(n));
  }, [group, q]);

  return (
    <div className="min-h-screen">
      <header className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-center gap-3">
            <span className="inline-block h-8 w-8 rounded-sm bg-[linear-gradient(135deg,var(--card)_50%,var(--primary)_50%)]" />
            <span className="text-sm uppercase tracking-widest opacity-70">Ориентирование · 2026</span>
          </div>
          <h1 className="mt-3 font-display text-2xl font-bold md:text-4xl">Юношеский рейтинг Гомельской области</h1>
          <p className="mt-2 max-w-2xl text-sm opacity-80">
            Группы МЖ10–20. Сумма {BEST_COUNT} лучших стартов. Категория А — до 500 очков, B и C — до 400.
            Неофициальный подсчёт по положению.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-wrap items-center gap-2">
          {GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setGroup(g)}
              className={`rounded-md px-3 py-1.5 font-mono text-sm font-semibold transition-colors ${g === group ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"}`}
            >
              {g}
            </button>
          ))}
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по фамилии или команде"
            className="ml-auto w-full rounded-md border border-input bg-card px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring sm:w-72"
          />
        </div>

        <div className="mt-4 overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted text-left text-xs">
              <tr>
                <th className="px-3 py-2">№</th>
                <th className="px-3 py-2">Фамилия, имя</th>
                <th className="px-3 py-2">Команда</th>
                <th className="px-2 py-2">Г.р.</th>
                {stages.map((s) => <StageHead key={s.id} s={s} />)}
                <th className="px-3 py-2 text-right">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-3 py-2 font-mono font-semibold">{r.place}</td>
                  <td className="whitespace-nowrap px-3 py-2 font-semibold">{r.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{r.club}</td>
                  <td className="px-2 py-2 font-mono">{r.year}</td>
                  {stages.map((s) => {
                    const v = r.cells[s.id];
                    const counted = r.counted.has(s.id);
                    return (
                      <td key={s.id} className="px-1 py-1 text-center font-mono">
                        {v == null ? (
                          <span className="text-muted-foreground/50">·</span>
                        ) : (
                          <span className={`inline-block min-w-10 rounded px-1.5 py-0.5 ${counted ? "bg-counted font-semibold text-counted-foreground" : typeof v === "number" ? "" : "text-xs text-destructive"}`}>
                            {v}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-right font-mono text-base font-bold">{r.total}</td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={5 + stages.length} className="px-3 py-8 text-center text-muted-foreground">Никого не нашли</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <section className="mt-6 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
          {stages.map((s) => (
            <div key={s.id}>
              <span className="font-mono font-semibold text-foreground">{s.id}</span> — {s.title}
              {s.dist ? `, ${s.dist.toLowerCase()}` : ""} · кат. {s.cat}
              {s.source === "upcoming" ? " · ещё не проведён" : ""}
            </div>
          ))}
          <p className="sm:col-span-2 mt-2">
            Выделены зачётные старты. Очки = максимум × (2 × время победителя / время участника − 1), не меньше 0.
            МЖ18 получают очки и в группах 20, 21; МЖ20 — в 21.
          </p>
        </section>
      </main>
    </div>
  );
}
