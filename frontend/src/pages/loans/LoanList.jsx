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
              <th>Emp No</th><th>Name</th><th>Designation</th><th>Loan Amount</th><th>Installment</th><th>Interest</th><th>Balance</th><th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((l, i) => (
              <tr key={i}>
                <td>{l.empno}</td>
                <td>{l.empname}</td>
                <td>{l.desig}</td>
                <td>₹{Number(l.inst_no || 0).toLocaleString()}</td>
                <td>₹{Number(l.interest || 0).toLocaleString()}</td>
                <td>₹{Number(l.tot_deduc || 0).toFixed(2)}</td>
                <td>₹{Number(l.loan_balance || 0).toLocaleString()}</td>
                <td>{l.mnyr || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
