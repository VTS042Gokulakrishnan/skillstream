const express = require("express");
const router = express.Router();
const reportController = require("../controller/reportController");
const { allAccessAdmin } = require("../middleware/allAccessAdmin");

router.get(
  "/employer-activity",
  allAccessAdmin,
  reportController.employerActivityReport
);
router.get(
  "/candidate-activity",
  allAccessAdmin,
  reportController.candidateActivityReport
);

// If you want a JSON-only endpoint (counts)
router.get(
  "/employer-activity-counts",
  allAccessAdmin,
  reportController.employerActivityCounts
);
router.get(
  "/candidate-activity-counts",
  allAccessAdmin,
  reportController.candidateActivityCounts
);

router.get(
  "/get/employers-list",
  allAccessAdmin,
  reportController.getEmployerList
);
router.get(
  "/get/candidates-list",
  allAccessAdmin,
  reportController.getCandidateList
);

router.post(
  "/extend-trial",
  allAccessAdmin,
  reportController.extendFreeTrial
);
router.post(
  "/end-trial",
  allAccessAdmin,
  reportController.endTrial
);
router.post(
  "/allow-cross-origin",
  allAccessAdmin,
  reportController.allowCrossOrigin
);
router.post(
  "/revoke-cross-origin",
  allAccessAdmin,
  reportController.revokeCrossOrigin
);

module.exports = router;
