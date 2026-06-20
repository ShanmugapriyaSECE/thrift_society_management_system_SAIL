const db = require('./db');

async function validate() {
  console.log('=== RUNNING IMPORT VALIDATION ===');
  
  let failed = false;
  
  function assert(condition, message) {
    if (!condition) {
      console.error(`  [FAIL] ${message}`);
      failed = true;
    } else {
      console.log(`  [PASS] ${message}`);
    }
  }

  try {
    // 1. Check Row Counts
    console.log('\n--- Checking Row Counts ---');
    const [[{ count: masterCount }]] = await db.query('SELECT COUNT(*) AS count FROM ects_master');
    const [[{ count: memberCount }]] = await db.query('SELECT COUNT(*) AS count FROM members');
    const [[{ count: loanMasterCount }]] = await db.query('SELECT COUNT(*) AS count FROM ects_loan_master');
    const [[{ count: loanCount }]] = await db.query('SELECT COUNT(*) AS count FROM loans');
    const [[{ count: divCount }]] = await db.query('SELECT COUNT(*) AS count FROM ects_dividend');
    const [[{ count: stgRegCount }]] = await db.query('SELECT COUNT(*) AS count FROM staging_deposit_register');
    const [[{ count: stgLoanCount }]] = await db.query('SELECT COUNT(*) AS count FROM staging_recovery_schedule');
    const [[{ count: stgDivCount }]] = await db.query('SELECT COUNT(*) AS count FROM staging_dividend');
    
    assert(masterCount === 640, `ects_master count is ${masterCount}, expected 640 (576 register + 2 extra borrowers + 62 extra dividend earners)`);
    assert(memberCount === 640, `members count is ${memberCount}, expected 640`);
    assert(loanMasterCount === 250, `ects_loan_master count is ${loanMasterCount}, expected 250`);
    assert(loanCount === 250, `loans count is ${loanCount}, expected 250`);
    assert(divCount === 629, `ects_dividend count is ${divCount}, expected 629`);
    
    assert(stgRegCount === 576, `staging_deposit_register count is ${stgRegCount}, expected 576`);
    assert(stgLoanCount === 250, `staging_recovery_schedule count is ${stgLoanCount}, expected 250`);
    assert(stgDivCount === 629, `staging_dividend count is ${stgDivCount}, expected 629`);

    // 2. Check Sums
    console.log('\n--- Checking Financial Sums ---');
    const [[{ sum: totalDiv }]] = await db.query('SELECT SUM(ds_tot) AS sum FROM ects_dividend');
    const [[{ sum: totalInterestStg }]] = await db.query('SELECT SUM(interest) AS sum FROM staging_deposit_register');
    const [[{ sum: totalInterestProduction }]] = await db.query('SELECT SUM(interestnumber) AS sum FROM ects_loan_master');
    const [[{ sum: totalLoanBalance }]] = await db.query('SELECT SUM(loan_balance) AS sum FROM ects_loan_master');
    const [[{ sum: totalCurrentBalance }]] = await db.query('SELECT SUM(current_balance) AS sum FROM ects_loan_master');
    
    assert(Math.round(totalDiv) === 3288470, `Total dividend is ${totalDiv}, expected exactly 3,288,470`);
    assert(Math.round(totalInterestStg) === 10369236, `Total interest in deposit register staging is ${totalInterestStg}, expected exactly 10,369,236`);
    
    // Check if ects_loan_master's current_balance matches loan_balance
    assert(totalLoanBalance === totalCurrentBalance, `Total loan balance (${totalLoanBalance}) does not match total current balance (${totalCurrentBalance})`);
    console.log(`  Total Active Loan Outstanding Balance: ${totalCurrentBalance}`);
    console.log(`  Total Dividend Payout: ${totalDiv}`);
    console.log(`  Total Thrift Deposit Interest: ${totalInterestStg}`);

    // 3. Null Checks
    console.log('\n--- Checking Mandatory Fields for Nulls ---');
    const [[{ count: nullEmps }]] = await db.query('SELECT COUNT(*) AS count FROM ects_master WHERE emp IS NULL OR emp = ""');
    const [[{ count: nullNames }]] = await db.query('SELECT COUNT(*) AS count FROM ects_master WHERE name IS NULL OR name = ""');
    const [[{ count: nullLoanEmps }]] = await db.query('SELECT COUNT(*) AS count FROM ects_loan_master WHERE empno IS NULL OR empno = ""');
    const [[{ count: nullLoanNos }]] = await db.query('SELECT COUNT(*) AS count FROM ects_loan_master WHERE loan_no IS NULL');
    
    assert(nullEmps === 0, `${nullEmps} records in ects_master have NULL employee numbers`);
    assert(nullNames === 0, `${nullNames} records in ects_master have NULL names`);
    assert(nullLoanEmps === 0, `${nullLoanEmps} records in ects_loan_master have NULL employee numbers`);
    assert(nullLoanNos === 0, `${nullLoanNos} records in ects_loan_master have NULL loan numbers`);

    // 4. Duplicate Checks
    console.log('\n--- Checking for Duplicate Primary/Unique Keys ---');
    const [[{ count: dupMaster }]] = await db.query('SELECT COUNT(emp) - COUNT(DISTINCT emp) AS count FROM ects_master');
    const [[{ count: dupLoanPairs }]] = await db.query('SELECT COUNT(*) AS count FROM (SELECT loan_no, GROUP_CONCAT(DISTINCT empno ORDER BY empno) AS emps FROM ects_loan_master GROUP BY loan_no HAVING COUNT(*) > 1 AND COUNT(DISTINCT empno) > 1) t');
    const [[{ count: dupDiv }]] = await db.query('SELECT COUNT(empno) - COUNT(DISTINCT empno) AS count FROM ects_dividend');
    
    assert(dupMaster === 0, `Found ${dupMaster} duplicate employee records in ects_master`);
    // NOTE: loan_no 9123 is shared by L001260 and L001273 in the source CSV - this is expected source data
    assert(dupLoanPairs <= 1, `Found ${dupLoanPairs} pairs of DIFFERENT employees sharing a loan number (expected at most 1 known source-data case: loan 9123)`);
    assert(dupDiv === 0, `Found ${dupDiv} duplicate employee records in ects_dividend`);

    // 5. Business Logic & Formula Audit
    console.log('\n--- Auditing Calculations and Business Rules ---');
    
    // Check if total deduction equals installment amount + interest
    const [deductionFails] = await db.query('SELECT s_no, empno, tot_deduc, inst_amt, interestnumber FROM ects_loan_master WHERE ABS(tot_deduc - (inst_amt + interestnumber)) > 0.01');
    assert(deductionFails.length === 0, `Found ${deductionFails.length} loans where total deduction != installment + interest`);
    if (deductionFails.length > 0) {
      console.log('Sample deduction failures:', deductionFails.slice(0, 3));
    }
    
    // Check interest against actual loan date (days from loan date to report date 2026-03-31)
    // This is the real formula used in the source: principal_outstanding * 0.11 * actual_days / 365
    // We allow ±2 rupees tolerance for rounding
    const [interestFails] = await db.query(`
      SELECT s_no, empno, interestnumber, current_balance, inst_amt, date_of_loan,
             DATEDIFF('2026-03-31', date_of_loan) AS actual_days,
             ROUND((current_balance + inst_amt) * 0.11 * DATEDIFF('2026-03-31', date_of_loan) / 365) AS expected_interest
      FROM ects_loan_master
      WHERE DATEDIFF('2026-03-31', date_of_loan) BETWEEN 1 AND 31
        AND ABS(interestnumber - ROUND((current_balance + inst_amt) * 0.11 * DATEDIFF('2026-03-31', date_of_loan) / 365)) > 2
    `);
    assert(interestFails.length === 0, `Found ${interestFails.length} newly-disbursed loans (≤31 days old) where interest deviates from actual-day formula by >₹2`);
    if (interestFails.length > 0) {
      console.log('Sample interest deviations (new loans only):', interestFails.slice(0, 3));
    }
    
    // For loans > 31 days old, check against standard 30-day month calculation
    const [interestFails30] = await db.query(`
      SELECT s_no, empno, interestnumber, current_balance, inst_amt
      FROM ects_loan_master
      WHERE DATEDIFF('2026-03-31', date_of_loan) > 31
        AND ABS(interestnumber - ROUND((current_balance + inst_amt) * 0.11 * 31 / 365)) > 2
        AND ABS(interestnumber - ROUND((current_balance + inst_amt) * 0.11 * 30 / 365)) > 2
    `);
    assert(interestFails30.length === 0, `Found ${interestFails30.length} established loans where interest deviates from both 30-day and 31-day formulas`);
    if (interestFails30.length > 0) {
      console.log('Sample interest deviations (established loans):', interestFails30.slice(0, 3));
    }
    
    // Check if master table loan balances match active loan balances
    const [balanceFails] = await db.query(`
      SELECT m.emp, m.ects_loan_bal, COALESCE(l.current_balance, 0) AS actual_balance
      FROM ects_master m
      LEFT JOIN ects_loan_master l ON m.emp = l.empno
      WHERE ABS(m.ects_loan_bal - COALESCE(l.current_balance, 0)) > 0.01
    `);
    assert(balanceFails.length === 0, `Found ${balanceFails.length} members whose master table loan balance != active loan table balance`);
    if (balanceFails.length > 0) {
      console.log('Sample balance mismatches:', balanceFails.slice(0, 3));
    }

    console.log('\n--- Final Validation Outcome ---');
    if (failed) {
      console.error('=== VALIDATION FAILED! Please review issues above ===');
      process.exit(1);
    } else {
      console.log('=== VALIDATION SUCCESSFUL! All integrity, count, sum, and formula checks passed! ===');
      process.exit(0);
    }
    
  } catch (err) {
    console.error('Validation error encountered:', err);
    process.exit(1);
  }
}

validate();
