import { classifyBranch } from "./content";

export type Specialty = { code: "doctor" | "dentist"; label: string; reason: string };

export function suggestSpecialty(complaint: string): Specialty {
  const branch = classifyBranch(complaint);
  if (branch.id === "dental") {
    return { code: "dentist", label: "Dentist", reason: "Your answers sound like a teeth or gum problem." };
  }
  return { code: "doctor", label: "Doctor", reason: "A general doctor will review your answers first." };
}
