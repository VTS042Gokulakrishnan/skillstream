const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");
const fs = require("fs");
const path = require("path");

const text = (value) => value == null ? "N/A" : String(value);
const list = (value, separator = ", ") => Array.isArray(value) ? value.join(separator) : text(value);

function videoSections(summary = {}) {
  const analysis = summary?.analysis || {};
  const lines = [
    ["Interview Result Summary", "title"],
    [`Score: ${text(analysis.score)}`, "bold"],
    [`Next Round Eligibility: ${text(analysis.next_round_eligibility)}`, "bold"],
    [`Focus Category: ${text(summary?.focus_category)}`],
    [`Camera Summary: ${text(summary?.camera_summary)}`],
    [`Gadget Summary: ${text(summary?.gadget_summary)}`],
    ["Question Feedback", "heading"],
  ];
  for (const value of Object.values(analysis.per_question_feedback || {})) {
    if (!value || value.skipped || !value.question) continue;
    lines.push([`Q: ${value.question}`, "bold"], [`Summary: ${text(value.answer_summary)}`]);
    for (const [key, label] of [["strengths", "Strengths"], ["areas_for_improvement", "Areas for Improvement"], ["evidence", "Evidence"]]) {
      if (value[key]?.length) lines.push([`${label}: ${list(value[key], key === "evidence" ? " | " : ", ")}`]);
    }
    lines.push([""]);
  }
  lines.push([`Communication Clarity: ${text(analysis.communication_clarity)}`, "bold"]);
  return lines;
}

function codingSections(summary = {}, questions = []) {
  const evaluation = summary?.evaluation || {};
  const lines = [["Coding Interview Feedback", "title"],
    [`Total Score: ${text(evaluation.total_score)}`, "bold"],
    [`Final Feedback: ${text(evaluation.final_feedback)}`],
    [`Decision: ${text(evaluation.decision)}`, "bold"], ["Question Feedback", "heading"]];
  const entries = Array.isArray(evaluation.per_question) ? evaluation.per_question : [];
  for (const [index, item] of entries.entries()) {
    if (!item) continue;
    // The evaluator uses one-based question IDs. Never attach another question to an unknown ID.
    const id = item.id == null ? index + 1 : Number(String(item.id).replace(/^Q/i, ""));
    const original = Number.isInteger(id) && id > 0 ? questions[id - 1] : null;
    const question = typeof original === "string" ? original : original?.question;
    lines.push([`Q${text(item.id ?? index + 1)}: ${question || item.question || "Question text unavailable"}`, "bold"],
      [`Score: ${text(item.score)}`], [`Feedback: ${text(item.feedback)}`], [""]);
  }
  return lines;
}

// Break even long code tokens, preserve explicit newlines, and paginate every rendered line.
function wrapLine(value, font, size, width) {
  const result = [];
  for (const paragraph of String(value).replace(/\t/g, "    ").split(/\r?\n/)) {
    let line = "";
    for (const word of paragraph.split(/(\s+)/)) {
      for (const char of word) {
        if (line && font.widthOfTextAtSize(line + char, size) > width) {
          const lastSpace = line.lastIndexOf(" ");
          if (lastSpace > 0 && !/\s/.test(char)) {
            result.push(line.slice(0, lastSpace));
            line = line.slice(lastSpace + 1);
          } else { result.push(line.trimEnd()); line = ""; }
        }
        line += char;
      }
    }
    result.push(line.trimEnd());
  }
  return result;
}

async function renderSections(lines) {
  const doc = await PDFDocument.create();
  let regular, bold;
  if (lines.some(([value]) => /[^\x09\x0a\x0d\x20-\x7e]/.test(value))) {
    doc.registerFontkit(fontkit);
    regular = await doc.embedFont(fs.readFileSync(path.join(__dirname, "../assets/fonts/NotoSans-Regular.ttf")), { subset: true });
    bold = regular;
  } else {
    regular = await doc.embedFont(StandardFonts.Helvetica);
    bold = await doc.embedFont(StandardFonts.HelveticaBold);
  }
  let page = doc.addPage([600, 700]), y = 650;
  for (const [value, style] of lines) {
    const size = style === "title" ? 16 : style === "heading" ? 13 : 11;
    const font = style ? bold : regular;
    if (style === "heading") y -= 10;
    for (const line of wrapLine(value, font, size, 500)) {
      if (y < 50 + 17) { page = doc.addPage([600, 700]); y = 650; }
      page.drawText(line, { x: 50, y, size, font, color: rgb(0, 0, 0) });
      y -= size + 6;
    }
    if (style === "title") y -= 12;
  }
  return doc.save();
}

module.exports = {
  createPdf: (summary) => renderSections(videoSections(summary)),
  createCodingPdf: (summary, questions) => renderSections(codingSections(summary, questions)),
  videoSections, codingSections, wrapLine,
};
