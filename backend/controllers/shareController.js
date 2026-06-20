const Share = require("../models/shareModel");

exports.getAllShares = async (req, res) => {
  try {
    const data = await Share.getAllShares();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.getMemberShares = async (req, res) => {
  try {
    const data = await Share.getMemberShares(
      req.params.memberId
    );

    if (!data) {
      return res.status(404).json({
        message: "Member not found"
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.getShareTransactions = async (
  req,
  res
) => {
  try {
    const data =
      await Share.getShareTransactions(
        req.params.memberId
      );

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.addShare = async (req, res) => {
  try {
    const {
      amount,
      remarks
    } = req.body;

    await Share.addShare(
      req.params.memberId,
      amount,
      remarks
    );

    res.json({
      success: true,
      message:
        "Share transaction added successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};