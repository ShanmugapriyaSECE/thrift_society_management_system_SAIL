const db = require('./db');

async function investigate() {
  try {
    // Check loan 9123 duplicates
    console.log('=== LOAN 9123 DUPLICATE RECORDS ===');
    const [dupRows] = await db.query('SELECT s_no, empno, loan_no, empname, date_of_loan, loan_amt, inst_amt, interestnumber, current_balance FROM ects_loan_master WHERE loan_no = 9123');
    dupRows.forEach(r => {
      console.log(`  EMP: ${r.empno} | Name: ${r.empname} | Date: ${r.date_of_loan} | LoanAmt: ${r.loan_amt} | Balance: ${r.current_balance}`);
    });

    // Check interest deviations with actual loan dates
    console.log('\n=== INTEREST DEVIATIONS - WITH DATE-BASED CALCULATION ===');
    const [intRows] = await db.query(`
      SELECT s_no, empno, loan_no, date_of_loan, loan_amt, inst_amt, interestnumber, current_balance,
             DATEDIFF('2026-03-31', date_of_loan) AS days_since_loan,
             ROUND((current_balance + inst_amt) * 0.11 * DATEDIFF('2026-03-31', date_of_loan) / 365) AS expected_by_date,
             ROUND((current_balance + inst_amt) * 0.11 * 30 / 365) AS expected_30d,
             ROUND((current_balance + inst_amt) * 0.11 * 31 / 365) AS expected_31d
      FROM ects_loan_master
      WHERE ABS(interestnumber - ROUND((current_balance + inst_amt) * 0.11 * 31 / 365)) > 1
      ORDER BY s_no
    `);
    intRows.forEach(r => {
      console.log('  EMP:', r.empno, '| LN:', r.loan_no, '| Date:', r.date_of_loan, '| DaysSince:', r.days_since_loan);
      console.log('    ActualInt:', r.interestnumber, '| Exp(30d):', r.expected_30d, '| Exp(31d):', r.expected_31d, '| Exp(ByDate):', r.expected_by_date);
    });

    // Check if all interest deviations share the same interest value (suggests a special fixed schedule)
    console.log('\n=== GROUPED INTEREST VALUES FOR DEVIATING LOANS ===');
    const [groupedInt] = await db.query(`
      SELECT interestnumber, COUNT(*) AS cnt
      FROM ects_loan_master
      WHERE ABS(interestnumber - ROUND((current_balance + inst_amt) * 0.11 * 31 / 365)) > 1
      GROUP BY interestnumber
      ORDER BY cnt DESC
    `);
    console.log('Grouped by interest amount:', groupedInt);

    // Check staging for E020851 (one of the deviating records) to confirm data was loaded correctly
    console.log('\n=== STAGING RECORD FOR E020851 ===');
    const [stgRows] = await db.query("SELECT * FROM staging_recovery_schedule WHERE empno = 'E020851'");
    console.log('Staging:', stgRows[0]);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
investigate();
