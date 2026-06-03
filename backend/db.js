const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "thrift_user",
  password: "Thrift@2024",
  database: "thrift_society",
});

db.connect((err) => {
  if (err) {
    console.error("MySQL Connection Error:", err.message);
    return;
  }
  console.log("MySQL Connected");
});

module.exports = db.promise();