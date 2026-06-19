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
    const {
      empno,
      empname,
      desig,
      memno,
      loan_amt,
      inst_amt,
      tot_nstalments,
      mnyr
    } = req.body;

    const days = 30;
    const interestnumber = parseFloat(loan_amt) * 0.11 * days / 365;
    const tot_deduc = parseFloat(inst_amt) + interestnumber;

    const loan_balance = parseFloat(loan_amt);

    await db.query(
      `INSERT INTO ects_loan_master
      (
        empno,
        empname,
        desig,
        memno,
        date_of_loan,
        loan_amt,
        inst_amt,
        tot_nstalments,
        inst_no,
        interestnumber,
        tot_deduc,
        loan_balance,
        current_balance,
        emi_amount,
        status,
        mnyr
      )
      VALUES
      (
        ?, ?, ?, ?, CURDATE(),
        ?, ?, ?, 1,
        ?, ?, ?,
        ?, ?, 'Active',
        ?
      )`,
      [
        empno,
        empname,
        desig,
        memno,
        loan_amt,
        inst_amt,
        tot_nstalments,
        interestnumber,
        tot_deduc,
        loan_balance,
        loan_balance,
        inst_amt,
        mnyr
      ]
    );

    res.status(201).json({
      message: "Loan added successfully",
      interestnumber,
      tot_deduc,
      loan_balance,
      current_balance: loan_balance,
      emi_amount: inst_amt
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.processMonthlyLoans = async (req, res) => {
  try {
    const { process_month } = req.body;

    // 1. Validate input
    if (!process_month) {
      return res.status(400).json({
        message: "process_month is required"
      });
    }

    // 2. Duplicate protection — prevent re-processing same month
    const [existing] = await db.query(
      `SELECT process_id FROM loan_process WHERE process_month = ? LIMIT 1`,
      [process_month]
    );
    if (existing.length > 0) {
      return res.status(400).json({
        message: `Loans already processed for ${process_month}`
      });
    }

    // 3. Fetch only required columns for active loans
    const [loans] = await db.query(`
      SELECT loan_no, empno, loan_amt, emi_amount, current_balance
      FROM ects_loan_master
      WHERE status = 'Active'
    `);

    // 4. Early exit if nothing to process
    if (loans.length === 0) {
      return res.status(200).json({
        message: "No active loans found to process",
        processed: 0
      });
    }

    // 5. Begin transaction — inserts and updates are all-or-nothing
    await db.beginTransaction();

    let processed = 0;
    const skippedLoans = [];

    try {
      for (const loan of loans) {
        const currentBalance = parseFloat(loan.current_balance || 0);
        const emiAmount = parseFloat(loan.emi_amount || 0);

        // Skip loans with no valid EMI
        if (emiAmount <= 0) {
          skippedLoans.push(loan.loan_no);
          continue;
        }

        // Round to 2 decimal places to avoid float precision drift
        const newBalance = parseFloat(
          Math.max(0, currentBalance - emiAmount).toFixed(2)
        );
        const newStatus = newBalance === 0 ? "Closed" : "Active";

        // Insert process history (includes processed_date)
        await db.query(
          `INSERT INTO loan_process (
             process_month,
             employee_no,
             loan_no,
             loan_amount,
             emi_amount,
             current_balance,
             status,
             processed_date
           ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            process_month,
            loan.empno,
            loan.loan_no,
            loan.loan_amt,
            emiAmount,
            newBalance,
            newStatus
          ]
        );

        // Update master table balance and status
        await db.query(
          `UPDATE ects_loan_master
           SET current_balance = ?,
               status = ?
           WHERE loan_no = ?`,
          [newBalance, newStatus, loan.loan_no]
        );

        processed++;
      }

      // All operations succeeded — commit
      await db.commit();

      res.status(200).json({
        message: "Monthly loan processing completed",
        processed,
        skipped: skippedLoans.length,
        ...(skippedLoans.length > 0 && { skipped_loans: skippedLoans })
      });

    } catch (innerError) {
      // Any failure — roll back everything
      await db.rollback();
      throw innerError;
    }

  } catch (error) {
    console.error("processMonthlyLoans error:", error);
    res.status(500).json({ message: error.message });
  }
};
