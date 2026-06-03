const express = require("express");

const router = express.Router();

const {
    getLoans,
    addLoan
} = require("../controllers/loanController");

router.get("/", getLoans);

router.post("/", addLoan);

module.exports = router;