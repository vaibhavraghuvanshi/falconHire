export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
};

export type ScoreCategories = {
  communication: number;
  confidence: number;
  professionalism: number;
  technicalClarity: number;
  gccReadiness: number;
};

export type RecruiterScore = {
  overall: number;
  categories: ScoreCategories;
  strengths: string[];
  needsImprovement: string[];
  summary: string;
};

export type ResumeAnalysisResult = {
  overallScore: number;
  atsReadiness: { score: number; notes: string };
  missingKeywords: string[];
  formattingIssues: string[];
  gccRecruiterNotes: string[];
  improvements: string[];
  elevatorPitch: string;
};

export type LinkedInOptimizationResult = {
  headline: string;
  about: string;
  featuredBullets: string[];
  recruiterSummary: string;
  keywords: string[];
};
