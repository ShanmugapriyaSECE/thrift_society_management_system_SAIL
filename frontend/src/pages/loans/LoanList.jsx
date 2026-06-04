import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLoans } from '../../services/loanService'
import '../members/Members.css'

export default function LoanList() {
  const [loans, setLoans] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    getLoans().then(r => setLoans(r.data)).catch(() => {})
  }, [])

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Loans</h2>
        <button className="btn-primary" onClick={() => navigate('/loans/add')}>+ Add Loan</button>
      </div>
      <div className="table-box">
        <table>
          <thead>
            <tr>
              <th>Emp No</th><th>Loan Amount</th><th>Installment</th><th>Total Inst.</th><th>Interest</th><th>Balance</th><th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((l, i) => (
              <tr key={i}>
                <td>{l.employee_no || l.empno}</td>
                <td>₹{Number(l.loan_amount || l.loan_amt || 0).toLocaleString()}</td>
                <td>₹{Number(l.installment_amount || l.inst_amt || 0).toLocaleString()}</td>
                <td>{l.total_installments || l.tot_nstalments}</td>
                <td>₹{Number(l.interest || l.interestnumber || 0).toFixed(2)}</td>
                <td>₹{Number(l.loan_balance || 0).toLocaleString()}</td>
                <td>{l.loan_date ? new Date(l.loan_date).toLocaleDateString() : l.date_of_loan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
