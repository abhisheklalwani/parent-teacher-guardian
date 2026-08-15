export type GuardianContact = {
  studentId: string;
  studentName: string;
  guardianName: string;
  guardianEmail: string;
};

/** Synthetic students only. No real student data anywhere in this project. */
export const CLASS_ROSTER: GuardianContact[] = [
  { studentId: "S01", studentName: "Maya Chen", guardianName: "Ms. Chen", guardianEmail: "guardian.chen@example.com" },
  { studentId: "S02", studentName: "Jaylen Brooks", guardianName: "Mr. Brooks", guardianEmail: "guardian.brooks@example.com" },
  { studentId: "S03", studentName: "Ethan Whitfield", guardianName: "Mrs. Whitfield", guardianEmail: "guardian.whitfield@example.com" },
  { studentId: "S04", studentName: "Sofia Ramirez", guardianName: "Ms. Ramirez", guardianEmail: "guardian.ramirez@example.com" },
  { studentId: "S05", studentName: "Marcus Bell", guardianName: "Ms. Bell", guardianEmail: "guardian.bell@example.com" },
  { studentId: "S06", studentName: "Aaliyah Foster", guardianName: "Mrs. Foster", guardianEmail: "guardian.foster@example.com" },
  { studentId: "S07", studentName: "Noah Kaplan", guardianName: "Mr. Kaplan", guardianEmail: "guardian.kaplan@example.com" },
  { studentId: "S08", studentName: "Grace Thompson", guardianName: "Mr. Thompson", guardianEmail: "guardian.thompson@example.com" },
  { studentId: "S09", studentName: "Diego Alvarez", guardianName: "Mrs. Alvarez", guardianEmail: "guardian.alvarez@example.com" },
  { studentId: "S10", studentName: "Priya Patel", guardianName: "Mr. Patel", guardianEmail: "guardian.patel@example.com" },
];

/**
 * Resend's free tier caps sends at 100/day. Every broadcast (syllabus/homework
 * send) fans out to the whole roster per click, so a handful of demo/test runs
 * burns through that fast. Cap broadcasts to one guardian for now; switch back
 * to CLASS_ROSTER once volume isn't a concern (e.g. a paid Resend plan).
 */
export const BROADCAST_ROSTER: GuardianContact[] = CLASS_ROSTER.slice(0, 1);
