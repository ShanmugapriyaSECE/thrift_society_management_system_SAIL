const db = require('../db')

exports.getTallyRegister = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT emp, name, ects_memno, mth, ects_sub, cect_subs, ects_loan_bal
       FROM ects_master ORDER BY ects_memno`
    )
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
