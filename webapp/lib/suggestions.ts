export type OutreachType = "positive" | "intervention" | "change";

export type Suggestion = {
  id: string;
  studentName: string;
  type: OutreachType;
  reason: string;
  evidence: string[];
  subject: string;
  draft: string;
  guardianName: string;
  guardianEmail: string;
};

/** Synthetic students only. No real student data anywhere in this project. */
export const MOCK_SUGGESTIONS: Suggestion[] = [
  {
    id: "sug-1",
    studentName: "Amara Okafor",
    type: "positive",
    reason:
      "Went from quiet in discussion to leading her lab group through the whole titration.",
    evidence: [
      "Volunteered to present her group's findings twice this week",
      "Lab writeup 94%, up from 78% on the previous unit",
      "Teacher note Wednesday: walked two classmates through the calculation",
    ],
    subject: "A good week for Amara in Chemistry",
    guardianName: "Ms. Okafor",
    guardianEmail: "guardian.okafor@example.com",
    draft: `Hi Ms. Okafor,

Quick note with some good news. Amara took the lead in her lab group this week during our titration unit, and she presented her group's findings to the class twice. She also stopped to walk two classmates through a calculation they were stuck on.

Her lab writeup came in at 94%, up from 78% on the last unit. Nothing you need to do here, I just wanted you to hear it.

Best,
Ms. Rivera`,
  },
  {
    id: "sug-2",
    studentName: "Daniel Reyes",
    type: "intervention",
    reason:
      "Solving for a variable on both sides is not landing; last two quizzes dropped.",
    evidence: [
      "Quiz 4: 61%, Quiz 5: 54% (class median 82%)",
      "Both quizzes lost points on the same step: distributing before combining",
      "Homework 6 and 7 not turned in",
    ],
    subject: "Checking in about Daniel and this algebra unit",
    guardianName: "Mr. Reyes",
    guardianEmail: "guardian.reyes@example.com",
    draft: `Hi Mr. Reyes,

I wanted to reach out early rather than wait. Daniel's last two quizzes came in at 61% and 54%, and in both cases the points were lost on the same step: distributing before combining like terms. He understands the setup, so this is a fixable habit rather than a gap in the whole unit.

One concrete thing that would help at home: ask him to talk you through one problem out loud before he writes anything down. Naming the step first is usually what makes it stick.

I'm also going to pull him for ten minutes during Thursday's work time. Happy to talk if that's useful.

Best,
Ms. Rivera`,
  },
  {
    id: "sug-3",
    studentName: "Priya Raman",
    type: "change",
    reason:
      "Was turning in everything on time through October; three assignments missing in the last two weeks.",
    evidence: [
      "On-time submission rate went from 100% to 40% over two weeks",
      "Two late arrivals to first period, which had not happened before",
      "Still participating in class discussion at her usual level",
    ],
    subject: "Something has shifted for Priya -- do you know why?",
    guardianName: "Mrs. Raman",
    guardianEmail: "guardian.raman@example.com",
    draft: `Hi Mrs. Raman,

I noticed something and wanted to ask rather than assume. Priya turned in every assignment on time through October, and over the last two weeks three have come in missing. She's also been late to first period twice, which hadn't happened before.

In class she seems like herself, still engaged and asking good questions, so I don't have a read on what changed. If anything is going on that would help me understand, I'd welcome a reply. And if this is just a busy stretch, that's useful for me to know too.

Best,
Ms. Rivera`,
  },
  {
    id: "sug-4",
    studentName: "Marcus Bell",
    type: "positive",
    reason:
      "Rewrote his essay after conferencing, without being asked to, and it was a real jump.",
    evidence: [
      "Revised draft moved from a 2 to a 4 on the evidence rubric strand",
      "Came to office hours on his own on Tuesday",
      "Teacher note: asked specifically how to make a counterargument land",
    ],
    subject: "Marcus put in real work on his essay revision",
    guardianName: "Ms. Bell",
    guardianEmail: "guardian.bell@example.com",
    draft: `Hi Ms. Bell,

I wanted to name something Marcus did this week. After our writing conference he rewrote his essay on his own, which I hadn't required, and came to office hours to ask how to make his counterargument stronger. His revised draft moved from a 2 to a 4 on the evidence strand of the rubric.

That kind of follow-through is the part that's hard to teach. No reply needed, just wanted you to know.

Best,
Ms. Rivera`,
  },
  {
    id: "sug-5",
    studentName: "Sofia Delgado",
    type: "intervention",
    reason:
      "Strong on the reading, but consistently losing points for citing without explaining.",
    evidence: [
      "Three consecutive assignments marked down on the analysis criterion",
      "Reading comprehension checks all above 90%",
      "Participates confidently in discussion, then under-explains in writing",
    ],
    subject: "One thing that would move Sofia's writing grade",
    guardianName: "Mr. Delgado",
    guardianEmail: "guardian.delgado@example.com",
    draft: `Hi Mr. Delgado,

Sofia's reading comprehension is genuinely strong, all of her checks this unit were above 90%, and she's one of the more confident voices in discussion. Where she's losing points is narrower than it looks: she picks a good quote and then stops, without explaining what it proves.

One thing to try at home: when she's drafting, ask her "so what does that quote prove?" and have her answer out loud, then write that answer down as the next sentence. That single habit is most of the gap.

Best,
Ms. Rivera`,
  },
  {
    id: "sug-6",
    studentName: "Jonah Whitfield",
    type: "change",
    reason:
      "Group work engagement dropped off; he's asked to work alone three times in a row.",
    evidence: [
      "Requested to work independently on the last three group tasks",
      "Grades holding steady at a B+ average",
      "Sat apart from his usual table group starting last Thursday",
    ],
    subject: "A change I noticed with Jonah",
    guardianName: "Mr. and Mrs. Whitfield",
    guardianEmail: "guardian.whitfield@example.com",
    draft: `Hi Mr. and Mrs. Whitfield,

Jonah's grades are steady, so this isn't an academic note. I noticed he's asked to work independently on the last three group tasks and has been sitting apart from his usual table group since last Thursday. Before that he was one of the students who pulled a group together.

I don't want to read too much into it, and I'd rather ask than guess. If you have a sense of what's going on, or if you'd like me to keep an eye on it quietly, just reply and let me know.

Best,
Ms. Rivera`,
  },
];
