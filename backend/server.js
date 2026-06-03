const express = require('express');
const db = require('./db');

const app = express();

app.use(express.json());

/* ===== GET API ===== */
app.get('/api/loans', (req, res) => {
  const sql = 'SELECT * FROM loans';

  db.query(sql, (err, result) => {
    if (err) {
      console.error("GET Error:", err);
      return res.status(500).json({ message: 'Error fetching loans' });
    }

    res.json(result);
  });
});

/* ===== POST API (WITH CALCULATIONS) ===== */
app.post('/api/loans', (req, res) => {
  const {
    employee_no,
    member_no,
    loan_amount,
    installment_amount,
    total_installments
  } = req.body;

  // 🔢 Calculations
  const interest = loan_amount * 0.11 * (30 / 365);
  const total_deduction = installment_amount + interest;
  const loan_balance = loan_amount - installment_amount;
  const shares_allotted = loan_amount * 0.05;

  const sql = `
    INSERT INTO loans 
    (
      employee_no,
      member_no,
      loan_amount,
      installment_amount,
      total_installments,
      interest,
      total_deduction,
      loan_balance,
      shares_allotted
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      employee_no,
      member_no,
      loan_amount,
      installment_amount,
      total_installments,
      interest,
      total_deduction,
      loan_balance,
      shares_allotted
    ],
    (err, result) => {
      if (err) {
        console.error("POST Error:", err);
        return res.status(500).json({ message: 'Insert failed' });
      }

      res.json({
        message: 'Loan added successfully',
        interest,
        total_deduction,
        loan_balance,
        shares_allotted
      });
    }
  );
});

/* ===== SERVER ===== */
app.listen(5000, () => {
  console.log('Server running on port 5000');
});
/* ===== UPDATE API ===== */
app.put('/api/loans/:id', (req, res) => {
  const { id } = req.params;

  const {
    loan_amount,
    installment_amount,
    total_installments
  } = req.body;

  // 🔢 Recalculate values
  const interest = loan_amount * 0.11 * (30 / 365);
  const total_deduction = installment_amount + interest;
  const loan_balance = loan_amount - installment_amount;
  const shares_allotted = loan_amount * 0.05;

  const sql = `
    UPDATE loans SET
      loan_amount = ?,
      installment_amount = ?,
      total_installments = ?,
      interest = ?,
      total_deduction = ?,
      loan_balance = ?,
      shares_allotted = ?
    WHERE loan_no = ?
  `;

  db.query(
    sql,
    [
      loan_amount,
      installment_amount,
      total_installments,
      interest,
      total_deduction,
      loan_balance,
      shares_allotted,
      id
    ],
    (err, result) => {
      if (err) {
        console.error("UPDATE Error:", err);
        return res.status(500).json({ message: 'Update failed' });
      }

      res.json({ message: 'Loan updated successfully' });
    }
  );
});
/* ===== DELETE API ===== */
app.delete('/api/loans/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM loans WHERE loan_no = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("DELETE Error:", err);
      return res.status(500).json({ message: 'Delete failed' });
    }

    res.json({ message: 'Loan deleted successfully' });
  });
});