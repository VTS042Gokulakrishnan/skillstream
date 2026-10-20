const express = require("express");
const router = express.Router();
const {
  reumeParserAI,
  resumeParserNLP,
  generateJobDescription,
  speechToText,
  textToSpeech,
  generatelinkedInPost,
  resumeParserAIMultiple,
  getSkillsFromDescription,
} = require("../controller/resumeParser");

router.post("/openAI/storeData", reumeParserAI);
router.post("/openAI/multiple/storeData", resumeParserAIMultiple);
router.post("/NLP/storeData", resumeParserNLP);
router.post("/generate/description", generateJobDescription);
router.post("/generate/skills", getSkillsFromDescription);

router.post("/generate/linkedin", generatelinkedInPost);
router.post("/convert/stt", speechToText);
router.post("/convert/tts", textToSpeech);

module.exports = router;
