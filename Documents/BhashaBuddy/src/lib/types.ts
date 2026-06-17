export type SupportedLanguage = "en" | "te" | "hi";

export type DocumentKind =
  | "Government Notice"
  | "Scholarship Notice"
  | "College Circular"
  | "Legal Notice"
  | "Medical Report"
  | "Bank Document"
  | "Insurance Document"
  | "Utility Bill"
  | "Unknown Document";

export type Severity = "Low" | "Medium" | "High";
export type Urgency = "Green" | "Yellow" | "Red";

export interface Citation {
  id: string;
  quote: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  details?: string;
  citationId?: string;
}

export interface DeadlineItem {
  id: string;
  label: string;
  dateText: string;
  isoDate?: string;
  status: "Upcoming" | "Today" | "Passed" | "Unknown";
  countdownText: string;
  citationId?: string;
}

export interface RiskItem {
  id: string;
  label: string;
  severity: Severity;
  consequence: string;
  citationId?: string;
}

export interface EligibilityItem {
  id: string;
  condition: string;
  explanation: string;
  citationId?: string;
}

export interface TranslationItem {
  summary: string;
  grandmaMode: string;
  actions: string[];
}

export interface RawAnalysisResponse {
  classification: {
    type: DocumentKind;
    confidence: number;
  };
  summary: {
    simple: string;
    purpose: string;
    context: string;
    grandmaMode: string;
  };
  actions: ChecklistItem[];
  deadlines: DeadlineItem[];
  risks: RiskItem[];
  eligibility: EligibilityItem[];
  requiredDocuments: ChecklistItem[];
  translations: {
    en: TranslationItem;
    te?: TranslationItem;
    hi?: TranslationItem;
  };
  urgency: {
    level: Urgency;
    reasons: string[];
  };
  citations: Citation[];
}

export interface DocumentAnalysis extends RawAnalysisResponse {
  ocr: {
    text: string;
    preview: string;
    confidence: number;
    method: "pdf-text" | "openrouter-vision" | "tesseract" | "demo";
  };
  disclaimers: string[];
  timings?: {
    uploadMs?: number;
    pdfParseMs?: number;
    ocrMs: number;
    aiMs: number;
    totalMs: number;
  };
  pagesAnalyzed?: number;
  totalPages?: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  source?: "document" | "general";
}

export const languageLabels: Record<SupportedLanguage, string> = {
  en: "English",
  te: "Telugu",
  hi: "Hindi"
};

export const languageNativeLabels: Record<SupportedLanguage, string> = {
  en: "English",
  te: "తెలుగు",
  hi: "हिन्दी"
};
