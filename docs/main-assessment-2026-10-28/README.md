# Assessment UI and OpenAI speech

## Updated screens
- Practice video: removed the visible response transcript. Recorded answers continue to be transcribed when submitted.
- Main video assessment and coding round now use the same compact workspace styles, camera/device checks, local editor panels and visible action areas as practice.
- Branded expired invitation, completed and maintenance screens. Expired invitations expose a mailto action when recruiter email is available.
- Shared logo loader for preparing/submitting states; retry surface on failed final submission.
- Main assessment invitation checks, question-generation endpoints and submission payload fields remain in place.
- Setup validation fixed on mobile; desktop setup retains the approved tall card and plain background.

## Speech configuration
`OPENAI_API_KEY` stays server-side. Optional `OPENAI_STT_MODEL` (default `gpt-transcribe`), `OPENAI_TTS_MODEL` (default `gpt-4o-mini-tts`), `OPENAI_TTS_VOICE` (default `coral`).

The existing `/api/v1/parser/convert/stt` upload returns `{text,status}`. `/api/v1/parser/convert/tts` accepts `{textInput}` and returns MP3 (`audio/mpeg`), matching the client audio blob type. Transcription uploads are deleted after use. No candidate transcript is logged by these handlers. Gemini remains in unrelated resume/text generation features.

The browser SpeechRecognition transcript is removed from the practice and main interview components; MediaRecorder audio feeds the OpenAI-backed server endpoint. An AI-generated voice label is displayed in the interview.

OpenAI documentation checked October 28, 2026:
- https://developers.openai.com/api/docs/guides/speech-to-text
- https://developers.openai.com/api/docs/guides/text-to-speech

The compatible Speech API (`gpt-4o-mini-tts`) is documented for shutdown January 6, 2027. Before that date, the server speech adapter needs a Realtime API implementation; changing the model string alone is not sufficient. The current change preserves the application's existing request/response workflow.

## Validation
- JSX undefined-name check and application unminified production compilation.
- Three speech adapter tests: upload stream/text contract, MP3 binary response, provider failure propagation.
- Browser layout fixtures at 1440x900, 1280x720, 390x844 cover main device screens, video question, submission, expired/completed, coding editor and final button. Setup separately checked at 1920x1080, 1440x900, 1366x768, 1280x720, 390x844 including validation errors.
- Browser fixtures use mocked APIs and no real candidate media. No live OpenAI request, real recording/upload, or external email was sent. The mocked video fixture has no speech audio and may log unsupported-media errors.
