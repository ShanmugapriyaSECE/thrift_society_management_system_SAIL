const db = require("../db");

exports.getLoans = (req, res) => {
    db.query("SELECT * FROM loans", (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);
    });
};

exports.addLoan = (req, res) => {
    const {
        employee_no,
        member_no,
        loan_amount,
        installment_amount,
        total_installments
    } = req.body;

    const days = 30;

    const interest =
        loan_amount * 0.11 * days / 365;

    const total_deduction =
        Number(installment_amount) + Number(interest);

    const loan_balance =
        loan_amount - installment_amount;

    const shares_allotted =
        (loan_amount / 100000) * 5000;

    const sql = `
        INSERT INTO loans (
            employee_no,
            member_no,
            loan_amount,
            loan_date,
            installment_amount,
            total_installments,
            current_installment,
            interest,
            total_deduction,
            loan_balance,
            shares_allotted
        )
        VALUES (?, ?, ?, CURDATE(), ?, ?, 1, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            employee_no,
            member_no,
            loan_amount,
            installment_amount,
            total_installments,
            interest,
            total_deduction,
            loan_balance,
            shares_allotted
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                message: "Loan Added Successfully",
                interest,
                shares_allotted
            });
        }
    );
};