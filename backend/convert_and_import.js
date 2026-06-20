/**
 * convert_and_import.js
 *
 * Run this script ONCE to:
 * 1. Read the XLSX files from D:\Steel
 * 2. Convert them to real CSV
 * 3. Generate SQL INSERT statements → import.sql
 *
 * Usage (from D:\Steel\thrift-society-system\backend):
 *   node convert_and_import.js
 */

const XLSX = require('xlsx');
const fs   = require('fs');
const path = require('path');

const DATA_DIR  = 'D:\\Steel';
const OUT_DIR   = 'D:\\Steel';

function excelDateToMySQL(serial) {
  if (!serial || isNaN(serial)) return null;
  // Excel date serial → JS date
  const date = new Date((serial - 25569) * 86400 * 1000);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

function escape(val) {
  if (val === null || val === undefined || val === '') return 'NULL';
  const s = String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return `'${s}'`;
}

function numOrNull(val) {
  if (val === null || val === undefined || val === '') return 'NULL';
  const n = Number(val);
  return isNaN(n) ? 'NULL' : n;
}

// ─── ects_master ─────────────────────────────────────────────────────────────
console.log('\n=== Processing ects_master.csv (xlsx) ===');
const wb1   = XLSX.readFile(path.join(DATA_DIR, 'ects_master.csv'));
const ws1   = wb1.Sheets[wb1.SheetNames[0]];
const rows1 = XLSX.utils.sheet_to_json(ws1, { defval: null });

console.log('Columns detected:', Object.keys(rows1[0] || {}));
console.log('Row count:', rows1.length);

// Save as real CSV for reference
XLSX.writeFile(wb1, path.join(OUT_DIR, 'ects_master_real.csv'), { bookType: 'csv' });
console.log('Saved: ects_master_real.csv');

// ─── ects_loan_master ─────────────────────────────────────────────────────────
console.log('\n=== Processing ects_loan_master.csv (xlsx) ===');
const wb2   = XLSX.readFile(path.join(DATA_DIR, 'ects_loan_master.csv'));
const ws2   = wb2.Sheets[wb2.SheetNames[0]];
const rows2 = XLSX.utils.sheet_to_json(ws2, { defval: null });

console.log('Columns detected:', Object.keys(rows2[0] || {}));
console.log('Row count:', rows2.length);

XLSX.writeFile(wb2, path.join(OUT_DIR, 'ects_loan_master_real.csv'), { bookType: 'csv' });
console.log('Saved: ects_loan_master_real.csv');

// ─── Generate SQL ─────────────────────────────────────────────────────────────
console.log('\n=== Generating import.sql ===');

let sql = `-- Auto-generated import script
-- Run in MySQL Workbench: File > Run SQL Script > select this file
USE thrift_society;

-- Clear existing test data
TRUNCATE TABLE ects_loan_master;
TRUNCATE TABLE ects_master;

-- ects_master rows (${rows1.length} rows)
INSERT INTO ects_master (sno, emp, mth, ects_sub, ects_loan_bal, cect_subs, cplb, ects_memno, father_name, address, aadhar, name)
VALUES\n`;

const m1 = rows1.map(r => {
  const sno          = numOrNull(r['sno']          ?? r['SNO']          ?? r['S.No'] ?? r['S No']);
  const emp          = escape(r['emp']             ?? r['EMP']          ?? r['Emp No'] ?? r['empno']);
  const mth          = escape(r['mth']             ?? r['MTH']          ?? r['Month'] ?? r['month']);
  const ects_sub     = numOrNull(r['ects_sub']     ?? r['ECTS_SUB']     ?? r['Ects Sub']);
  const ects_loan_bal= numOrNull(r['ects_loan_bal']?? r['ECTS_LOAN_BAL']?? r['Ects Loan Bal']);
  const cect_subs    = numOrNull(r['cect_subs']    ?? r['CECT_SUBS']    ?? r['Cect Subs']);
  const cplb         = numOrNull(r['cplb']         ?? r['CPLB']         ?? r['Cplb']);
  const ects_memno   = numOrNull(r['ects_memno']   ?? r['ECTS_MEMNO']   ?? r['Mem No'] ?? r['memno']);
  const father_name  = escape(r['father_name']     ?? r['FATHER_NAME']  ?? r["Father's Name"] ?? r['Father Name']);
  const address      = escape(r['address']         ?? r['ADDRESS']      ?? r['Address']);
  const aadhar       = escape(r['aadhar']          ?? r['AADHAR']       ?? r['Aadhar'] ?? r['aadhar_no']);
  const name         = escape(r['name']            ?? r['NAME']         ?? r['Name']);
  return `(${sno}, ${emp}, ${mth}, ${ects_sub}, ${ects_loan_bal}, ${cect_subs}, ${cplb}, ${ects_memno}, ${father_name}, ${address}, ${aadhar}, ${name})`;
});

sql += m1.join(',\n') + ';\n\n';

sql += `-- ects_loan_master rows (${rows2.length} rows)
INSERT INTO ects_loan_master (s_no, empno, loan_no, empname, desig, memno, date_of_loan, loan_amt, inst_no, inst_amt, interest, tot_deduc, loan_balance, tot_nstalments, mnyr, arr_int, arr_amt, receipt)
VALUES\n`;

const m2 = rows2.map(r => {
  const s_no          = numOrNull(r['s_no']         ?? r['S_NO']         ?? r['S.No'] ?? r['S No']);
  const empno         = escape(r['empno']           ?? r['EMPNO']        ?? r['Emp No'] ?? r['emp']);
  const loan_no       = numOrNull(r['loan_no']      ?? r['LOAN_NO']      ?? r['Loan No']);
  const empname       = escape(r['empname']         ?? r['EMPNAME']      ?? r['Emp Name'] ?? r['name']);
  const desig         = escape(r['desig']           ?? r['DESIG']        ?? r['Designation']);
  const memno         = numOrNull(r['memno']        ?? r['MEMNO']        ?? r['Mem No']);
  const rawDate       = r['date_of_loan'] ?? r['DATE_OF_LOAN'] ?? r['Date of Loan'] ?? r['date'];
  const date_of_loan  = (typeof rawDate === 'number') ? escape(excelDateToMySQL(rawDate)) : escape(rawDate);
  const loan_amt      = numOrNull(r['loan_amt']     ?? r['LOAN_AMT']     ?? r['Loan Amt'] ?? r['Loan Amount']);
  const inst_no       = numOrNull(r['inst_no']      ?? r['INST_NO']      ?? r['Inst No']);
  const inst_amt      = numOrNull(r['inst_amt']     ?? r['INST_AMT']     ?? r['Inst Amt']);
  const interest      = numOrNull(r['interest']     ?? r['INTEREST']     ?? r['Interest']);
  const tot_deduc     = numOrNull(r['tot_deduc']    ?? r['TOT_DEDUC']    ?? r['Tot Deduc']);
  const loan_balance  = numOrNull(r['loan_balance'] ?? r['LOAN_BALANCE'] ?? r['Loan Balance']);
  const tot_nstalments= numOrNull(r['tot_nstalments']?? r['TOT_NSTALMENTS']?? r['Tot Instalments']);
  const mnyr          = escape(r['mnyr']            ?? r['MNYR']         ?? r['Mn/Yr']);
  const arr_int       = numOrNull(r['arr_int']      ?? r['ARR_INT']      ?? r['Arr Int']);
  const arr_amt       = numOrNull(r['arr_amt']      ?? r['ARR_AMT']      ?? r['Arr Amt']);
  const receipt       = numOrNull(r['receipt']      ?? r['RECEIPT']      ?? r['Receipt']);
  return `(${s_no}, ${empno}, ${loan_no}, ${empname}, ${desig}, ${memno}, ${date_of_loan}, ${loan_amt}, ${inst_no}, ${inst_amt}, ${interest}, ${tot_deduc}, ${loan_balance}, ${tot_nstalments}, ${mnyr}, ${arr_int}, ${arr_amt}, ${receipt})`;
});

sql += m2.join(',\n') + ';\n\n';

sql += `-- Verification
SELECT 'ects_master' AS tbl, COUNT(*) AS rows FROM ects_master
UNION ALL
SELECT 'ects_loan_master', COUNT(*) FROM ects_loan_master;
`;

fs.writeFileSync(path.join(OUT_DIR, 'import.sql'), sql, 'utf8');
console.log('Generated: D:\\Steel\\import.sql');
console.log('\nDone! Now run import.sql in MySQL Workbench:');
console.log('  File > Run SQL Script > D:\\Steel\\import.sql');
