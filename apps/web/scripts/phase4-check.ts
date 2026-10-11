import { classifyBranch, CONTENT_VERSION } from "../lib/checks/content";
import { evaluateEmergency } from "../lib/checks/emergency";
import { suggestSpecialty } from "../lib/checks/specialty";
import { t } from "../../i18n/src/index";

let fails = 0;
const check = (name: string, cond: boolean) => {
  console.log((cond ? "PASS " : "FAIL ") + name);
  if (!cond) fails++;
};

// Engine cases
check("chest pain flagged urgent", evaluateEmergency({ text: "I have chest pain and pressure" }).some((f) => f.id === "chest" && f.urgent));
check("breathing flagged", evaluateEmergency({ text: "I cant breathe well" }).some((f) => f.id === "breathing"));
check("suicide flagged", evaluateEmergency({ text: "I want to end my life" }).some((f) => f.id === "suicide"));
check("toothache not flagged", evaluateEmergency({ text: "toothache for 3 days, hurts with cold water" }).length === 0);
check("answers scanned too", evaluateEmergency({ text: "feeling bad", answers: { note: "vomiting blood since morning" } }).some((f) => f.id === "bleeding"));

// Classification + specialty
check("dental branch", classifyBranch("my tooth hurts when I chew").id === "dental");
check("respiratory branch", classifyBranch("cough and fever for days").id === "respiratory");
check("stomach branch", classifyBranch("vomiting and diarrhoea").id === "stomach");
check("fallback general", classifyBranch("I feel somehow weak").id === "general");
check("dentist suggested", suggestSpecialty("hole in tooth, gum swelling").code === "dentist");
check("doctor suggested", suggestSpecialty("headache and fever").code === "doctor");

// i18n completeness: every key in all 4 languages, non-empty
for (const lang of ["en", "ha", "yo", "ig"]) {
  const { en } = await import("../../i18n/src/en");
  for (const k of Object.keys(en) as (keyof typeof en)[]) {
    const v = t(lang, k);
    if (!v || v.trim().length === 0) {
      check(`i18n ${lang}.${k}`, false);
      fails++;
    }
  }
}
console.log("PASS i18n all keys present in en/ha/yo/ig");
console.log("CONTENT_VERSION=" + CONTENT_VERSION);
if (fails > 0) {
  console.error(fails + " FAILURES");
  process.exit(1);
}
console.log("ALL PHASE-4 UNIT CHECKS GREEN");
