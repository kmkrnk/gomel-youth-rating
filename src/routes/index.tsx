import { createFileRoute } from "@tanstack/react-router";
import { BEST_COUNT, GROUPS, buildRating, stages } from "@/lib/rating";

const POLOZHENIE = "https://ogomel.ucoz.net/index/rejting_gomelskoj_oblasti_mzh10_20/0-30";
const TABLE =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSot8uIogmiq8UEG2Iq7B6pAry8gAgyPY8amfq_1-o621Duwk9RBCo7oVHxpoJ4w6VbrnMaTW4eT-We/pubhtml";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "НЕОФИЦИАЛЬНЫЙ юношеский рейтинг Гомельской области 2026" },
      { name: "description", content: "Неофициальный расчёт юношеского рейтинга Гомельской области по ориентированию, МЖ10–20, 2026." },
      { property: "og:title", content: "НЕОФИЦИАЛЬНЫЙ юношеский рейтинг Гомельской области 2026" },
      { property: "og:description", content: "Сумма 6 лучших стартов по Положению о рейтинге Гомельской области." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const rating = buildRating();
const held = stages.filter((s) => s.source !== "upcoming");
const added = held.filter((s) => s.source === "protocol");
const fmtD = (d: string) => d.slice(8, 10) + "." + d.slice(5, 7);
const groupLabel = (g: string) => g.replace("М", "М").replace("Ж", "Ж");

function Index() {
  let stripe = 0;
  const addedComps: { c: string; d: string[] }[] = [];
  for (const s of added) {
    const c = s.title.replace(/, день \d+$/, "");
    let x = addedComps.find((y) => y.c === c);
    if (!x) addedComps.push((x = { c, d: [] }));
    if (s.date) x.d.push(s.date);
  }
  const span = (d: string[]) => {
    const a = d[0], b = d[d.length - 1];
    if (!a || !b) return "";
    if (a === b) return fmtD(a);
    return a.slice(5, 7) === b.slice(5, 7) ? `${a.slice(8, 10)}-${fmtD(b)}` : `${fmtD(a)}-${fmtD(b)}`;
  };
  const headCells = (
    <>
      <th>№</th>
      <th>Прозвішча, Імя</th>
      <th>ГН</th>
      {held.map((s) => (
        <th key={s.id} title={`${s.title}${s.dist ? ", " + s.dist.toLowerCase() : ""}`}>
          {s.date ? fmtD(s.date) : s.id}
        </th>
      ))}
      <th>Ачкі</th>
      <th>Сярэдняе</th>
      <th>Месца</th>
    </>
  );

  return (
    <div className="wrap">
      <div className="unoff" role="note">
        <strong>⚠ НЕОФИЦИАЛЬНЫЙ РАСЧЁТ</strong>
        Это не официальный рейтинг Гомельской области. Таблица посчитана частным образом по опубликованным протоколам,
        чтобы видеть картину сразу после стартов; возможны ошибки. Официальный рейтинг — только у организаторов:{" "}
        <a href={TABLE} target="_blank" rel="noopener">таблица рейтинга Гомельской области</a> ·{" "}
        <a href={POLOZHENIE} target="_blank" rel="noopener">Положение о юношеском рейтинге Гомельской области 2026</a>.
      </div>
      <p className="crumbs">Юношеский рейтинг Гомельской области 2026 · неофициальный расчёт</p>
      <ul className="facts">
        <li>
          <b>Основа:</b> <a href={TABLE} target="_blank" rel="noopener">таблица рейтинга Гомельской области</a> (Лесная лига 3–4, Первенство области 1–3), без изменений
        </li>
        <li>
          <b>Добавлено:</b>
          <ul className="sub">
            {addedComps.map((x) => (
              <li key={x.c}><span className="d">{span(x.d)}</span><span>{x.c}</span></li>
            ))}
          </ul>
        </li>
        <li>
          <b>Впереди:</b>
          <ul className="sub"><li><span className="d">—</span>Спринт-тур 2026, этапы 1–4</li></ul>
        </li>
        <li>
          <b>Ачкі</b> — сумма <b>{BEST_COUNT}</b> лучших результатов <span className="muted">(категория А — до 500, B и C — до 400)</span>
        </li>
        <li>
          <b>Правила:</b> строго по <a href={POLOZHENIE} target="_blank" rel="noopener">Положению о юношеском рейтинге Гомельской области 2026</a>
        </li>
      </ul>
      <div className="rating">
        <hr />
        <span>
          {GROUPS.map((g, i) => (
            <span key={g}>
              {i > 0 && " | "}
              <a href={`#list${i}`} title={`Перейти к ${g}`}>{groupLabel(g)}</a>
            </span>
          ))}
        </span>
        <hr />
        {GROUPS.map((g, gi) => {
          const rows = rating[g] ?? [];
          return (
            <div key={g}>
              <a id={`list${gi}`} />
              <h2>
                {g} <span className="tag">НЕОФИЦИАЛЬНЫЙ РАСЧЁТ<span className="wide"> · официальный рейтинг — у организаторов</span></span>
              </h2>
              <div className="scroller">
                <table>
                  <thead>
                    <tr className={stripe++ % 2 ? "odd" : ""}>
                      {headCells}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => {
                      const best = [...r.counted].map((k) => r.cells[k]).filter((v): v is number => typeof v === "number");
                      const nz = best.filter((v) => v > 0).length;
                      const avg = nz ? Math.round(r.total / nz) : 0;
                      return (
                        <tr key={r.name} className={stripe++ % 2 ? "odd" : ""}>
                          <td>{i + 1}</td>
                          <td>{r.name}</td>
                          <td>{r.year}</td>
                          {held.map((s) => {
                            const v = r.cells[s.id];
                            return <td key={s.id}>{v == null ? "" : r.counted.has(s.id) ? <b>{v}</b> : v}</td>;
                          })}
                          <td>{r.total}</td>
                          <td>{avg}</td>
                          <td>{i + 1}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
