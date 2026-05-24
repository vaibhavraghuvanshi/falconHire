import { create } from "zustand";
import type { ChatMessage, RecruiterScore } from "@/types/chat";

type InterviewStatus = "idle" | "streaming" | "scoring";

type InterviewState = {
  messages: ChatMessage[];
  status: InterviewStatus;
  score: RecruiterScore | null;
  sessionStarted: boolean;
  /** Optional target JD; sent to interview/score APIs and persisted when a DB session is created. */
  jobDescription: string;
  /** Prisma InterviewSession id when DATABASE_URL is set and session bootstrap succeeded. */
  serverSessionId: string | null;
  appendAssistantChunk: (messageId: string, chunk: string) => void;
  addMessage: (message: Omit<ChatMessage, "id" | "createdAt"> & Partial<Pick<ChatMessage, "id" | "createdAt">>) => ChatMessage;
  setStatus: (status: InterviewStatus) => void;
  setScore: (score: RecruiterScore | null) => void;
  setJobDescription: (value: string) => void;
  setServerSessionId: (id: string | null) => void;
  resetSession: () => void;
  startSession: () => void;
};

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export const useInterviewStore = create<InterviewState>((set, get) => ({
  messages: [],
  status: "idle",
  score: null,
  sessionStarted: false,
  jobDescription: "",
  serverSessionId: null,
  appendAssistantChunk: (messageId, chunk) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, content: m.content + chunk } : m,
      ),
    })),
  addMessage: (message) => {
    const full: ChatMessage = {
      id: message.id ?? createId(),
      role: message.role,
      content: message.content,
      createdAt: message.createdAt ?? Date.now(),
    };
    set((state) => ({ messages: [...state.messages, full] }));
    return full;
  },
  setStatus: (status) => set({ status }),
  setScore: (score) => set({ score }),
  setJobDescription: (value) => set({ jobDescription: value }),
  setServerSessionId: (id) => set({ serverSessionId: id }),
  resetSession: () =>
    set({
      messages: [],
      status: "idle",
      score: null,
      sessionStarted: false,
      serverSessionId: null,
    }),
  startSession: () => {
    const { sessionStarted } = get();
    if (sessionStarted) return;
    set({ sessionStarted: true });
  },
}));
