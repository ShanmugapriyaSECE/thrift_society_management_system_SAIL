const express = require("express");
const router = express.Router();

const {
  getAllSubscriptions,
  getSubscription,
  addMonthlySubscription,
  getYearlyReport,
  processMonthlySubscriptions
} = require("../controllers/subscriptionController");

router.get("/", getAllSubscriptions);

router.get(
  "/report/yearly",
  getYearlyReport
);

router.get(
  "/:emp",
  getSubscription
);

router.put(
  "/:emp",
  addMonthlySubscription
);

router.post(
  "/process",
  processMonthlySubscriptions
);

module.exports = router;