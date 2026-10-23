import { describe, expect, it } from "vitest";
import { bestTotal, buildRating, eligible, ratingAge, stagePoints } from "./rating";

describe("областной рейтинг", () => {
  it("категория А — максимум 500 за победу", () => expect(stagePoints("A", 600, 600)).toBe(500));
  it("категории B и C — максимум 400", () => {
    expect(stagePoints("B", 600, 600)).toBe(400);
    expect(stagePoints("C", 600, 600)).toBe(400);
  });
  it("формула обратных процентов", () => expect(stagePoints("A", 600, 800)).toBe(250));
  it("не финишировал — 0, отрицательных нет", () => {
    expect(stagePoints("A", 600, null)).toBe(0);
    expect(stagePoints("A", 600, 1500)).toBe(0);
  });
  it("зачёт — 6 лучших", () => {
    const r = bestTotal({ a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7 });
    expect(r.total).toBe(27);
  });
  it("группы по году рождения", () => {
    expect(ratingAge(2016)).toBe(10);
    expect(ratingAge(2014)).toBe(12);
    expect(ratingAge(2012)).toBe(14);
    expect(ratingAge(2010)).toBe(16);
    expect(ratingAge(2008)).toBe(18);
    expect(ratingAge(2006)).toBe(20);
    expect(ratingAge(2005)).toBeNull();
  });
  it("допуск групп", () => {
    expect(eligible(18, 21)).toBe(true);
    expect(eligible(18, 20)).toBe(true);
    expect(eligible(20, 21)).toBe(true);
    expect(eligible(16, 18)).toBe(false);
    expect(eligible(14, 14)).toBe(true);
  });
  it("Степаняк Анна получила очки за Золотую осень", () => {
    const r = (buildRating()["Ж10"] ?? []).find((x) => x.name === "Степаняк Анна")!;
    expect(typeof r.cells["ЗО1"]).toBe("number");
  });
});

describe("состав рейтинга", () => {
  it("в рейтинге только люди из таблицы — никого нового", () => {
    const total = Object.values(buildRating()).reduce((s, rows) => s + rows.length, 0);
    expect(total).toBe(69);
  });
});
