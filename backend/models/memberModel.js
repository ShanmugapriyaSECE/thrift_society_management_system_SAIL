const db = require("../db");

const getAllMembers = async () => {
  const [rows] = await db.query(
    "SELECT * FROM ects_master"
  );
  return rows;
};


const getMemberByEmp = async (emp) => {
  const [rows] = await db.query(
    "SELECT * FROM ects_master WHERE emp = ?",
    [emp]
  );
  return rows[0];
};

const addMember = async (data) => {

  const {
    emp,
    name,
    father_name,
    address,
    aadhar
  } = data;

  const [result] = await db.query(
    `INSERT INTO ects_master
    (emp,name,father_name,address,aadhar)
    VALUES (?,?,?,?,?)`,
    [emp,name,father_name,address,aadhar]
  );

  return result;
};

const updateMember = async (emp,data) => {

  const {
    name,
    father_name,
    address,
    aadhar
  } = data;

  const [result] = await db.query(
    `UPDATE ects_master
     SET name=?,
         father_name=?,
         address=?,
         aadhar=?
     WHERE emp=?`,
     [
      name,
      father_name,
      address,
      aadhar,
      emp
     ]
  );

  return result;
};

const deleteMember = async (emp) => {

  const [result] = await db.query(
    "DELETE FROM ects_master WHERE emp=?",
    [emp]
  );

  return result;
};

module.exports = {
  getAllMembers,
  getMemberByEmp,
  addMember,
  updateMember,
  deleteMember
};