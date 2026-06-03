const Subscription = require("../models/subscriptionModel");

exports.getAllSubscriptions = async (req, res) => {
  try {
    const data = await Subscription.getAllSubscriptions();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSubscription = async (req, res) => {
  try {
    const data = await Subscription.getSubscriptionByEmp(req.params.emp);
    if (!data) return res.status(404).json({ message: "Member not found" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addMonthlySubscription = async (req, res) => {
  try {
    const { amount, month } = req.body;
    const result = await Subscription.addMonthlySubscription(req.params.emp, amount, month);
    res.json({ message: "Subscription updated", newCumulative: result.newCumulative });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getYearlyReport = async (req, res) => {
  try {
    const data = await Subscription.getYearlySubscriptionReport();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
