const express = require("express");
const cors = require("cors");

const memberRoutes = require("./routes/memberRoutes");
const loanRoutes = require("./routes/loanRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/test", (req, res) => res.json({ message: "works" }));

app.use("/api/members", memberRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
