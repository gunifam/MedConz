// Emergency engine — runs on EVERY input, client-side (offline OK) and
// re-checked server-side on submit. Conservative: over-flag, never block.
// Change control: two medical approvers (PRD 12).

export type Flag = { id: string; label: string; urgent: boolean };

type Rule = {
  id: string;
  label: string;
  urgent: boolean;
  patterns: string[];
  // confirmatory question shown in the flow when hinted but not confirmed
  confirm?: { id: string; text: string };
};

const RULES: Rule[] = [
  { id: "chest", label: "Chest pain or pressure", urgent: true, patterns: ["chest pain", "chest press", "chest tight", "pain in chest", "heavy chest"], confirm: { id: "cf_chest", text: "Do you have chest pain or pressure right now?" } },
  { id: "breathing", label: "Trouble breathing", urgent: true, patterns: ["can't breathe", "cant breathe", "hard to breathe", "difficulty breath", "short of breath", "gasping", "choking"], confirm: { id: "cf_breathing", text: "Is breathing hard right now?" } },
  { id: "bleeding", label: "Heavy bleeding", urgent: true, patterns: ["heavy bleed", "bleeding heavily", "blood everywhere", "lost a lot of blood", "vomiting blood", "vomit blood", "blood in stool"], confirm: { id: "cf_bleeding", text: "Are you bleeding heavily now?" } },
  { id: "unconscious", label: "Fainted or unconscious", urgent: true, patterns: ["fainted", "passed out", "unconscious", "collapsed", "not waking", "wont wake"], confirm: { id: "cf_unconscious", text: "Did someone faint or become unconscious?" } },
  { id: "stroke", label: "Possible stroke signs", urgent: true, patterns: ["face droop", "slurred speech", "one side weak", "sudden numbness", "sudden confusion"], confirm: { id: "cf_stroke", text: "Is there face drooping, slurred speech, or weakness on one side?" } },
  { id: "suicide", label: "Thoughts of harming self", urgent: true, patterns: ["kill myself", "end my life", "suicid", "harm myself", "want to die", "better off dead"] },
  { id: "labour", label: "Labour emergency", urgent: true, patterns: ["water broke", "waters broke", "in labour", "in labor", "bleeding", "pregnant"], confirm: { id: "cf_labour", text: "Are you pregnant with heavy bleeding, waters broken, or strong pains?" } },
  { id: "infant", label: "Very young baby unwell", urgent: true, patterns: ["newborn", "2 week", "3 week", "month old baby", "baby fever", "baby wont feed", "baby won't feed"] },
  { id: "dehydration", label: "Severe dehydration", urgent: true, patterns: ["no urine", "not urinating", "very thirsty", "sunken eyes", "dry mouth", "dizzy when standing"] },
  { id: "headinjury", label: "Head injury with warning signs", urgent: true, patterns: ["hit head", "head injury", "knocked head"], confirm: { id: "cf_head", text: "After the head knock: vomiting, sleepiness, or confusion?" } },
  { id: "burn", label: "Serious burn", urgent: true, patterns: ["large burn", "burn blister", "burnt face", "burned face", "electrical burn", "chemical burn"] },
  { id: "poison", label: "Poisoning", urgent: true, patterns: ["swallowed poison", "drank kerosene", "drank bleach", "overdose", "too many tablets", "snake bite", "scorpion"] },
  { id: "stiffneck", label: "Fever with stiff neck", urgent: false, patterns: ["stiff neck"], confirm: { id: "cf_neck", text: "Fever with a stiff neck?" } },
  { id: "worstheadache", label: "Worst headache ever", urgent: false, patterns: ["worst headache"] },
];

export function evaluateEmergency(input: {
  text?: string | null;
  answers?: Record<string, unknown> | null;
}): Flag[] {
  const hay = [input.text ?? "", JSON.stringify(input.answers ?? {})]
    .join(" ")
    .toLowerCase();
  const out: Flag[] = [];
  for (const r of RULES) {
    if (r.patterns.some((p) => hay.includes(p))) {
      out.push({ id: r.id, label: r.label, urgent: r.urgent });
    }
  }
  return out;
}

/** Confirmatory questions for hinted-but-unconfirmed flags. */
export function confirmQuestions(flags: Flag[]): { id: string; text: string }[] {
  const out: { id: string; text: string }[] = [];
  for (const f of flags) {
    const rule = RULES.find((r) => r.id === f.id);
    if (rule?.confirm && !out.some((q) => q.id === rule.confirm!.id)) {
      out.push({ id: rule.confirm.id, text: rule.confirm.text });
    }
  }
  return out;
}
