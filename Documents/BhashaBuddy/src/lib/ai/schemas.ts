import { z } from "zod";

export const citationSchema = z.object({
  id: z.string(),
  quote: z.string()
});

const translationItemSchema = z.object({
  summary: z.string(),
  grandmaMode: z.string(),
  actions: z.array(z.string())
});

export const analysisSchema = z.object({
  classification: z.object({
    type: z.enum([
      "Government Notice",
      "Scholarship Notice",
      "College Circular",
      "Legal Notice",
      "Medical Report",
      "Bank Document",
      "Insurance Document",
      "Utility Bill",
      "Unknown Document"
    ]),
    confidence: z.number().min(0).max(1)
  }),
  summary: z.object({
    simple: z.string(),
    purpose: z.string(),
    context: z.string(),
    grandmaMode: z.string()
  }),
  actions: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      details: z.string().optional(),
      citationId: z.string().optional()
    })
  ),
  deadlines: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      dateText: z.string(),
      isoDate: z.string().optional(),
      status: z.enum(["Upcoming", "Today", "Passed", "Unknown"]),
      countdownText: z.string(),
      citationId: z.string().optional()
    })
  ),
  risks: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      severity: z.enum(["Low", "Medium", "High"]),
      consequence: z.string(),
      citationId: z.string().optional()
    })
  ),
  eligibility: z.array(
    z.object({
      id: z.string(),
      condition: z.string(),
      explanation: z.string(),
      citationId: z.string().optional()
    })
  ),
  requiredDocuments: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      details: z.string().optional(),
      citationId: z.string().optional()
    })
  ),
  translations: z.object({
    en: translationItemSchema,
    te: translationItemSchema.optional(),
    hi: translationItemSchema.optional()
  }),
  urgency: z.object({
    level: z.enum(["Green", "Yellow", "Red"]),
    reasons: z.array(z.string())
  }),
  citations: z.array(citationSchema)
});

export const chatSchema = z.object({
  source: z.enum(["document", "general"]),
  answer: z.string(),
  citations: z.array(citationSchema)
});

export const translationResponseSchema = z.object({
  summary: z.string(),
  grandmaMode: z.string(),
  actions: z.array(z.string())
});

export type AnalysisPayload = z.infer<typeof analysisSchema>;
export type ChatPayload = z.infer<typeof chatSchema>;
export type TranslationResponsePayload = z.infer<typeof translationResponseSchema>;
