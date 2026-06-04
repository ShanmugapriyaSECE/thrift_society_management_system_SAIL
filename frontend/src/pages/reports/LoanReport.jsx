import { useEffect, useState } from 'react'
import { getLoans } from '../../services/loanService'
import '../members/Members.css'

export default function LoanReport() {
  const [loans, setLoans] = useState([])

  useEffect(() => {
    getLoans().then(r => setLoans(r.data)).catch(() => {})
  }, [])

  const total = loans.reduce((s, l) => s + Number(l.loan_amount || l.loan_amt || 0), 0)
  const totalBalance = loans.reduce((s, l) => s + Number(l.loan_balance || 0), 0)

  return (
    <div>
      <h2 className="page-title">Loan Report</h2>
      <div className="table-box">
        <table>
          <thead>
            <tr>
              <th>Emp No</th><th>Loan Amount</th><th>Installment</th><th>Interest</th><th>Total Deduction</th><th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((l, i) => (
              <tr key={i}>
                <td>{l.employee_no || l.empno}</td>
                <td>₹{Number(l.loan_amount || l.loan_amt || 0).toLocaleString()}</td>
                <td>₹{Number(l.installment_amount || l.inst_amt || 0).toLocaleString()}</td>
                <td>₹{Number(l.interest || l.interestnumber || 0).toFixed(2)}</td>
                <td>₹{Number(l.total_deduction || l.tot_deduc || 0).toFixed(2)}</td>
                <td>₹{Number(l.loan_balance || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td><strong>Total</strong></td>
              <td><strong>₹{total.toLocaleString()}</strong></td>
              <td colSpan={3}></td>
              <td><strong>₹{totalBalance.toLocaleString()}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
