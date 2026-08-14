Parent–Teacher Communication Team Working Doc
AI Education Hackathon · Cambridge, MA · Aug 14–15, 2026 

Discussion Notes:
Caroline’s thoughts:
Claire’s Product Team Alignment Doc:
Timeline
Discussion Notes:
Classroom choices:
Elementary School(Grade  K - 5)
Middle School (Grade 6 - 8)
High School (Grade 9 - 12)
Data Input:
Gradebook
Attendance records
Free form teacher input (speech to text) 

Parents’ Problems
Parents can’t see units/lessons/plans for the week to understand what their student is currently working on, what has been covered, what is coming up next
It takes too long for parents to get insight into what their child is struggling with, which makes interventions less timely and effective 
Even once parents know that their child is struggling with something, it can be hard to know what to do to help them 
Parents have concerns about screen time in the classroom and don’t have insight into what’s being done on screens 

Teachers’ Problems
Very hard to find the time to directly communicate with parents (e.g. phone call, email) and put together what would be useful to actually communicate 
Have to strike the right tone with parents 
Help teachers shorten the distance between actually starting the conversation with parents
Can be really easy to only send negative updates 

Effort vs. impact is disproportionate in a positive way for sending positive feedback about student 
“Planting seeds” of positive classroom culture, makes it easier if you need to reach out about something negative in the future 

Reasons to reach out:
Positive thing I noticed 
Intervention needed 
Change – something is different – would be great if this category invited the parents to respond back 
Behavior changed, were turning in assignments and now they’re not 
Current communication to parents:
Email
Sometimes student information system has a parent portal with some kind of communication 
Specific tools like Remind 
Teachers find the one that works for them, can be district-specific, can be teacher-specific 
Big Constraints: 
Don’t add something new to a teacher’s plate: how can this happen without a teacher needing to do something new, copy things into a new system, etc 
Respect students’ privacy on social/emotional things that teacher might have noticed (e.g “I noticed that Becky is finally talking to boys”)

Persona
Parents
Parents really want to hear even the smallest things
Personal things
Parents communicate back to teachers:

Parent Teacher Communication Tool Use Cases:
Parent Teacher Conference follow up 

Watch for the PII - Student names and days

Support Persona:
Teacher comfortable with AI summarize the email
Emails
App
What do teachers need from parents?
Parent communicate 
Huge gap with teacher communicate with parents
Different scenarios to raise 
What do teachers not want from their parents?
Quiz progress
Grades fall behind
Anything academic is fair game to share with parent
Teachers:
Not to create burden for teachers
Class room observations
Mental notes are in teacher’s head
Inform notes system
Seating chart
Speech to text 
AI help teacher to remember everything about kids to communicate and what 
End of day - AI suggested questions
High School - Needs parent to emotion involvement of teachers 
Help the teacher to shorten the distance to teacher and parents
How to make teacher with the first steps
Shorten the distance the distance for teachers to communicate to the parents (not until the teacher parent conference)
Help teacher to craft the messages and tone to communication
Quick check-in for kids doing bad / good
What is better way to involve 
Encourage the open communications
Teachers:
Positive emails and

School guidelines for parent teacher communication:
Hard requirement

Vibe check for students
Learn Progress and teacher decide when to involve parents
Automatically nudge teacher to engage parents

Classroom communications from teachers to parents
Frequency 
Emails? Messages?
Setup:
Dataset of classroom of 20 students - AI generated
Data Schema - Weekly snapshot
TTS notes from teacher at the end of day which get added to the correct students - Ambitious, but can be done
Content taught that week
Quiz scores - Online vs handwritten
Ground truth notes - cosine similarity
10/5/5 - Train/Val/Test
5 training as ICL
Platform - Claude + Github + AOAI
Positive also really important


Caroline’s thoughts:
Focus on high school (since we have a former high school teacher on the team who can give us that perspective)
Things in UX/UI:
Speech to text input: prompts the teacher to talk for ~3 minutes per week about what they’ve noticed in their classroom. Has specific prompts/questions for them to talk about so it’s not just a blank slate 
Weekly suggested students/parents to reach out to + email drafts 
Remove the burden of choice from the teacher 
Based on all automatically collected input data + the freeform thoughts from speech to text 
Teacher can select different students instead if they want to – would create same insights/draft email for those students 
Some for positive feedback, some for interventions needed
When the teacher sends positive feedback, they get some kind of cute animation about planting seeds of positive culture, to reinforce why this is important 
Easy to copy & paste to any system that you use (email, SIS, other)
Could show buttons for integrations to do this directly, but don’t actually hook this up during the hackathon 
More backend-y things:
Data inputs:
Gradebook
Attendance data 
Free-form notes 
All optional 
All format agnostic – include a data standardization layer (can be LLM) for gradebooks & attendance so that they can be various input formats 
(could also skip this for the hackathon but call it out as something that we would do) 
Synthesis cadence should be configurable (could also be a non-hackathon part of this) 
We’ve been talking about weekly, some teachers might want every 2 weeks, monthly, etc 
Also needs to be triggerable, for demo purposes (and so teacher could do it off schedule if they want to) 













Claire’s Product Team Alignment Doc:
1. The problem we're solving
Teachers already know a hundred small, useful things about each student. Almost none of it reaches parents, because the cost of writing it down and sending it is too high — so parents mostly hear from school when something has already gone wrong.

The gap isn't that teachers don't care or parents don't want to hear. The gap is friction: the distance between "I noticed something about this kid" and "I sent a message to their parent" is long enough that it almost never gets crossed.

Not only intervention but also vibe check 
What's painful right now — parents
No visibility into the week. Can't see what units or lessons their child is working on, what's been covered, what's coming next.
They find out too late. By the time a parent learns their child is struggling, the window where intervention would have helped has mostly closed.
Even knowing doesn't help. "Your child is behind in fractions" doesn't tell a parent what to do on a Tuesday night.
Nothing small or personal ever arrives. Parents want the little things — effort, a good moment, a breakthrough — and essentially never get them.
You only hear when things are going poorly, not when things are going well.


What's painful right now — teachers
No time. Not for the call, not for the email, and not for assembling what's even worth saying.
Tone risk. Getting the tone wrong with a parent is expensive, so the safe move is to not send.
The first step is the costly one. Once a teacher starts writing, it's fine. Starting is what doesn't happen.
Outreach skews negative by default. Problems force action; good news doesn't. So the only time a parent hears from school, it's bad.
The best signal is trapped. Classroom observations — the richest, most specific thing a teacher has — live in their head and are never written down anywhere.
The asymmetry we're exploiting
Positive outreach has a wildly favorable effort-to-impact ratio. A two-sentence "here's something good I noticed today" costs a teacher almost nothing and changes the parent relationship disproportionately. Nobody sends them because there is no forcing function. 
The constraint that shapes everything
Whatever we build, a teacher must not have to do anything new — not so sure - no new system to log into?, no copying things from one place to another. We consume what already exists. 


The only new input we'd even consider asking for is an end-of-day voice note, because talking is cheaper than typing.

Classroom choices:
High School (Grade 9 - 12) - 3
Elementary School(Grade  K - 5)

Class size: 25

Input:
Gradebook - Expand the definition of Gradebook
Attendance records
Free form teacher input (speech to text) 
MVP text
Ideally speech-to-text


2. What we're shipping
Two deliverables, and they serve different audiences:

A) A working demo application — frontend + backend.

Backend: an API that takes a student's weekly snapshot and returns whether to contact the parent, why, and a drafted message — with a policy/privacy stage in between.
Frontend: a teacher's end-of-day review queue — 3–5 suggested messages, each one approve / edit / skip. This is what we put on screen in the demo.

B) A reusable open-source contribution — a parent–student communication framework. This is the part the organizers actually care about. The hackathon is looking for AI building blocks that work as a shared spine across the education ecosystem, not polished one-off apps. So we package and publish:

The weekly snapshot data contract (section 5) — the interchange format any SIS or gradebook could emit.
The outreach detection logic — should we contact, and which of the three reasons.
The privacy/policy filter — the piece every vendor would otherwise rebuild badly.
The prompt templates + eval harness, so adopters can measure their own results.

Shipped as an installable module with a README and a pip install-able / importable interface. The pitch line: "Any gradebook or SIS can sit behind this instead of reinventing 'should I email this parent' logic."


3. ⚠️ Open questions — let's answer these before writing code
These are the discussion items. My recommendation is in the middle column; push back on any of them.

#
Question
Answer
Why
1
Which grade band — K–5, 6–8, or 9–12?
High School
One teacher, one roster of ~20, richest observational data, most engaged parents. Cleanest data model, best demo. We can note in the pitch that the burden problem is worst in high school (150 students/teacher) — that's the scaling story, not the demo.
2
Is teacher voice input (speech-to-text) in scope?
Yes 

Start with just text and then build on the speech to text part afterwards
Notes call it "ambitious but doable." Pre-write notes as text for the Friday checkpoint; add real transcription Saturday only if the pipeline is solid.
3
One direction or two?
Teacher → parent for v1, with a visible reply hook on "something changed" messages
Two-way messaging is a whole product. The reply invitation demos the idea without us building an inbox.
4
Does anything ever auto-send?
Never
Product-defining, and it's our answer when a governance-track judge asks about surveillance.
5
Daily or weekly cadence?
Weekly
Daily catches change fast; the weekly digest solves the parent-visibility problem cheaply.
6
Do we build the class-wide "what we covered this week" digest?
Save for V2
Easiest parent-facing win, but additive, not core.



















4. Design principles
Teacher-in-the-loop, always. We draft; the teacher approves, edits, or discards. Nothing sends on its own.
Positive message type not a nice-to-have. If the system only fires on problems, we've rebuilt the status quo. Do not just communicate the problems, also communicate the good things!
Synthetic data only. Our dataset is AI-generated. No real student data, no real names, anywhere in this project.

5. Who we're building for


Role
What they need
Primary user
Classroom teacher
To communicate more, sooner, with less effort — and to feel safe doing it
Beneficiary
Parent/guardian
Specifics about their own kid, early, plus something concrete they can do
Protected party
Student
Dignity and privacy, especially around social/emotional observations








The teacher's burden is what decides whether this lives or dies. Every feature gets tested against: does this add a step to a teacher's day?


6. The three reasons to reach out
This taxonomy is the spine of the whole system — detection, drafting, and evaluation all key off it.

Type
Trigger
Tone
Call to action
① Positive noticing
Effort, improvement, a moment worth naming
Warm, specific, short
None — no reply needed. Just receive it.
② Intervention needed
Falling scores, missing work, a concept not landing
Direct, non-alarming, partnership-framed
One concrete thing to try at home. This closes the "I don't know how to help" gap.
③ Something changed
Delta vs. the student's own prior baseline — was turning in work, now isn't; engagement shifted
Curious, open, non-accusatory
Explicitly invites a reply. The parent may know why.


11. Work split (3–4 people)




12. Demo script (3 minutes)
The gap. "Ms. Rivera teaches 24 fourth-graders. Here's everything she knows about Student 14 this week. Here's what Student 14's parent knows: nothing since October."
End of day. She taps record and says two sentences about her class. (Saturday: live. Friday: pre-recorded.)
The queue. Three drafts appear — one positive, one intervention with a specific at-home suggestion, one "something changed, do you know why?"
The filter. Show a note that got held back — flagged as a social observation, with an explanation. This is the moment that wins a governance-track room.
Approve and send. Total teacher time: under 90 seconds.
The ask. "Detection and the policy filter are open source. Any gradebook or SIS can sit behind them instead of rebuilding this."


13. Risks and our answers
"This is surveillance of children." These are the teacher's own observations, which she already makes and already keeps in her head. Nothing is captured that a teacher wouldn't write in a notebook. Nothing sends without her approval. The filter's job is to reduce what gets shared, not expand it.
"AI writing to parents feels impersonal." The teacher edits and approves every message, and drafts are grounded in specific evidence about that specific child. The realistic alternative isn't a handwritten note — it's no message at all.
"Won't this generate noise?" That's what the should_contact decision and the "send nothing" test cases exist to prevent — and we report the false-positive rate.
Biggest build risk: the dataset. If it isn't real by late morning, three people are idle. Ship a crude version early and improve it in place.



Timeline & Logistics:
Friday, August 14
10:30-4pm Hacking time (+lunch)
4-5pm First Day Demos


Saturday, August 15
10:00am-3:00pm Hacking time (+lunch)
3:00pm-4:00pm Final demos, next steps, and departure


0. Scope
Friday by 4pm (checkpoint) — thin end-to-end slice:

Synthetic dataset generated (20 students, 2 weeks, hard cases seeded)
Backend returning should_contact + reason
Draft generation for all three message types
Minimal review queue UI — even a single page listing drafts with approve/edit
One live click-through: snapshot in → three drafts out → teacher approves one

Saturday (final demo) — depth and the reusable piece:

Privacy/policy filter as its own testable stage with its own eval
Change detection against prior-week baseline (the differentiator)
Eval harness with real numbers on the test split
Teacher voice note → transcription → routed to the right student
Packaged as an installable module with a README, so it reads as a building block

Explicitly out of scope: authentication, real SIS/LMS integration, a parent inbox, multi-class support, mobile, screen-time telemetry.






Competitive Analytiscs:
Parent Square


