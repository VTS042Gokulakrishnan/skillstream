const { test } = require("node:test");
const assert = require("node:assert/strict");
const { PDFDocument, StandardFonts } = require("pdf-lib");
const { videoSections, codingSections, wrapLine, createPdf, createCodingPdf } = require("../services/interviewFeedbackPdf");

test("video feedback excludes missing/skipped entries and preserves zero scores", () => {
  const sections = videoSections({ analysis: { score: 0, per_question_feedback: {
    first: { question: "Explain APIs", answer_summary: "Discussed APIs", strengths: ["Clear"] },
    missing: {}, skipped: { skipped: true, question: "Skipped" }, invalid: null,
  } } });
  const content = sections.map(([line]) => line).join("\n");
  assert.match(content, /Score: 0/);
  assert.match(content, /Q: Explain APIs/);
  assert.doesNotMatch(content, /undefined|Skipped/);
});

test("coding feedback matches original questions by ID, including reordered results", () => {
  const sections = codingSections({ evaluation: { per_question: [
    { id: 2, score: 3, feedback: "Second" }, { id: 1, score: 5, feedback: "First" },
    { id: 99, score: 0 },
  ] } }, ["Write an API", "Debug this code"]);
  const content = sections.map(([line]) => line).join("\n");
  assert.match(content, /Q2: Debug this code/);
  assert.match(content, /Q1: Write an API/);
  assert.match(content, /Q99: Question text unavailable/);
});

test("long paragraphs and unbroken code stay within page width", async () => {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (const line of wrapLine(`A long question ${"backend architecture ".repeat(100)}\n${"x".repeat(400)}`, font, 11, 500)) {
    assert.ok(font.widthOfTextAtSize(line, 11) <= 500.01, line);
  }
});

test("both report types produce readable multipage PDF files", async () => {
  const longText = "Explain scalable APIs and describe your implementation. ".repeat(120);
  for (const bytes of [await createPdf({ analysis: { per_question_feedback: [{ question: longText, answer_summary: longText }] } }),
    await createCodingPdf({ evaluation: { per_question: [{ id: 1, score: 0, feedback: longText }] } }, [longText])]) {
    const pdf = await PDFDocument.load(bytes);
    assert.ok(pdf.getPageCount() > 1);
  }
});
