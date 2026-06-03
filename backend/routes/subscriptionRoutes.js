const express = require("express");
const router = express.Router();

const {
  getAllSubscriptions,
  getSubscription,
  addMonthlySubscription,
  getYearlyReport
} = require("../controllers/subscriptionController");

router.get("/", getAllSubscriptions);
router.get("/report/yearly", getYearlyReport);
router.get("/:emp", getSubscription);
router.put("/:emp", addMonthlySubscription);

module.exports = router;
