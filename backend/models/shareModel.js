const db = require("../db");

const getMemberShares = async (memberId) => {
  const [rows] = await db.query(
    `
    SELECT
      m.id,
      m.employee_no,
      m.member_name,
      m.share_balance
    FROM members m
    WHERE m.id = ?
    `,
    [memberId]
  );

  return rows[0];
};

const getShareTransactions = async (memberId) => {
  const [rows] = await db.query(
    `
    SELECT *
    FROM share_transactions
    WHERE member_id = ?
    ORDER BY transaction_date DESC
    `,
    [memberId]
  );

  return rows;
};

const addShare = async (
  memberId,
  amount,
  remarks
) => {
  await db.query(
    `
    INSERT INTO share_transactions
    (
      member_id,
      transaction_date,
      amount,
      remarks
    )
    VALUES
    (
      ?,
      CURDATE(),
      ?,
      ?
    )
    `,
    [memberId, amount, remarks]
  );

  await db.query(
    `
    UPDATE members
    SET share_balance =
      share_balance + ?
    WHERE id = ?
    `,
    [amount, memberId]
  );

  return true;
};

const getAllShares = async () => {
  const [rows] = await db.query(
    `
    SELECT
      id,
      employee_no,
      member_name,
      share_balance
    FROM members
    WHERE share_balance > 0
    ORDER BY member_name
    `
  );
  return rows;
};

module.exports = {
  getAllShares,
  getMemberShares,
  getShareTransactions,
  addShare
};

