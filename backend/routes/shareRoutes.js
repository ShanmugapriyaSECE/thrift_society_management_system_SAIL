const express = require("express");
const router = express.Router();

const {
  getAllShares,
  getMemberShares,
  getShareTransactions,
  addShare
} = require("../controllers/shareController");

router.get(
  "/",
  getAllShares
);

router.get(
  "/:memberId",
  getMemberShares
);

router.get(
  "/:memberId/transactions",
  getShareTransactions
);

router.post(
  "/:memberId",
  addShare
);

module.exports = router;