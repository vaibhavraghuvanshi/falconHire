export type Locale = "en" | "ar";

export const en = {
  nav: {
    dashboard: "Dashboard",
    interview: "AI Interview",
    resume: "Resume",
    linkedin: "LinkedIn",
    startMockInterview: "Start mock interview",
    signOut: "Sign out",
    signIn: "Sign in",
    primary: "Primary",
    primaryMobile: "Primary mobile",
  },
  preferences: {
    themeDark: "Dark",
    themeLight: "Light",
    languageEn: "English",
    languageAr: "العربية",
    themeLabel: "Theme",
    languageLabel: "Language",
    dockAriaLabel: "Theme and language",
  },
  landing: {
    badge: "FalconHire AI · UAE/GCC interview copilot",
    heroTitle1: "Practice the interview",
    heroTitle2: "recruiters remember.",
    heroBody:
      "A premium, AI-native prep surface for GCC hiring realities—mock HR screens, scoring, resume signal, and LinkedIn polish in one cohesive product experience.",
    ctaInterview: "Start mock interview",
    ctaDashboard: "View dashboard",
    techBadgeNext: "Next.js App Router",
    techBadgeLlm: "OpenAI / Groq / Anthropic",
    techBadgeDb: "Prisma + Postgres",
    techBadgeState: "Zustand + Framer Motion",
    previewTitle: "Live recruiter preview",
    previewStreaming: "Streaming",
    previewDescription:
      "FalconHire keeps answers tight, professional, and region-aware—mirroring how strong candidates show up in UAE screens.",
    previewRecruiter: "Recruiter",
    previewRecruiterMsg:
      "Walk me through your notice period and earliest start date in the UAE—what does your timeline look like if we move forward?",
    previewCandidate: "Candidate",
    previewCandidateMsg:
      "I am on a 30-day notice with a clear handover plan; I can relocate to Dubai within two weeks of a signed offer…",
    previewFooter: "Tokens stream as the model responds",
    previewFooterMeta: "LLM env",
    sectionTitle: "Built for GCC hiring workflows",
    sectionBody:
      "Every surface pairs modern SaaS UX with pragmatic AI plumbing—server-side calls, structured JSON where it matters, and streaming where it feels human.",
    sectionCta: "Try resume analyzer",
    features: {
      interview: {
        title: "GCC HR interview simulator",
        description:
          "Streaming mock screens with visa, AED, notice period, and stakeholder questions recruiters actually ask.",
      },
      scoring: {
        title: "Recruiter impression scoring",
        description:
          "Structured JSON evaluation across communication, confidence, professionalism, technical clarity, and GCC readiness.",
      },
      resume: {
        title: "Resume intelligence",
        description:
          "ATS-oriented analysis with GCC hiring context—keywords, formatting, and prioritized improvements.",
      },
      linkedin: {
        title: "LinkedIn packaging",
        description:
          "Headline, About, achievement bullets, and recruiter summaries tuned for UAE hiring managers.",
      },
    },
  },
  signIn: {
    title: "Sign in",
    subtitle:
      "Sign in once to run mock interviews, see recruiter-style scores, and keep your session history in sync across devices.",
    loading: "Loading sign-in…",
    backHome: "Back to home",
    cardTitle: "Continue with Google",
    cardHighlight:
      "Step into your interview cockpit—live practice, instant feedback, your progress saved.",
    cardBody:
      "Secure Google sign-in. No passwords to remember; we only use your account to personalize FalconHire for you.",
    googleCta: "Sign in with Google",
  },
} as const;

/** Same shape as English copy, but every text field is typed as `string` for translations. */
type DeepStringLeaves<T> = T extends string
  ? string
  : { [K in keyof T]: DeepStringLeaves<T[K]> };

export type MessageTree = DeepStringLeaves<typeof en>;

export const ar: MessageTree = {
  nav: {
    dashboard: "لوحة التحكم",
    interview: "مقابلة ذكاء اصطناعي",
    resume: "السيرة الذاتية",
    linkedin: "لينكدإن",
    startMockInterview: "ابدأ مقابلة تجريبية",
    signOut: "تسجيل الخروج",
    signIn: "تسجيل الدخول",
    primary: "التنقل الرئيسي",
    primaryMobile: "التنقل الرئيسي — الجوال",
  },
  preferences: {
    themeDark: "داكن",
    themeLight: "فاتح",
    languageEn: "English",
    languageAr: "العربية",
    themeLabel: "المظهر",
    languageLabel: "اللغة",
    dockAriaLabel: "المظهر واللغة",
  },
  landing: {
    badge: "FalconHire AI · مساعد مقابلات الخليج",
    heroTitle1: "تدرّب على المقابلة",
    heroTitle2: "التي يتذكرها المسؤولون.",
    heroBody:
      "سطح تحضير متكامل يعكس واقع التوظيف في الخليج—شاشات محاكاة، تقييم، تحليل للسيرة، وصقل لملف لينكدإن في تجربة واحدة.",
    ctaInterview: "ابدأ مقابلة تجريبية",
    ctaDashboard: "عرض لوحة التحكم",
    techBadgeNext: "Next.js App Router",
    techBadgeLlm: "OpenAI / Groq / Anthropic",
    techBadgeDb: "Prisma + Postgres",
    techBadgeState: "Zustand + Framer Motion",
    previewTitle: "معاينة مسؤول التوظيف",
    previewStreaming: "بث مباشر",
    previewDescription:
      "إجابات مركزة واحترافية ومراعاة للسياق الإقليمي—قريبة مما يقدمه المرشحون القويون في شاشات الإمارات.",
    previewRecruiter: "مسؤول التوظيف",
    previewRecruiterMsg:
      "حدّثني عن فترة الإشعار وأقرب تاريخ يمكنك البدء فيه ضمن الإمارات—كيف يبدو جدولك إذا تقدمنا؟",
    previewCandidate: "المرشح",
    previewCandidateMsg:
      "لدي إشعار 30 يومًا مع خطة تسليم واضحة؛ يمكنني الانتقال إلى دبي خلال أسبوعين من توقيع العرض…",
    previewFooter: "تدفق الرموز أثناء رد النموذج",
    previewFooterMeta: "بيئة النموذج",
    sectionTitle: "مصمم لمسارات التوظيف في الخليج",
    sectionBody:
      "كل شاشة تجمع واجهة SaaS حديثة مع بنية ذكاء اصطناعي عملية—استدعاءات من الخادم، JSON منظم حيث يلزم، وبث حيث يشعر الحوار بأنه بشري.",
    sectionCta: "جرّب محلل السيرة",
    features: {
      interview: {
        title: "محاكي مقابلات الموارد البشرية في الخليج",
        description:
          "شاشات بث حول التأشيرة والدرهم وفترة الإشعار وأسئلة أصحاب المصلحة كما يطرحها المسؤولون فعليًا.",
      },
      scoring: {
        title: "تقييم انطباع المسؤول عن التوظيف",
        description:
          "تقييم JSON منظم عبر التواصل والثقة والاحتراف والوضوح التقني والاستعداد لسوق الخليج.",
      },
      resume: {
        title: "ذكاء السيرة الذاتية",
        description:
          "تحليل موجه لأنظمة التتبع مع سياق توظيف الخليج—الكلمات المفتاحية والتنسيق وتحسينات ذات أولوية.",
      },
      linkedin: {
        title: "حزمة لينكدإن",
        description:
          "عنوان ونبذة ونقاط إنجاز وملخصات لمسؤولي التوظيف في الإمارات.",
      },
    },
  },
  signIn: {
    title: "تسجيل الدخول",
    subtitle:
      "سجّل مرة واحدة لتشغيل المقابلات التجريبية، رؤية درجات أسلوب المسؤولين، ومزامنة سجل الجلسات بين الأجهزة.",
    loading: "جارٍ تحميل تسجيل الدخول…",
    backHome: "العودة للرئيسية",
    cardTitle: "المتابعة عبر Google",
    cardHighlight:
      "ادخل إلى لوحة المقابلة—تمرين مباشر، ملاحظات فورية، وتقدم محفوظ.",
    cardBody:
      "تسجيل دخول آمن عبر Google. بلا كلمات مرور نحتاج فقط لحسابك لتخصيص FalconHire.",
    googleCta: "تسجيل الدخول عبر Google",
  },
};

export const messages: Record<Locale, MessageTree> = {
  en: en as unknown as MessageTree,
  ar,
};

function getByPath(obj: unknown, path: string): string | undefined {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur === null || cur === undefined || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === "string" ? cur : undefined;
}

/** Dot-path keys, e.g. `nav.dashboard` */
export function translate(locale: Locale, key: string): string {
  const raw = getByPath(messages[locale], key) ?? getByPath(messages.en, key);
  return raw ?? key;
}
