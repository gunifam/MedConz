import { buildSummaryDraft } from "../lib/doctor/summary";

let fails = 0;
const check = (name: string, cond: boolean) => {
  console.log((cond ? "PASS " : "FAIL ") + name);
  if (!cond) fails++;
};

const draft = buildSummaryDraft({
  complaint: "toothache",
  duration: { value: "3", unit: "days" },
  severity: 7,
  branchAnswers: [{ question: "Swelling?", answer: "Yes" }],
  flags: [{ label: "Chest pain or pressure" }],
});
check("draft has complaint", draft.includes("toothache"));
check("draft has duration", draft.includes("3 days"));
check("draft has severity", draft.includes("7 of 10"));
check("draft has branch answer", draft.includes("Swelling? Yes"));
check("draft lists open flags", draft.includes("Chest pain or pressure"));
check("draft demands review", draft.includes("review every line"));

const empty = buildSummaryDraft({ complaint: "", branchAnswers: [], flags: [] });
check("draft never invents", empty.includes("(not given)"));

if (fails > 0) {
  console.error(fails + " FAILURES");
  process.exit(1);
}
console.log("ALL PHASE-8 UNIT CHECKS GREEN");
