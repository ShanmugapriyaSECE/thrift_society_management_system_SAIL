const db = require("../db");

exports.getLoans = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM ects_loan_master");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addLoan = async (req, res) => {
  try {
    const { empno, empname, desig, memno, loan_amt, inst_amt, tot_nstalments, mnyr } = req.body;

    const days = 30;
    const interest = parseFloat(loan_amt) * 0.11 * days / 365;
    const tot_deduc = parseFloat(inst_amt) + interest;
    const loan_balance = parseFloat(loan_amt) - parseFloat(inst_amt);

    const [result] = await db.query(
      `INSERT INTO ects_loan_master
        (empno, empname, desig, memno, date_of_loan, loan_amt, inst_amt, tot_nstalments, inst_no, interest, tot_deduc, loan_balance, mnyr)
        VALUES (?, ?, ?, ?, CURDATE(), ?, ?, ?, 1, ?, ?, ?, ?)`,
      [empno, empname, desig, memno, loan_amt, inst_amt, tot_nstalments, interest, tot_deduc, loan_balance, mnyr]
    );

    res.status(201).json({ message: "Loan added successfully", interest, tot_deduc, loan_balance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
