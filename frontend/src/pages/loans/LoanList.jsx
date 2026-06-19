import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLoans, processMonthlyLoans } from '../../services/loanService'    
import '../members/Members.css'

export default function LoanList() {
  const [loans, setLoans] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    getLoans().then(r => setLoans(r.data)).catch(() => {})
  }, [])
 
  const handleProcessLoans = async () => {
  try {
    const response = await processMonthlyLoans({
      process_month: "072026"
    });

    alert(response.data.message);
  } catch (error) {
    alert(error.response?.data?.message || "Processing failed");
  }
};
  return (
    <div>
      <div className="page-header">
  <h2 className="page-title">Loans</h2>

  <div style={{ display: 'flex', gap: '10px' }}>
    <button
      className="btn-primary"
      onClick={() => navigate('/loans/add')}
    >
      + Add Loan
    </button>

    <button
      className="btn-primary"
      onClick={handleProcessLoans}
    >
      Process Monthly Loans
    </button>
  </div>
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
                <td>₹{Number(l.loan_amt || 0).toLocaleString()}</td>
                <td>₹{Number(l.emi_amount || 0).toLocaleString()}</td>
                <td>₹{Number(l.interestnumber || 0).toFixed(2)}</td>
                <td>₹{Number(l.current_balance || 0).toLocaleString()}</td>
                <td>{l.mnyr || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
