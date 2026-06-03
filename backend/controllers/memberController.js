const Member = require("../models/memberModel");

exports.getMembers = async (req, res) => {
  try {
    const data = await Member.getAllMembers();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMember = async (req, res) => {
  try {
    const data = await Member.getMemberByEmp(req.params.emp);
    if (!data) return res.status(404).json({ message: "Member not found" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addMember = async (req, res) => {
  try {
    const result = await Member.addMember(req.body);
    res.status(201).json({ message: "Member added", result });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Member with this emp already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.updateMember = async (req, res) => {
  try {
    const result = await Member.updateMember(req.params.emp, req.body);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Member not found" });
    res.json({ message: "Member updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMember = async (req, res) => {
  try {
    const result = await Member.deleteMember(req.params.emp);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Member not found" });
    res.json({ message: "Member deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
