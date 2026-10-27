/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import { massages, partialMassages, pairPrices, pairUpgrades, vouchers, subscriptions, subscriptionRules, categoryBadges, upgradeBadge, upgradePriceRows } from "./content";

describe("Uploaded Royal Krabi price list", () => {
  const expected: [string, [number, number][]][] = [
    ["Royal Thai Massage – ohne Öl", [[60,59],[90,85],[120,109]]],
    ["Royal Thai Massage", [[60,65],[90,92],[120,119]]],
    ["Relax-Massage mit Öl", [[60,65],[90,92],[120,119]]],
    ["Aromaöl-Massage", [[60,69],[90,96],[120,125]]],
    ["Hot-Stone-Massage", [[60,79],[90,109],[120,139]]],
    ["Thai-Kräuterstempelmassage", [[60,85],[90,115],[120,145]]],
    ["Royal Sound Healing – Royal Krabi Signature", [[90,119],[120,149]]],
    ["Kosmetische Lymphdrainage – Ganzkörper", [[60,79],[90,109],[120,139]]],
  ];
  for (const [name, prices] of expected) {
    test(`${name}: exact durations and prices`, () => {
      expect(massages.find(m => m.name === name)?.prices).toEqual(prices);
    });
  }
  for (const name of ["Rückenmassage mit Öl", "Nacken- und Schultermassage", "Kopfmassage"]) {
    test(`${name}: 30 minutes €39 and 60 minutes €59`, () => {
      expect(partialMassages.find(m => m.name === name)?.prices).toEqual([[30,39],[60,59]]);
    });
  }
  test("pair totals for two people", () => expect(pairPrices).toEqual([[60,129],[90,179],[120,229]]));
  test("foot massage: 30 minutes €43 and 60 minutes €63", () => expect(partialMassages.find(m => m.name === "Thai-Fußreflexzonenmassage")?.prices).toEqual([[30,43],[60,63]]));
  for (const [name, prices] of [["Aromaöl-Massage",[[60,5],[90,10],[120,15]]],["Hot-Stone-Massage",[[60,15],[90,20],[120,25]]],["Thai-Kräuterstempelmassage",[[60,20],[90,25],[120,30]]]] as [string, [number, number][]][]) {
    test(`${name}: duration-specific pair upgrade per person`, () => expect(pairUpgrades.find(m => m.name === name)?.prices).toEqual(prices));
  }
  test("classic pair choices", () => expect(massages.filter(m => m.category === "classic").map(m => m.name)).toEqual(["Royal Thai Massage – ohne Öl", "Royal Thai Massage", "Relax-Massage mit Öl"]));
  test("voucher prices follow current massage prices", () => {
    expect(vouchers.filter(([name]) => name?.startsWith("60 Minuten")).map(([,price]) => price)).toEqual(["59 €","65 €","65 €","69 €","79 €","85 €","79 €"]);
    expect(vouchers[0]?.[1]).toBe("39 €");
    expect(vouchers[1]?.[1]).toBe("43 €");
  });
});
const offers: [string, [number,number,number][]][] = [
  ["Royal Thai Massage – ohne Öl",[[60,280,531],[90,404,765],[120,518,981]]],
  ["Royal Thai Massage",[[60,309,585],[90,437,828],[120,565,1071]]],
  ["Relax-Massage mit Öl",[[60,309,585],[90,437,828],[120,565,1071]]],
  ["Aromaöl-Massage",[[60,328,621],[90,456,864],[120,594,1125]]],
  ["Hot-Stone-Massage",[[60,375,711],[90,518,981],[120,660,1251]]],
  ["Thai-Kräuterstempelmassage",[[60,404,765],[90,546,1035],[120,689,1305]]],
  ["Royal Sound Healing – Royal Krabi Signature",[[90,565,1071],[120,708,1341]]],
  ["Kosmetische Lymphdrainage – Ganzkörper",[[60,375,711],[90,518,981],[120,660,1251]]],
  ["Rückenmassage mit Öl",[[30,185,351],[60,280,531]]],
  ["Nacken- und Schultermassage",[[30,185,351],[60,280,531]]],
  ["Kopfmassage",[[30,185,351],[60,280,531]]],
  ["Thai-Fußreflexzonenmassage",[[30,204,387],[60,299,567]]],
];
for (const [name, rows] of offers) for (const [duration,five,ten] of rows) for (const count of [5,10] as const) {
  test(`${name} ${duration} minutes: ${count}-pack exact price and regular total`, () => {
    const offer = subscriptions.find(s => s.name === name && s.duration === duration && s.count === count);
    expect(offer?.price).toBe(count === 5 ? five : ten);
    const unit = [...massages,...partialMassages].find(m => m.name === name)?.prices.find(([d]) => d === duration)?.[1];
    expect(unit).toBeDefined();
    expect(offer?.regular).toBe(Number(unit) * count);
  });
}
test("all 62 subscription offers included", () => expect(subscriptions).toHaveLength(62));
test("abos include five or ten massages", () => expect(subscriptionRules.counts).toEqual([5,10]));
test("abos fix massage type and duration", () => expect(subscriptionRules.sameTypeAndDuration).toBe(true));
test("pair massages excluded from abos", () => expect(subscriptionRules.pairIncluded).toBe(false));
test("abos cannot combine discounts by default", () => expect(subscriptionRules.combinableByDefault).toBe(false));
test("category badges: KLASSISCH, PREMIUM and ROYAL KRABI SIGNATURE", () => {
  expect(categoryBadges).toEqual({ classic: "KLASSISCH", premium: "PREMIUM", signature: "ROYAL KRABI SIGNATURE" });
  expect(massages.every(m => m.category in categoryBadges)).toBe(true);
});
test("premium upgrade area shows one PREMIUM-OPTION badge", () => expect(upgradeBadge).toBe("PREMIUM-OPTION"));
test("every pair upgrade surcharge is labelled pro Person", () => {
  const expected = {
    "Aromaöl-Massage": [["+5 €", "pro Person"], ["+10 €", "pro Person"], ["+15 €", "pro Person"]],
    "Hot-Stone-Massage": [["+15 €", "pro Person"], ["+20 €", "pro Person"], ["+25 €", "pro Person"]],
    "Thai-Kräuterstempelmassage": [["+20 €", "pro Person"], ["+25 €", "pro Person"], ["+30 €", "pro Person"]],
  };
  for (const [name, rows] of Object.entries(expected)) {
    const upgrade = pairUpgrades.find(m => m.name === name)!;
    expect(upgradePriceRows(upgrade.prices).map(r => [r.amount, r.perPerson])).toEqual(rows);
  }
});
test("upgrade price rows keep the original durations", () => expect(pairUpgrades.flatMap(u => upgradePriceRows(u.prices).map(r => r.minutes))).toEqual([60,90,120,60,90,120,60,90,120]));
test("only Royal Krabi Signature is signature, prices unchanged", () => {
  expect(massages.filter(m => m.category === "signature").map(m => [m.name, m.prices])).toEqual([["Royal Sound Healing – Royal Krabi Signature", [[90,119],[120,149]]]]);
});
