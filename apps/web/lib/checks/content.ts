// MedConz check content bank v1.0.0 (English-first; HA/YO/IG medical
// review pending with the medical team per PRD 5.6).
// Only the medical team + tech team together may change this file, and
// emergency rules need two medical approvers (PRD 12). Record changes below.
//
// Changelog:
// - v1.0.0 initial branches + red-flag rules (tech scaffold, NEEDS medical sign-off)

export const CONTENT_VERSION = "v1.0.0";

export type ChipQ = {
  id: string;
  text: string;
  options: { value: string; label: string }[];
  multi: boolean;
};

export type Branch = {
  id: string;
  keywords: string[];
  questions: ChipQ[];
};

export const BRANCHES: Branch[] = [
  {
    id: "dental",
    keywords: ["tooth", "teeth", "gum", "molar", "dentist", "chew", "cavity", "hole in tooth", "toothache"],
    questions: [
      { id: "dental_sensitive", text: "Do hot or cold things hurt the tooth?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], multi: false },
      { id: "dental_swelling", text: "Is there swelling in the gum or face?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], multi: false },
      { id: "dental_bleed", text: "Do the gums bleed?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], multi: false },
      { id: "dental_broken", text: "Is a tooth broken or has a hole?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], multi: false },
    ],
  },
  {
    id: "eye",
    keywords: ["eye", "vision", "sight", "red eye", "itchy eye"],
    questions: [
      { id: "eye_vision", text: "Has your vision changed?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], multi: false },
      { id: "eye_pain", text: "Is the eye painful?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], multi: false },
      { id: "eye_discharge", text: "Is anything coming out of the eye?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], multi: false },
    ],
  },
  {
    id: "injury",
    keywords: ["injur", "accident", "fall", "fell", "cut", "burn", "fracture", "hit", "wound", "blood"],
    questions: [
      { id: "injury_bleeding", text: "Is it bleeding now?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], multi: false },
      { id: "injury_move", text: "Can you move the hurt part?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], multi: false },
      { id: "injury_how", text: "How did it happen?", options: [{ value: "fall", label: "Fall" }, { value: "cut", label: "Cut" }, { value: "burn", label: "Burn" }, { value: "accident", label: "Road accident" }, { value: "other", label: "Other" }], multi: false },
    ],
  },
  {
    id: "respiratory",
    keywords: ["cough", "breath", "chest", "cold", "flu", "catarrh", "sore throat", "fever"],
    questions: [
      { id: "resp_fever", text: "Do you have a fever?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], multi: false },
      { id: "resp_breath", text: "Is breathing hard?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], multi: false },
      { id: "resp_chest", text: "Do you have chest pain?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], multi: false },
      { id: "resp_cough", text: "What kind of cough?", options: [{ value: "dry", label: "Dry" }, { value: "wet", label: "Bringing up something" }, { value: "none", label: "No cough" }], multi: false },
    ],
  },
  {
    id: "stomach",
    keywords: ["stomach", "vomit", "nausea", "diarrh", "stool", "abdomen", "belly", "ulcer", "purging"],
    questions: [
      { id: "stom_vomit", text: "Are you vomiting?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], multi: false },
      { id: "stom_diarr", text: "Do you have diarrhoea?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], multi: false },
      { id: "stom_blood", text: "Is there blood in stool or vomit?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], multi: false },
      { id: "stom_where", text: "Where is the pain?", options: [{ value: "upper", label: "Upper belly" }, { value: "lower", label: "Lower belly" }, { value: "all", label: "All over" }, { value: "none", label: "No pain" }], multi: false },
    ],
  },
  {
    id: "skin",
    keywords: ["rash", "itch", "skin", "boil", "spots", "swelling"],
    questions: [
      { id: "skin_spread", text: "Is it spreading?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], multi: false },
      { id: "skin_itch", text: "Is it itchy?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], multi: false },
      { id: "skin_pain", text: "Is it painful?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], multi: false },
      { id: "skin_fever", text: "Do you also have a fever?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], multi: false },
    ],
  },
  {
    id: "headache",
    keywords: ["headache", "migraine", "head pain", "dizz", "faint"],
    questions: [
      { id: "head_worst", text: "Is this the worst headache of your life?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], multi: false },
      { id: "head_vision", text: "Any change in vision?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], multi: false },
      { id: "head_neck", text: "Is your neck stiff, with fever?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], multi: false },
    ],
  },
  {
    id: "general",
    keywords: [],
    questions: [
      { id: "gen_fever", text: "Do you have a fever?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], multi: false },
      { id: "gen_pain", text: "Do you have pain?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], multi: false },
      { id: "gen_worse", text: "Is it getting worse?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "same", label: "Staying the same" }], multi: false },
    ],
  },
];

export const CONTEXT_QUESTIONS: ChipQ[] = [
  { id: "ctx_conditions", text: "Do you have any ongoing conditions (e.g. hypertension, diabetes, asthma, ulcer)?", options: [{ value: "none", label: "None" }, { value: "yes", label: "Yes — I will type them" }], multi: false },
  { id: "ctx_allergies", text: "Do you have any drug allergies?", options: [{ value: "none", label: "None" }, { value: "yes", label: "Yes — I will type them" }], multi: false },
  { id: "ctx_meds", text: "Are you taking any medicines now?", options: [{ value: "none", label: "None" }, { value: "yes", label: "Yes — I will type them" }], multi: false },
];

export const DURATION_OPTIONS = [
  { value: "hours", labelKey: "dur_hours" },
  { value: "days", labelKey: "dur_days" },
  { value: "weeks", labelKey: "dur_weeks" },
  { value: "months", labelKey: "dur_months" },
] as const;

export const EMERGENCY_NUMBERS = [
  { label: "National emergency", number: "112" },
  { label: "Lagos emergency", number: "767" },
];

export const HOSPITAL_NOTE =
  "Go to the nearest hospital now. Show them this warning on your phone.";

export function classifyBranch(text: string): Branch {
  const lower = (text ?? "").toLowerCase();
  for (const b of BRANCHES) {
    if (b.id === "general") continue;
    if (b.keywords.some((k) => lower.includes(k))) return b;
  }
  return BRANCHES[BRANCHES.length - 1];
}
