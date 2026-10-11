import { etaText, sortQueue, tierOf, type Queued } from "../lib/queue/ordering";

let fails = 0;
const check = (name: string, cond: boolean) => {
  console.log((cond ? "PASS " : "FAIL ") + name);
  if (!cond) fails++;
};

const now = Date.now();
const q = (over: Partial<Queued> & { id: string }): Queued => ({
  createdAt: new Date(now - 1000).toISOString(),
  urgent: false,
  feelingWorse: false,
  priorityOverride: null,
  hasEmergencyFlag: false,
  status: "waiting",
  ...over,
});

// Tiers
check("emergency tier 0", tierOf(q({ id: "e", hasEmergencyFlag: true })) === 0);
check("worse tier 1", tierOf(q({ id: "w", feelingWorse: true })) === 1);
check("normal tier 2", tierOf(q({ id: "n" })) === 2);

// Order: emergency first even if newest, worse before normal, FIFO inside tier
const rows = [
  q({ id: "normal-old", createdAt: new Date(now - 20 * 60000).toISOString() }),
  q({ id: "worse-new", feelingWorse: true, createdAt: new Date(now - 1000).toISOString() }),
  q({ id: "emg-newest", hasEmergencyFlag: true, createdAt: new Date(now - 500).toISOString() }),
  q({ id: "normal-new", createdAt: new Date(now - 2000).toISOString() }),
];
const order = sortQueue(rows, now).map((r) => r.id);
check(
  "emergency > worse > fifo",
  JSON.stringify(order) === JSON.stringify(["emg-newest", "worse-new", "normal-old", "normal-new"]),
);

// Anti-starvation: 60-min normal waiter jumps a 5-min normal waiter (same tier)
const starve = sortQueue(
  [
    q({ id: "fresh", createdAt: new Date(now - 5 * 60000).toISOString() }),
    q({ id: "stale", createdAt: new Date(now - 60 * 60000).toISOString() }),
  ],
  now,
).map((r) => r.id);
check("long waiter boosted within tier", starve[0] === "stale");

// Boost never crosses tiers: stale normal still behind fresh worse
const cross = sortQueue(
  [
    q({ id: "stale-normal", createdAt: new Date(now - 120 * 60000).toISOString() }),
    q({ id: "fresh-worse", feelingWorse: true, createdAt: new Date(now - 1000).toISOString() }),
  ],
  now,
).map((r) => r.id);
check("boost never crosses tiers", cross[0] === "fresh-worse");

// Doctor override wins
const over = sortQueue(
  [
    q({ id: "emg", hasEmergencyFlag: true }),
    q({ id: "moved", priorityOverride: 100 }),
  ],
  now,
).map((r) => r.id);
check("override wins", over[0] === "moved");

// ETA wording stays kind and neutral
check("eta next", etaText(0) === "You are next");
check("eta minutes", etaText(1) === "About 8 minutes");

if (fails > 0) {
  console.error(fails + " FAILURES");
  process.exit(1);
}
console.log("ALL PHASE-7 UNIT CHECKS GREEN");
