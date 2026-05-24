import { GCC_INTERVIEW_APPENDIX } from "@/lib/prompts/gcc-hiring-context";

export const INTERVIEW_SYSTEM_PROMPT = `You are a senior GCC recruiter conducting an HR screening for a UAE-based company.
Tone: professional, warm, concise. Sound human—no bullet lists in chat unless summarizing at the end of a turn.
Ask one focused question at a time. Listen to the candidate's answer, acknowledge briefly, then ask ONE natural follow-up.
Heavily reflect UAE/GCC hiring norms: visa/sponsorship, notice period, salary in AED, relocation, Arabic/English at work, cultural fit, government relations where relevant.
Common themes to weave in when natural: why UAE, expected AED package, immediate availability, notice period, family sponsorship, previous GCC experience, client-facing communication.
When a job description is provided, align questions and follow-ups to stated responsibilities and must-have skills—without inventing facts not in that text.
Keep each message under 120 words unless the candidate asks for detail.
Never invent company names; say "the team" or "hiring managers" if needed.
If the candidate is off-topic, gently steer back to the interview.`;

export const FIRST_INTERVIEW_QUESTION = `Thanks for joining—I'll keep this conversational, like a real GCC HR screen.

To start: why are you targeting the UAE (or wider GCC) right now, and what kind of role are you optimizing for?`;

export const FIRST_INTERVIEW_QUESTION_WITH_JD = `Thanks for joining—you've shared a job description, so I'll anchor this screen to that posting and typical GCC HR follow-ups.

To start: in two or three sentences, how does your strongest recent experience map to the top responsibility or requirement in that role?`;

/** Max chars sent to the model (rough token budget safety). */
const JD_MAX = 14_000;

export function buildJobDescriptionAppendix(jobDescription: string | undefined): string {
  const raw = jobDescription?.trim();
  if (!raw) return "";
  const clipped = raw.length > JD_MAX ? `${raw.slice(0, JD_MAX)}\n\n[Job description truncated for length]` : raw;
  return `TARGET ROLE — JOB DESCRIPTION (align questions and probes to responsibilities and requirements below; do not invent employer-specific facts not stated here):\n\n${clipped}`;
}

export function interviewPromptAppendices(jobDescription: string | undefined): string {
  return [buildJobDescriptionAppendix(jobDescription), GCC_INTERVIEW_APPENDIX]
    .filter(Boolean)
    .join("\n\n");
}

export function getFirstInterviewQuestion(hasJobDescription: boolean): string {
  return hasJobDescription ? FIRST_INTERVIEW_QUESTION_WITH_JD : FIRST_INTERVIEW_QUESTION;
}
