const db = require("../db");

const getAllSubscriptions = async () => {
  const [rows] = await db.query(`
    SELECT
      emp,
      name,
      mth,
      ects_sub,
      cect_subs,
      ects_loan_bal,
      ects_memno
    FROM ects_master
    ORDER BY ects_memno
  `);

  return rows;
};

const getSubscriptionByEmp = async (emp) => {
  const [rows] = await db.query(
    `
    SELECT
      emp,
      name,
      mth,
      ects_sub,
      cect_subs,
      ects_loan_bal,
      ects_memno
    FROM ects_master
    WHERE emp = ?
    `,
    [emp]
  );

  return rows[0];
};

const addMonthlySubscription = async (emp, amount, month) => {
  const [rows] = await db.query(
    "SELECT cect_subs FROM ects_master WHERE emp = ?",
    [emp]
  );

  if (!rows[0]) {
    throw new Error("Member not found");
  }

  const newCumulative =
    parseFloat(rows[0].cect_subs || 0) +
    parseFloat(amount || 0);

  await db.query(
    `
    UPDATE ects_master
    SET ects_sub = ?,
        cect_subs = ?,
        mth = ?
    WHERE emp = ?
    `,
    [amount, newCumulative, month, emp]
  );

  return { newCumulative };
};

const getYearlySubscriptionReport = async () => {
  const [rows] = await db.query(`
    SELECT
      emp,
      name,
      ects_memno,
      mth,
      ects_sub,
      cect_subs
    FROM ects_master
    ORDER BY ects_memno
  `);

  return rows;
};

const processMonthlySubscriptions = async (month) => {
  const [alreadyProcessed] = await db.query(
    `
    SELECT COUNT(*) AS count
    FROM subscription_process
    WHERE process_month = ?
    `,
    [month]
  );

  if (alreadyProcessed[0].count > 0) {
    throw new Error(
      `Subscriptions already processed for ${month}`
    );
  }

  const [members] = await db.query(`
    SELECT
      emp,
      name,
      ects_sub,
      cect_subs
    FROM ects_master
  `);

  for (const member of members) {
    const subscriptionAmount =
      parseFloat(member.ects_sub || 0);

    const cumulative =
      parseFloat(member.cect_subs || 0);

    await db.query(
      `
      INSERT INTO subscription_process
      (
        process_month,
        employee_no,
        member_name,
        subscription_amount,
        cumulative_subscription,
        processed_date
      )
      VALUES (?, ?, ?, ?, ?, NOW())
      `,
      [
        month,
        member.emp,
        member.name,
        subscriptionAmount,
        cumulative
      ]
    );
  }

  await db.query(
    `
    UPDATE ects_master
    SET mth = ?
    `,
    [month]
  );

  return {
    processed: members.length,
    month
  };
};

module.exports = {
  getAllSubscriptions,
  getSubscriptionByEmp,
  addMonthlySubscription,
  getYearlySubscriptionReport,
  processMonthlySubscriptions
};