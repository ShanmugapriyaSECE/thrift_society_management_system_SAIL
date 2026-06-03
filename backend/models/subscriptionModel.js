const db = require("../db");

const getAllSubscriptions = async () => {
  const [rows] = await db.query(
    "SELECT emp, name, mth, ects_sub, cect_subs, ects_loan_bal, ects_memno FROM ects_master"
  );
  return rows;
};

const getSubscriptionByEmp = async (emp) => {
  const [rows] = await db.query(
    "SELECT emp, name, mth, ects_sub, cect_subs, ects_loan_bal, ects_memno FROM ects_master WHERE emp = ?",
    [emp]
  );
  return rows[0];
};

const addMonthlySubscription = async (emp, amount, month) => {
  const [rows] = await db.query(
    "SELECT cect_subs FROM ects_master WHERE emp = ?",
    [emp]
  );
  if (!rows[0]) throw new Error("Member not found");

  const newCumulative = parseFloat(rows[0].cect_subs || 0) + parseFloat(amount);

  const [result] = await db.query(
    "UPDATE ects_master SET ects_sub = ?, cect_subs = ?, mth = ? WHERE emp = ?",
    [amount, newCumulative, month, emp]
  );
  return { ...result, newCumulative };
};

const getYearlySubscriptionReport = async () => {
  const [rows] = await db.query(
    "SELECT emp, name, ects_memno, mth, ects_sub, cect_subs FROM ects_master ORDER BY ects_memno"
  );
  return rows;
};

module.exports = {
  getAllSubscriptions,
  getSubscriptionByEmp,
  addMonthlySubscription,
  getYearlySubscriptionReport
};
