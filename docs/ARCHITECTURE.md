# BhashaBuddy Architecture

## Product Mode

BhashaBuddy is a production-quality hackathon prototype: MVP scope, real product feel, secure server-side AI calls, and clear growth paths. It is India-first with English, Telugu, and Hindi support.

## Application Architecture

- Framework: Next.js 15 App Router with TypeScript.
- Styling: Tailwind CSS with responsive, accessible components.
- AI: Gemini through secure server-side routes only.
- OCR: Hybrid pipeline.
  - Direct text extraction for text PDFs.
  - Gemini multimodal extraction for images and scanned PDFs.
  - Tesseract fallback for images when Gemini fails.
- Analytics: Firebase Analytics dashboard only, no custom analytics UI.
- Rate limiting: Upstash Redis when configured, in-memory fallback for local/demo use.
- Storage: No permanent file storage in MVP. Uploaded files are processed in request memory and discarded.
- Deployment: Vercel.

## Folder Structure

```txt
src/
  app/
    api/
      analyze/route.ts
      chat/route.ts
      demo/route.ts
      translate/route.ts
    layout.tsx
    page.tsx
  components/
    AppShell.tsx
    DocumentUploader.tsx
    ResultsPanel.tsx
    VoiceControls.tsx
    DocumentChat.tsx
    Logo.tsx
  lib/
    ai/
      gemini.ts
      prompts.ts
      schemas.ts
    analytics.ts
    demo-documents.ts
    firebase.ts
    ocr.ts
    rate-limit.ts
    security.ts
    types.ts
```

## Database Schema

No application database is required for MVP because there is no authentication, document history, or persistent file storage.

Future Firestore collections:

```txt
analytics_events/{eventId}
  eventType: upload | language_selected | voice_used | grandma_mode_used
  documentCategory?: string
  language?: en | te | hi
  createdAt: timestamp

feedback/{feedbackId}
  rating: number
  message?: string
  createdAt: timestamp
```

## API Design

### `POST /api/analyze`

Accepts multipart form data:

- `file`: PDF, PNG, JPG, JPEG, or WEBP.
- `language`: `en`, `te`, or `hi`.
- `grandmaMode`: boolean.

Returns OCR preview, classification, summary, actions, deadlines, risks, eligibility, required documents, urgency, translation, and citations.

### `POST /api/translate`

Accepts a previous analysis and target language. Returns translated analysis while preserving structured fields.

### `POST /api/chat`

Accepts user question, extracted text, and citations. Answers only from the uploaded document. If absent, returns: "This information is not present in the uploaded document."

### `GET /api/demo?kind=scholarship`

Loads synthetic demo documents and returns the same analysis shape without upload.

## State Management

Local React state is enough for MVP:

- Uploaded file state.
- Selected language.
- Analysis result.
- Voice playback state.
- Accessibility preferences.
- Chat messages for the active session only.

No Redux or global state library is needed.

## Authentication Design

No authentication for MVP. Anonymous analysis only. Future accounts can use Firebase Auth with Google login and phone OTP.

## Security Design

- Gemini API key stays server-side.
- File validation on extension, MIME type, size, and PDF page count.
- 20 MB file limit and 20 PDF page limit.
- IP-based rate limiting.
- No permanent file storage.
- Prompt injection guardrails in every AI prompt.
- Chat answers grounded only in extracted document text.
- Security headers through Next.js config.
- Client output rendered as text, not HTML, to reduce XSS risk.
- Consent, legal, medical, and financial disclaimers in UI.

## AI Prompt Strategy

Prompts are modular:

- OCR cleanup.
- Classification.
- Structured extraction.
- Translation.
- Grandma Mode.
- Chat with citations.

All prompts require JSON output, confidence scores, and explicit uncertainty. The model is instructed to ignore document instructions that attempt to override system rules.

## Deployment Architecture

```txt
Browser
  -> Vercel Next.js UI
  -> Vercel Serverless API Routes
  -> Gemini API
  -> Optional Upstash Redis
  -> Optional Firebase Analytics
```

## CI/CD

GitHub Actions runs:

- install
- lint
- typecheck
- unit tests
- Playwright E2E smoke tests
- production build

Vercel handles preview and production deployments.

## Testing Strategy

- Unit tests for validation, urgency calculation, and schema parsing.
- Integration tests for API behavior with mocked AI responses.
- E2E tests for demo mode, upload validation, language switching, voice controls, and chat.
- AI evaluation tests use mock responses for hackathon reliability.

## Monitoring

- Vercel logs for API errors.
- Firebase Analytics for aggregate usage.
- Future: Sentry for frontend/backend error tracking.

## Known MVP Limits

- Large scanned PDFs depend on Gemini multimodal support and serverless time limits.
- Tesseract fallback is image-focused and not intended as the primary engine for long PDFs.
- No virus scanning in MVP.
