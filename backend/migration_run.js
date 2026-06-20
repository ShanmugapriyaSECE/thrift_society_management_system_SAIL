const fs = require('fs');
const path = require('path');
const db = require('./db');

const DATA_DIR = 'd:\\Steel';

// --- Parsers ---

function parseDepositRegister(line) {
  const clean = line.replace(/^"|"$/g, '');
  if (clean.length < 50) return null;
  if (clean.startsWith('---') || clean.includes('THRIFT DEPOSIT') || clean.includes('S.NO MNO.') || clean.includes('\f')) {
    return null;
  }
  const parts = clean.trim().split(/\s+/);
  if (parts.length < 18) return null;
  
  const s_no = parseInt(parts[0]);
  if (isNaN(s_no)) return null;
  
  const empIdx = parts.findIndex(p => /^[A-Z]\d{6}$/.test(p));
  if (empIdx === -1) return null;
  
  const empno = parts[empIdx];
  const mno = empIdx > 1 ? parseInt(parts[empIdx - 1]) : null;
  
  const numParts = parts.slice(-16).map(parseFloat);
  if (numParts.some(isNaN)) return null;
  
  const name = parts.slice(empIdx + 1, parts.length - 16).join(' ');
  
  return {
    s_no,
    mno,
    empno,
    name,
    opn_bal: numParts[0],
    apr: numParts[1],
    may: numParts[2],
    jun: numParts[3],
    jul: numParts[4],
    aug: numParts[5],
    sep: numParts[6],
    oct: numParts[7],
    nov: numParts[8],
    dec: numParts[9],
    jan: numParts[10],
    feb: numParts[11],
    mar: numParts[12],
    dep: numParts[13],
    cl_bal: numParts[14],
    interest: numParts[15]
  };
}

function parsePR400P(line) {
  const clean = line.replace(/^"|"$/g, '');
  if (clean.trim().length === 0 || clean.startsWith('---') || clean.includes('RECOVERY SCHEDULE') || clean.includes('S.NO  EMP.NO')) {
    return null;
  }
  
  const match = clean.match(/(\d{2}\/\d{2}\/\d{4})/);
  if (!match) return null;
  
  const dateStr = match[0];
  const dateIndex = clean.indexOf(dateStr);
  const leftPart = clean.substring(0, dateIndex).trim();
  const rightPart = clean.substring(dateIndex).trim();
  
  const leftParts = leftPart.split(/\s+/);
  if (leftParts.length < 5) return null;
  
  const s_no_str = leftParts[0];
  const s_no = parseInt(s_no_str);
  const empno = leftParts[1];
  const loan_no = parseInt(leftParts[2]);
  
  const shift = s_no_str.length - 1;
  const loanNoIndex = leftPart.indexOf(leftParts[2]) + leftParts[2].length;
  const detailsText = leftPart.substring(loanNoIndex).trim();
  
  const lastSpace = detailsText.lastIndexOf(' ');
  if (lastSpace === -1) return null;
  const memnoStr = detailsText.substring(lastSpace).trim();
  const memno = parseInt(memnoStr);
  
  const nameStart = 16 + shift;
  const desigStart = 37 + shift;
  const empname = clean.substring(nameStart, desigStart).trim();
  
  const memnoIndex = clean.indexOf(memnoStr, desigStart);
  if (memnoIndex === -1) return null;
  const desig = clean.substring(desigStart, memnoIndex).trim();
  
  const rightParts = rightPart.split(/\s+/);
  if (rightParts.length !== 7) return null;
  
  const date_of_loan = rightParts[0];
  const loan_amt = parseFloat(rightParts[1]);
  const inst_no = parseInt(rightParts[2]);
  const inst_amt = parseFloat(rightParts[3]);
  const interest = parseFloat(rightParts[4]);
  const tot_rec = parseFloat(rightParts[5]);
  const ln_bal = parseFloat(rightParts[6]);
  
  if (isNaN(s_no) || isNaN(loan_no) || isNaN(memno) || isNaN(loan_amt) || isNaN(inst_no) || isNaN(inst_amt) || isNaN(interest) || isNaN(tot_rec) || isNaN(ln_bal)) {
    return null;
  }
  
  return {
    s_no, empno, loan_no, empname, desig, memno, date_of_loan, loan_amt, inst_no, inst_amt, interest, tot_rec, ln_bal
  };
}

function parseDividend(line) {
  const clean = line.replace(/^"|"$/g, '');
  if (clean.trim().length === 0 || clean.startsWith('---') || clean.includes('DIVIDEND PAYMENT') || clean.includes('S.NO COD') || clean.includes('TOTAL DVIDEND') || clean.includes('page :') || clean.includes('\f')) {
    return null;
  }
  const parts = clean.trim().split(/\s+/);
  if (parts.length < 7) return null;
  
  const s_no = parseInt(parts[0]);
  const cod = parts[1];
  const mno = parseInt(parts[2]);
  const empno = parts[3];
  const mnyr = parts[parts.length - 2];
  const ds_tot = parseFloat(parts[parts.length - 1]);
  const name = parts.slice(4, parts.length - 2).join(' ');
  
  if (isNaN(s_no) || isNaN(mno) || isNaN(ds_tot)) return null;
  
  return { s_no, cod, mno, empno, name, mnyr, ds_tot };
}

function parsePR200P(line) {
  const clean = line.replace(/^"|"$/g, '');
  if (clean.trim().length === 0 || clean.startsWith('---') || clean.includes('STATEMENT OF SUBSCRIPTION') || clean.includes('S.NO MR.NO')) {
    return null;
  }
  const parts = clean.trim().split(/\s+/);
  if (parts.length < 6) return null;
  
  const s_no = parseInt(parts[0]);
  if (isNaN(s_no)) return null;
  
  const empIdx = parts.findIndex(p => /^[A-Z]\d{6}$/.test(p));
  if (empIdx === -1) return null;
  
  const empno = parts[empIdx];
  const mr_no = empIdx > 1 ? parseInt(parts[empIdx - 1]) : null;
  
  const rightNums = parts.slice(-4).map(parseFloat);
  if (rightNums.some(isNaN)) return null;
  
  const dept = parts[parts.length - 5];
  const name = parts.slice(empIdx + 1, parts.length - 5).join(' ');
  
  return { s_no, mr_no, empno, name, dept, subs_amt: rightNums[0], loan_amt: rightNums[1], total_amt: rightNums[2], cum_subs_amt: rightNums[3] };
}

// --- Main Migration Workflow ---

async function run() {
  console.log('=== STARTING DATA MIGRATION ===');
  
  try {
    // 1. Create Staging Tables
    console.log('\nCreating staging tables...');
    await db.query(`DROP TABLE IF EXISTS staging_deposit_register`);
    await db.query(`
      CREATE TABLE staging_deposit_register (
        s_no INT,
        mno INT,
        empno VARCHAR(50),
        name VARCHAR(255),
        opn_bal DECIMAL(15,2),
        \`apr\` DECIMAL(15,2),
        \`may\` DECIMAL(15,2),
        \`jun\` DECIMAL(15,2),
        \`jul\` DECIMAL(15,2),
        \`aug\` DECIMAL(15,2),
        \`sep\` DECIMAL(15,2),
        \`oct\` DECIMAL(15,2),
        \`nov\` DECIMAL(15,2),
        \`dec\` DECIMAL(15,2),
        \`jan\` DECIMAL(15,2),
        \`feb\` DECIMAL(15,2),
        \`mar\` DECIMAL(15,2),
        dep DECIMAL(15,2),
        cl_bal DECIMAL(15,2),
        interest DECIMAL(15,2)
      )
    `);
    
    await db.query(`DROP TABLE IF EXISTS staging_recovery_schedule`);
    await db.query(`
      CREATE TABLE staging_recovery_schedule (
        s_no INT,
        empno VARCHAR(50),
        loan_no INT,
        empname VARCHAR(255),
        desig VARCHAR(255),
        memno INT,
        date_of_loan VARCHAR(50),
        loan_amt DECIMAL(15,2),
        inst_no INT,
        inst_amt DECIMAL(15,2),
        interest DECIMAL(15,2),
        tot_rec DECIMAL(15,2),
        ln_bal DECIMAL(15,2)
      )
    `);
    
    await db.query(`DROP TABLE IF EXISTS staging_dividend`);
    await db.query(`
      CREATE TABLE staging_dividend (
        s_no INT,
        cod VARCHAR(50),
        mno INT,
        empno VARCHAR(50),
        name VARCHAR(255),
        mnyr VARCHAR(50),
        ds_tot DECIMAL(15,2)
      )
    `);
    
    await db.query(`DROP TABLE IF EXISTS staging_pr200p`);
    await db.query(`
      CREATE TABLE staging_pr200p (
        s_no INT,
        mr_no INT,
        empno VARCHAR(50),
        name VARCHAR(255),
        dept VARCHAR(100),
        subs_amt DECIMAL(15,2),
        loan_amt DECIMAL(15,2),
        total_amt DECIMAL(15,2),
        cum_subs_amt DECIMAL(15,2)
      )
    `);
    console.log('Staging tables created successfully.');
    
    // 2. Parse and Load CSVs to Staging
    console.log('\nLoading CSV files to staging...');
    
    // Staging Deposit Register
    const regLines = fs.readFileSync(path.join(DATA_DIR, 'ects_int_2026.csv'), 'utf8').split(/\r?\n/);
    let regCount = 0;
    for (const line of regLines) {
      const parsed = parseDepositRegister(line);
      if (parsed) {
        await db.query(`
          INSERT INTO staging_deposit_register VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `, [
          parsed.s_no, parsed.mno, parsed.empno, parsed.name, parsed.opn_bal,
          parsed.apr, parsed.may, parsed.jun, parsed.jul, parsed.aug, parsed.sep,
          parsed.oct, parsed.nov, parsed.dec, parsed.jan, parsed.feb, parsed.mar,
          parsed.dep, parsed.cl_bal, parsed.interest
        ]);
        regCount++;
      }
    }
    console.log(`Loaded ${regCount} deposit register records.`);
    
    // Staging Recovery Schedule
    const loanLines = fs.readFileSync(path.join(DATA_DIR, 'PR400P_0326.csv'), 'utf8').split(/\r?\n/);
    let loanCount = 0;
    for (const line of loanLines) {
      const parsed = parsePR400P(line);
      if (parsed) {
        await db.query(`
          INSERT INTO staging_recovery_schedule VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
        `, [
          parsed.s_no, parsed.empno, parsed.loan_no, parsed.empname, parsed.desig,
          parsed.memno, parsed.date_of_loan, parsed.loan_amt, parsed.inst_no,
          parsed.inst_amt, parsed.interest, parsed.tot_rec, parsed.ln_bal
        ]);
        loanCount++;
      }
    }
    console.log(`Loaded ${loanCount} recovery schedule records.`);
    
    // Staging Dividend
    const divLines = fs.readFileSync(path.join(DATA_DIR, 'ects_dividend_final_p06_21102024.csv'), 'utf8').split(/\r?\n/);
    let divCount = 0;
    for (const line of divLines) {
      const parsed = parseDividend(line);
      if (parsed) {
        await db.query(`
          INSERT INTO staging_dividend VALUES (?,?,?,?,?,?,?)
        `, [
          parsed.s_no, parsed.cod, parsed.mno, parsed.empno, parsed.name,
          parsed.mnyr, parsed.ds_tot
        ]);
        divCount++;
      }
    }
    console.log(`Loaded ${divCount} dividend records.`);
    
    // Staging PR200P
    const pr200Lines = fs.readFileSync(path.join(DATA_DIR, 'PR200P_0324.csv'), 'utf8').split(/\r?\n/);
    let pr200Count = 0;
    for (const line of pr200Lines) {
      const parsed = parsePR200P(line);
      if (parsed) {
        await db.query(`
          INSERT INTO staging_pr200p VALUES (?,?,?,?,?,?,?,?,?)
        `, [
          parsed.s_no, parsed.mr_no, parsed.empno, parsed.name, parsed.dept,
          parsed.subs_amt, parsed.loan_amt, parsed.total_amt, parsed.cum_subs_amt
        ]);
        pr200Count++;
      }
    }
    console.log(`Loaded ${pr200Count} PR200P records.`);
    
    // 3. Backup production tables
    console.log('\nCreating backups of production tables...');
    const tablesToBackup = ['ects_master', 'ects_loan_master', 'members', 'loans', 'loan_process'];
    for (const tbl of tablesToBackup) {
      const backupTbl = `${tbl}_backup_old`;
      await db.query(`DROP TABLE IF EXISTS ${backupTbl}`);
      await db.query(`CREATE TABLE ${backupTbl} LIKE ${tbl}`);
      await db.query(`INSERT INTO ${backupTbl} SELECT * FROM ${tbl}`);
      console.log(`  Backed up: ${tbl} -> ${backupTbl}`);
    }
    
    // 4. Create ects_dividend table in production
    console.log('\nSetting up ects_dividend production table...');
    await db.query(`DROP TABLE IF EXISTS ects_dividend`);
    await db.query(`
      CREATE TABLE ects_dividend (
        s_no INT,
        cod VARCHAR(50),
        mno INT,
        empno VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255),
        mnyr VARCHAR(50),
        ds_tot DECIMAL(15,2)
      )
    `);
    
    // 5. Populate ects_dividend table
    console.log('Migrating dividend staging to production...');
    await db.query(`
      INSERT INTO ects_dividend
      SELECT s_no, cod, mno, empno, name, mnyr, ds_tot FROM staging_dividend
    `);
    console.log('Dividend production table loaded.');
    
    // 6. Begin Transaction for Master and Loan tables to ensure consistency
    console.log('\nBeginning production migration transaction...');
    await db.beginTransaction();
    
    try {
      // Clear production tables
      await db.query(`TRUNCATE TABLE ects_loan_master`);
      await db.query(`TRUNCATE TABLE ects_master`);
      await db.query(`TRUNCATE TABLE members`);
      await db.query(`TRUNCATE TABLE loans`);
      // Note: We don't truncate loan_process to preserve schemas but we clear it as per reset rule
      await db.query(`TRUNCATE TABLE loan_process`);
      
      console.log('  Cleared production tables.');
      
      // We will perform a union of employees to create a comprehensive ects_master
      // 1. Gather all unique employees from Deposit Register
      const [registerRows] = await db.query(`SELECT * FROM staging_deposit_register`);
      const employeeMap = new Map(); // empno -> master data object
      
      for (const row of registerRows) {
        employeeMap.set(row.empno, {
          sno: row.s_no,
          emp: row.empno,
          mth: 'MAR',
          ects_sub: row.mar,
          ects_loan_bal: 0.00,
          cect_subs: row.cl_bal,
          cplb: 0.00,
          ects_memno: row.mno,
          father_name: null,
          address: null,
          aadhar: null,
          name: row.name
        });
      }
      
      // 2. Gather all unique employees from Recovery Schedule (loans)
      const [loanRows] = await db.query(`SELECT * FROM staging_recovery_schedule`);
      for (const row of loanRows) {
        if (employeeMap.has(row.empno)) {
          const empData = employeeMap.get(row.empno);
          empData.ects_loan_bal = row.ln_bal;
          empData.cplb = row.ln_bal;
        } else {
          // Missing borrower, create a new master member
          console.log(`  Adding missing borrower to ects_master: ${row.empno} (${row.empname})`);
          employeeMap.set(row.empno, {
            sno: null,
            emp: row.empno,
            mth: 'MAR',
            ects_sub: 0.00,
            ects_loan_bal: row.ln_bal,
            cect_subs: 0.00,
            cplb: row.ln_bal,
            ects_memno: row.memno,
            father_name: null,
            address: null,
            aadhar: null,
            name: row.empname
          });
        }
      }
      
      // 3. Gather all unique employees from Dividend Staging
      const [divStgRows] = await db.query(`SELECT * FROM staging_dividend`);
      for (const row of divStgRows) {
        if (!employeeMap.has(row.empno)) {
          // Missing dividend earner, create a new master member
          console.log(`  Adding missing dividend earner to ects_master: ${row.empno} (${row.name})`);
          employeeMap.set(row.empno, {
            sno: null,
            emp: row.empno,
            mth: 'MAR',
            ects_sub: 0.00,
            ects_loan_bal: 0.00,
            cect_subs: 0.00,
            cplb: 0.00,
            ects_memno: row.mno,
            father_name: null,
            address: null,
            aadhar: null,
            name: row.name
          });
        }
      }
      
      // Insert all members into ects_master and members
      console.log(`\nInserting ${employeeMap.size} members into ects_master and members...`);
      for (const m of employeeMap.values()) {
        await db.query(`
          INSERT INTO ects_master (sno, emp, mth, ects_sub, ects_loan_bal, cect_subs, cplb, ects_memno, father_name, address, aadhar, name)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          m.sno, m.emp, m.mth, m.ects_sub, m.ects_loan_bal, m.cect_subs, m.cplb,
          m.ects_memno, m.father_name, m.address, m.aadhar, m.name
        ]);
        
        await db.query(`
          INSERT INTO members (employee_no, member_name, subscription_amount)
          VALUES (?, ?, ?)
        `, [
          m.emp, m.name, m.ects_sub
        ]);
      }
      
      // Insert loan records into ects_loan_master and loans
      console.log(`Inserting ${loanRows.length} loan records into ects_loan_master and loans...`);
      for (const row of loanRows) {
        // Converted date
        // Date format in file: DD/MM/YYYY (e.g. 11/11/2025) -> YYYY-MM-DD
        const dateParts = row.date_of_loan.split('/');
        let formattedDate = null;
        if (dateParts.length === 3) {
          formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        }
        
        const status = row.ln_bal > 0 ? 'Active' : 'Closed';
        
        await db.query(`
          INSERT INTO ects_loan_master (
            s_no, empno, loan_no, empname, desig, memno, date_of_loan, loan_amt,
            inst_no, inst_amt, interestnumber, tot_deduc, loan_balance,
            tot_nstalments, mnyr, arr_int, arr_amt, receipt, emi_amount, current_balance, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          row.s_no, row.empno, row.loan_no, row.empname, row.desig, row.memno,
          formattedDate, row.loan_amt, row.inst_no, row.inst_amt, row.interest,
          row.tot_rec, row.ln_bal, null, 'Mar-26', 0, 0, 0, row.inst_amt, row.ln_bal, status
        ]);
        
        await db.query(`
          INSERT INTO loans (employee_no, loan_no, loan_amount)
          VALUES (?, ?, ?)
        `, [
          row.empno, row.loan_no, row.loan_amt
        ]);
      }
      
      await db.commit();
      console.log('Transaction committed successfully.');
      
    } catch (transactionErr) {
      await db.rollback();
      throw transactionErr;
    }
    
    console.log('\n=== MIGRATION COMPLETE ===');
    process.exit(0);
    
  } catch (err) {
    console.error('\n!!! MIGRATION FAILED !!!');
    console.error(err);
    process.exit(1);
  }
}

run();
