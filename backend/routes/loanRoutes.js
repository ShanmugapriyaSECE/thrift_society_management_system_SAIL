const express = require("express");

const router = express.Router();

const {
    getLoans,
    addLoan,
    processMonthlyLoans
} = require("../controllers/loanController");

router.get("/", getLoans);

router.post("/", addLoan);

router.post("/process-monthly", processMonthlyLoans);

module.exports = router;